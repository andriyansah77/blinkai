import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesIntegration } from "@/lib/hermes-integration";
import { getGatewaySetupStatus, setupUserGateway } from "@/lib/setup-user-gateway";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get gateway status
    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    
    // Get setup status
    const setupStatus = await getGatewaySetupStatus(session.user.id!);

    return NextResponse.json({
      success: true,
      gateway: gatewayStatus,
      setup: setupStatus,
      platforms: gatewayStatus.platforms || {},
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Gateway status error:", error);
    // Return empty data instead of error to prevent UI breaking
    return NextResponse.json({
      success: false,
      gateway: { status: 'stopped', platforms: {} },
      setup: { profileExists: false, gatewayInstalled: false, gatewayRunning: false },
      platforms: {},
      error: String(error)
    });
  }
}

export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { platform, bot_token } = body;

    // If platform is specified, configure that platform
    if (platform) {
      console.log(`[Gateway API] Configuring ${platform} for user ${session.user.id}`);
      
      let result;
      
      switch (platform) {
        case 'telegram':
          if (!bot_token) {
            return NextResponse.json({ error: "Bot token is required for Telegram" }, { status: 400 });
          }
          result = await hermesIntegration.setupTelegram(session.user.id!, bot_token);
          break;
          
        case 'discord':
          if (!bot_token) {
            return NextResponse.json({ error: "Bot token is required for Discord" }, { status: 400 });
          }
          result = await hermesIntegration.setupDiscord(session.user.id!, bot_token);
          break;
          
        case 'whatsapp':
          result = await hermesIntegration.setupWhatsApp(session.user.id!);
          
          // WhatsApp returns instructions instead of direct setup
          if (result.success && (result as any).instructions) {
            return NextResponse.json({
              success: true,
              message: 'WhatsApp setup instructions',
              platform,
              instructions: (result as any).instructions,
              requiresManualSetup: true
            });
          }
          break;
          
        case 'slack':
          if (!bot_token) {
            return NextResponse.json({ error: "Bot token is required for Slack" }, { status: 400 });
          }
          // Slack uses same setup as Discord/Telegram
          result = await hermesIntegration.setupDiscord(session.user.id!, bot_token);
          break;
          
        default:
          return NextResponse.json({ error: "Unsupported platform" }, { status: 400 });
      }
      
      if (!result.success) {
        return NextResponse.json({ 
          error: `${platform} configuration failed`,
          details: result.error
        }, { status: 500 });
      }
      
      return NextResponse.json({
        success: true,
        message: `${platform} configured successfully`,
        platform
      });
    }

    // Otherwise, setup gateway for user (initial setup)
    const result = await setupUserGateway(session.user.id!);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Gateway setup failed",
        details: result.error,
        result
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Gateway setup completed successfully",
      result
    });
  } catch (error) {
    console.error("Gateway setup error:", error);
    return NextResponse.json(
      { error: "Failed to setup gateway", details: String(error) },
      { status: 500 }
    );
  }
}
