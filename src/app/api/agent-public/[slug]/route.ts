import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

interface RouteContext {
  params: { slug: string };
}

export async function GET(request: NextRequest, { params }: RouteContext) {
  const agent = await prisma.agent.findUnique({
    where: { slug: params.slug },
    select: {
      id: true,
      name: true,
      description: true,
      avatar: true,
      isPublic: true,
      template: true,
      status: true,
      userId: true,
    },
  });

  if (!agent || agent.status === "deleted") {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  return NextResponse.json({
    id: agent.id,
    name: agent.name,
    description: agent.description,
    avatar: agent.avatar,
    isPublic: agent.isPublic,
    template: agent.template,
    userId: agent.userId,
  });
}
