import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// Supported platforms with their validation requirements
const SUPPORTED_PLATFORMS = {
  telegram: {
    name: "Telegram",
    requiredFields: ["botToken"],
    optionalFields: ["username"],
    validation: {
      botToken: (token: string) => /^\d+:[A-Za-z0-9_-]{35}$/.test(token)
    }
  },
  discord: {
    name: "Discord", 
    requiredFields: ["botToken"],
    optionalFields: ["serverId"],
    validation: {
      botToken: (token: string) => token.length > 50 && token.includes('.'),
      serverId: (id: string) => /^\d{17,19}$/.test(id)
    }
  },
  whatsapp: {
    name: "WhatsApp",
    requiredFields: ["phoneNumber", "apiKey"],
    optionalFields: ["webhookUrl"],
    validation: {
      phoneNumber: (phone: string) => /^\+\d{10,15}$/.test(phone),
      apiKey: (key: string) => key.length > 10,
      webhookUrl: (url: string) => /^https?:\/\/.+/.test(url)
    }
  }
};

async function validateChannelConfig(type: string, config: any) {
  const platform = SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS];
  if (!platform) {
    throw new Error(`Unsupported platform: ${type}`);
  }

  // Check required fields
  for (const field of platform.requiredFields) {
    if (!config[field]) {
      throw new Error(`Missing required field: ${field}`);
    }
    
    // Validate field format if validator exists
    const validator = platform.validation[field as keyof typeof platform.validation] as ((value: string) => boolean) | undefined;
    if (validator && !validator(config[field])) {
      throw new Error(`Invalid format for ${field}`);
    }
  }

  // Validate optional fields if provided
  for (const field of platform.optionalFields) {
    if (config[field]) {
      const validator = platform.validation[field as keyof typeof platform.validation] as ((value: string) => boolean) | undefined;
      if (validator && !validator(config[field])) {
        throw new Error(`Invalid format for ${field}`);
      }
    }
  }

  return true;
}

async function testChannelConnection(type: string, config: any) {
  // In a real implementation, you would test the actual connection
  // For now, we'll simulate connection testing
  
  try {
    switch (type) {
      case 'telegram':
        // Test Telegram bot token by calling getMe API
        console.log(`Testing Telegram bot: ${config.username || 'Unknown'}`);
        break;
        
      case 'discord':
        // Test Discord bot token by calling Discord API
        console.log(`Testing Discord bot for server: ${config.serverId || 'Unknown'}`);
        break;
        
      case 'whatsapp':
        // Test WhatsApp API connection
        console.log(`Testing WhatsApp for number: ${config.phoneNumber}`);
        break;
    }
    
    // Simulate successful connection
    return { success: true, message: "Connection successful" };
  } catch (error) {
    return { success: false, message: "Connection failed" };
  }
}

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's connected channels from database
    // For now, we'll return mock data but in production this would be from a channels table
    const channels = [
      {
        id: "telegram-demo",
        type: "telegram",
        name: "Demo Telegram Bot",
        agentId: "agent-demo-1",
        agentName: "Customer Support Agent",
        status: "connected",
        lastActivity: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
        messageCount: 1250,
        config: {
          username: "@demo_bot",
          botToken: "***hidden***"
        }
      },
      {
        id: "discord-demo", 
        type: "discord",
        name: "Demo Discord Bot",
        agentId: "agent-demo-2",
        agentName: "Gaming Assistant",
        status: "connected",
        lastActivity: new Date(Date.now() - 30 * 60 * 1000).toISOString(), // 30 minutes ago
        messageCount: 890,
        config: {
          serverId: "123456789012345678",
          botToken: "***hidden***"
        }
      }
    ];

    return NextResponse.json({ 
      channels,
      supportedPlatforms: Object.keys(SUPPORTED_PLATFORMS)
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
      // Validate configuration
      await validateChannelConfig(type, config);
      
      // Test connection
      const connectionTest = await testChannelConnection(type, config);
      if (!connectionTest.success) {
        return NextResponse.json({ 
          error: `Connection test failed: ${connectionTest.message}` 
        }, { status: 400 });
      }

      // Create channel record with agent connection
      const channelData = {
        type,
        name,
        agentId,
        ...config
      };

      const channel = {
        id: `${type}-${Date.now()}`,
        type,
        name,
        agentId, // Store the connected agent ID
        status: "connected" as const,
        lastActivity: new Date().toISOString(),
        messageCount: 0,
        config: {
          // Store config but hide sensitive data in response
          ...Object.fromEntries(
            Object.entries(config).map(([key, value]) => [
              key,
              key.includes('token') || key.includes('key') ? "***hidden***" : value
            ])
          )
        },
        createdAt: new Date().toISOString(),
        userId: session.user.id
      };

      // In production, save to database:
      // await prisma.channel.create({ data: channel });

      console.log(`✅ ${SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS].name} channel created:`, {
        id: channel.id,
        name: channel.name,
        type: channel.type,
        userId: session.user.id
      });

      return NextResponse.json({ 
        channel,
        message: `${SUPPORTED_PLATFORMS[type as keyof typeof SUPPORTED_PLATFORMS].name} channel connected successfully!`
      }, { status: 201 });

    } catch (validationError) {
      return NextResponse.json({ 
        error: validationError instanceof Error ? validationError.message : "Validation failed"
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