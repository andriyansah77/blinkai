import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";
import { EXAMPLE_SKILLS } from "@/lib/example-skills";

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const agentId = searchParams.get('agentId');
    const examples = searchParams.get('examples');

    if (examples === 'true') {
      // Return example skills
      return NextResponse.json({ 
        skills: EXAMPLE_SKILLS,
        message: "Example skills for reference" 
      });
    }

    if (agentId) {
      // Get skills for specific agent
      const skills = await HermesAgentDB.getAgentSkills(agentId);
      return NextResponse.json({ skills });
    } else {
      // Get all skills for the user
      const skills = await HermesAgentDB.getAllSkills(session.user.id!);
      return NextResponse.json({ skills });
    }
  } catch (error) {
    console.error("Get skills error:", error);
    return NextResponse.json(
      { error: "Failed to fetch skills" },
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
    const { agentId, name, description, code, category, tags } = body;

    if (!agentId || !name || !code) {
      return NextResponse.json({ 
        error: "Agent ID, skill name, and code are required" 
      }, { status: 400 });
    }

    // Verify agent ownership
    const agent = await HermesAgentDB.getAgent(agentId);
    if (!agent || agent.userId !== session.user.id) {
      return NextResponse.json({ error: "Agent not found or access denied" }, { status: 404 });
    }

    const skill = await HermesAgentDB.createSkill(agentId, {
      name,
      description: description || "",
      code,
      category: category || "general",
      tags: tags || [],
      usage: 0,
      rating: 0
    });

    return NextResponse.json({ 
      skill: {
        ...skill,
        tags: JSON.parse(skill.tags)
      }
    }, { status: 201 });
  } catch (error) {
    console.error("Create skill error:", error);
    return NextResponse.json(
      { error: "Failed to create skill" },
      { status: 500 }
    );
  }
}