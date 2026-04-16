import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user profile and status
    const profile = await hermesIntegration.getProfile(session.user.id!);
    const status = await hermesIntegration.getStatus(session.user.id!);
    const skills = await hermesIntegration.getSkills(session.user.id!);
    const sessions = await hermesIntegration.getSessions(session.user.id!);
    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    const memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);
    const cronJobs = await hermesIntegration.getCronJobs(session.user.id!);

    // Create a unified agent representation for this user
    const agent = {
      id: `hermes-${session.user.id}`,
      name: profile?.profileName || `user-${session.user.id}`,
      description: "Your personal Hermes agent with full CLI integration",
      model: status.model || "gpt-4o",
      provider: status.provider || "openai",
      systemPrompt: "You are a helpful AI assistant powered by the Hermes framework.",
      temperature: 0.7,
      maxTokens: 4000,
      learningEnabled: true,
      memoryEnabled: memoryStatus.status === 'active',
      status: profile?.status || 'inactive',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      
      // Hermes-specific stats
      skills: {
        total: skills.length,
        installed: skills.filter(s => s.installed).length,
        enabled: skills.filter(s => s.enabled).length,
        list: skills
      },
      memory: {
        type: memoryStatus.type,
        status: memoryStatus.status,
        config: memoryStatus.config
      },
      sessions: {
        total: sessions.length,
        recent: sessions.slice(0, 5)
      },
      gateway: {
        status: gatewayStatus.status,
        platforms: gatewayStatus.platforms
      },
      cronJobs: {
        total: cronJobs.length,
        enabled: cronJobs.filter(j => j.enabled).length,
        list: cronJobs
      },
      
      // Integration info
      hermesIntegration: true,
      userIsolation: true,
      profilePath: profile?.hermesHome,
      configPath: profile?.configPath
    };

    return NextResponse.json({
      success: true,
      agents: [agent], // Single agent per user with full Hermes integration
      count: 1,
      hermesIntegration: true,
      userIsolation: true
    });

  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'createProfile':
        const createResult = await hermesIntegration.createProfile(session.user.id!, params);
        return NextResponse.json(createResult);

      case 'updateConfig':
        const { key, value } = params;
        if (!key || value === undefined) {
          return NextResponse.json({ 
            success: false,
            error: "Config key and value are required" 
          }, { status: 400 });
        }
        
        const configResult = await hermesIntegration.setConfig(session.user.id!, key, value);
        return NextResponse.json(configResult);

      default:
        return NextResponse.json({ 
          success: false,
          error: "Invalid action" 
        }, { status: 400 });
    }

  } catch (error) {
    console.error("Agent action error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to execute action" 
      },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ 
        success: false,
        error: "Config key and value are required" 
      }, { status: 400 });
    }

    // Update configuration for this user
    const result = await hermesIntegration.setConfig(session.user.id!, key, value);
    
    if (result.success) {
      // Get updated agent info
      const profile = await hermesIntegration.getProfile(session.user.id!);
      const status = await hermesIntegration.getStatus(session.user.id!);
      
      return NextResponse.json({
        success: true,
        message: `Configuration updated: ${key} = ${value}`,
        agent: {
          id: `hermes-${session.user.id}`,
          profile: profile?.profileName,
          status: status
        }
      });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to update agent configuration" 
      },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete user's Hermes profile (this removes all user data)
    const result = await hermesIntegration.deleteProfile(session.user.id!);

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "User profile and all associated data deleted successfully"
      });
    } else {
      return NextResponse.json(result, { status: 400 });
    }

  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json(
      { 
        success: false,
        error: "Failed to delete agent profile" 
      },
      { status: 500 }
    );
  }
}