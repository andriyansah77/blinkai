import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const [status, diagnostics, version] = await Promise.all([
      hermesIntegration.getStatus(session.user.id!),
      hermesIntegration.runDiagnostics(session.user.id!),
      hermesIntegration.getVersion()
    ]);
    
    return NextResponse.json({
      success: true,
      status,
      diagnostics,
      version,
      hermesInstalled: await hermesIntegration.isHermesInstalled()
    });
  } catch (error) {
    console.error("Get diagnostics error:", error);
    return NextResponse.json(
      { error: "Failed to get diagnostics" },
      { status: 500 }
    );
  }
}