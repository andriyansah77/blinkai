import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { id: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  });

  if (!agent || agent.userId !== session.user.id) {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  if (agent.status === "deleted") {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json(agent);
}

export async function PATCH(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  });

  if (!agent || agent.userId !== session.user.id || agent.status === "deleted") {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const body = await request.json() as {
    name?: string;
    description?: string;
    avatar?: string;
    systemPrompt?: string;
    model?: string;
    temperature?: number;
    maxTokens?: number;
    isPublic?: boolean;
    status?: string;
  };

  const updated = await prisma.agent.update({
    where: { id: params.id },
    data: {
      ...(body.name !== undefined && { name: body.name }),
      ...(body.description !== undefined && { description: body.description }),
      ...(body.avatar !== undefined && { avatar: body.avatar }),
      ...(body.systemPrompt !== undefined && { systemPrompt: body.systemPrompt }),
      ...(body.model !== undefined && { model: body.model }),
      ...(body.temperature !== undefined && { temperature: body.temperature }),
      ...(body.maxTokens !== undefined && { maxTokens: body.maxTokens }),
      ...(body.isPublic !== undefined && { isPublic: body.isPublic }),
      ...(body.status !== undefined && { status: body.status }),
    },
  });

  return NextResponse.json(updated);
}

export async function DELETE(request: NextRequest, { params }: RouteContext) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  });

  if (!agent || agent.userId !== session.user.id || agent.status === "deleted") {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  await prisma.agent.update({
    where: { id: params.id },
    data: { status: "deleted" },
  });

  return NextResponse.json({ success: true });
}
