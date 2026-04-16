import { NextRequest, NextResponse } from "next/server";
import { getPrivySession } from "@/lib/privy-server";
import { fileWalletManager } from "@/lib/wallet/file-wallet-manager";

/**
 * Wallet Skill API - Accessible by AI Agent
 * Provides wallet operations: check balance, send, receive
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
        console.log(`[Wallet Skill] Using X-User-ID header: ${userId}`);
      }
    }
    
    if (!userId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { action, ...params } = await request.json();

    switch (action) {
      case "check_balance":
        return await checkBalance(userId);
      
      case "get_address":
        return await getAddress(userId);
      
      case "send_eth":
        return await sendEth(userId, params);
      
      case "send_reagent":
        return await sendReagent(userId, params);
      
      case "get_history":
        return await getHistory(userId, params);
      
      default:
        return NextResponse.json(
          { 
            error: "Invalid action", 
            available: ["check_balance", "get_address", "send_eth", "send_reagent", "get_history"] 
          },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error("[Wallet Skill] Error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * Check wallet balance (real-time from blockchain)
 */
async function checkBalance(userId: string) {
  try {
    const wallet = await fileWalletManager.getWallet(userId);
    
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found. Please generate a wallet first."
      });
    }

    // Get real-time balance from blockchain
    const balance = await fileWalletManager.getBalance(userId);

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        eth: balance.eth,
        reagent: balance.reagent,
        pathusd: balance.pathusd
      },
      formatted: {
        address: wallet.address,
        eth: `${balance.eth} ETH`,
        reagent: `${balance.reagent} REAGENT`,
        pathusd: `${balance.pathusd} PATHUSD`
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
 * Get wallet address
 */
async function getAddress(userId: string) {
  try {
    const wallet = await fileWalletManager.getWallet(userId);
    
    if (!wallet) {
      return NextResponse.json({
        success: false,
        error: "Wallet not found"
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        address: wallet.address,
        createdAt: wallet.createdAt
      }
    });
  } catch (error) {
    console.error("[Get Address] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get address"
    });
  }
}

/**
 * Send ETH
 */
async function sendEth(userId: string, params: any) {
  try {
    const { to, amount } = params;

    if (!to || !amount) {
      return NextResponse.json({
        success: false,
        error: "Missing required parameters: to, amount"
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid amount"
      });
    }

    // Check balance first
    const balance = await fileWalletManager.getBalance(userId);
    if (parseFloat(balance.eth) < amountNum) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You have ${balance.eth} ETH, but trying to send ${amount} ETH`
      });
    }

    // Send transaction
    const result = await fileWalletManager.sendEth(userId, to, amount);

    return NextResponse.json({
      success: true,
      data: {
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        from: (await fileWalletManager.getWallet(userId))?.address,
        to,
        amount: `${amount} ETH`
      }
    });
  } catch (error: any) {
    console.error("[Send ETH] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send ETH"
    });
  }
}

/**
 * Send REAGENT tokens
 */
async function sendReagent(userId: string, params: any) {
  try {
    const { to, amount } = params;

    if (!to || !amount) {
      return NextResponse.json({
        success: false,
        error: "Missing required parameters: to, amount"
      });
    }

    // Validate amount
    const amountNum = parseFloat(amount);
    if (isNaN(amountNum) || amountNum <= 0) {
      return NextResponse.json({
        success: false,
        error: "Invalid amount"
      });
    }

    // Check balance first
    const balance = await fileWalletManager.getBalance(userId);
    if (parseFloat(balance.reagent) < amountNum) {
      return NextResponse.json({
        success: false,
        error: `Insufficient balance. You have ${balance.reagent} REAGENT, but trying to send ${amount} REAGENT`
      });
    }

    // Send transaction
    const result = await fileWalletManager.sendReagent(userId, to, amount);

    return NextResponse.json({
      success: true,
      data: {
        txHash: result.txHash,
        explorerUrl: result.explorerUrl,
        from: (await fileWalletManager.getWallet(userId))?.address,
        to,
        amount: `${amount} REAGENT`
      }
    });
  } catch (error: any) {
    console.error("[Send REAGENT] Error:", error);
    return NextResponse.json({
      success: false,
      error: error.message || "Failed to send REAGENT"
    });
  }
}

/**
 * Get transaction history
 */
async function getHistory(userId: string, params: any) {
  try {
    const limit = params.limit || 10;
    const history = await fileWalletManager.getTransactionHistory(userId, limit);

    return NextResponse.json({
      success: true,
      data: {
        transactions: history,
        count: history.length
      }
    });
  } catch (error) {
    console.error("[Get History] Error:", error);
    return NextResponse.json({
      success: false,
      error: "Failed to get history"
    });
  }
}
