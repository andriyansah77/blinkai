/**
 * POST /api/wallet/import
 * Import external wallet using private key
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

    // 2. Ensure user exists in database (upsert)
    const userEmail = session.user.email || `${session.user.id}@privy.user`;
    const userName = session.user.name || session.user.id!;
    
    await prisma.user.upsert({
      where: { id: session.user.id! },
      update: {
        email: userEmail,
        name: userName,
      },
      create: {
        id: session.user.id!,
        email: userEmail,
        name: userName,
        password: 'PRIVY_AUTH', // Privy users don't use password
      }
    });

    console.log(`[Wallet] User ensured in database: ${session.user.id}`);

    // 3. Check if user already has a wallet
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

    // 4. Get private key from request
    const body = await request.json();
    const { privateKey } = body;

    if (!privateKey || typeof privateKey !== 'string') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INPUT',
            message: 'Private key is required'
          }
        },
        { status: 400 }
      );
    }

    // 5. Validate private key format
    let wallet: ethers.Wallet;
    try {
      // Remove 0x prefix if present
      const cleanPrivateKey = privateKey.startsWith('0x') ? privateKey : `0x${privateKey}`;
      wallet = new ethers.Wallet(cleanPrivateKey);
    } catch (error) {
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

    // 6. Encrypt private key
    const { encrypted, iv } = encryptPrivateKey(wallet.privateKey);

    // 7. Create wallet record
    const newWallet = await prisma.wallet.create({
      data: {
        userId,
        address: wallet.address,
        encryptedPrivateKey: encrypted,
        keyIv: iv,
        network: 'tempo',
        imported: true,
        reagentBalance: '0',
        pathusdBalance: '0',
        lastBalanceUpdate: new Date()
      }
    });

    // 8. Create USD balance record
    await prisma.usdBalance.create({
      data: {
        userId,
        walletId: newWallet.id,
        balance: '0',
        lockedBalance: '0'
      }
    });

    console.log(`[Wallet] External wallet imported for user ${userId}: ${wallet.address}`);

    // 9. Return success
    return NextResponse.json({
      success: true,
      address: wallet.address,
      imported: true,
      message: 'External wallet imported successfully'
    });

  } catch (error: any) {
    console.error('Wallet import error:', error);
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
