/**
 * POST /api/wallet/create
 * Create a new wallet for user
 * Returns mnemonic and private key that user MUST save
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { walletManager } from '@/lib/mining/wallet-manager';
import { UsdBalanceManager } from '@/lib/mining/usd-balance-manager';

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

    // 2. Generate wallet
    console.log(`[Wallet Create] Generating wallet for user ${userId}`);
    const wallet = await walletManager.generateWallet(userId);

    // 3. Initialize USD balance
    console.log(`[Wallet Create] Initializing USD balance`);
    const balanceManager = new UsdBalanceManager();
    await balanceManager.initializeBalance(userId, wallet.id);

    // 4. Return wallet info with mnemonic and private key
    // IMPORTANT: User must save these - they won't be shown again!
    return NextResponse.json({
      success: true,
      wallet: {
        address: wallet.address,
        mnemonic: wallet.mnemonic,
        privateKey: wallet.privateKey,
        network: wallet.network
      },
      warning: 'SAVE YOUR MNEMONIC AND PRIVATE KEY! They will not be shown again and cannot be recovered if lost.'
    });

  } catch (error: any) {
    console.error('[Wallet Create] Error:', error);
    
    if (error.message.includes('already exists')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_EXISTS',
            message: 'Wallet already exists for this user'
          }
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
