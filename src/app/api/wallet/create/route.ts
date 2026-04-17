/**
 * POST /api/wallet/create
 * Create a new wallet for user
 * Returns mnemonic and private key that user MUST save
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { walletManager } from '@/lib/mining/wallet-manager';
import { UsdBalanceManager } from '@/lib/mining/usd-balance-manager';
import { prisma } from '@/lib/prisma';
import { SIGNUP_BONUS } from '@/lib/credits';

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

    // 2. Ensure user exists in database (for Privy users)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`[Wallet Create] Creating user record for Privy user ${userId}`);
      
      // Create user with transaction to ensure all related records are created
      user = await prisma.$transaction(async (tx) => {
        const newUser = await tx.user.create({
          data: {
            id: userId,
            email: session.user.email || `${userId}@privy.user`,
            name: session.user.name || 'User',
            password: '', // Privy users don't have password
          },
        });

        // Create signup bonus credit ledger entry
        await tx.creditLedger.create({
          data: {
            userId: newUser.id,
            amount: SIGNUP_BONUS,
            reason: 'signup_bonus',
            meta: JSON.stringify({ note: 'Welcome bonus' }),
          },
        });

        // Create default ApiKeyConfig (platform mode)
        await tx.apiKeyConfig.create({
          data: {
            userId: newUser.id,
            mode: 'platform',
          },
        });

        return newUser;
      });

      console.log(`[Wallet Create] User record created for ${userId}`);
    }

    // 3. Generate wallet
    console.log(`[Wallet Create] Generating wallet for user ${userId}`);
    const wallet = await walletManager.generateWallet(userId);

    // 4. Initialize USD balance
    console.log(`[Wallet Create] Initializing USD balance`);
    const balanceManager = new UsdBalanceManager();
    await balanceManager.initializeBalance(userId, wallet.id);

    // 5. Return wallet info with mnemonic and private key
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
