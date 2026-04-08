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

  // Verify agent ownership
  const agent = await prisma.agent.findUnique({
    where: { id: params.id },
  });

  if (!agent || agent.userId !== session.user.id || agent.status === "deleted") {
    return NextResponse.json({ error: "Agent not found" }, { status: 404 });
  }

  const sessions = await prisma.agentSession.findMany({
    where: { agentId: params.id },
    orderBy: { updatedAt: "desc" },
    take: 20,
    select: {
      id: true,
      visitorId: true,
      title: true,
      tokenUsed: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  return NextResponse.json(sessions);
}
