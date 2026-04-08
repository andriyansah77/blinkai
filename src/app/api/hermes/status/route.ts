import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesCliWrapper } from "@/lib/hermes-cli-wrapper";
import { HermesAgentDB } from "@/lib/hermes-db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Hermes CLI installation
    const hermesInstalled = await hermesCliWrapper.isHermesInstalled();
    
    // Get all running agents
    const runningAgents = hermesCliWrapper.getAllAgents();
    
    // Get user's agents from database
    const userAgents = await HermesAgentDB.getUserAgents(session.user.id!);
    
    // Check which user agents have running Hermes instances
    const agentStatus = userAgents.map(agent => {
      const hermesInstance = hermesCliWrapper.getAgentStatus(agent.id);
      return {
        id: agent.id,
        name: agent.name,
        model: agent.model,
        provider: agent.provider,
        hermesInstance: hermesInstance ? {
          status: hermesInstance.status,
          pid: hermesInstance.pid,
          port: hermesInstance.port
        } : null,
        isRunning: hermesInstance?.status === 'running'
      };
    });

    return NextResponse.json({
      hermes: {
        installed: hermesInstalled,
        version: hermesInstalled ? "latest" : null,
        framework: "NousResearch/hermes-agent"
      },
      agents: {
        total: userAgents.length,
        running: runningAgents.length,
        details: agentStatus
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        supportedPlatforms: ["linux", "darwin", "win32 (WSL2)"]
      },
      recommendations: hermesInstalled ? [] : [
        "Install Hermes CLI for enhanced agent capabilities",
        "Hermes provides learning, memory, and skill development",
        "Agents will fallback to standard AI without Hermes CLI"
      ]
    });

  } catch (error) {
    console.error("Hermes status error:", error);
    return NextResponse.json({
      error: "Failed to get Hermes status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, agentId } = body;

    switch (action) {
      case 'install':
        try {
          await hermesCliWrapper.installHermes();
          return NextResponse.json({ 
            success: true, 
            message: "Hermes CLI installation initiated. Please check your terminal." 
          });
        } catch (error) {
          return NextResponse.json({ 
            error: "Installation failed", 
            details: error instanceof Error ? error.message : "Unknown error",
            instructions: [
              "Manual installation required",
              "Run: curl -fsSL https://raw.githubusercontent.com/NousResearch/hermes-agent/main/scripts/install.sh | bash",
              "Reload shell: source ~/.bashrc",
              "Verify: hermes --version"
            ]
          }, { status: 500 });
        }

      case 'start':
        if (!agentId) {
          return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
        }
        
        try {
          await hermesCliWrapper.startAgent(agentId);
          return NextResponse.json({ 
            success: true, 
            message: `Agent ${agentId} started successfully` 
          });
        } catch (error) {
          return NextResponse.json({ 
            error: "Failed to start agent", 
            details: error instanceof Error ? error.message : "Unknown error" 
          }, { status: 500 });
        }

      case 'stop':
        if (!agentId) {
          return NextResponse.json({ error: "Agent ID required" }, { status: 400 });
        }
        
        try {
          await hermesCliWrapper.stopAgent(agentId);
          return NextResponse.json({ 
            success: true, 
            message: `Agent ${agentId} stopped successfully` 
          });
        } catch (error) {
          return NextResponse.json({ 
            error: "Failed to stop agent", 
            details: error instanceof Error ? error.message : "Unknown error" 
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Hermes action error:", error);
    return NextResponse.json({
      error: "Failed to execute action",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}