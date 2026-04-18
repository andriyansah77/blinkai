/**
 * GET /api/wallet/info
 * Get wallet info for user (supports both session and API key auth)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (support both Privy session and X-User-ID header for bots)
    let userId: string | null = null;
    
    // Check for X-User-ID header (for Telegram bot / API calls)
    const userIdHeader = request.headers.get('X-User-ID');
    if (userIdHeader) {
      // Verify API key for bot requests
      const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
      const platformApiKey = process.env.PLATFORM_API_KEY;
      
      if (apiKey && platformApiKey && apiKey === platformApiKey) {
        userId = userIdHeader;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }
    } else {
      // Regular Privy session authentication
      const session = await getPrivySession(request);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Verify userId is not null
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      id: wallet.id,
      address: wallet.address,
      network: wallet.network,
      reagentBalance: wallet.reagentBalance,
      pathusdBalance: wallet.pathusdBalance,
      createdAt: wallet.createdAt,
      lastBalanceUpdate: wallet.lastBalanceUpdate
    });

  } catch (error: any) {
    console.error('[Wallet Info API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
