import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { setupUserGateway } from "@/lib/setup-user-gateway";

/**
 * Setup Hermes profiles for all existing users
 * This is a one-time migration endpoint
 */
export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    
    // Only allow authenticated users (you might want to add admin check)
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log("[Setup All Users] Starting bulk user setup...");

    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    console.log(`[Setup All Users] Found ${users.length} users`);

    const results = {
      total: users.length,
      successful: 0,
      failed: 0,
      skipped: 0,
      details: [] as any[],
    };

    // Setup each user
    for (const user of users) {
      console.log(`[Setup All Users] Processing user ${user.id} (${user.email})`);
      
      try {
        const result = await setupUserGateway(user.id);
        
        if (result.success) {
          results.successful++;
          results.details.push({
            userId: user.id,
            email: user.email,
            status: "success",
            profileCreated: result.profileCreated,
            gatewayInstalled: result.gatewayInstalled,
            gatewayStarted: result.gatewayStarted,
          });
          console.log(`[Setup All Users] ✅ Success for user ${user.id}`);
        } else {
          results.failed++;
          results.details.push({
            userId: user.id,
            email: user.email,
            status: "failed",
            error: result.error,
          });
          console.log(`[Setup All Users] ❌ Failed for user ${user.id}: ${result.error}`);
        }
      } catch (error) {
        results.failed++;
        results.details.push({
          userId: user.id,
          email: user.email,
          status: "error",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        console.error(`[Setup All Users] ❌ Exception for user ${user.id}:`, error);
      }

      // Small delay to avoid overwhelming the system
      await new Promise(resolve => setTimeout(resolve, 1000));
    }

    console.log("[Setup All Users] Bulk setup complete");
    console.log(`[Setup All Users] Results: ${results.successful} successful, ${results.failed} failed, ${results.skipped} skipped`);

    return NextResponse.json({
      message: "Bulk user setup completed",
      results,
    });
  } catch (error) {
    console.error("[Setup All Users] Error:", error);
    return NextResponse.json(
      { 
        error: "Failed to setup users",
        details: error instanceof Error ? error.message : "Unknown error"
      },
      { status: 500 }
    );
  }
}

/**
 * Get setup status for all users
 */
export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
      },
    });

    return NextResponse.json({
      message: "User list for setup",
      totalUsers: users.length,
      users: users.map(u => ({
        id: u.id,
        email: u.email,
        name: u.name,
        createdAt: u.createdAt,
      })),
      setupEndpoint: "/api/hermes/setup-all-users (POST)",
    });
  } catch (error) {
    console.error("[Setup All Users] Error:", error);
    return NextResponse.json(
      { error: "Failed to get users" },
      { status: 500 }
    );
  }
}
