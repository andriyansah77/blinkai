import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { getUserAIConfig } from "@/lib/platform";
import { hermesStream, getHermesConfig, HermesMessage } from "@/lib/hermes";

const PLANNING_SYSTEM_PROMPT = `You are a strategic planning AI assistant. Your role is to help users break down complex tasks, create actionable plans, and think through problems systematically.

PLANNING APPROACH:
1. **Understand the Goal**: Clarify what the user wants to achieve
2. **Break Down**: Divide complex tasks into smaller, manageable steps
3. **Prioritize**: Suggest the order of execution based on dependencies and importance
4. **Timeline**: Provide realistic time estimates when possible
5. **Resources**: Identify what resources, tools, or skills are needed
6. **Risks**: Highlight potential challenges and mitigation strategies

RESPONSE FORMAT:
- Start with a brief summary of the goal
- Provide a structured plan with numbered steps
- Include sub-tasks where helpful
- Add time estimates and resource requirements
- Suggest checkpoints and milestones
- End with next immediate actions

Be practical, actionable, and thorough in your planning approach.`;

export async function POST(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { message } = body;

    if (!message) {
      return NextResponse.json({ error: "Message is required" }, { status: 400 });
    }

    // Get user's AI config
    const aiConfig = await getUserAIConfig(session.user.id!);

    // Create planning-specific messages
    const planningMessages: HermesMessage[] = [
      { role: "user", content: `Please help me create a plan for: ${message}` }
    ];

    // Build hermes config with planning system prompt
    const hermesConfig = getHermesConfig({
      apiKey: aiConfig.apiKey,
      baseUrl: aiConfig.baseUrl,
      model: aiConfig.model,
      temperature: 0.3, // Lower temperature for more structured planning
      maxTokens: 2000,
      systemPromptOverride: PLANNING_SYSTEM_PROMPT,
      streamingEnabled: true,
    });

    // Stream the planning response
    const aiStream = await hermesStream(planningMessages, hermesConfig);

    return new Response(aiStream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Response-Type": "planning-ai",
      },
    });

  } catch (error) {
    console.error("Planning AI error:", error);
    return NextResponse.json(
      { error: "Failed to generate plan" },
      { status: 500 }
    );
  }
}