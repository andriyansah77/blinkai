import { NextRequest, NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/lib/prisma";
import { grantCredits, SIGNUP_BONUS } from "@/lib/credits";
import { setupUserGateway } from "@/lib/setup-user-gateway";
import { WalletManager } from "@/lib/mining/wallet-manager";
import { UsdBalanceManager } from "@/lib/mining/usd-balance-manager";
import { autoInstallMintingSkill } from "@/lib/hooks/auto-install-minting-skill";

export async function POST(request: NextRequest) {
  try {
    const { name, email, password } = await request.json();

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "Password must be at least 8 characters" },
        { status: 400 }
      );
    }

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json(
        { error: "An account with this email already exists" },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 12);

    // Create user + credit ledger + api key config + wallet + usd balance in a transaction
    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email,
          password: hashedPassword,
        },
      });

      // Create signup bonus credit ledger entry
      await tx.creditLedger.create({
        data: {
          userId: newUser.id,
          amount: SIGNUP_BONUS,
          reason: "signup_bonus",
          meta: JSON.stringify({ note: "Welcome bonus" }),
        },
      });

      // Create default ApiKeyConfig (platform mode)
      await tx.apiKeyConfig.create({
        data: {
          userId: newUser.id,
          mode: "platform",
        },
      });

      // Generate wallet for mining feature
      console.log(`[Registration] Generating wallet for user ${newUser.id}`);
      const walletManager = new WalletManager();
      const wallet = await walletManager.generateWallet(newUser.id);
      
      console.log(`[Registration] ✅ Wallet generated: ${wallet.address}`);

      // Initialize USD balance
      console.log(`[Registration] Initializing USD balance for user ${newUser.id}`);
      const balanceManager = new UsdBalanceManager();
      await balanceManager.initializeBalance(newUser.id, wallet.id);
      console.log(`[Registration] ✅ USD balance initialized`);

      return newUser;
    });

    // Setup Hermes profile and gateway for new user (async, don't block registration)
    console.log(`[Registration] Starting auto-setup for user ${user.id}`);
    
    setupUserGateway(user.id).then(async (result) => {
      if (result.success) {
        console.log(`✅ [Registration] Complete setup for user ${user.id}`);
        console.log(`   - Profile: ${result.profileCreated ? '✅' : '❌'}`);
        console.log(`   - Gateway Installed: ${result.gatewayInstalled ? '✅' : '❌'}`);
        console.log(`   - Gateway Running: ${result.gatewayStarted ? '✅' : '❌'}`);
        
        // Install minting skill after gateway is ready
        console.log(`[Registration] Installing minting skill for user ${user.id}`);
        const skillResult = await autoInstallMintingSkill(user.id);
        if (skillResult.success) {
          console.log(`✅ [Registration] Minting skill installed: ${skillResult.skillId}`);
        } else {
          console.error(`❌ [Registration] Minting skill installation failed: ${skillResult.error}`);
        }
      } else {
        console.error(`❌ [Registration] Setup failed for user ${user.id}: ${result.error}`);
      }
    }).catch((error) => {
      console.error(`❌ [Registration] Setup exception for user ${user.id}:`, error);
    });

    return NextResponse.json({
      id: user.id,
      email: user.email,
      name: user.name,
    });
  } catch (error) {
    console.error("Registration error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// Suppress unused import warning
void grantCredits;
