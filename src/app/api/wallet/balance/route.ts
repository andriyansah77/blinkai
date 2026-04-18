/**
 * GET /api/wallet/balance
 * Get wallet balance for user (supports both session and API key auth)
 * Fetches real-time balance from blockchain
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

// Tempo Network RPC
const TEMPO_RPC_URL = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.network';

// PATHUSD Token Contract Address
const PATHUSD_ADDRESS = process.env.NEXT_PUBLIC_PATHUSD_ADDRESS || '0x...';

// ERC20 ABI for balanceOf
const ERC20_ABI = [
  'function balanceOf(address owner) view returns (uint256)'
];

export async function GET(request: NextRequest) {
  try {
    // Authenticate user (support both Privy session and X-User-ID header for bots)
    let userId: string | null = null;
    
    // Check for X-User-ID header (for Telegram bot / API calls)
    const userIdHeader = request.headers.get('X-User-ID');
    if (userIdHeader) {
      // Verify API key for bot requests
      const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
      const platformApiKey = process.env.PLATFORM_API_KEY;
      
      if (apiKey && platformApiKey && apiKey === platformApiKey) {
        userId = userIdHeader;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }
    } else {
      // Regular Privy session authentication
      const session = await getPrivySession(request);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Verify userId is not null
    if (!userId) {
      return NextResponse.json(
        { success: false, error: 'User ID not found' },
        { status: 400 }
      );
    }

    // Get wallet
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return NextResponse.json(
        { success: false, error: 'Wallet not found' },
        { status: 404 }
      );
    }

    // Fetch real-time balance from blockchain
    try {
      const provider = new ethers.JsonRpcProvider(TEMPO_RPC_URL);
      
      // Get PATHUSD balance
      const pathusdContract = new ethers.Contract(PATHUSD_ADDRESS, ERC20_ABI, provider);
      const pathusdBalanceRaw = await pathusdContract.balanceOf(wallet.address);
      const pathusdBalance = ethers.formatUnits(pathusdBalanceRaw, 6); // PATHUSD has 6 decimals

      // Update database with latest balance
      await prisma.wallet.update({
        where: { userId },
        data: {
          pathusdBalance,
          lastBalanceUpdate: new Date()
        }
      });

      return NextResponse.json({
        success: true,
        address: wallet.address,
        reagentBalance: wallet.reagentBalance,
        pathusdBalance,
        lastBalanceUpdate: new Date()
      });

    } catch (blockchainError: any) {
      console.error('[Wallet Balance] Blockchain fetch error:', blockchainError);
      
      // Fallback to database balance if blockchain fetch fails
      return NextResponse.json({
        success: true,
        address: wallet.address,
        reagentBalance: wallet.reagentBalance,
        pathusdBalance: wallet.pathusdBalance || '0',
        lastBalanceUpdate: wallet.lastBalanceUpdate,
        warning: 'Using cached balance (blockchain fetch failed)'
      });
    }

  } catch (error: any) {
    console.error('[Wallet Balance API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
