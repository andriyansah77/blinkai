import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from "@/lib/prisma";
import { getUserCredits } from "@/lib/credits";

export async function GET(request: NextRequest) {
  const session = await getPrivySession(request);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const [balance, history] = await Promise.all([
    getUserCredits(session.user.id),
    prisma.creditLedger.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      select: {
        id: true,
        amount: true,
        reason: true,
        meta: true,
        createdAt: true,
      },
    }),
  ]);

  return NextResponse.json({ balance, history });
}
