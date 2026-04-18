/**
 * POST /api/wallet/enable-managed
 * Enable managed wallet for auto mining
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { walletManager } from '@/lib/mining/wallet-manager';

export async function POST(request: NextRequest) {
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

    // 2. Get existing wallet
    const wallet = await walletManager.getWallet(userId);
    if (!wallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_NOT_FOUND',
            message: 'Wallet not found. Please create a wallet first.'
          }
        },
        { status: 404 }
      );
    }

    // 3. Check if already has managed wallet
    if (wallet.encryptedPrivateKey && wallet.encryptedPrivateKey.length > 0) {
      return NextResponse.json({
        success: true,
        message: 'Managed wallet already enabled',
        hasManagedWallet: true
      });
    }

    // 4. Generate new managed wallet
    // This creates a new wallet with encrypted private key
    const newWallet = await walletManager.createManagedWallet(userId);

    return NextResponse.json({
      success: true,
      message: 'Managed wallet enabled successfully',
      address: newWallet.address,
      hasManagedWallet: true,
      warning: 'Please transfer your REAGENT tokens to this new managed wallet address to use auto mining.'
    });

  } catch (error: any) {
    console.error('Enable managed wallet error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to enable managed wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
