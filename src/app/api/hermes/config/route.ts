import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const config = await hermesIntegration.getConfig(session.user.id!);
    
    return NextResponse.json({
      success: true,
      config
    });
  } catch (error) {
    console.error("Get config error:", error);
    return NextResponse.json(
      { error: "Failed to get config" },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { key, value } = body;

    if (!key || value === undefined) {
      return NextResponse.json({ 
        error: "Key and value are required" 
      }, { status: 400 });
    }

    const result = await hermesIntegration.setConfig(session.user.id!, key, value);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Set config error:", error);
    return NextResponse.json(
      { error: "Failed to set config" },
      { status: 500 }
    );
  }
}