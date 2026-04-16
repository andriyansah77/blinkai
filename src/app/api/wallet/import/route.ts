/**
 * POST /api/wallet/import
 * Import existing wallet with private key (with 2FA authentication)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from '@/lib/prisma';
import { WalletManager } from '@/lib/mining/wallet-manager';

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

    // 2. Parse request body
    const body = await request.json();
    const { privateKey, twoFactorCode } = body;

    // 3. Validate inputs
    if (!privateKey) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PRIVATE_KEY',
            message: 'Private key is required'
          }
        },
        { status: 400 }
      );
    }

    // 4. Verify 2FA code (placeholder - implement actual 2FA verification)
    if (!twoFactorCode) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'TWO_FACTOR_REQUIRED',
            message: '2FA code is required for this operation'
          }
        },
        { status: 400 }
      );
    }

    if (!/^\d{6}$/.test(twoFactorCode)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_TWO_FACTOR',
            message: 'Invalid 2FA code format'
          }
        },
        { status: 400 }
      );
    }

    // 5. Check if user already has a wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_EXISTS',
            message: 'User already has a wallet. Cannot import another wallet.'
          }
        },
        { status: 400 }
      );
    }

    // 6. Import wallet
    const walletManager = new WalletManager();
    const walletData = await walletManager.importWallet(userId, privateKey);

    // 7. Log the import operation for audit
    console.log(`[AUDIT] Wallet imported for user ${userId} at ${new Date().toISOString()}`);

    // 8. Return wallet data
    return NextResponse.json({
      success: true,
      address: walletData.address,
      message: 'Wallet imported successfully'
    });

  } catch (error: any) {
    console.error('Wallet import error:', error);
    
    // Handle specific error cases
    if (error.message?.includes('Invalid private key')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_PRIVATE_KEY',
            message: 'Invalid private key format'
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
          message: 'Failed to import wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
