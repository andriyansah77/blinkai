import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesIntegration } from "@/lib/hermes-integration";

// Available Hermes slash commands
const HERMES_COMMANDS = {
  '/help': {
    description: 'Show all available commands',
    usage: '/help',
    category: 'General'
  },
  '/skills': {
    description: 'List available skills',
    usage: '/skills [search]',
    category: 'Skills'
  },
  '/memory': {
    description: 'Show agent memory status',
    usage: '/memory',
    category: 'Memory'
  },
  '/sessions': {
    description: 'List chat sessions',
    usage: '/sessions',
    category: 'Sessions'
  },
  '/gateway': {
    description: 'Gateway status and management',
    usage: '/gateway [start|stop|status]',
    category: 'Gateway'
  },
  '/config': {
    description: 'Show configuration',
    usage: '/config [key] [value]',
    category: 'Settings'
  },
  '/cron': {
    description: 'List cron jobs',
    usage: '/cron',
    category: 'Automation'
  },
  '/status': {
    description: 'Show agent status',
    usage: '/status',
    category: 'General'
  },
  '/diagnostics': {
    description: 'Run system diagnostics',
    usage: '/diagnostics',
    category: 'System'
  },
  '/profile': {
    description: 'Profile management',
    usage: '/profile [create|delete|info]',
    category: 'Profile'
  }
};

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { command, args = [] } = body;

    if (!command || !command.startsWith('/')) {
      return NextResponse.json({ error: "Invalid command format" }, { status: 400 });
    }

    console.log(`🔧 Processing Hermes command: ${command} with args:`, args);

    // Process command
    let result;
    switch (command) {
      case '/help':
        result = await handleHelpCommand();
        break;
      
      case '/skills':
        result = await handleSkillsCommand(session.user.id!, args[0]);
        break;
      
      case '/memory':
        result = await handleMemoryCommand(session.user.id!);
        break;
      
      case '/sessions':
        result = await handleSessionsCommand(session.user.id!);
        break;
      
      case '/gateway':
        result = await handleGatewayCommand(session.user.id!, args[0]);
        break;
      
      case '/config':
        result = await handleConfigCommand(session.user.id!, args[0], args[1]);
        break;
      
      case '/cron':
        result = await handleCronCommand(session.user.id!);
        break;
      
      case '/status':
        result = await handleStatusCommand(session.user.id!);
        break;
      
      case '/diagnostics':
        result = await handleDiagnosticsCommand(session.user.id!);
        break;
      
      case '/profile':
        result = await handleProfileCommand(session.user.id!, args[0]);
        break;
      
      default:
        result = {
          type: 'error',
          message: `Unknown command: ${command}. Type /help to see available commands.`
        };
    }

    return NextResponse.json({
      success: true,
      command,
      result
    });

  } catch (error) {
    console.error("Hermes command error:", error);
    return NextResponse.json(
      { error: "Failed to process command" },
      { status: 500 }
    );
  }
}

// Command handlers
async function handleHelpCommand() {
  const categories = Object.entries(HERMES_COMMANDS).reduce((acc, [cmd, info]) => {
    if (!acc[info.category]) acc[info.category] = [];
    acc[info.category].push({ command: cmd, ...info });
    return acc;
  }, {} as Record<string, any[]>);

  let helpText = "# 🤖 Hermes Agent Commands\n\n";
  
  Object.entries(categories).forEach(([category, commands]) => {
    helpText += `## ${category}\n`;
    commands.forEach(cmd => {
      helpText += `- **${cmd.command}** - ${cmd.description}\n`;
      helpText += `  Usage: \`${cmd.usage}\`\n\n`;
    });
  });

  return {
    type: 'info',
    message: helpText
  };
}

async function handleSkillsCommand(userId: string, search?: string) {
  try {
    const skills = await hermesIntegration.getSkills(userId);
    
    let filteredSkills = skills;
    if (search) {
      filteredSkills = skills.filter(skill => 
        skill.name.toLowerCase().includes(search.toLowerCase()) ||
        skill.description.toLowerCase().includes(search.toLowerCase())
      );
    }

    if (filteredSkills.length === 0) {
      return {
        type: 'info',
        message: search 
          ? `No skills found matching "${search}"`
          : "No skills installed yet. Use the skills API to install skills."
      };
    }

    let skillsText = `# 🛠️ Agent Skills ${search ? `(matching "${search}")` : ''}\n\n`;
    
    filteredSkills.forEach(skill => {
      skillsText += `## ${skill.name}\n`;
      skillsText += `${skill.description}\n`;
      skillsText += `- **Source**: ${skill.source}\n`;
      skillsText += `- **Installed**: ${skill.installed ? 'Yes' : 'No'}\n`;
      skillsText += `- **Enabled**: ${skill.enabled ? 'Yes' : 'No'}\n\n`;
    });

    return {
      type: 'info',
      message: skillsText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve skills"
    };
  }
}

