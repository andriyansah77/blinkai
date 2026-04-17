/**
 * Fix balance cache - clear old cached balances and force refresh from blockchain
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fixBalanceCache() {
  try {
    console.log('🔧 Fixing balance cache...\n');

    // Get all wallets
    const wallets = await prisma.wallet.findMany({
      select: {
        userId: true,
        address: true,
        pathusdBalance: true,
        reagentBalance: true
      }
    });

    console.log(`Found ${wallets.length} wallets\n`);

    // Reset all balances to 0 and set lastBalanceUpdate to old date
    // This will force refresh on next API call
    for (const wallet of wallets) {
      console.log(`Resetting cache for wallet ${wallet.address}...`);
      console.log(`  Old PATHUSD: ${wallet.pathusdBalance}`);
      console.log(`  Old REAGENT: ${wallet.reagentBalance}`);
      
      await prisma.wallet.update({
        where: { userId: wallet.userId },
        data: {
          pathusdBalance: '0',
          reagentBalance: '0',
          lastBalanceUpdate: new Date('2020-01-01') // Old date to force refresh
        }
      });
      
      console.log(`  ✅ Cache cleared\n`);
    }

    console.log('✅ All balance caches cleared!');
    console.log('Next API call will fetch fresh data from blockchain.\n');

  } catch (error) {
    console.error('❌ Error:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

fixBalanceCache()
  .then(() => {
    console.log('Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Failed:', error);
    process.exit(1);
  });
