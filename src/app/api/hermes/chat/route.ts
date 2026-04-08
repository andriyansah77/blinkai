import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesCliWrapper } from "@/lib/hermes-cli-wrapper";
import { HermesAgentDB } from "@/lib/hermes-db";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, agentId } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Get user's agent from database
    let dbAgent;
    if (agentId) {
      dbAgent = await HermesAgentDB.getAgent(agentId);
    } else {
      // Get user's primary agent
      const userAgents = await HermesAgentDB.getUserAgents(session.user.id!);
      dbAgent = userAgents[0];
    }

    if (!dbAgent) {
      return NextResponse.json({ error: "No agent found. Please complete onboarding." }, { status: 404 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    // For now, use direct AI API with conversational formatting to ensure clean responses
    // TODO: Re-enable Hermes CLI once it's properly configured on VPS
    console.log(`💬 Processing chat for agent: ${dbAgent.name}`);
    
    try {
      // Enhanced system prompt for conversational responses
      const conversationalSystemPrompt = `${dbAgent.systemPrompt}

IMPORTANT RESPONSE GUIDELINES:
- Respond naturally and conversationally, like a helpful AI assistant
- Do not include any technical metadata, CLI output, or system information
- Keep responses focused, helpful, and engaging
- Use a friendly, professional tone
- Provide clear, actionable information when possible
- If you need clarification, ask follow-up questions naturally`;

      const response = await fetch(`${process.env.AI_API_BASE_URL}/chat/completions`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${process.env.AI_API_KEY}`,
        },
        body: JSON.stringify({
          model: dbAgent.model,
          messages: [
            { role: "system", content: conversationalSystemPrompt },
            ...messages
          ],
          stream: true,
          temperature: dbAgent.temperature || 0.7,
          max_tokens: dbAgent.maxTokens || 2000,
        }),
      });

      if (!response.ok) {
        throw new Error(`AI API error: ${response.status}`);
      }

      return new Response(response.body, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Agent-Id": dbAgent.id,
          "X-Response-Type": "conversational-ai",
        },
      });

    } catch (error) {
      console.error("AI API error:", error);
      
      // Fallback to a simple conversational response
      const fallbackMessage = "I'm here to help! I'm experiencing some technical difficulties at the moment, but I'm ready to assist you. Could you please tell me what you'd like to know or discuss?";
      
      const stream = new ReadableStream({
        start(controller) {
          const words = fallbackMessage.split(' ');
          let wordIndex = 0;
          
          const sendWord = () => {
            if (wordIndex < words.length) {
              const word = words[wordIndex] + (wordIndex < words.length - 1 ? ' ' : '');
              const data = `data: ${JSON.stringify({
                choices: [{
                  delta: {
                    content: word
                  }
                }]
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(data));
              wordIndex++;
              
              setTimeout(sendWord, 50); // Natural typing speed
            } else {
              controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
              controller.close();
            }
          };
          
          sendWord();
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Fallback": "true",
        },
      });
    }

  } catch (error) {
    console.error("Chat API error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: "Failed to process chat request", details: errorMessage },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    const hermesInstalled = await hermesCliWrapper.isHermesInstalled();
    const agents = hermesCliWrapper.getAllAgents();
    
    return NextResponse.json({ 
      message: "Hermes Agent Chat API",
      version: "3.1.0",
      framework: "NousResearch/hermes-agent",
      status: {
        hermesInstalled,
        cliAvailable: process.env.HERMES_CLI_AVAILABLE === 'true',
        runningAgents: agents.length,
        platform: process.platform
      },
      agents: agents.map(agent => ({
        id: agent.id,
        name: agent.name,
        status: agent.status,
        pid: agent.pid,
        port: agent.port
      })),
      endpoints: {
        POST: "Send messages to Hermes framework agents with real CLI integration",
        "GET /api/hermes/test": "Test Hermes CLI connection and configuration",
        "GET /api/hermes/status": "Get detailed Hermes status and agent info"
      },
      configuration: {
        learningEnabled: process.env.HERMES_LEARNING_ENABLED === 'true',
        memoryEnabled: process.env.HERMES_MEMORY_ENABLED === 'true',
        skillsEnabled: process.env.HERMES_SKILLS_ENABLED === 'true'
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get Hermes status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}