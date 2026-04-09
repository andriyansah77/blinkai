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