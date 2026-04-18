/**
 * GET /api/wallet
 * Get user's wallet information including balances
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';
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
        address: true,
        reagentBalance: true,
        pathusdBalance: true,
        lastBalanceUpdate: true,
        encryptedPrivateKey: true // Check if it's a new wallet
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

    // 3. Check if this is an old wallet (has encrypted key) or new wallet (no encrypted key)
    const isNewWallet = !wallet.encryptedPrivateKey || wallet.encryptedPrivateKey === '';

    // 4. Refresh balance from blockchain if last update was more than 30 seconds ago
    const now = new Date();
    const lastUpdate = wallet.lastBalanceUpdate;
    const timeSinceUpdate = now.getTime() - lastUpdate.getTime();
    const shouldRefresh = timeSinceUpdate > 30000; // 30 seconds

    let pathusdBalance = parseFloat(wallet.pathusdBalance) || 0;
    let reagentBalance = parseFloat(wallet.reagentBalance) || 0;

    if (shouldRefresh) {
      try {
        console.log(`[Wallet API] Refreshing balance for ${userId} (last update: ${Math.floor(timeSinceUpdate / 1000)}s ago)`);
        
        // Connect to Tempo Network
        const provider = new ethers.JsonRpcProvider(
          process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
        );

        // Get PATHUSD balance (native token)
        const pathusdBalanceBN = await provider.getBalance(wallet.address);
        // PATHUSD uses 6 decimals
        pathusdBalance = parseFloat(ethers.formatUnits(pathusdBalanceBN, 6));
        
        // Ensure it's a valid number
        if (isNaN(pathusdBalance) || !isFinite(pathusdBalance)) {
          console.error(`[Wallet API] Invalid PATHUSD balance: ${pathusdBalance}`);
          pathusdBalance = 0;
        }

        // Get REAGENT token balance
        const reagentTokenAddress = process.env.REAGENT_TOKEN_ADDRESS || '0x20C000000000000000000000a59277C0c1d65Bc5';
        const tokenAbi = ['function balanceOf(address owner) view returns (uint256)'];
        const tokenContract = new ethers.Contract(reagentTokenAddress, tokenAbi, provider);
        const reagentBalanceBN = await tokenContract.balanceOf(wallet.address);
        reagentBalance = parseFloat(ethers.formatUnits(reagentBalanceBN, 6)); // 6 decimals
        
        // Ensure it's a valid number
        if (isNaN(reagentBalance) || !isFinite(reagentBalance)) {
          console.error(`[Wallet API] Invalid REAGENT balance: ${reagentBalance}`);
          reagentBalance = 0;
        }

        // Update database
        await prisma.wallet.update({
          where: { userId },
          data: {
            pathusdBalance: pathusdBalance.toString(),
            reagentBalance: reagentBalance.toString(),
            lastBalanceUpdate: new Date()
          }
        });

        console.log(`[Wallet API] Balance refreshed - PATHUSD: ${pathusdBalance}, REAGENT: ${reagentBalance}`);
      } catch (error) {
        console.error('[Wallet API] Failed to refresh balance from blockchain:', error);
        // Continue with cached balance if refresh fails
      }
    }

    // 5. Check if has managed wallet
    const hasManagedWallet = !!(wallet.encryptedPrivateKey && wallet.encryptedPrivateKey.length > 0);

    // 6. Return wallet data
    return NextResponse.json({
      success: true,
      address: wallet.address,
      reagentBalance,
      pathusdBalance,
      usdBalance: pathusdBalance,  // Use pathusdBalance as usdBalance for compatibility
      lastUpdate: wallet.lastBalanceUpdate.toISOString(),
      isNewWallet, // Indicate if this is a new wallet (client-side keys)
      needsSetup: !isNewWallet, // Old wallets need migration to new system
      hasManagedWallet // Indicate if wallet has encrypted private key for auto mining
    });

  } catch (error: any) {
    console.error('Wallet API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch wallet data',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
