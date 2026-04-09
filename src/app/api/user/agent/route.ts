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

    // Get Hermes profile and status for this user
    const profile = await hermesIntegration.getProfile(session.user.id!);
    const status = await hermesIntegration.getStatus(session.user.id!);
    const skills = await hermesIntegration.getSkills(session.user.id!);
    const sessions = await hermesIntegration.getSessions(session.user.id!);
    const memoryStatus = await hermesIntegration.getMemoryStatus(session.user.id!);

    // Check if user has an active Hermes profile
    const hasAgent = profile?.status === 'active';
    
    if (!hasAgent) {
      return NextResponse.json({ 
        agent: null,
        hasAgent: false 
      });
    }

    // Build agent data from Hermes integration
    const agent = {
      id: `hermes-${session.user.id}`,
      name: profile?.profileName || `user-${session.user.id}`,
      description: "Your personal Hermes agent with full CLI integration",
      model: status.model || "gpt-4o",
      provider: status.provider || "openai",
      skills: skills.length,
      sessions: sessions.length,
      memories: sessions.reduce((sum, s) => sum + s.messageCount, 0),
      learningEnabled: true,
      createdAt: new Date().toISOString()
    };
    
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
    console.error("Get user agent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}