async function handleMemoryCommand(userId: string) {
  try {
    const memoryStatus = await hermesIntegration.getMemoryStatus(userId);
    
    let memoryText = `# 🧠 Agent Memory\n\n`;
    memoryText += `- **Type**: ${memoryStatus.type}\n`;
    memoryText += `- **Status**: ${memoryStatus.status}\n`;
    
    if (memoryStatus.config) {
      memoryText += `- **Configuration**: Available\n`;
    }
    
    memoryText += `\nMemory system is ${memoryStatus.status === 'active' ? 'active and learning from conversations' : 'inactive'}.`;

    return {
      type: 'info',
      message: memoryText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve memory status"
    };
  }
}

async function handleSessionsCommand(userId: string) {
  try {
    const sessions = await hermesIntegration.getSessions(userId);
    
    if (sessions.length === 0) {
      return {
        type: 'info',
        message: "No chat sessions found."
      };
    }

    let sessionsText = `# 💬 Chat Sessions (${sessions.length})\n\n`;
    
    sessions.forEach((session, index) => {
      sessionsText += `## Session ${index + 1}\n`;
      sessionsText += `- **ID**: \`${session.id}\`\n`;
      sessionsText += `- **Title**: ${session.title || 'Untitled'}\n`;
      sessionsText += `- **Messages**: ${session.messageCount}\n`;
      sessionsText += `- **Created**: ${new Date(session.created).toLocaleDateString()}\n`;
      sessionsText += `- **Last Activity**: ${new Date(session.lastActivity).toLocaleDateString()}\n`;
      sessionsText += `- **Source**: ${session.source}\n\n`;
    });

    return {
      type: 'info',
      message: sessionsText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve sessions"
    };
  }
}

async function handleGatewayCommand(userId: string, action?: string) {
  try {
    if (!action || action === 'status') {
      const gatewayStatus = await hermesIntegration.getGatewayStatus(userId);
      
      let gatewayText = `# 🌐 Gateway Status\n\n`;
      gatewayText += `- **Status**: ${gatewayStatus.status}\n\n`;
      
      if (Object.keys(gatewayStatus.platforms).length > 0) {
        gatewayText += `## Connected Platforms\n`;
        Object.entries(gatewayStatus.platforms).forEach(([platform, config]) => {
          gatewayText += `- **${platform.charAt(0).toUpperCase() + platform.slice(1)}**: ${config.status}\n`;
        });
      } else {
        gatewayText += `No platforms connected. Use the channels API to connect platforms.`;
      }

      return {
        type: 'info',
        message: gatewayText
      };
    }

    if (action === 'start') {
      const result = await hermesIntegration.startGateway(userId);
      return {
        type: result.success ? 'success' : 'error',
        message: result.success ? '✅ Gateway started' : `❌ Failed to start gateway: ${result.error}`
      };
    }

    if (action === 'stop') {
      const result = await hermesIntegration.stopGateway(userId);
      return {
        type: result.success ? 'success' : 'error',
        message: result.success ? '✅ Gateway stopped' : `❌ Failed to stop gateway: ${result.error}`
      };
    }

    return {
      type: 'error',
      message: `Invalid gateway action: ${action}. Use start, stop, or status.`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to process gateway command"
    };
  }
}

async function handleConfigCommand(userId: string, key?: string, value?: string) {
  try {
    if (key && value) {
      // Set config
      const result = await hermesIntegration.setConfig(userId, key, value);
      return {
        type: result.success ? 'success' : 'error',
        message: result.success ? `✅ Config set: ${key} = ${value}` : `❌ Failed to set config: ${result.error}`
      };
    } else {
      // Show config
      const config = await hermesIntegration.getConfig(userId);
      
      let configText = `# ⚙️ Configuration\n\n`;
      
      if (Object.keys(config).length === 0) {
        configText += `No configuration found. Use \`/config <key> <value>\` to set values.`;
      } else {
        Object.entries(config).forEach(([key, value]) => {
          configText += `- **${key}**: ${value}\n`;
        });
      }

      return {
        type: 'info',
        message: configText
      };
    }
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to process config command"
    };
  }
}

