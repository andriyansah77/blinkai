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