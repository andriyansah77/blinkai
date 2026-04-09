import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, title, messages } = body;

    if (!agentId || !title || !messages) {
      return NextResponse.json({ 
        error: "Agent ID, title, and messages are required" 
      }, { status: 400 });
    }

    // Verify agent belongs to user
    const agent = await HermesAgentDB.getAgent(agentId);
    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Create session
    const newSession = await HermesAgentDB.createSession(
      agentId,
      session.user.id!,
      title,
      messages
    );

    return NextResponse.json({
      success: true,
      sessionId: newSession.id,
      message: `Session "${title}" saved successfully`
    });

  } catch (error) {
    console.error("Save session error:", error);
    return NextResponse.json(
      { error: "Failed to save session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const limit = parseInt(searchParams.get('limit') || '10');

    if (!agentId) {
      return NextResponse.json({ 
        error: "Agent ID is required" 
      }, { status: 400 });
    }

    // Verify agent belongs to user
    const agent = await HermesAgentDB.getAgent(agentId);
    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found" }, { status: 404 });
    }

    // Get sessions
    const sessions = await HermesAgentDB.getAgentSessions(agentId, limit);

    return NextResponse.json({
      success: true,
      sessions: sessions.map(s => ({
        id: s.id,
        title: s.title,
        messageCount: s.messageCount,
        tokenUsed: s.tokenUsed,
        createdAt: s.createdAt,
        updatedAt: s.updatedAt
      }))
    });

  } catch (error) {
    console.error("Get sessions error:", error);
    return NextResponse.json(
      { error: "Failed to get sessions" },
      { status: 500 }
    );
  }
}