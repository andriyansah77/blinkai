/**
 * POST /api/wallet/generate
 * Generate new wallet for user (Privy embedded wallet or fallback to ethers)
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';
import crypto from 'crypto';

// Encryption key from environment
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production-32b';

function encryptPrivateKey(privateKey: string): { encrypted: string; iv: string } {
  const key = Buffer.from(ENCRYPTION_KEY.padEnd(32, '0').slice(0, 32));
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv('aes-256-cbc', key, iv);
  
  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');
  
  return {
    encrypted,
    iv: iv.toString('hex')
  };
}

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

    // 2. Check if user already has a wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_EXISTS',
            message: 'User already has a wallet'
          }
        },
        { status: 400 }
      );
    }

    // 3. Try to get Privy embedded wallet first
    let wallet: ethers.Wallet;
    let walletSource = 'ethers'; // Default fallback
    
    try {
      // TODO: Implement Privy embedded wallet creation
      // For now, we'll use ethers as fallback
      // const privyWallet = await createPrivyEmbeddedWallet(userId);
      // if (privyWallet) {
      //   wallet = new ethers.Wallet(privyWallet.privateKey);
      //   walletSource = 'privy';
      // }
      
      // Fallback to ethers wallet generation
      wallet = ethers.Wallet.createRandom();
      console.log(`[Wallet] Generated new ethers wallet for user ${userId}`);
    } catch (privyError) {
      console.warn('[Wallet] Privy wallet creation failed, using ethers fallback:', privyError);
      wallet = ethers.Wallet.createRandom();
    }

    // 4. Encrypt private key
    const { encrypted, iv } = encryptPrivateKey(wallet.privateKey);

    // 5. Create wallet record
    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        address: wallet.address,
        encryptedPrivateKey: encrypted,
        keyIv: iv,
        network: 'tempo',
        imported: false,
        reagentBalance: '0',
        pathusdBalance: '0',
        lastBalanceUpdate: new Date()
      }
    });

    // 6. Create USD balance record
    await prisma.usdBalance.create({
      data: {
        userId,
        walletId: newWallet.id,
        balance: '0',
        lockedBalance: '0'
      }
    });

    console.log(`[Wallet] New wallet created for user ${userId}: ${wallet.address} (source: ${walletSource})`);

    // 7. Return success with wallet info
    return NextResponse.json({
      success: true,
      address: wallet.address,
      source: walletSource,
      message: 'Wallet generated successfully'
    });

  } catch (error: any) {
    console.error('Wallet generation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to generate wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
