/**
 * GET /api/wallet/balance
 * Refresh wallet balance from blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from '@/lib/prisma';
import { WalletManager } from '@/lib/mining/wallet-manager';
import { ethers } from 'ethers';

export async function GET(request: NextRequest) {
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

    // 2. Get wallet data
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        address: true
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

    // 3. Connect to Tempo Network
    const provider = new ethers.JsonRpcProvider(
      process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
    );

    // 4. Get PATHUSD balance (native token)
    const pathusdBalance = await provider.getBalance(wallet.address);
    const pathusdBalanceFormatted = parseFloat(ethers.formatUnits(pathusdBalance, 6)); // 6 decimals for PATHUSD

    // 5. Get REAGENT token balance
    const reagentTokenAddress = process.env.REAGENT_TOKEN_ADDRESS || '0x20C000000000000000000000a59277C0c1d65Bc5';
    
    // TIP-20 token ABI (minimal - just balanceOf)
    const tokenAbi = [
      'function balanceOf(address owner) view returns (uint256)'
    ];
    
    const tokenContract = new ethers.Contract(reagentTokenAddress, tokenAbi, provider);
    const reagentBalance = await tokenContract.balanceOf(wallet.address);
    const reagentBalanceFormatted = parseFloat(ethers.formatUnits(reagentBalance, 6)); // 6 decimals for TIP-20

    // 6. Update wallet balances in database
    await prisma.wallet.update({
      where: { userId },
      data: {
        pathusdBalance: pathusdBalanceFormatted.toString(),
        reagentBalance: reagentBalanceFormatted.toString(),
        lastBalanceUpdate: new Date()
      }
    });

    // 7. Return updated balances
    return NextResponse.json({
      success: true,
      address: wallet.address,
      pathusdBalance: pathusdBalanceFormatted,
      reagentBalance: reagentBalanceFormatted,
      lastUpdate: new Date().toISOString()
    });

  } catch (error: any) {
    console.error('Balance refresh error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to refresh balance',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
