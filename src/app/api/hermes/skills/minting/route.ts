import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { simpleWalletManager } from "@/lib/mining/simple-wallet-manager";
import { simpleMintingEngine } from "@/lib/mining/simple-minting-engine";
import { prisma } from "@/lib/prisma";
import { ethers } from 'ethers';

/**
 * Minting Skill API - Accessible by AI Agent
 * Provides all minting-related functions for the AI agent
 * Uses server-side signing only
 */

export async function POST(request: NextRequest) {
  try {
    // Check for session-based auth first
    const session = await getPrivySession(request);
    
    // If no session, check for X-User-ID header (for Hermes CLI/Telegram bot)
    let userId = session?.user?.id;
    
    if (!userId) {
      const userIdHeader = request.headers.get("X-User-ID");
      if (userIdHeader) {
        // Verify API key for bot requests
        const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
        const platformApiKey = process.env.PLATFORM_API_KEY;
        
        if (apiKey && platformApiKey && apiKey === platformApiKey) {
          userId = userIdHeader;
          console.log(`[Minting Skill] Using X-User-ID header: ${userId}`);
        } else {
          return NextResponse.json({ error: "Invalid API key" }, { status: 401 });
        }
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, ...params } = await request.json();

    switch (action) {
      case "check_balance":
        return await checkMiningBalance(userId);
      
      case "estimate_cost":
        return await estimateMintingCost(userId);
      
      case "mint_tokens":
        return await mintReagentTokens(userId);
      
      case "get_history":
        return await getMintingHistory(userId, params);
      
      case "get_stats":
        return await getMiningStats();
      
      default:
        return NextResponse.json(
          { error: "Invalid action", available: ["check_balance", "estimate_cost", "mint_tokens", "get_history", "get_stats"] },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Minting Skill] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check user's mining balance
 */
async function checkMiningBalance(userId: string) {
  try {
    const wallet = await simpleWalletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found. Please generate a wallet first."
      });
    }

    // Get PATHUSD balance from blockchain
    const provider = new ethers.JsonRpcProvider(process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz');
    const PATHUSD_ADDRESS = process.env.PATHUSD_TOKEN_ADDRESS || '0x20c0000000000000000000000000000000000000';
    
    const pathusdContract = new ethers.Contract(
      PATHUSD_ADDRESS,
      ['function balanceOf(address) view returns (uint256)'],
      provider
    );
    
    const pathusdBalanceRaw = await pathusdContract.balanceOf(wallet.address);
    const pathusdBalance = ethers.formatUnits(pathusdBalanceRaw, 6); // PATHUSD has 6 decimals

    // Get REAGENT balance from database
    const reagentBalance = wallet.reagentBalance || '0';

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        pathusdBalance: parseFloat(pathusdBalance),
        reagentBalance: parseFloat(reagentBalance)
      },
      formatted: {
        address: wallet.address,
        pathusd: `${pathusdBalance} PATHUSD`,
        reagent: `${reagentBalance} REAGENT`
      }
    });
  } catch (error) {
    console.error("[Check Balance] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to check balance"
    });
  }
}

/**
 * Estimate minting cost
 */
async function estimateMintingCost(userId: string) {
  try {
    const wallet = await simpleWalletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      });
    }

    const feePathusd = 0.05; // Auto-mining fee in PATHUSD
    const gasEstimate = "0.000150"; // Estimated gas in ETH

    return NextResponse.json({
      success: true,
      feePathusd,
      gasEstimate,
      tokensToEarn: 10000,
      message: `💵 Base Fee: ${feePathusd} PATHUSD (auto-mining)\n⛽ Gas Fee: ~${gasEstimate} ETH\n🪙 Reward: 10,000 REAGENT tokens`
    });
  } catch (error) {
    console.error("[Estimate Cost] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to estimate cost"
    });
  }
}

/**
 * Mint REAGENT tokens
 */
async function mintReagentTokens(userId: string) {
  try {
    // Get wallet
    const wallet = await simpleWalletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      });
    }

    // Execute minting with server-side signing
    const result = await simpleMintingEngine.mint(userId, "auto");

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: `Minting failed: ${result.error}`
      });
    }

    // Get updated wallet
    const updatedWallet = await simpleWalletManager.getWallet(userId);

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      tokensEarned: result.tokensEarned || "10000",
      feePathusd: result.feePaid || "0.05",
      newReagentBalance: updatedWallet?.reagentBalance || "0",
      explorerUrl: `https://explore.tempo.xyz/tx/${result.txHash}`,
      message: `✅ Minting successful!\n\n🪙 Tokens Earned: ${result.tokensEarned || "10000"} REAGENT\n💵 Fee Paid: ${result.feePaid || "0.05"} PATHUSD\n🔗 Transaction: ${result.txHash}\n\n🪙 Total REAGENT: ${updatedWallet?.reagentBalance || "0"} tokens\n\nView on Explorer: https://explore.tempo.xyz/tx/${result.txHash}`
    });
  } catch (error) {
    console.error("[Mint Tokens] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to mint tokens. Please try again."
    });
  }
}

/**
 * Get minting history
 */
async function getMintingHistory(userId: string, params: any) {
  try {
    const page = params.page || 1;
    const limit = params.limit || 10;
    const status = params.status;

    const skip = (page - 1) * limit;

    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    const [inscriptions, total] = await Promise.all([
      prisma.inscription.findMany({
        where,
        orderBy: { createdAt: "desc" },
        take: limit,
        skip,
      }),
      prisma.inscription.count({ where }),
    ]);

    return NextResponse.json({
      success: true,
      inscriptions: inscriptions.map(i => ({
        id: i.id,
        createdAt: i.createdAt,
        type: i.type,
        tokensEarned: 10000,
        feePathusd: i.type === "auto" ? 0.05 : 0.1,
        gasUsed: i.gasFee || "0.000150",
        status: i.status,
        txHash: i.txHash,
      })),
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("[Get History] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get history"
    });
  }
}

/**
 * Get global mining statistics
 */
async function getMiningStats() {
  try {
    const [totalInscriptions, inscriptions24h, uniqueUsers, typeBreakdown] = await Promise.all([
      prisma.inscription.count(),
      prisma.inscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000),
          },
        },
      }),
      prisma.inscription.groupBy({
        by: ["userId"],
        _count: true,
      }),
      prisma.inscription.groupBy({
        by: ["type"],
        _count: true,
      }),
    ]);

    const totalSupplyMinted = totalInscriptions * 10000;
    const remainingAllocation = 200000000 - totalSupplyMinted;
    const allocationPercentage = (totalSupplyMinted / 200000000) * 100;

    const autoCount = typeBreakdown.find(t => t.type === "auto")?._count || 0;
    const manualCount = typeBreakdown.find(t => t.type === "manual")?._count || 0;

    return NextResponse.json({
      success: true,
      stats: {
        totalInscriptions,
        totalSupplyMinted: totalSupplyMinted.toString(),
        remainingAllocation: remainingAllocation.toString(),
        allocationPercentage: allocationPercentage.toFixed(2),
        inscriptions24h,
        uniqueUsers: uniqueUsers.length,
        typeBreakdown: {
          auto: autoCount,
          manual: manualCount,
          autoPercentage: ((autoCount / totalInscriptions) * 100).toFixed(1),
          manualPercentage: ((manualCount / totalInscriptions) * 100).toFixed(1),
        },
      },
    });
  } catch (error) {
    console.error("[Get Stats] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get stats"
    });
  }
}
