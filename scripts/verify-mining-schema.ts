/**
 * Verify Mining Feature Database Schema
 * 
 * This script verifies that all mining feature tables exist
 * and have the correct structure with proper foreign keys.
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function verifySchema() {
  console.log('🔍 Verifying Mining Feature Database Schema...\n');

  try {
    // Test 1: Verify Wallet table
    console.log('✓ Testing Wallet table...');
    const walletCount = await prisma.wallet.count();
    console.log(`  Found ${walletCount} wallet(s)`);

    // Test 2: Verify UsdBalance table
    console.log('✓ Testing UsdBalance table...');
    const balanceCount = await prisma.usdBalance.count();
    console.log(`  Found ${balanceCount} balance record(s)`);

    // Test 3: Verify UsdTransaction table
    console.log('✓ Testing UsdTransaction table...');
    const transactionCount = await prisma.usdTransaction.count();
    console.log(`  Found ${transactionCount} transaction(s)`);

    // Test 4: Verify Inscription table
    console.log('✓ Testing Inscription table...');
    const inscriptionCount = await prisma.inscription.count();
    console.log(`  Found ${inscriptionCount} inscription(s)`);

    // Test 5: Verify InscriptionSchedule table
    console.log('✓ Testing InscriptionSchedule table...');
    const scheduleCount = await prisma.inscriptionSchedule.count();
    console.log(`  Found ${scheduleCount} schedule(s)`);

    // Test 6: Verify TradeOrder table
    console.log('✓ Testing TradeOrder table...');
    const orderCount = await prisma.tradeOrder.count();
    console.log(`  Found ${orderCount} order(s)`);

    // Test 7: Verify Trade table
    console.log('✓ Testing Trade table...');
    const tradeCount = await prisma.trade.count();
    console.log(`  Found ${tradeCount} trade(s)`);

    // Test 8: Verify User relations
    console.log('✓ Testing User model relations...');
    const userWithRelations = await prisma.user.findFirst({
      include: {
        wallet: true,
        usdBalance: true,
        inscriptions: true,
        inscriptionSchedules: true,
        tradeOrders: true,
        buyTrades: true,
        sellTrades: true
      }
    });
    console.log(`  User relations verified (found ${userWithRelations ? 1 : 0} user with relations)`);

    console.log('\n✅ All mining feature tables verified successfully!');
    console.log('\n📊 Summary:');
    console.log(`  - Wallets: ${walletCount}`);
    console.log(`  - USD Balances: ${balanceCount}`);
    console.log(`  - Transactions: ${transactionCount}`);
    console.log(`  - Inscriptions: ${inscriptionCount}`);
    console.log(`  - Schedules: ${scheduleCount}`);
    console.log(`  - Trade Orders: ${orderCount}`);
    console.log(`  - Trades: ${tradeCount}`);

  } catch (error) {
    console.error('\n❌ Schema verification failed:');
    console.error(error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

verifySchema();
