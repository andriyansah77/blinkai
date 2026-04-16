import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";

function generateSlug(name: string): string {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 30);
  const suffix = Math.random().toString(36).slice(2, 8);
  return `${base}-${suffix}`;
}

export async function GET(request: NextRequest) {
  const session = await getPrivySession(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agents = await prisma.agent.findMany({
    where: {
      userId: session.user.id,
      status: { not: "deleted" },
    },
    select: {
      id: true,
      name: true,
      slug: true,
      description: true,
      avatar: true,
      status: true,
      isPublic: true,
      totalMessages: true,
      totalTokens: true,
      createdAt: true,
    },
    orderBy: { createdAt: "desc" },
  });

  return NextResponse.json(agents);
}

export async function POST(request: NextRequest) {
  const session = await getPrivySession(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json() as {
    name?: string;
    description?: string;
    avatar?: string;
    systemPrompt?: string;
    template?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    isPublic?: boolean;
  };

  if (!body.name || body.name.trim().length === 0) {
    return NextResponse.json({ error: "Name is required" }, { status: 400 });
  }

  // Generate unique slug
  let slug = generateSlug(body.name.trim());
  let attempts = 0;
  while (attempts < 5) {
    const existing = await prisma.agent.findUnique({ where: { slug } });
    if (!existing) break;
    slug = generateSlug(body.name.trim());
    attempts++;
  }

  const agent = await prisma.agent.create({
    data: {
      userId: session.user.id,
      name: body.name.trim(),
      slug,
      description: body.description || null,
      avatar: body.avatar || "🤖",
      systemPrompt: body.systemPrompt || "",
      template: body.template || "assistant",
      model: body.model || "",
      temperature: body.temperature ?? 0.7,
      maxTokens: body.maxTokens ?? 2048,
      isPublic: body.isPublic ?? false,
      status: "active",
    },
  });

  return NextResponse.json(agent, { status: 201 });
}
