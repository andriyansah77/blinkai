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

    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    
    return NextResponse.json({
      success: true,
      gateway: gatewayStatus
    });
  } catch (error) {
    console.error("Get gateway status error:", error);
    return NextResponse.json(
      { error: "Failed to get gateway status" },
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
    const { action, platform, config } = body;

    switch (action) {
      case 'start':
        const startResult = await hermesIntegration.startGateway(session.user.id!);
        return NextResponse.json(startResult);

      case 'stop':
        const stopResult = await hermesIntegration.stopGateway(session.user.id!);
        return NextResponse.json(stopResult);

      case 'setup':
        const setupResult = await hermesIntegration.setupGateway(session.user.id!);
        return NextResponse.json(setupResult);

      case 'setup-platform':
        if (!platform) {
          return NextResponse.json({ error: "Platform is required" }, { status: 400 });
        }

        let platformResult;
        switch (platform) {
          case 'telegram':
            if (!config?.botToken) {
              return NextResponse.json({ error: "Bot token is required for Telegram" }, { status: 400 });
            }
            platformResult = await hermesIntegration.setupTelegram(session.user.id!, config.botToken);
            break;

          case 'discord':
            if (!config?.botToken) {
              return NextResponse.json({ error: "Bot token is required for Discord" }, { status: 400 });
            }
            platformResult = await hermesIntegration.setupDiscord(session.user.id!, config.botToken);
            break;

          case 'whatsapp':
            platformResult = await hermesIntegration.setupWhatsApp(session.user.id!);
            break;

          default:
            return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
        }

        return NextResponse.json(platformResult);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Gateway action error:", error);
    return NextResponse.json(
      { error: "Failed to perform gateway action" },
      { status: 500 }
    );
  }
}