import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Check Hermes CLI installation
    const hermesInstalled = await hermesIntegration.isHermesInstalled();
    const hermesVersion = await hermesIntegration.getVersion();
    
    // Get user profile status
    const profile = await hermesIntegration.getProfile(session.user.id!);
    
    // Get comprehensive status
    const status = await hermesIntegration.getStatus(session.user.id!);
    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    const memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);
    const skills = await hermesIntegration.getSkills(session.user.id!);
    const cronJobs = await hermesIntegration.getCronJobs(session.user.id!);

    return NextResponse.json({
      hermes: {
        installed: hermesInstalled,
        version: hermesVersion,
        framework: "NousResearch/hermes-agent",
        cliPath: "/root/.local/bin/hermes"
      },
      profile: {
        exists: profile?.status === 'active',
        name: profile?.profileName,
        home: profile?.hermesHome,
        status: profile?.status
      },
      status,
      gateway: gatewayStatus,
      memory: memoryStatus,
      skills: {
        total: skills.length,
        installed: skills.filter(s => s.installed).length,
        enabled: skills.filter(s => s.enabled).length,
        list: skills
      },
      cronJobs: {
        total: cronJobs.length,
        enabled: cronJobs.filter(j => j.enabled).length,
        list: cronJobs
      },
      system: {
        platform: process.platform,
        nodeVersion: process.version,
        userIsolation: true,
        profilesDir: "/tmp/hermes-profiles"
      },
      capabilities: {
        chat: true,
        skills: true,
        gateway: true,
        cron: true,
        memory: true,
        config: true,
        diagnostics: true,
        userProfiles: true
      }
    });

  } catch (error) {
    console.error("Hermes status error:", error);
    return NextResponse.json({
      error: "Failed to get Hermes status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'createProfile':
        try {
          const result = await hermesIntegration.createProfile(session.user.id!, params);
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : "Profile creation failed"
          }, { status: 500 });
        }

      case 'deleteProfile':
        try {
          const result = await hermesIntegration.deleteProfile(session.user.id!);
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : "Profile deletion failed"
          }, { status: 500 });
        }

      case 'startGateway':
        try {
          const result = await hermesIntegration.startGateway(session.user.id!);
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : "Gateway start failed"
          }, { status: 500 });
        }

      case 'stopGateway':
        try {
          const result = await hermesIntegration.stopGateway(session.user.id!);
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({ 
            success: false,
            error: error instanceof Error ? error.message : "Gateway stop failed"
          }, { status: 500 });
        }

      case 'runDiagnostics':
        try {
          const result = await hermesIntegration.runDiagnostics(session.user.id!);
          return NextResponse.json(result);
        } catch (error) {
          return NextResponse.json({ 
            success: false,
            report: '',
            error: error instanceof Error ? error.message : "Diagnostics failed"
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ 
          success: false,
          error: "Invalid action" 
        }, { status: 400 });
    }

  } catch (error) {
    console.error("Hermes action error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to execute action",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}