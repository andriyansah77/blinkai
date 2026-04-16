/**
 * POST /api/wallet/export
 * Export private key (with 2FA authentication)
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
    const { twoFactorCode } = body;

    // 3. Verify 2FA code (placeholder - implement actual 2FA verification)
    // TODO: Implement actual 2FA verification with user's 2FA secret
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

    // For now, we'll accept any 6-digit code as valid
    // In production, verify against user's 2FA secret using speakeasy or similar
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

    // 4. Get wallet data
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        address: true,
        encryptedPrivateKey: true,
        keyIv: true
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

    // 5. Decrypt private key
    const walletManager = new WalletManager();
    const privateKey = walletManager.decryptPrivateKey(
      wallet.encryptedPrivateKey,
      wallet.keyIv
    );

    // 6. Log the export operation for audit
    console.log(`[AUDIT] Private key exported for user ${userId} at ${new Date().toISOString()}`);

    // 7. Return private key
    return NextResponse.json({
      success: true,
      address: wallet.address,
      privateKey: privateKey,
      warning: 'Keep your private key secure. Never share it with anyone.'
    });

  } catch (error: any) {
    console.error('Wallet export error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to export private key',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
