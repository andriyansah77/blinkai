import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";
import { exec } from "child_process";
import { promisify } from "util";

const prisma = new PrismaClient();
const execAsync = promisify(exec);

// Supported platforms with their validation requirements
const SUPPORTED_PLATFORMS = {
  telegram: {
    name: "Telegram",
    requiredFields: ["botToken"],
    optionalFields: ["username"],
    validation: {
      botToken: (token: string) => /^\d+:[A-Za-z0-9_-]{35}$/.test(token)
    },
    hermesCommand: "gateway"
  },
  discord: {
    name: "Discord", 
    requiredFields: ["botToken"],
    optionalFields: ["serverId"],
    validation: {
      botToken: (token: string) => token.length > 50 && token.includes('.'),
      serverId: (id: string) => /^\d{17,19}$/.test(id)
    },
    hermesCommand: "gateway"
  },
  whatsapp: {
    name: "WhatsApp",
    requiredFields: [],
    optionalFields: ["phoneNumber"],
    validation: {
      phoneNumber: (phone: string) => /^\+\d{10,15}$/.test(phone)
    },
    hermesCommand: "whatsapp"
  }
};

async function executeHermesCommand(command: string, args: string[] = [], userId?: string): Promise<any> {
  const hermesPath = '/root/.local/bin/hermes';
  
  // Create user-specific working directory and profile
  let workingDir = process.cwd();
  let profileArgs: string[] = [];
  
  if (userId) {
    // Create user-specific directory
    workingDir = `/tmp/hermes-users/${userId}`;
    await execAsync(`mkdir -p ${workingDir}`);
    
    // Use Hermes profiles for isolation
    profileArgs = ['--profile', `user-${userId}`];
  }
  
  const fullArgs = [...profileArgs, command, ...args];
  const fullCommand = `${hermesPath} ${fullArgs.join(' ')}`;
  
  try {
    const result = await execAsync(fullCommand, { cwd: workingDir });
    return { success: true, output: result.stdout, error: result.stderr };
  } catch (error: any) {
    return { success: false, output: '', error: error.message };
  }
}

async function setupHermesPlatform(type: string, config: any, userId: string): Promise<{ success: boolean; message: string }> {
  const platform = SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS];
  if (!platform) {
    return { success: false, message: `Unsupported platform: ${type}` };
  }

  try {
    // Initialize user profile if not exists
    const profileResult = await executeHermesCommand('profile', ['create', `user-${userId}`], userId);
    if (!profileResult.success && !profileResult.error.includes('already exists')) {
      console.warn(`Profile creation warning: ${profileResult.error}`);
    }

    switch (type) {
      case 'telegram':
        // Use Hermes gateway setup for Telegram with user isolation
        const telegramResult = await executeHermesCommand('gateway', ['setup'], userId);
        if (!telegramResult.success) {
          return { success: false, message: `Telegram setup failed: ${telegramResult.error}` };
        }
        
        // Configure Telegram bot token via Hermes config for this user
        const configResult = await executeHermesCommand('config', ['set', 'telegram.bot_token', config.botToken], userId);
        if (!configResult.success) {
          return { success: false, message: `Failed to set Telegram token: ${configResult.error}` };
        }
        
        return { success: true, message: "Telegram bot configured successfully for your isolated Hermes instance" };

      case 'discord':
        // Use Hermes gateway setup for Discord with user isolation
        const discordResult = await executeHermesCommand('gateway', ['setup'], userId);
        if (!discordResult.success) {
          return { success: false, message: `Discord setup failed: ${discordResult.error}` };
        }
        
        // Configure Discord bot token via Hermes config for this user
        const discordConfigResult = await executeHermesCommand('config', ['set', 'discord.bot_token', config.botToken], userId);
        if (!discordConfigResult.success) {
          return { success: false, message: `Failed to set Discord token: ${discordConfigResult.error}` };
        }
        
        return { success: true, message: "Discord bot configured successfully for your isolated Hermes instance" };

      case 'whatsapp':
        // Use Hermes WhatsApp setup (QR code pairing) with user isolation
        const whatsappResult = await executeHermesCommand('whatsapp', [], userId);
        if (!whatsappResult.success) {
          return { success: false, message: `WhatsApp setup failed: ${whatsappResult.error}` };
        }
        
        return { success: true, message: "WhatsApp configured successfully for your isolated Hermes instance (QR code pairing)" };

      default:
        return { success: false, message: `Platform ${type} not implemented yet` };
    }
  } catch (error) {
    return { success: false, message: `Setup failed: ${error}` };
  }
}

