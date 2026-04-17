/**
 * Clean Test Data
 * Remove all test users and related data from database
 */

import { prisma } from '@/lib/prisma';

async function cleanTestData() {
  console.log('🧹 Cleaning test data from database...\n');

  try {
    // Get all users
    const users = await prisma.user.findMany({
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    console.log(`Found ${users.length} users in database:\n`);
    users.forEach((user, index) => {
      console.log(`${index + 1}. ${user.email} (${user.name || 'No name'})`);
      console.log(`   ID: ${user.id}`);
      console.log(`   Created: ${user.createdAt.toISOString()}`);
      console.log('');
    });

    // Confirm deletion
    console.log('⚠️  WARNING: This will delete ALL users and their data!');
    console.log('   - Users');
    console.log('   - Wallets');
    console.log('   - Inscriptions');
    console.log('   - USD Balances');
    console.log('   - Credit Ledgers');
    console.log('   - API Key Configs');
    console.log('   - Agents');
    console.log('   - Sessions');
    console.log('   - And all related data...\n');

    // Delete all data in correct order (respecting foreign keys)
    console.log('Starting deletion...\n');

    // 1. Delete trades
    const trades = await prisma.trade.deleteMany({});
    console.log(`✓ Deleted ${trades.count} trades`);

    // 2. Delete trade orders
    const tradeOrders = await prisma.tradeOrder.deleteMany({});
    console.log(`✓ Deleted ${tradeOrders.count} trade orders`);

    // 3. Delete inscription schedules
    const inscriptionSchedules = await prisma.inscriptionSchedule.deleteMany({});
    console.log(`✓ Deleted ${inscriptionSchedules.count} inscription schedules`);

    // 4. Delete inscriptions
    const inscriptions = await prisma.inscription.deleteMany({});
    console.log(`✓ Deleted ${inscriptions.count} inscriptions`);

    // 5. Delete USD transactions
    const usdTransactions = await prisma.usdTransaction.deleteMany({});
    console.log(`✓ Deleted ${usdTransactions.count} USD transactions`);

    // 6. Delete USD balances
    const usdBalances = await prisma.usdBalance.deleteMany({});
    console.log(`✓ Deleted ${usdBalances.count} USD balances`);

    // 7. Delete wallets
    const wallets = await prisma.wallet.deleteMany({});
    console.log(`✓ Deleted ${wallets.count} wallets`);

    // 8. Delete feedback
    const feedback = await prisma.feedback.deleteMany({});
    console.log(`✓ Deleted ${feedback.count} feedback entries`);

    // 9. Delete Hermes memories
    const hermesMemories = await prisma.hermesMemory.deleteMany({});
    console.log(`✓ Deleted ${hermesMemories.count} Hermes memories`);

    // 10. Delete Hermes sessions
    const hermesSessions = await prisma.hermesSession.deleteMany({});
    console.log(`✓ Deleted ${hermesSessions.count} Hermes sessions`);

    // 11. Delete Hermes skills
    const hermesSkills = await prisma.hermesSkill.deleteMany({});
    console.log(`✓ Deleted ${hermesSkills.count} Hermes skills`);

    // 12. Delete Hermes agents
    const hermesAgents = await prisma.hermesAgent.deleteMany({});
    console.log(`✓ Deleted ${hermesAgents.count} Hermes agents`);

    // 13. Delete agent sessions
    const agentSessions = await prisma.agentSession.deleteMany({});
    console.log(`✓ Deleted ${agentSessions.count} agent sessions`);

    // 14. Delete agents
    const agents = await prisma.agent.deleteMany({});
    console.log(`✓ Deleted ${agents.count} agents`);

    // 15. Delete credit ledgers
    const credits = await prisma.creditLedger.deleteMany({});
    console.log(`✓ Deleted ${credits.count} credit ledger entries`);

    // 16. Delete API key configs
    const apiKeys = await prisma.apiKeyConfig.deleteMany({});
    console.log(`✓ Deleted ${apiKeys.count} API key configs`);

    // 17. Delete users
    const deletedUsers = await prisma.user.deleteMany({});
    console.log(`✓ Deleted ${deletedUsers.count} users`);

    console.log('\n✅ Database cleaned successfully!');
    console.log('\nAll test data has been removed.');
    console.log('You can now start fresh with new user registrations.\n');

  } catch (error: any) {
    console.error('❌ Error cleaning database:', error.message);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

cleanTestData();
