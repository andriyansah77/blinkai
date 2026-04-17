/**
 * GET /api/onboarding/status
 * Check user's onboarding completion status
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Check if user has agent
    const agent = await prisma.hermesAgent.findFirst({
      where: { userId },
      select: { id: true, name: true }
    });

    // Check if user has wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { id: true, address: true }
    });

    // Check if user has completed onboarding (has agent)
    const hasCompletedOnboarding = !!agent;

    return NextResponse.json({
      success: true,
      completed: hasCompletedOnboarding,
      steps: {
        agentSetup: !!agent,
        walletSetup: !!wallet,
        // Channels and plan are optional, always consider them done if agent exists
        channels: hasCompletedOnboarding,
        plan: hasCompletedOnboarding,
        deployment: hasCompletedOnboarding
      },
      agent: agent ? { id: agent.id, name: agent.name } : null,
      wallet: wallet ? { address: wallet.address } : null
    });

  } catch (error: any) {
    console.error('Onboarding status error:', error);
    return NextResponse.json(
      { error: 'Failed to check onboarding status' },
      { status: 500 }
    );
  }
}
