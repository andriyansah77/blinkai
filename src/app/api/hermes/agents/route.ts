import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Get user's agents with stats
    const agents = await HermesAgentDB.getUserAgents(session.user.id!);
    
    // Transform agents with additional stats
    const agentsWithStats = await Promise.all(
      agents.map(async (agent) => {
        const stats = await HermesAgentDB.getAgentStats(agent.id);
        
        return {
          id: agent.id,
          name: agent.name,
          description: agent.description,
          model: agent.model,
          provider: agent.provider,
          systemPrompt: agent.systemPrompt,
          temperature: agent.temperature,
          maxTokens: agent.maxTokens,
          learningEnabled: agent.learningEnabled,
          memoryEnabled: agent.memoryEnabled,
          status: agent.status,
          createdAt: agent.createdAt,
          updatedAt: agent.updatedAt,
          skills: stats?.stats.totalSkills || 0,
          memory: {
            total: stats?.stats.totalMemories || 0,
            byType: {} // Could be expanded to show memory by type
          },
          sessions: stats?.stats.totalSessions || 0,
          totalTokens: stats?.stats.totalTokens || 0,
          recentSessions: stats?.stats.recentSessions || 0
        };
      })
    );

    return NextResponse.json({
      success: true,
      agents: agentsWithStats,
      count: agentsWithStats.length
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
    const {
      name,
      description,
      model = "gpt-4o",
      provider = "openai",
      systemPrompt = "",
      temperature = 0.7,
      maxTokens = 4000,
      learningEnabled = true,
      memoryEnabled = true
    } = body;

    if (!name) {
      return NextResponse.json({ 
        error: "Agent name is required" 
      }, { status: 400 });
    }

    // Create new agent
    const agent = await HermesAgentDB.createAgent(session.user.id!, {
      name,
      description,
      model,
      provider,
      systemPrompt,
      temperature,
      maxTokens,
      memory: memoryEnabled,
      learningEnabled
    });

    return NextResponse.json({
      success: true,
      agent: {
        id: agent.id,
        name: agent.name,
        description: agent.description,
        model: agent.model,
        provider: agent.provider,
        systemPrompt: agent.systemPrompt,
        temperature: agent.temperature,
        maxTokens: agent.maxTokens,
        learningEnabled: agent.learningEnabled,
        memoryEnabled: agent.memoryEnabled,
        status: agent.status,
        createdAt: agent.createdAt
      }
    });

  } catch (error) {
    console.error("Create agent error:", error);
    return NextResponse.json(
      { error: "Failed to create agent" },
      { status: 500 }
    );
  }
}

export async function PUT(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { agentId, ...updates } = body;

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

    // Update agent
    const updatedAgent = await HermesAgentDB.updateAgent(agentId, updates);

    return NextResponse.json({
      success: true,
      agent: updatedAgent
    });

  } catch (error) {
    console.error("Update agent error:", error);
    return NextResponse.json(
      { error: "Failed to update agent" },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');

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

    // Soft delete agent
    await HermesAgentDB.deleteAgent(agentId);

    return NextResponse.json({
      success: true,
      message: "Agent deleted successfully"
    });

  } catch (error) {
    console.error("Delete agent error:", error);
    return NextResponse.json(
      { error: "Failed to delete agent" },
      { status: 500 }
    );
  }
}