/**
 * Add pathUSD balance to user for testing
 * Usage: npx ts-node scripts/add-test-balance.ts <email> <amount>
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function addTestBalance(email: string, amount: string) {
  try {
    console.log(`\n🔍 Finding user: ${email}`);
    
    // Find user
    const user = await prisma.user.findUnique({
      where: { email },
      include: {
        wallet: true,
        usdBalance: true
      }
    });

    if (!user) {
      console.error(`❌ User not found: ${email}`);
      process.exit(1);
    }

    console.log(`✅ User found: ${user.name || user.email} (ID: ${user.id})`);

    // Check wallet
    if (!user.wallet) {
      console.log(`⚠️  No wallet found. Creating wallet...`);
      
      // Create a placeholder wallet (external wallet, no private key)
      await prisma.wallet.create({
        data: {
          userId: user.id,
          address: '0x0000000000000000000000000000000000000000', // Placeholder
          encryptedPrivateKey: '',
          keyIv: '',
          network: 'tempo',
          imported: true,
          reagentBalance: '0',
          pathusdBalance: '0'
        }
      });
      
      console.log(`✅ Wallet created`);
    } else {
      console.log(`✅ Wallet exists: ${user.wallet.address}`);
    }

    // Check USD balance
    let usdBalance = user.usdBalance;
    
    if (!usdBalance) {
      console.log(`⚠️  No USD balance record. Creating...`);
      
      // Get wallet (might be newly created)
      const wallet = await prisma.wallet.findUnique({
        where: { userId: user.id }
      });

      if (!wallet) {
        console.error(`❌ Failed to get wallet`);
        process.exit(1);
      }

      usdBalance = await prisma.usdBalance.create({
        data: {
          userId: user.id,
          walletId: wallet.id,
          balance: '0',
          lockedBalance: '0'
        }
      });
      
      console.log(`✅ USD balance record created`);
    }

    // Add balance
    const currentBalance = parseFloat(usdBalance.balance);
    const addAmount = parseFloat(amount);
    const newBalance = (currentBalance + addAmount).toString();

    await prisma.usdBalance.update({
      where: { userId: user.id },
      data: {
        balance: newBalance
      }
    });

    console.log(`\n💰 Balance Updated:`);
    console.log(`   Previous: ${currentBalance} pathUSD`);
    console.log(`   Added: ${addAmount} pathUSD`);
    console.log(`   New: ${newBalance} pathUSD`);

    // Create transaction record
    await prisma.usdTransaction.create({
      data: {
        balanceId: usdBalance.id,
        type: 'deposit',
        amount: amount,
        balanceBefore: currentBalance.toString(),
        balanceAfter: newBalance,
        description: 'Test balance added via script',
        referenceType: 'manual'
      }
    });

    console.log(`✅ Transaction recorded`);
    console.log(`\n✨ Done! User can now mint REAGENT tokens.`);

  } catch (error) {
    console.error(`\n❌ Error:`, error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Parse command line arguments
const args = process.argv.slice(2);

if (args.length < 2) {
  console.log(`
Usage: npx ts-node scripts/add-test-balance.ts <email> <amount>

Example:
  npx ts-node scripts/add-test-balance.ts user@example.com 100

This will add 100 pathUSD to the user's balance for testing.
  `);
  process.exit(1);
}

const [email, amount] = args;

// Validate amount
if (isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
  console.error(`❌ Invalid amount: ${amount}`);
  process.exit(1);
}

addTestBalance(email, amount);
