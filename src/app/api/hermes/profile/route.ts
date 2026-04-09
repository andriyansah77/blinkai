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

    const profile = await hermesIntegration.getProfile(session.user.id!);
    const status = await hermesIntegration.getStatus(session.user.id!);
    
    return NextResponse.json({
      success: true,
      profile,
      status
    });
  } catch (error) {
    console.error("Get profile error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
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
    const { action, ...options } = body;

    switch (action) {
      case 'create':
        const result = await hermesIntegration.createProfile(session.user.id!, options);
        return NextResponse.json(result);

      case 'delete':
        const deleteResult = await hermesIntegration.deleteProfile(session.user.id!);
        return NextResponse.json(deleteResult);

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }
  } catch (error) {
    console.error("Profile action error:", error);
    return NextResponse.json(
      { error: "Failed to perform profile action" },
      { status: 500 }
    );
  }
}