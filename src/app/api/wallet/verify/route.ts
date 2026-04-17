/**
 * POST /api/wallet/verify
 * Verify mnemonic or private key matches user's wallet
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { walletManager } from '@/lib/mining/wallet-manager';
import { prisma } from '@/lib/prisma';

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

    // 2. Get user's wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: { address: true }
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

    // 3. Parse request body
    const body = await request.json();
    const { mnemonic, privateKey } = body;

    if (!mnemonic && !privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_REQUEST',
            message: 'Either mnemonic or privateKey is required'
          }
        },
        { status: 400 }
      );
    }

    // 4. Verify mnemonic or private key
    let isValid = false;
    let verifiedWith = '';

    if (mnemonic) {
      isValid = walletManager.verifyMnemonic(mnemonic, wallet.address);
      verifiedWith = 'mnemonic';
    } else if (privateKey) {
      isValid = walletManager.verifyPrivateKey(privateKey, wallet.address);
      verifiedWith = 'privateKey';
    }

    // 5. Return verification result
    return NextResponse.json({
      success: true,
      verified: isValid,
      verifiedWith,
      address: wallet.address
    });

  } catch (error: any) {
    console.error('[Wallet Verify] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to verify wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
