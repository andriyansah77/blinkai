import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";
import { DEFAULT_AGENTS } from "@/lib/hermes-agent";

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const agents = await HermesAgentDB.getUserAgents(session.user.id!);
    
    return NextResponse.json({
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        provider: agent.provider,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        tools: JSON.parse(agent.tools),
        skills: agent._count.skills,
        memory: {
          total: agent._count.memories,
          byType: {} // Could be expanded with more detailed stats
        },
        sessions: agent._count.sessions,
        learningEnabled: agent.learningEnabled,
        createdAt: agent.createdAt.toISOString()
      })),
      defaultAgents: DEFAULT_AGENTS
    });
  } catch (error) {
    console.error("Get agents error:", error);
    return NextResponse.json(
      { error: "Failed to fetch agents" },
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
    const { name, description, model, provider, systemPrompt, temperature, maxTokens, tools, learningEnabled } = body;

    if (!name) {
      return NextResponse.json({ error: "Agent name is required" }, { status: 400 });
    }

    const agent = await HermesAgentDB.createAgent(session.user.id!, {
      name,
      description: description || "",
      model: model || "gpt-4o",
      provider: provider || "openai",
      systemPrompt: systemPrompt || "You are a helpful AI assistant.",
      temperature: temperature || 0.7,
      maxTokens: maxTokens || 4000,
      tools: tools || [],
      memory: true,
      learningEnabled: learningEnabled !== false
    });
    
    return NextResponse.json({
      id: agent.id,
      name: agent.name,
      description: agent.description,
      model: agent.model,
      provider: agent.provider,
      temperature: agent.temperature,
      maxTokens: agent.maxTokens,
      tools: JSON.parse(agent.tools),
      learningEnabled: agent.learningEnabled,
      createdAt: agent.createdAt.toISOString()
    }, { status: 201 });
  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}