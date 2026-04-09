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
      gateway: gatewayStatus,
      setup: setupStatus,
      userId: session.user.id,
    });
  } catch (error) {
    console.error("Gateway status error:", error);
    return NextResponse.json(
      { error: "Failed to get gateway status" },
      { status: 500 }
    );
  }
}

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Setup gateway for user
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
      { error: "Failed to setup gateway" },
      { status: 500 }
    );
  }
}
