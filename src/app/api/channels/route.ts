import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";
import { ensureHermesProfile } from "@/lib/ensure-hermes-profile";

// Telegram commands to auto-register
const TELEGRAM_COMMANDS = [
  {
    command: "mine",
    description: "Mine REAGENT tokens (usage: /mine [amount])"
  },
  {
    command: "balance",
    description: "Check your wallet balance"
  },
  {
    command: "wallet",
    description: "View your wallet information"
  },
  {
    command: "help",
    description: "Show help message and available commands"
  },
  {
    command: "start",
    description: "Start the bot and link your account"
  }
];

/**
 * Auto-register Telegram bot commands
 */
async function registerTelegramCommands(botToken: string): Promise<boolean> {
  try {
    const url = `https://api.telegram.org/bot${botToken}/setMyCommands`;
    const response = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        commands: TELEGRAM_COMMANDS
      }),
    });

    if (!response.ok) {
      console.error(`Telegram API error: ${response.status}`);
      return false;
    }

    const result = await response.json();
    return result.ok === true;
  } catch (error) {
    console.error('Error registering Telegram commands:', error);
    return false;
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure user has Hermes profile (auto-create if needed)
    await ensureHermesProfile(session.user.id!);

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
    const session = await getPrivySession(request);
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
          
          // Auto-register Telegram commands after successful setup
          if (setupResult.success) {
            try {
              const commandsRegistered = await registerTelegramCommands(config.botToken);
              if (commandsRegistered) {
                console.log(`✅ Telegram commands auto-registered for user ${session.user.id}`);
              } else {
                console.warn(`⚠️ Failed to auto-register Telegram commands for user ${session.user.id}`);
              }
            } catch (cmdError) {
              // Don't fail the whole setup if command registration fails
              console.error(`⚠️ Command registration error (non-fatal):`, cmdError);
            }
          }
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

      console.log(`✅ ${type.charAt(0).toUpperCase() + type.slice(1)} platform configured and gateway restarted`);

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

      // Build success message
      let successMessage = `${type.charAt(0).toUpperCase() + type.slice(1)} channel connected successfully to your isolated Hermes instance!`;
      if (type === 'telegram') {
        successMessage += ' Slash commands (/mine, /balance, /wallet, /help, /start) have been automatically registered.';
      }

      return NextResponse.json({ 
        channel,
        message: successMessage,
        hermesSetup: setupResult.error || "Platform configured successfully",
        userIsolation: true,
        commandsRegistered: type === 'telegram' ? true : undefined
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
    const session = await getPrivySession(request);
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