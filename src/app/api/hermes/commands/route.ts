import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "../../auth/[...nextauth]/route";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { command } = await request.json();
    if (!command) {
      return NextResponse.json({ error: "Command is required" }, { status: 400 });
    }

    const userId = session.user.email;
    const commandParts = command.trim().split(' ');
    const mainCommand = commandParts[0];
    const subCommand = commandParts[1];
    const args = commandParts.slice(2);

    let result: { success: boolean; output: string; error: string };

    try {
      switch (mainCommand.toLowerCase()) {
        case 'status':
          const status = await hermesIntegration.getStatus(userId);
          result = {
            success: true,
            output: formatStatusOutput(status),
            error: ''
          };
          break;

        case 'chat':
          if (args.length === 0) {
            result = {
              success: false,
              output: '',
              error: 'Usage: chat <message>'
            };
          } else {
            const message = args.join(' ');
            const chatGenerator = hermesIntegration.sendChatMessage(userId, message, { quiet: true });
            let response = '';
            
            // Collect streaming response
            for await (const chunk of chatGenerator) {
              response += chunk;
            }
            
            result = {
              success: true,
              output: response || 'Chat response received',
              error: ''
            };
          }
          break;

        case 'skills':
          if (subCommand === 'list') {
            const skills = await hermesIntegration.getSkills(userId);
            result = {
              success: true,
              output: formatSkillsOutput(skills),
              error: ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: skills list'
            };
          }
          break;

        case 'gateway':
          if (subCommand === 'status') {
            const gatewayStatus = await hermesIntegration.getGatewayStatus(userId);
            result = {
              success: true,
              output: formatGatewayOutput(gatewayStatus),
              error: ''
            };
          } else if (subCommand === 'start') {
            const startResult = await hermesIntegration.startGateway(userId);
            result = {
              success: startResult.success,
              output: startResult.success ? 'Gateway started successfully' : '',
              error: startResult.error || ''
            };
          } else if (subCommand === 'stop') {
            const stopResult = await hermesIntegration.stopGateway(userId);
            result = {
              success: stopResult.success,
              output: stopResult.success ? 'Gateway stopped successfully' : '',
              error: stopResult.error || ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: gateway [status|start|stop]'
            };
          }
          break;

        case 'sessions':
          if (subCommand === 'list') {
            const sessions = await hermesIntegration.getSessions(userId);
            result = {
              success: true,
              output: formatSessionsOutput(sessions),
              error: ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: sessions list'
            };
          }
          break;

        case 'config':
          if (subCommand === 'show') {
            const config = await hermesIntegration.getConfig(userId);
            result = {
              success: true,
              output: formatConfigOutput(config),
              error: ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: config show'
            };
          }
          break;

        case 'memory':
          if (subCommand === 'status') {
            const memoryStatus = await hermesIntegration.getMemoryStatus(userId);
            result = {
              success: true,
              output: formatMemoryOutput(memoryStatus),
              error: ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: memory status'
            };
          }
          break;

        case 'cron':
          if (subCommand === 'list') {
            const cronJobs = await hermesIntegration.getCronJobs(userId);
            result = {
              success: true,
              output: formatCronOutput(cronJobs),
              error: ''
            };
          } else {
            result = {
              success: false,
              output: '',
              error: 'Usage: cron list'
            };
          }
          break;

        case 'doctor':
          const diagnostics = await hermesIntegration.runDiagnostics(userId);
          result = {
            success: diagnostics.success,
            output: diagnostics.report,
            error: diagnostics.error || ''
          };
          break;

        default:
          result = {
            success: false,
            output: '',
            error: `Unknown command: ${mainCommand}. Type 'help' for available commands.`
          };
      }
    } catch (error) {
      result = {
        success: false,
        output: '',
        error: `Command execution failed: ${error}`
      };
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Hermes command error:", error);
    return NextResponse.json(
      { error: "Failed to execute command" },
      { status: 500 }
    );
  }
}

function formatStatusOutput(status: Record<string, any>): string {
  const lines = [
    "Hermes Agent Status:",
    "==================",
    ""
  ];

  if (status.profile) {
    lines.push(`Profile: ${status.profile}`);
  }
  if (status.model) {
    lines.push(`Model: ${status.model}`);
  }
  if (status.provider) {
    lines.push(`Provider: ${status.provider}`);
  }
  if (status.gateway) {
    lines.push(`Gateway: ${status.gateway}`);
  }

  return lines.join('\n');
}

function formatSkillsOutput(skills: any[]): string {
  if (skills.length === 0) {
    return "No skills installed";
  }

  const lines = [
    "Installed Skills:",
    "================",
    ""
  ];

  skills.forEach(skill => {
    const status = skill.enabled ? "✓" : "✗";
    lines.push(`${status} ${skill.name} - ${skill.description || 'No description'}`);
  });

  return lines.join('\n');
}

function formatGatewayOutput(gateway: any): string {
  const lines = [
    "Gateway Status:",
    "==============",
    "",
    `Status: ${gateway.status}`
  ];

  if (gateway.platforms) {
    lines.push("", "Platforms:");
    Object.entries(gateway.platforms).forEach(([platform, config]: [string, any]) => {
      lines.push(`  ${platform}: ${config.status || 'disconnected'}`);
    });
  }

  return lines.join('\n');
}

function formatSessionsOutput(sessions: any[]): string {
  if (sessions.length === 0) {
    return "No chat sessions found";
  }

  const lines = [
    "Chat Sessions:",
    "=============",
    ""
  ];

  sessions.forEach(session => {
    lines.push(`${session.id} - ${session.title || 'Untitled'} (${session.created})`);
  });

  return lines.join('\n');
}

function formatConfigOutput(config: Record<string, any>): string {
  const lines = [
    "Hermes Configuration:",
    "====================",
    ""
  ];

  Object.entries(config).forEach(([key, value]) => {
    lines.push(`${key}: ${value}`);
  });

  return lines.join('\n');
}

function formatMemoryOutput(memory: any): string {
  return [
    "Memory System:",
    "=============",
    "",
    `Type: ${memory.type}`,
    `Status: ${memory.status}`,
    `Total: ${memory.total || 0} memories`
  ].join('\n');
}

function formatCronOutput(cronJobs: any[]): string {
  if (cronJobs.length === 0) {
    return "No scheduled jobs found";
  }

  const lines = [
    "Scheduled Jobs:",
    "==============",
    ""
  ];

  cronJobs.forEach(job => {
    const status = job.enabled ? "ENABLED" : "DISABLED";
    lines.push(`${job.id} - ${job.name} [${status}]`);
    lines.push(`  Schedule: ${job.schedule}`);
    lines.push(`  Prompt: ${job.prompt}`);
    lines.push("");
  });

  return lines.join('\n');
}