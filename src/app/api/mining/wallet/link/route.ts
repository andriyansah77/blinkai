/**
 * POST /api/mining/wallet/link
 * Link MetaMask wallet to user account
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
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

    // 2. Parse request body
    const body = await request.json();
    const { address } = body;

    if (!address || !ethers.isAddress(address)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_ADDRESS',
            message: 'Invalid wallet address'
          }
        },
        { status: 400 }
      );
    }

    // 3. Check if user already has a wallet
    const existingWallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existingWallet) {
      // Update existing wallet address if different
      if (existingWallet.address.toLowerCase() !== address.toLowerCase()) {
        await prisma.wallet.update({
          where: { userId },
          data: {
            address: address.toLowerCase(),
            imported: true,
            lastBalanceUpdate: new Date()
          }
        });
      }

      return NextResponse.json({
        success: true,
        message: 'Wallet linked successfully',
        wallet: {
          address: address.toLowerCase(),
          linked: true
        }
      });
    }

    // 4. Create new wallet record (external wallet, no private key stored)
    await prisma.wallet.create({
      data: {
        userId,
        address: address.toLowerCase(),
        encryptedPrivateKey: '', // External wallet - no private key
        keyIv: '',
        network: 'tempo',
        imported: true,
        reagentBalance: '0',
        pathusdBalance: '0'
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Wallet linked successfully',
      wallet: {
        address: address.toLowerCase(),
        linked: true
      }
    });

  } catch (error: any) {
    console.error('Wallet link API error:', error);
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
