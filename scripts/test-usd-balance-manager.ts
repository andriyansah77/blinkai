/**
 * Test USD Balance Manager
 * 
 * This script tests the USD Balance Manager service functionality
 */

import { PrismaClient } from '@prisma/client';
import { walletManager } from '../src/lib/mining/wallet-manager';
import { usdBalanceManager } from '../src/lib/mining/usd-balance-manager';

const prisma = new PrismaClient();

async function testUsdBalanceManager() {
  console.log('🧪 Testing USD Balance Manager...\n');

  try {
    // Create a test user
    console.log('1️⃣ Creating test user...');
    const testUser = await prisma.user.create({
      data: {
        email: `test-${Date.now()}@example.com`,
        name: 'Test User',
        password: 'test-password-hash',
        role: 'user'
      }
    });
    console.log(`✓ Created user: ${testUser.email}`);

    // Generate wallet for user
    console.log('\n2️⃣ Generating wallet...');
    const wallet = await walletManager.generateWallet(testUser.id);
    console.log(`✓ Generated wallet: ${wallet.address}`);

    // Test: Get initial balance (should auto-create)
    console.log('\n3️⃣ Testing getBalance (auto-create)...');
    const initialBalance = await usdBalanceManager.getBalance(testUser.id);
    console.log(`✓ Initial balance: ${initialBalance.balance} PATHUSD`);
    console.log(`  Available: ${initialBalance.availableBalance} PATHUSD`);
    console.log(`  Locked: ${initialBalance.lockedBalance} PATHUSD`);

    // Test: Deposit funds
    console.log('\n4️⃣ Testing deposit...');
    const depositResult = await usdBalanceManager.deposit(
      testUser.id,
      '100.50',
      'Test deposit'
    );
    console.log(`✓ Deposited 100.50 PATHUSD`);
    console.log(`  New balance: ${depositResult.newBalance} PATHUSD`);

    // Test: Check sufficient balance
    console.log('\n5️⃣ Testing hasSufficientBalance...');
    const hasFunds = await usdBalanceManager.hasSufficientBalance(testUser.id, '50');
    console.log(`✓ Has 50 PATHUSD: ${hasFunds}`);
    const hasMoreFunds = await usdBalanceManager.hasSufficientBalance(testUser.id, '200');
    console.log(`✓ Has 200 PATHUSD: ${hasMoreFunds}`);

    // Test: Deduct inscription fee
    console.log('\n6️⃣ Testing deduct (inscription fee)...');
    const deductResult = await usdBalanceManager.deduct(
      testUser.id,
      '0.5',
      'inscription_fee',
      'Auto inscription fee',
      'inscription',
      'test-inscription-id'
    );
    console.log(`✓ Deducted 0.5 PATHUSD`);
    console.log(`  New balance: ${deductResult.newBalance} PATHUSD`);

    // Test: Deduct gas fee
    console.log('\n7️⃣ Testing deduct (gas fee)...');
    const gasDeductResult = await usdBalanceManager.deduct(
      testUser.id,
      '0.05',
      'gas_fee',
      'Gas fee for inscription',
      'inscription',
      'test-inscription-id'
    );
    console.log(`✓ Deducted 0.05 PATHUSD`);
    console.log(`  New balance: ${gasDeductResult.newBalance} PATHUSD`);

    // Test: Lock balance
    console.log('\n8️⃣ Testing lockBalance...');
    await usdBalanceManager.lockBalance(testUser.id, '10');
    const balanceAfterLock = await usdBalanceManager.getBalance(testUser.id);
    console.log(`✓ Locked 10 PATHUSD`);
    console.log(`  Total balance: ${balanceAfterLock.balance} PATHUSD`);
    console.log(`  Locked: ${balanceAfterLock.lockedBalance} PATHUSD`);
    console.log(`  Available: ${balanceAfterLock.availableBalance} PATHUSD`);

    // Test: Unlock balance
    console.log('\n9️⃣ Testing unlockBalance...');
    await usdBalanceManager.unlockBalance(testUser.id, '10');
    const balanceAfterUnlock = await usdBalanceManager.getBalance(testUser.id);
    console.log(`✓ Unlocked 10 PATHUSD`);
    console.log(`  Total balance: ${balanceAfterUnlock.balance} PATHUSD`);
    console.log(`  Locked: ${balanceAfterUnlock.lockedBalance} PATHUSD`);
    console.log(`  Available: ${balanceAfterUnlock.availableBalance} PATHUSD`);

    // Test: Refund
    console.log('\n🔟 Testing refund...');
    const refundResult = await usdBalanceManager.refund(
      testUser.id,
      '0.5',
      'Failed inscription refund',
      'inscription',
      'test-inscription-id'
    );
    console.log(`✓ Refunded 0.5 PATHUSD`);
    console.log(`  New balance: ${refundResult.newBalance} PATHUSD`);

    // Test: Get transaction history
    console.log('\n1️⃣1️⃣ Testing getTransactions...');
    const transactions = await usdBalanceManager.getTransactions(testUser.id, 10);
    console.log(`✓ Retrieved ${transactions.length} transactions:`);
    transactions.forEach((tx, index) => {
      console.log(`  ${index + 1}. ${tx.type}: ${tx.amount} PATHUSD (${tx.description})`);
    });

    // Test: Get transaction count
    console.log('\n1️⃣2️⃣ Testing getTransactionCount...');
    const txCount = await usdBalanceManager.getTransactionCount(testUser.id);
    console.log(`✓ Total transactions: ${txCount}`);

    // Final balance check
    console.log('\n📊 Final Balance Summary:');
    const finalBalance = await usdBalanceManager.getBalance(testUser.id);
    console.log(`  Total: ${finalBalance.balance} PATHUSD`);
    console.log(`  Available: ${finalBalance.availableBalance} PATHUSD`);
    console.log(`  Locked: ${finalBalance.lockedBalance} PATHUSD`);

    // Cleanup
    console.log('\n🧹 Cleaning up test data...');
    await prisma.user.delete({ where: { id: testUser.id } });
    console.log('✓ Test user deleted');

    console.log('\n✅ All USD Balance Manager tests passed!');

  } catch (error) {
    console.error('\n❌ Test failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

testUsdBalanceManager();
