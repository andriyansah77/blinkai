import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";
import { getUserAIConfig } from "@/lib/platform";
import { getUserCredits, deductCredits, estimateCreditCost } from "@/lib/credits";
import { hermesStream, getHermesConfig, HermesMessage } from "@/lib/hermes";

interface RouteContext {
  params: { id: string };
}

interface StoredMessage {
  role: "user" | "assistant" | "system";
  content: string;
  ts?: string;
}

const ESTIMATED_TOKENS_PER_MESSAGE = 500;

export async function POST(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);

  const body = await request.json() as {
    message: string;
    sessionId?: string;
    visitorId?: string;
  };

  if (!body.message || body.message.trim().length === 0) {
    return NextResponse.json({ error: "Message is required" }, { status: 400 });
  }

  // Load agent
  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  });

  if (!agent || agent.status !== "active") {
    return NextResponse.json({ error: "Agent not found or inactive" }, { status: 404 });
  }

  // Access control: owner OR public agent
  const isOwner = session?.user?.id === agent.userId;
  const isPublicAgent = agent.isPublic;

  if (!isOwner && !isPublicAgent) {
    return NextResponse.json({ error: "Access denied" }, { status: 403 });
  }

  // Get or create session
  let agentSession = body.sessionId
    ? await prisma.agentSession.findFirst({
        where: { id: body.sessionId, agentId: agent.id },
      })
    : null;

  if (!agentSession) {
    agentSession = await prisma.agentSession.create({
      data: {
        agentId: agent.id,
        visitorId: body.visitorId || null,
        messages: "[]",
      },
    });
  }

  // Load user's AI config
  const aiConfig = await getUserAIConfig(agent.userId);
  const isPlatformMode = aiConfig.mode === "platform";

  // Estimate cost and check credits (platform mode only)
  const estimatedTokens = ESTIMATED_TOKENS_PER_MESSAGE;
  const estimatedCost = estimateCreditCost(estimatedTokens);

  if (isPlatformMode) {
    const balance = await getUserCredits(agent.userId);
    if (balance < estimatedCost) {
      return NextResponse.json(
        { error: "Insufficient credits" },
        { status: 402 }
      );
    }
  }

  // Build messages from session history
  const history: StoredMessage[] = JSON.parse(agentSession.messages || "[]");
  const hermesMessages: HermesMessage[] = [
    ...history.map((m) => ({
      role: m.role as "user" | "assistant",
      content: m.content,
    })),
    { role: "user" as const, content: body.message.trim() },
  ];

  // Build hermes config
  const hermesConfig = getHermesConfig({
    apiKey: aiConfig.apiKey,
    baseUrl: aiConfig.baseUrl,
    model: agent.model || aiConfig.model,
    temperature: agent.temperature,
    maxTokens: agent.maxTokens,
    systemPromptOverride: agent.systemPrompt || undefined,
    streamingEnabled: true,
  });

  let fullResponse = "";
  const sessionId = agentSession.id;

  // Create SSE stream
  const stream = new ReadableStream({
    async start(controller) {
      const encoder = new TextEncoder();

      function send(data: string) {
        controller.enqueue(encoder.encode(`data: ${data}\n\n`));
      }

      // First send session ID so client knows it
      send(JSON.stringify({ type: "session", sessionId }));

      try {
        const aiStream = await hermesStream(hermesMessages, hermesConfig);
        const reader = aiStream.getReader();
        const decoder = new TextDecoder();
        let buffer = "";

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
                fullResponse += delta;
                send(JSON.stringify({ type: "delta", content: delta }));
              }
            } catch {
              // skip malformed chunks
            }
          }
        }

        // Process remaining buffer
        if (buffer.trim().startsWith("data:")) {
          const data = buffer.trim().slice(5).trim();
          if (data && data !== "[DONE]") {
            try {
              const json = JSON.parse(data) as {
                choices?: Array<{ delta?: { content?: string } }>;
              };
              const delta = json.choices?.[0]?.delta?.content;
              if (delta) fullResponse += delta;
            } catch {
              // ignore
            }
          }
        }

        // Count tokens (rough: chars/4)
        const usedTokens = Math.ceil(
          (body.message.length + fullResponse.length) / 4
        );

        // Deduct credits if platform mode
        if (isPlatformMode && usedTokens > 0) {
          const actualCost = estimateCreditCost(usedTokens);
          await deductCredits(agent.userId, actualCost, "usage", {
            agentId: agent.id,
            sessionId,
            tokens: usedTokens,
          });
        }

        // Update session messages
        const updatedHistory: StoredMessage[] = [
          ...history,
          { role: "user", content: body.message.trim(), ts: new Date().toISOString() },
          { role: "assistant", content: fullResponse, ts: new Date().toISOString() },
        ];

        // Auto-generate title from first user message
        const title =
          agentSession!.title ||
          body.message.trim().slice(0, 60) +
            (body.message.trim().length > 60 ? "…" : "");

        await prisma.agentSession.update({
          where: { id: sessionId },
          data: {
            messages: JSON.stringify(updatedHistory),
            tokenUsed: { increment: usedTokens },
            title,
          },
        });

        // Update agent stats
        await prisma.agent.update({
          where: { id: agent.id },
          data: {
            totalMessages: { increment: 2 }, // user + assistant
            totalTokens: { increment: usedTokens },
          },
        });

        send(JSON.stringify({ type: "done", sessionId, tokens: usedTokens }));
      } catch (err) {
        const message = err instanceof Error ? err.message : "Stream error";
        send(JSON.stringify({ type: "error", error: message }));
      } finally {
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    },
  });
}
