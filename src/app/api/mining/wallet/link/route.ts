/**
 * POST /api/mining/wallet/link
 * Link MetaMask wallet to user account and grant ISSUER_ROLE
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

// Grant ISSUER_ROLE to wallet
async function grantIssuerRole(walletAddress: string): Promise<{ success: boolean; txHash?: string; error?: string }> {
  try {
    const platformPrivateKey = process.env.PLATFORM_WALLET_PRIVATE_KEY;
    const reagentTokenAddress = process.env.REAGENT_TOKEN_ADDRESS;
    const rpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';

    if (!platformPrivateKey) {
      console.error('Platform wallet private key not configured');
      return { success: false, error: 'Platform wallet not configured' };
    }

    if (!reagentTokenAddress) {
      console.error('REAGENT token address not configured');
      return { success: false, error: 'Token address not configured' };
    }

    // Connect to Tempo Network
    const provider = new ethers.JsonRpcProvider(rpcUrl);
    const platformWallet = new ethers.Wallet(platformPrivateKey, provider);

    // ISSUER_ROLE = keccak256("ISSUER_ROLE")
    const ISSUER_ROLE = ethers.keccak256(ethers.toUtf8Bytes('ISSUER_ROLE'));

    // Create contract interface
    const contractInterface = new ethers.Interface([
      'function grantRole(bytes32 role, address account) external',
      'function hasRole(bytes32 role, address account) external view returns (bool)'
    ]);

    // Check if wallet already has ISSUER_ROLE
    const contract = new ethers.Contract(reagentTokenAddress, contractInterface, provider);
    const hasRole = await contract.hasRole(ISSUER_ROLE, walletAddress) as boolean;

    if (hasRole) {
      console.log(`Wallet ${walletAddress} already has ISSUER_ROLE`);
      return { success: true, txHash: 'already_granted' };
    }

    // Grant ISSUER_ROLE
    const contractWithSigner = contract.connect(platformWallet) as ethers.Contract;
    const tx = await contractWithSigner.grantRole(ISSUER_ROLE, walletAddress) as ethers.ContractTransactionResponse;
    
    console.log(`Granting ISSUER_ROLE to ${walletAddress}, tx: ${tx.hash}`);
    
    // Wait for confirmation
    await tx.wait();
    
    console.log(`ISSUER_ROLE granted to ${walletAddress}`);
    
    return { success: true, txHash: tx.hash };
  } catch (error: any) {
    console.error('Failed to grant ISSUER_ROLE:', error);
    return { success: false, error: error.message };
  }
}

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getPrivySession(request);
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
        
        // Grant ISSUER_ROLE to new address
        const roleResult = await grantIssuerRole(address.toLowerCase());
        if (!roleResult.success) {
          console.error('Failed to grant ISSUER_ROLE:', roleResult.error);
        }
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

    // 5. Grant ISSUER_ROLE to the wallet
    const roleResult = await grantIssuerRole(address.toLowerCase());
    if (!roleResult.success) {
      console.error('Failed to grant ISSUER_ROLE:', roleResult.error);
      // Don't fail the wallet linking, just log the error
      // User can try minting and we'll show a better error message
    }

    return NextResponse.json({
      success: true,
      message: 'Wallet linked successfully',
      wallet: {
        address: address.toLowerCase(),
        linked: true,
        roleGranted: roleResult.success
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
