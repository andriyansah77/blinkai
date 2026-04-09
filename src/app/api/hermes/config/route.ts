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
    const session = await getServerSession(authOptions);
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