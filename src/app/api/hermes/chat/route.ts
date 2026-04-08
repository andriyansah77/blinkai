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

    // Check if we have a running Hermes instance for this agent
    let hermesInstanceId = dbAgent.id; // Use agent ID as instance ID
    let hermesInstance = hermesCliWrapper.getAgentStatus(hermesInstanceId);

    // If no instance exists or it's not running, create/start one
    if (!hermesInstance || hermesInstance.status !== 'running') {
      try {
        console.log(`🚀 Setting up Hermes instance for agent: ${dbAgent.name}`);
        
        // Setup Hermes environment with proper API configuration
        hermesInstanceId = await hermesCliWrapper.setupUserEnvironment(session.user.id!, {
          name: dbAgent.name,
          personality: dbAgent.systemPrompt,
          model: dbAgent.model,
          provider: dbAgent.provider,
          apiKey: process.env.AI_API_KEY!,
          baseUrl: process.env.AI_API_BASE_URL,
          temperature: dbAgent.temperature,
          maxTokens: dbAgent.maxTokens,
          tools: JSON.parse(dbAgent.tools)
        });
        
        console.log(`✅ Hermes instance created: ${hermesInstanceId}`);
      } catch (error) {
        console.error("Failed to setup Hermes instance:", error);
        
        // Fallback to simple AI response if Hermes setup fails
        console.log("🔄 Falling back to standard AI response");
        return await fallbackToSimpleAI(messages, dbAgent);
      }
    }

    // Send message to Hermes and stream response
    try {
      const responseGenerator = await hermesCliWrapper.sendMessage(
        hermesInstanceId, 
        lastMessage.content, 
        session.user.id!
      );

      // Create a readable stream
      const stream = new ReadableStream({
        async start(controller) {
          try {
            for await (const chunk of responseGenerator) {
              // Format as SSE
              const data = `data: ${JSON.stringify({
                choices: [{
                  delta: {
                    content: chunk
                  }
                }]
              })}\n\n`;
              
              controller.enqueue(new TextEncoder().encode(data));
            }
            
            // Send done signal
            controller.enqueue(new TextEncoder().encode('data: [DONE]\n\n'));
            controller.close();
          } catch (error) {
            console.error("Stream error:", error);
            controller.error(error);
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Agent-Id": dbAgent.id,
          "X-Hermes-Instance": hermesInstanceId,
        },
      });

    } catch (error) {
      console.error("Hermes communication error:", error);
      
      // Fallback to simple AI response
      return await fallbackToSimpleAI(messages, dbAgent);
    }

  } catch (error) {
    console.error("Hermes chat error:", error);
    
    const errorMessage = error instanceof Error ? error.message : "Unknown error occurred";
    
    return NextResponse.json(
      { error: "Failed to process chat request", details: errorMessage },
      { status: 500 }
    );
  }
}

/**
 * Fallback to simple AI response when Hermes is not available
 */
async function fallbackToSimpleAI(messages: any[], dbAgent: any) {
  try {
    const response = await fetch(`${process.env.AI_API_BASE_URL}/chat/completions`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.AI_API_KEY}`,
      },
      body: JSON.stringify({
        model: dbAgent.model,
        messages: [
          { role: "system", content: dbAgent.systemPrompt },
          ...messages
        ],
        stream: true,
        temperature: dbAgent.temperature,
        max_tokens: dbAgent.maxTokens,
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
        "X-Fallback": "true",
      },
    });

  } catch (error) {
    console.error("Fallback AI error:", error);
    throw error;
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