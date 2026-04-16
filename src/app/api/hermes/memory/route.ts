import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);
    
    return NextResponse.json({
      success: true,
      memory: memoryStatus
    });
  } catch (error) {
    console.error("Get memory status error:", error);
    return NextResponse.json(
      { error: "Failed to get memory status" },
      { status: 500 }
    );
  }
}