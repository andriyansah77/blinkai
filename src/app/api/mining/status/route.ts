/**
 * GET /api/mining/status
 * Get user's mining status (wallet, balance, etc.)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { walletManager } from '@/lib/mining/wallet-manager';
import { usdBalanceManager } from '@/lib/mining/usd-balance-manager';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getPrivySession(request);
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

    // 3. For external wallets (MetaMask), user can mint if wallet is linked
    // No pathUSD balance check needed
    const canMint = hasWallet;

    return NextResponse.json({
      success: true,
      status: {
        authenticated: true,
        hasWallet,
        walletAddress: wallet?.address || null,
        canMint,
        message: hasWallet 
          ? 'Ready to mint! Gas fees will be paid from your connected wallet.'
          : 'Please connect your wallet to start minting.'
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