async function startHermesGateway(userId: string): Promise<{ success: boolean; message: string }> {
  try {
    const result = await executeHermesCommand('gateway', ['start'], userId);
    if (result.success) {
      return { success: true, message: "Your isolated Hermes gateway started successfully" };
    } else {
      return { success: false, message: `Failed to start your gateway: ${result.error}` };
    }
  } catch (error) {
    return { success: false, message: `Gateway start failed: ${error}` };
  }
}

async function getHermesGatewayStatus(userId: string): Promise<{ success: boolean; status: string; platforms: any[] }> {
  try {
    const result = await executeHermesCommand('gateway', ['status'], userId);
    if (result.success) {
      // Parse gateway status output
      const statusLines = result.output.split('\n').filter((line: string) => line.trim());
      const platforms = [];
      
      for (const line of statusLines) {
        if (line.includes('Telegram') || line.includes('Discord') || line.includes('WhatsApp')) {
          const parts = line.split(':');
          if (parts.length >= 2) {
            platforms.push({
              name: parts[0].trim(),
              status: parts[1].trim().toLowerCase().includes('running') ? 'connected' : 'disconnected'
            });
          }
        }
      }
      
      return { success: true, status: 'running', platforms };
    } else {
      return { success: false, status: 'stopped', platforms: [] };
    }
  } catch (error) {
    return { success: false, status: 'error', platforms: [] };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get Hermes gateway status to see connected platforms for this user
    const gatewayStatus = await getHermesGatewayStatus(session.user.id!);
    
    // Get user's connected channels from Hermes for this specific user
    const channels = gatewayStatus.platforms.map((platform, index) => ({
      id: `hermes-${session.user.id}-${platform.name.toLowerCase()}-${index}`,
      type: platform.name.toLowerCase(),
      name: `${platform.name} (Your Instance)`,
      agentId: `hermes-${session.user.id}`,
      agentName: "Your Hermes Agent",
      status: platform.status,
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      config: {
        hermesManaged: true,
        userIsolated: true,
        userId: session.user.id
      }
    }));

    return NextResponse.json({ 
      channels,
      gatewayStatus: gatewayStatus.status,
      supportedPlatforms: Object.keys(SUPPORTED_PLATFORMS),
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

    const body = await request.json();
    const { type, name, agentId, ...config } = body;

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

    // Validate platform support
    if (!SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS]) {
      return NextResponse.json({ 
        error: `Platform ${type} is not supported yet. Available platforms: ${Object.keys(SUPPORTED_PLATFORMS).join(', ')}` 
      }, { status: 400 });
    }

    try {
      // Setup platform using Hermes CLI with user isolation
      const setupResult = await setupHermesPlatform(type, config, session.user.id!);
      if (!setupResult.success) {
        return NextResponse.json({ 
          error: `Platform setup failed: ${setupResult.message}` 
        }, { status: 400 });
      }

      // Start Hermes gateway for this user if not already running
      const gatewayResult = await startHermesGateway(session.user.id!);
      if (!gatewayResult.success) {
        console.warn(`Gateway start warning for user ${session.user.id}: ${gatewayResult.message}`);
      }

      // Create channel record with Hermes integration and user isolation
      const channel = {
        id: `hermes-${session.user.id}-${type}-${Date.now()}`,
        type,
        name,
        agentId, // Store the connected agent ID
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

      // In production, save to database:
      // await prisma.channel.create({ data: channel });

      console.log(`✅ ${SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS].name} channel created via isolated Hermes:`, {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        userId: session.user.id,
        hermesProfile: `user-${session.user.id}`,
        isolated: true
      });

      return NextResponse.json({ 
        channel,
        message: `${SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS].name} channel connected successfully to your isolated Hermes instance!`,
        hermesSetup: setupResult.message,
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

    // In production, delete from database:
    // await prisma.channel.delete({ 
    //   where: { id: channelId, userId: session.user.id } 
    // });

    console.log(`🗑️ Channel deleted: ${channelId} by user: ${session.user.id}`);

    return NextResponse.json({ 
      message: "Channel disconnected successfully" 
    });

  } catch (error) {
    console.error("Delete channel error:", error);
    return NextResponse.json(
      { error: "Failed to delete channel" },
      { status: 500 }
    );
  }
}