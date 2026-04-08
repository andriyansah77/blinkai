import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { HermesAgentDB } from "@/lib/hermes-db";
import { getUserAIConfig } from "@/lib/platform";
import { hermesStream, getHermesConfig, HermesMessage } from "@/lib/hermes";
import { getUserCredits, deductCredits, estimateCreditCost } from "@/lib/credits";

const ESTIMATED_TOKENS_PER_MESSAGE = 500;

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

    console.log(`💬 Processing chat for agent: ${dbAgent.name}`);
    
    try {
      // Load user's AI config
      const aiConfig = await getUserAIConfig(session.user.id!);
      const isPlatformMode = aiConfig.mode === "platform";
      
      console.log(`🔧 AI Config loaded:`, {
        mode: aiConfig.mode,
        baseUrl: aiConfig.baseUrl,
        model: aiConfig.model,
        hasApiKey: !!aiConfig.apiKey
      });

      // Estimate cost and check credits (platform mode only)
      const estimatedTokens = ESTIMATED_TOKENS_PER_MESSAGE;
      const estimatedCost = estimateCreditCost(estimatedTokens);

      if (isPlatformMode) {
        const balance = await getUserCredits(session.user.id!);
        console.log(`💰 Credit check - Balance: ${balance}, Cost: ${estimatedCost}`);
        
        if (balance < estimatedCost) {
          return NextResponse.json(
            { error: "Insufficient credits. Please add more credits or configure your own API key." },
            { status: 402 }
          );
        }
      }
      
      // Convert messages to Hermes format
      const hermesMessages: HermesMessage[] = messages.map((msg: any) => ({
        role: msg.role as "user" | "assistant",
        content: msg.content,
      }));

      // Build hermes config with conversational system prompt
      const conversationalSystemPrompt = `${dbAgent.systemPrompt}

IMPORTANT RESPONSE GUIDELINES:
- Respond naturally and conversationally, like a helpful AI assistant
- Do not include any technical metadata, CLI output, or system information
- Keep responses focused, helpful, and engaging
- Use a friendly, professional tone
- Provide clear, actionable information when possible
- If you need clarification, ask follow-up questions naturally`;

      const hermesConfig = getHermesConfig({
        apiKey: aiConfig.apiKey,
        baseUrl: aiConfig.baseUrl,
        model: aiConfig.model, // Use AI config model instead of agent model for compatibility
        temperature: dbAgent.temperature || 0.7,
        maxTokens: dbAgent.maxTokens || 2000,
        systemPromptOverride: conversationalSystemPrompt,
        streamingEnabled: true,
      });

      console.log(`🚀 Hermes config:`, {
        baseUrl: hermesConfig.baseUrl,
        model: hermesConfig.model,
        temperature: hermesConfig.temperature,
        hasApiKey: !!hermesConfig.apiKey
      });

      // Create SSE stream using the original hermesStream function
      const stream = new ReadableStream({
        async start(controller) {
          const encoder = new TextEncoder();

          function send(data: string) {
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          try {
            console.log(`📡 Starting Hermes stream...`);
            const aiStream = await hermesStream(hermesMessages, hermesConfig);
            const reader = aiStream.getReader();
            const decoder = new TextDecoder();
            let buffer = "";

            console.log(`✅ Stream started successfully`);

            let totalTokensUsed = 0;

            while (true) {
              const { done, value } = await reader.read();
              if (done) break;

              buffer += decoder.decode(value, { stream: true });
              const lines = buffer.split("\n");
              buffer = lines.pop() ?? "";

              for (const line of lines) {
                const trimmed = line.trim();
                if (!trimmed.startsWith("data:")) continue;
                const data = trimmed.slice(5).trim();
                if (data === "[DONE]") continue;

                try {
                  const json = JSON.parse(data) as {
                    choices?: Array<{ delta?: { content?: string } }>;
                  };
                  const delta = json.choices?.[0]?.delta?.content;
                  if (delta) {
                    totalTokensUsed += Math.ceil(delta.length / 4); // Rough token estimation
                    // Send the content directly in the expected format
                    send(JSON.stringify({
                      choices: [{
                        delta: {
                          content: delta
                        }
                      }]
                    }));
                  }
                } catch (parseError) {
                  // Skip invalid JSON
                  continue;
                }
              }
            }

            // Deduct credits after successful completion (platform mode only)
            if (isPlatformMode && totalTokensUsed > 0) {
              try {
                const actualCost = estimateCreditCost(totalTokensUsed);
                await deductCredits(session.user.id!, actualCost, "Chat completion", {
                  agentId: dbAgent.id,
                  tokensUsed: totalTokensUsed,
                  model: hermesConfig.model
                });
                console.log(`💸 Credits deducted: ${actualCost} (${totalTokensUsed} tokens)`);
              } catch (creditError) {
                console.error("Failed to deduct credits:", creditError);
              }
            }

            // Send done signal
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();

          } catch (streamError) {
            console.error("❌ Stream error:", streamError);
            
            // Fallback response
            const fallbackMessage = "I'm here to help! I'm experiencing some technical difficulties at the moment, but I'm ready to assist you. Could you please tell me what you'd like to know or discuss?";
            const words = fallbackMessage.split(' ');
            
            for (let i = 0; i < words.length; i++) {
              const word = words[i] + (i < words.length - 1 ? ' ' : '');
              send(JSON.stringify({
                choices: [{
                  delta: {
                    content: word
                  }
                }]
              }));
              await new Promise(resolve => setTimeout(resolve, 50));
            }
            
            controller.enqueue(encoder.encode('data: [DONE]\n\n'));
            controller.close();
          }
        }
      });

      return new Response(stream, {
        headers: {
          "Content-Type": "text/plain; charset=utf-8",
          "Cache-Control": "no-cache",
          "Connection": "keep-alive",
          "X-Agent-Id": dbAgent.id,
          "X-Response-Type": "hermes-stream",
        },
      });

    } catch (error) {
      console.error("❌ Hermes chat error:", error);
      
      // Fallback to simple conversational response
      const fallbackMessage = "I'm here to help! I'm experiencing some technical difficulties at the moment, but I'm ready to assist you. Could you please tell me what you'd like to know or discuss?";
      
      const stream = new ReadableStream({
        start(controller) {
          const encoder = new TextEncoder();
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
              
              controller.enqueue(encoder.encode(data));
              wordIndex++;
              
              setTimeout(sendWord, 50);
            } else {
              controller.enqueue(encoder.encode('data: [DONE]\n\n'));
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
    return NextResponse.json({ 
      message: "Hermes Agent Chat API",
      version: "3.2.0",
      framework: "ReAgent with Hermes integration",
      status: {
        hermesEnabled: true,
        streamingEnabled: true,
        platform: process.platform
      },
      endpoints: {
        POST: "Send messages to AI agents with conversational responses",
        "GET /api/hermes/test": "Test Hermes connection and configuration",
        "GET /api/hermes/status": "Get detailed Hermes status and agent info"
      },
      configuration: {
        conversationalMode: true,
        naturalResponses: true,
        streamingEnabled: true
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get Hermes status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}