import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Hermes gateway status for this user
    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    
    // Convert gateway platforms to channel format
    const channels = Object.entries(gatewayStatus.platforms).map(([platform, config], index) => ({
      id: `hermes-${session.user.id}-${platform}-${index}`,
      type: platform,
      name: `${platform.charAt(0).toUpperCase() + platform.slice(1)} (Your Instance)`,
      agentId: `hermes-${session.user.id}`,
      agentName: "Your Hermes Agent",
      status: config.status,
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      config: {
        hermesManaged: true,
        userIsolated: true,
        userId: session.user.id,
        ...config
      }
    }));

    return NextResponse.json({ 
      channels,
      gatewayStatus: gatewayStatus.status,
      supportedPlatforms: ['telegram', 'discord', 'whatsapp'],
      hermesIntegration: true,
      userIsolation: true,
      userId: session.user.id
    });
  } catch (error) {
    console.error("Get channels error:", error);
    return NextResponse.json(
      { error: "Failed to fetch channels" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[Channels] POST request from user ${session.user.id}`);

    const body = await request.json();
    const { type, name, agentId, ...config } = body;

    console.log(`[Channels] Request body:`, { type, name, agentId, hasConfig: !!config });

    if (!type || !name) {
      return NextResponse.json({ 
        error: "Channel type and name are required" 
      }, { status: 400 });
    }

    if (!agentId) {
      return NextResponse.json({ 
        error: "Agent selection is required" 
      }, { status: 400 });
    }

    // Ensure user profile exists
    console.log(`[Channels] Checking profile for user ${session.user.id}`);
    const profile = await hermesIntegration.getProfile(session.user.id!);
    console.log(`[Channels] Profile status:`, profile?.status);
    
    if (!profile || profile.status === 'inactive') {
      console.log(`[Channels] Creating profile for user ${session.user.id}`);
      const createResult = await hermesIntegration.createProfile(session.user.id!);
      console.log(`[Channels] Profile creation result:`, createResult);
      
      if (!createResult.success) {
        console.error(`[Channels] Profile creation failed:`, createResult.error);
        return NextResponse.json({ 
          error: `Failed to initialize user profile: ${createResult.error}` 
        }, { status: 500 });
      }
      
      console.log(`[Channels] Profile created successfully`);
    } else {
      console.log(`[Channels] Profile already exists and is active`);
    }

    try {
      let setupResult;
      
      switch (type) {
        case 'telegram':
          if (!config.botToken) {
            return NextResponse.json({ 
              error: "Bot token is required for Telegram" 
            }, { status: 400 });
          }
          setupResult = await hermesIntegration.setupTelegram(session.user.id!, config.botToken);
          break;

        case 'discord':
          if (!config.botToken) {
            return NextResponse.json({ 
              error: "Bot token is required for Discord" 
            }, { status: 400 });
          }
          setupResult = await hermesIntegration.setupDiscord(session.user.id!, config.botToken);
          break;

        case 'whatsapp':
          setupResult = await hermesIntegration.setupWhatsApp(session.user.id!);
          break;

        default:
          return NextResponse.json({ 
            error: `Platform ${type} is not supported yet` 
          }, { status: 400 });
      }

      if (!setupResult.success) {
        return NextResponse.json({ 
          error: `Platform setup failed: ${setupResult.error}` 
        }, { status: 400 });
      }

      // Start gateway if not already running
      const gatewayResult = await hermesIntegration.startGateway(session.user.id!);
      if (!gatewayResult.success) {
        console.warn(`Gateway start warning for user ${session.user.id}: ${gatewayResult.error}`);
      }

      // Create channel record
      const channel = {
        id: `hermes-${session.user.id}-${type}-${Date.now()}`,
        type,
        name,
        agentId,
        status: "connected" as const,
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        config: {
          hermesManaged: true,
          setupMethod: "hermes-cli",
          userIsolated: true,
          userId: session.user.id,
          hermesProfile: `user-${session.user.id}`
        },
        createdAt: new Date().toISOString(),
        userId: session.user.id
      };

      console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} channel created via isolated Hermes:`, {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        userId: session.user.id,
        hermesProfile: `user-${session.user.id}`,
        isolated: true
      });

      return NextResponse.json({ 
        channel,
        message: `${type.charAt(0).toUpperCase() + type.slice(1)} channel connected successfully to your isolated Hermes instance!`,
        hermesSetup: setupResult.error || "Platform configured successfully",
        userIsolation: true
      }, { status: 201 });

    } catch (validationError) {
      return NextResponse.json({ 
        error: validationError instanceof Error ? validationError.message : "Setup failed"
      }, { status: 400 });
    }

  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const channelId = searchParams.get('channelId');

    if (!channelId) {
      return NextResponse.json({ 
        error: "Channel ID is required" 
      }, { status: 400 });
    }

    // Stop gateway for this user
    const stopResult = await hermesIntegration.stopGateway(session.user.id!);
    
    console.log(`🗑️ Channel deleted: ${channelId} by user: ${session.user.id}`);

    return NextResponse.json({ 
      message: "Channel disconnected successfully",
      gatewayStop: stopResult.success
    });

  } catch (error) {
    console.error("Delete channel error:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
}