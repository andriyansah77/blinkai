import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { hermesStream, getHermesConfig, HermesMessage, HermesConfig } from "@/lib/hermes";

export const runtime = "nodejs";

// Disable Next.js response buffering
export const dynamic = "force-dynamic";

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await request.json();
    const { messages, hermes } = body as {
      messages: HermesMessage[];
      hermes?: Partial<HermesConfig>;
      // legacy fields backward compat
      apiKey?: string;
      baseUrl?: string;
      model?: string;
    };

    if (!messages || !Array.isArray(messages) || messages.length === 0) {
      return NextResponse.json({ error: "Messages are required" }, { status: 400 });
    }

    // Build Hermes config — prefer new `hermes` object, fallback to legacy fields
    const config = getHermesConfig(
      hermes ?? {
        apiKey: body.apiKey,
        baseUrl: body.baseUrl,
        model: body.model,
      }
    );

    const upstream = await hermesStream(messages, config);

    // Pipe upstream SSE straight to client with no buffering
    return new Response(upstream, {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive",
        // Disable buffering for Cloudflare, nginx, etc.
        "X-Accel-Buffering": "no",
        "X-Content-Type-Options": "nosniff",
        "X-Hermes-Version": "1.0.0",
        "X-Hermes-Provider": config.providerId,
        "X-Hermes-Model": config.model,
      },
    });
  } catch (error) {
    console.error("[Hermes] Generate error:", error);
    const message = error instanceof Error ? error.message : "Hermes generation failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
