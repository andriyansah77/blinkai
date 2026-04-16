import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { WalletManager } from "@/lib/mining/wallet-manager";
import { InscriptionEngine } from "@/lib/mining/inscription-engine";
import { GasEstimator } from "@/lib/mining/gas-estimator";
import { UsdBalanceManager } from "@/lib/mining/usd-balance-manager";
import { prisma } from "@/lib/prisma";

/**
 * Minting Skill API - Accessible by AI Agent
 * Provides all minting-related functions for the AI agent
 */

export async function POST(request: NextRequest) {
  try {
    // Check for session-based auth first
    const session = await getPrivySession(request);
    
    // If no session, check for X-User-ID header (for Hermes CLI)
    let userId = session?.user?.id;
    
    if (!userId) {
      const userIdHeader = request.headers.get("X-User-ID");
      if (userIdHeader) {
        userId = userIdHeader;
        console.log(`[Minting Skill] Using X-User-ID header: ${userId}`);
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
    const walletManager = new WalletManager();
    const wallet = await walletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found. Please generate a wallet first."
      });
    }

    // Get USD balance
    const balanceManager = new UsdBalanceManager();
    const usdBalance = await balanceManager.getBalance(userId);

    // Get REAGENT balance from blockchain
    const tokenBalances = await walletManager.getTokenBalance(userId);
    const reagentBalance = tokenBalances.reagent;

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        usdBalance: parseFloat(usdBalance.toString()),
        reagentBalance: parseFloat(reagentBalance.toString())
      },
      formatted: {
        address: wallet.address,
        usd: `${usdBalance} USD`,
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
    const walletManager = new WalletManager();
    const wallet = await walletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      });
    }

    const gasEstimator = new GasEstimator();
    const gasEstimate = await gasEstimator.estimateGasForInscription();

    const feeUsd = 0.5; // Auto-mining fee
    const totalCostUsd = feeUsd + parseFloat(gasEstimate.estimatedGas);

    return NextResponse.json({
      success: true,
      feeUsd,
      gasEstimate: gasEstimate.gasUnits,
      gasCostUsd: gasEstimate.estimatedGas,
      totalCostUsd,
      tokensToEarn: 10000,
      message: `💵 Base Fee: ${feeUsd} USD (auto-mining)\n⛽ Gas Fee: ~${gasEstimate.estimatedGas} USD\n📊 Total: ~${totalCostUsd.toFixed(2)} USD\n🪙 Reward: 10,000 REAGENT tokens`
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
    // Check balance first
    const balanceManager = new UsdBalanceManager();
    const usdBalance = await balanceManager.getBalance(userId);

    const requiredAmount = 0.5; // Auto-mining fee
    if (parseFloat(usdBalance.toString()) < requiredAmount) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You need at least $${requiredAmount} USD for auto-mining.\n\nCurrent Balance: $${usdBalance} USD\nRequired: $${requiredAmount} USD\nShortfall: $${(requiredAmount - parseFloat(usdBalance.toString())).toFixed(2)} USD\n\nPlease deposit more funds through the Mining Dashboard.`
      });
    }

    // Get wallet
    const walletManager = new WalletManager();
    const wallet = await walletManager.getWallet(userId);

    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      });
    }

    // Execute minting (handles balance deduction and refunds internally)
    const inscriptionEngine = new InscriptionEngine();
    const result = await inscriptionEngine.executeInscription(
      userId,
      "auto" // Auto-mining type
    );

    if (!result.success) {
      return NextResponse.json({
        success: false,
        error: `Minting failed: ${result.error}`
      });
    }

    // Get updated balances
    const newUsdBalance = await balanceManager.getBalance(userId);
    const newTokenBalances = await walletManager.getTokenBalance(userId);
    const newReagentBalance = newTokenBalances.reagent;

    return NextResponse.json({
      success: true,
      txHash: result.txHash,
      tokensEarned: 10000,
      feeUsd: requiredAmount,
      gasUsed: result.gasPaid || "0.000150",
      newUsdBalance: parseFloat(newUsdBalance.toString()),
      newReagentBalance: parseFloat(newReagentBalance.toString()),
      explorerUrl: `https://explore.tempo.xyz/tx/${result.txHash}`,
      message: `✅ Minting successful!\n\n🪙 Tokens Earned: 10,000 REAGENT\n💵 Fee Paid: $${requiredAmount} USD\n⛽ Gas Used: ${result.gasUsed || "0.000150"} ETH\n🔗 Transaction: ${result.txHash}\n\n💰 New Balance: $${newUsdBalance} USD\n🪙 Total REAGENT: ${newReagentBalance} tokens\n\nView on Explorer: https://explore.tempo.xyz/tx/${result.txHash}`
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
        feeUsd: i.type === "auto" ? 0.5 : 1.0,
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
