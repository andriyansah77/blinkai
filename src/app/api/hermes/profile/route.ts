import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { ensureHermesProfile } from "@/lib/ensure-hermes-profile";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Ensure profile exists (auto-create if needed)
    const result = await ensureHermesProfile(session.user.id!);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Failed to ensure profile",
        details: result.error
      }, { status: 500 });
    }

    // Get full profile info
    const profile = await hermesIntegration.getProfile(session.user.id!);

    return NextResponse.json({
      success: true,
      profile,
      created: result.created,
      message: result.created 
        ? "Profile created successfully" 
        : "Profile already exists"
    });
  } catch (error) {
    console.error("Profile API error:", error);
    return NextResponse.json(
      { error: "Failed to get profile" },
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

    // Force create/recreate profile
    const result = await hermesIntegration.createProfile(session.user.id!);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Failed to create profile",
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      profile: result.profile,
      message: "Profile created successfully"
    });
  } catch (error) {
    console.error("Profile creation error:", error);
    return NextResponse.json(
      { error: "Failed to create profile" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Delete profile
    const result = await hermesIntegration.deleteProfile(session.user.id!);

    if (!result.success) {
      return NextResponse.json({ 
        error: "Failed to delete profile",
        details: result.error
      }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      message: "Profile deleted successfully"
    });
  } catch (error) {
    console.error("Profile deletion error:", error);
    return NextResponse.json(
      { error: "Failed to delete profile" },
      { status: 500 }
    );
  }
}