async function handleCronCommand(userId: string) {
  try {
    const cronJobs = await hermesIntegration.getCronJobs(userId);
    
    if (cronJobs.length === 0) {
      return {
        type: 'info',
        message: "No cron jobs configured. Use the cron API to create scheduled tasks."
      };
    }

    let cronText = `# ⏰ Cron Jobs (${cronJobs.length})\n\n`;
    
    cronJobs.forEach((job, index) => {
      cronText += `## Job ${index + 1}\n`;
      cronText += `- **ID**: \`${job.id}\`\n`;
      cronText += `- **Name**: ${job.name}\n`;
      cronText += `- **Schedule**: ${job.schedule}\n`;
      cronText += `- **Prompt**: ${job.prompt}\n`;
      cronText += `- **Enabled**: ${job.enabled ? 'Yes' : 'No'}\n`;
      if (job.nextRun) {
        cronText += `- **Next Run**: ${job.nextRun}\n`;
      }
      cronText += `\n`;
    });

    return {
      type: 'info',
      message: cronText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve cron jobs"
    };
  }
}

async function handleStatusCommand(userId: string) {
  try {
    const status = await hermesIntegration.getStatus(userId);
    const profile = await hermesIntegration.getProfile(userId);
    
    let statusText = `# 📊 Agent Status\n\n`;
    statusText += `- **Profile**: ${profile?.profileName || 'Not created'}\n`;
    statusText += `- **Status**: ${profile?.status || 'inactive'}\n`;
    
    if (status.model) {
      statusText += `- **Model**: ${status.model}\n`;
    }
    if (status.provider) {
      statusText += `- **Provider**: ${status.provider}\n`;
    }
    if (status.gateway) {
      statusText += `- **Gateway**: ${status.gateway}\n`;
    }

    return {
      type: 'info',
      message: statusText
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to retrieve status"
    };
  }
}

async function handleDiagnosticsCommand(userId: string) {
  try {
    const diagnostics = await hermesIntegration.runDiagnostics(userId);
    
    return {
      type: diagnostics.success ? 'info' : 'error',
      message: diagnostics.success 
        ? `# 🔍 Diagnostics Report\n\n${diagnostics.report}`
        : `❌ Diagnostics failed: ${diagnostics.error}`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to run diagnostics"
    };
  }
}

async function handleProfileCommand(userId: string, action?: string) {
  try {
    const profile = await hermesIntegration.getProfile(userId);
    
    if (!action || action === 'info') {
      let profileText = `# 👤 Profile Information\n\n`;
      
      if (profile && profile.status === 'active') {
        profileText += `- **Name**: ${profile.profileName}\n`;
        profileText += `- **Home**: ${profile.hermesHome}\n`;
        profileText += `- **Config**: ${profile.configPath}\n`;
        profileText += `- **Status**: ${profile.status}\n`;
      } else {
        profileText += `Profile not created. Use \`/profile create\` to create one.`;
      }

      return {
        type: 'info',
        message: profileText
      };
    }

    if (action === 'create') {
      if (profile && profile.status === 'active') {
        return {
          type: 'info',
          message: 'Profile already exists.'
        };
      }
      
      const result = await hermesIntegration.createProfile(userId);
      return {
        type: result.success ? 'success' : 'error',
        message: result.success ? '✅ Profile created successfully' : `❌ Failed to create profile: ${result.error}`
      };
    }

    if (action === 'delete') {
      const result = await hermesIntegration.deleteProfile(userId);
      return {
        type: result.success ? 'success' : 'error',
        message: result.success ? '✅ Profile deleted successfully' : `❌ Failed to delete profile: ${result.error}`
      };
    }

    return {
      type: 'error',
      message: `Invalid profile action: ${action}. Use create, delete, or info.`
    };
  } catch (error) {
    return {
      type: 'error',
      message: "Failed to process profile command"
    };
  }
}

export async function GET() {
  return NextResponse.json({
    message: "Hermes Commands API",
    commands: Object.keys(HERMES_COMMANDS),
    usage: "POST with { command, args } to execute commands"
  });
}