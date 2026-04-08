import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's primary agent (first one created)
    const agents = await HermesAgentDB.getUserAgents(session.user.id!);
    
    if (agents.length === 0) {
      return NextResponse.json({ 
        agent: null,
        hasAgent: false 
      });
    }

    const primaryAgent = agents[0]; // Get the first/primary agent
    
    return NextResponse.json({
      agent: {
        id: primaryAgent.id,
        name: primaryAgent.name,
        description: primaryAgent.description,
        model: primaryAgent.model,
        provider: primaryAgent.provider,
        skills: primaryAgent._count.skills,
        sessions: primaryAgent._count.sessions,
        memories: primaryAgent._count.memories,
        learningEnabled: primaryAgent.learningEnabled,
        createdAt: primaryAgent.createdAt.toISOString()
      },
      hasAgent: true
    });
  } catch (error) {
    console.error("Get user agent error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agent" },
      { status: 500 }
    );
  }
}