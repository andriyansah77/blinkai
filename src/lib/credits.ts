import { prisma } from "@/lib/prisma";

export const SIGNUP_BONUS = parseInt(process.env.SIGNUP_CREDIT_BONUS || "100", 10);
export const CREDIT_COST_PER_1K = parseInt(process.env.CREDIT_COST_PER_1K_TOKENS || "10", 10);

export function estimateCreditCost(tokens: number): number {
  return Math.ceil((tokens / 1000) * CREDIT_COST_PER_1K);
}

export async function getUserCredits(userId: string): Promise<number> {
  const result = await prisma.creditLedger.aggregate({
    where: { userId },
    _sum: { amount: true },
  });
  return result._sum.amount ?? 0;
}

export async function grantCredits(
  userId: string,
  amount: number,
  reason: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  await prisma.creditLedger.create({
    data: {
      userId,
      amount: Math.abs(amount),
      reason,
      meta: JSON.stringify(meta),
    },
  });
}

export async function deductCredits(
  userId: string,
  amount: number,
  reason: string,
  meta: Record<string, unknown> = {}
): Promise<void> {
  const balance = await getUserCredits(userId);
  if (balance < amount) {
    throw new Error("Insufficient credits");
  }
  await prisma.creditLedger.create({
    data: {
      userId,
      amount: -Math.abs(amount),
      reason,
      meta: JSON.stringify(meta),
    },
  });
}
