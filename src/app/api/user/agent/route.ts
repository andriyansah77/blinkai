import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { hermesIntegration } from "@/lib/hermes-integration";

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    console.log(`[API /api/user/agent] Fetching agent for user ${session.user.id}`);

    // Get Hermes profile (this is the critical check)
    const profile = await hermesIntegration.getProfile(session.user.id!);
    
    console.log(`[API /api/user/agent] Profile status: ${profile?.status}`);

    // Check if user has an active Hermes profile
    const hasAgent = profile?.status === 'active';
    
    if (!hasAgent) {
      console.log(`[API /api/user/agent] No active agent for user ${session.user.id}`);
      return NextResponse.json({ 
        agent: null,
        hasAgent: false 
      });
    }

    // Get additional info (with fallbacks if they fail)
    let status = {};
    let skills: any[] = [];
    let sessions: any[] = [];
    let memoryStatus = { type: 'built-in', status: 'active' };

    try {
      status = await hermesIntegration.getStatus(session.user.id!);
    } catch (err) {
      console.warn(`[API /api/user/agent] Failed to get status:`, err);
    }

    try {
      skills = await hermesIntegration.getSkills(session.user.id!);
    } catch (err) {
      console.warn(`[API /api/user/agent] Failed to get skills:`, err);
    }

    try {
      sessions = await hermesIntegration.getSessions(session.user.id!);
    } catch (err) {
      console.warn(`[API /api/user/agent] Failed to get sessions:`, err);
    }

    try {
      memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);
    } catch (err) {
      console.warn(`[API /api/user/agent] Failed to get memory status:`, err);
    }

    // Build agent data from Hermes integration
    const agent = {
      id: `hermes-${session.user.id}`,
      name: profile?.profileName || `user-${session.user.id}`,
      description: "Your personal Hermes agent with full CLI integration",
      model: (status as any).model || "gpt-4o",
      provider: (status as any).provider || "openai",
      skills: skills.length,
      sessions: sessions.length,
      memories: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      learningEnabled: true,
      createdAt: new Date().toISOString()
    };
    
    console.log(`[API /api/user/agent] Agent found for user ${session.user.id}`);
    
    return NextResponse.json({
      agent,
      hasAgent: true,
      hermesIntegration: true,
      profile: {
        home: profile?.hermesHome,
        config: profile?.configPath,
        memory: memoryStatus
      }
    });
  } catch (error) {
    console.error("[API /api/user/agent] Error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}