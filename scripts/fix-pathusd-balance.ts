/**
 * Fix PATHUSD Balance in Database
 * Reset all corrupted balance values to 0 and force refresh from blockchain
 */

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Starting PATHUSD balance fix...');

  // Find all wallets with invalid balance values
  const wallets = await prisma.wallet.findMany({
    select: {
      userId: true,
      address: true,
      pathusdBalance: true,
      reagentBalance: true,
    }
  });

  console.log(`Found ${wallets.length} wallets to check`);

  let fixedCount = 0;

  for (const wallet of wallets) {
    const pathusdBalance = parseFloat(wallet.pathusdBalance);
    const reagentBalance = parseFloat(wallet.reagentBalance);

    const needsFix = 
      isNaN(pathusdBalance) || 
      !isFinite(pathusdBalance) || 
      pathusdBalance > 1000000 || // Suspiciously large
      isNaN(reagentBalance) || 
      !isFinite(reagentBalance) ||
      reagentBalance > 100000000; // Suspiciously large

    if (needsFix) {
      console.log(`Fixing wallet ${wallet.address}:`);
      console.log(`  Old PATHUSD: ${wallet.pathusdBalance}`);
      console.log(`  Old REAGENT: ${wallet.reagentBalance}`);

      // Reset to 0 and set lastBalanceUpdate to old date to force refresh
      await prisma.wallet.update({
        where: { userId: wallet.userId },
        data: {
          pathusdBalance: '0',
          reagentBalance: '0',
          lastBalanceUpdate: new Date('2020-01-01'), // Force refresh on next API call
        }
      });

      console.log(`  ✓ Reset to 0, will refresh from blockchain on next API call`);
      fixedCount++;
    }
  }

  console.log(`\nFixed ${fixedCount} wallets`);
  console.log('Balance will be refreshed from blockchain on next /api/wallet call');
}

main()
  .catch((e) => {
    console.error('Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
