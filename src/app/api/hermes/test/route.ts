import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log('🔍 Testing Hermes CLI connection...');

    // Test 1: Check Hermes CLI installation
    const hermesInstalled = await hermesIntegration.isHermesInstalled();
    const hermesVersion = await hermesIntegration.getVersion();

    // Test 2: Check user profile
    const profile = await hermesIntegration.getProfile(session.user.id!);
    
    // Test 3: Get comprehensive status
    const status = await hermesIntegration.getStatus(session.user.id!);
    const gatewayStatus = await hermesIntegration.getGatewayStatus(session.user.id!);
    const memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);
    const skills = await hermesIntegration.getSkills(session.user.id!);
    const sessions = await hermesIntegration.getSessions(session.user.id!);
    const cronJobs = await hermesIntegration.getCronJobs(session.user.id!);

    // Test 4: Run diagnostics
    const diagnostics = await hermesIntegration.runDiagnostics(session.user.id!);

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      environment: {
        platform: process.platform,
        nodeVersion: process.version,
        hermesPath: "/root/.local/bin/hermes"
      },
      hermes: {
        installed: hermesInstalled,
        version: hermesVersion,
        framework: "NousResearch/hermes-agent"
      },
      profile: {
        exists: profile?.status === 'active',
        name: profile?.profileName,
        home: profile?.hermesHome,
        status: profile?.status
      },
      status,
      gateway: {
        status: gatewayStatus.status,
        platforms: Object.keys(gatewayStatus.platforms).length,
        details: gatewayStatus.platforms
      },
      memory: {
        type: memoryStatus.type,
        status: memoryStatus.status
      },
      skills: {
        total: skills.length,
        installed: skills.filter(s => s.installed).length,
        enabled: skills.filter(s => s.enabled).length
      },
      sessions: {
        total: sessions.length,
        recent: sessions.slice(0, 3)
      },
      cronJobs: {
        total: cronJobs.length,
        enabled: cronJobs.filter(j => j.enabled).length
      },
      diagnostics: {
        success: diagnostics.success,
        hasReport: diagnostics.report.length > 0
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
      },
      recommendations: [
        ...(hermesInstalled ? [] : ['Install Hermes CLI on VPS']),
        ...(profile?.status === 'active' ? [] : ['Create user profile']),
        ...(skills.length > 0 ? [] : ['Install some skills']),
        ...(gatewayStatus.status === 'running' ? [] : ['Setup gateway for platform connections'])
      ]
    });

  } catch (error) {
    console.error("Hermes test error:", error);
    return NextResponse.json({
      error: "Failed to test Hermes CLI",
      details: error instanceof Error ? error.message : "Unknown error",
      timestamp: new Date().toISOString()
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { action, message } = body;

    switch (action) {
      case 'quick_chat':
        if (!message) {
          return NextResponse.json({ error: "Message required" }, { status: 400 });
        }

        try {
          // Ensure profile exists
          const profile = await hermesIntegration.getProfile(session.user.id!);
          if (!profile || profile.status === 'inactive') {
            await hermesIntegration.createProfile(session.user.id!);
          }

          // Send test message
          const responseGenerator = await hermesIntegration.sendChatMessage(
            session.user.id!,
            message,
            { quiet: true }
          );

          let response = '';
          for await (const chunk of responseGenerator) {
            response += chunk;
          }

          return NextResponse.json({
            success: true,
            response: response.trim(),
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            error: "Chat test failed",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 });
        }

      case 'check_config':
        try {
          const config = await hermesIntegration.getConfig(session.user.id!);
          return NextResponse.json({
            success: true,
            config,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            error: "Config check failed",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 });
        }

      case 'run_diagnostics':
        try {
          const diagnostics = await hermesIntegration.runDiagnostics(session.user.id!);
          return NextResponse.json({
            success: diagnostics.success,
            report: diagnostics.report,
            error: diagnostics.error,
            timestamp: new Date().toISOString()
          });
        } catch (error) {
          return NextResponse.json({
            error: "Diagnostics failed",
            details: error instanceof Error ? error.message : "Unknown error"
          }, { status: 500 });
        }

      default:
        return NextResponse.json({ error: "Invalid action" }, { status: 400 });
    }

  } catch (error) {
    console.error("Hermes test action error:", error);
    return NextResponse.json({
      error: "Failed to execute test action",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}