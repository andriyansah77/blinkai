/**
 * GET /api/mining/status
 * Get user's mining status (wallet, balance, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { walletManager } from '@/lib/mining/wallet-manager';
import { usdBalanceManager } from '@/lib/mining/usd-balance-manager';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Check wallet
    const wallet = await walletManager.getWallet(userId);
    const hasWallet = !!wallet;

    // 3. Check balance
    let balance = null;
    let hasBalance = false;
    
    if (hasWallet) {
      try {
        balance = await usdBalanceManager.getBalance(userId);
        hasBalance = parseFloat(balance.availableBalance) > 0;
      } catch (error) {
        // Balance might not exist yet
        console.error('Failed to get balance:', error);
      }
    }

    // 4. Calculate readiness
    const canMint = hasWallet && balance && parseFloat(balance.availableBalance) >= 1.0;

    return NextResponse.json({
      success: true,
      status: {
        authenticated: true,
        hasWallet,
        walletAddress: wallet?.address || null,
        balance: balance ? {
          total: balance.balance,
          available: balance.availableBalance,
          locked: balance.lockedBalance
        } : null,
        canMint,
        requirements: {
          minBalance: '1.0',
          currency: 'pathUSD'
        }
      }
    });

  } catch (error: any) {
    console.error('Mining status API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
