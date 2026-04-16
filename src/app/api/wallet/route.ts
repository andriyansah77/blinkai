/**
 * GET /api/wallet
 * Get user's wallet information including balances
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Get wallet data
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        address: true,
        reagentBalance: true,
        pathusdBalance: true,
        lastBalanceUpdate: true
      }
    });

    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_NOT_FOUND',
            message: 'Wallet not found for this user'
          }
        },
        { status: 404 }
      );
    }

    // 3. Get USD balance
    const usdBalance = await prisma.usdBalance.findUnique({
      where: { userId },
      select: {
        balance: true
      }
    });

    // 4. Return wallet data
    return NextResponse.json({
      success: true,
      address: wallet.address,
      reagentBalance: parseFloat(wallet.reagentBalance) || 0,
      pathusdBalance: parseFloat(wallet.pathusdBalance) || 0,
      usdBalance: parseFloat(usdBalance?.balance || '0'),
      lastUpdate: wallet.lastBalanceUpdate.toISOString()
    });

  } catch (error: any) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch wallet data',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
