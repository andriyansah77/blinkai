import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesIntegration } from "@/lib/hermes-integration";
import { deductCredits, getUserCredits } from "@/lib/credits";
import { getPlatformConfig } from "@/lib/platform";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, model, provider, skills, toolsets } = body;

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: "Messages array is required" }, { status: 400 });
    }

    // Get the last user message
    const lastMessage = messages[messages.length - 1];
    if (!lastMessage || lastMessage.role !== 'user') {
      return NextResponse.json({ error: "Last message must be from user" }, { status: 400 });
    }

    // Get platform configuration for credit management
    const platformConfig = await getPlatformConfig(session.user.id!);
    
    // Check credits if using platform mode
    if (platformConfig.mode === 'platform') {
      const credits = await getUserCredits(session.user.id!);
      if (credits.remaining <= 0) {
        return NextResponse.json({ 
          error: "Insufficient credits. Please add more credits or switch to BYOK mode." 
        }, { status: 402 });
      }
    }

    // Ensure user profile exists
    const profile = await hermesIntegration.getProfile(session.user.id!);
    if (!profile || profile.status === 'inactive') {
      const createResult = await hermesIntegration.createProfile(session.user.id!);
      if (!createResult.success) {
        return NextResponse.json({ 
          error: "Failed to initialize user profile" 
        }, { status: 500 });
      }
    }

    // Set model and provider if specified
    if (model) {
      await hermesIntegration.setConfig(session.user.id!, 'model.model', model);
    }
    if (provider) {
      await hermesIntegration.setConfig(session.user.id!, 'model.provider', provider);
    }

    // Create streaming response
    const encoder = new TextEncoder();
    const stream = new ReadableStream({
      async start(controller) {
        try {
          const responseGenerator = await hermesIntegration.sendChatMessage(
            session.user.id!,
            lastMessage.content,
            {
              model,
              provider,
              skills,
              toolsets,
              quiet: true
            }
          );

          let fullResponse = '';
          
          for await (const chunk of responseGenerator) {
            fullResponse += chunk;
            
            // Send in OpenAI-compatible format for frontend compatibility
            const data = JSON.stringify({
              choices: [{
                delta: {
                  content: chunk
                }
              }]
            });
            
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
          }

          // Deduct credits after successful response (platform mode only)
          if (platformConfig.mode === 'platform' && fullResponse.length > 0) {
            const estimatedTokens = Math.ceil(fullResponse.length / 4); // Rough estimation
            await deductCredits(session.user.id!, estimatedTokens);
          }

          // Send completion signal
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        } catch (error) {
          console.error("Hermes chat error:", error);
          
          // Fallback response
          const fallbackMessage = "I'm here to help! I'm experiencing some technical difficulties at the moment, but I'm ready to assist you. Could you please tell me what you'd like to know or discuss?";
          const words = fallbackMessage.split(' ');
          
          for (let i = 0; i < words.length; i++) {
            const word = words[i] + (i < words.length - 1 ? ' ' : '');
            const data = JSON.stringify({
              choices: [{
                delta: {
                  content: word
                }
              }]
            });
            controller.enqueue(encoder.encode(`data: ${data}\n\n`));
            await new Promise(resolve => setTimeout(resolve, 50));
          }
          
          controller.enqueue(encoder.encode('data: [DONE]\n\n'));
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/plain; charset=utf-8',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
      },
    });

  } catch (error) {
    console.error("Hermes chat API error:", error);
    return NextResponse.json(
      { error: "Failed to process chat message" },
      { status: 500 }
    );
  }
}

export async function GET() {
  try {
    return NextResponse.json({ 
      message: "Hermes Agent Chat API",
      version: "4.0.0",
      framework: "ReAgent with Full Hermes Integration",
      status: {
        hermesEnabled: true,
        streamingEnabled: true,
        userIsolation: true,
        platform: process.platform
      },
      endpoints: {
        POST: "Send messages to isolated Hermes agents with conversational responses",
        "GET /api/hermes/profile": "Get user profile status",
        "GET /api/hermes/skills": "Get user skills",
        "GET /api/hermes/gateway": "Get gateway status",
        "GET /api/hermes/diagnostics": "Get system diagnostics"
      },
      features: {
        profiles: "Isolated user profiles",
        skills: "Dynamic skill management",
        gateway: "Multi-platform messaging",
        cron: "Scheduled tasks",
        memory: "Persistent memory systems",
        config: "Per-user configuration"
      }
    });
  } catch (error) {
    return NextResponse.json({
      error: "Failed to get Hermes status",
      details: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}