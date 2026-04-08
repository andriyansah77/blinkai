import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's connected channels
    const user = await prisma.user.findUnique({
      where: { id: session.user.id! },
      select: {
        id: true,
        hermesAgents: {
          select: {
            id: true,
            name: true,
            // In a real implementation, you'd have a channels relation
          }
        }
      }
    });

    // Mock channels data - in production, this would come from database
    const channels = [
      {
        id: "discord-1",
        type: "discord",
        name: "My Discord Bot",
        status: "connected",
        lastActivity: new Date().toISOString(),
        messageCount: 1250,
        config: {
          serverId: "123456789",
          botToken: "***hidden***"
        }
      },
      {
        id: "telegram-1", 
        type: "telegram",
        name: "Telegram Assistant",
        status: "connected",
        lastActivity: new Date().toISOString(),
        messageCount: 890,
        config: {
          botToken: "***hidden***",
          username: "@my_assistant_bot"
        }
      }
    ];

    return NextResponse.json({ channels });
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
    const { type, name, config } = body;

    if (!type || !name) {
      return NextResponse.json({ 
        error: "Channel type and name are required" 
      }, { status: 400 });
    }

    // In a real implementation, you would:
    // 1. Validate the channel configuration
    // 2. Test the connection
    // 3. Store in database
    // 4. Set up webhooks/polling

    const channel = {
      id: `${type}-${Date.now()}`,
      type,
      name,
      status: "connected",
      lastActivity: new Date().toISOString(),
      messageCount: 0,
      config: {
        ...config,
        // Hide sensitive data
        botToken: config.botToken ? "***hidden***" : undefined
      }
    };

    return NextResponse.json({ channel }, { status: 201 });
  } catch (error) {
    console.error("Create channel error:", error);
    return NextResponse.json(
      { error: "Failed to create channel" },
      { status: 500 }
    );
  }
}