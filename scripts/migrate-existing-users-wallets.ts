/**
 * Migrate Existing Users to File-Based Wallets
 * This script creates file-based wallets for all existing users who have database wallets
 */

import { PrismaClient } from '@prisma/client';
import { WalletManager } from '../src/lib/mining/wallet-manager';
import { fileWalletManager } from '../src/lib/wallet/file-wallet-manager';

const prisma = new PrismaClient();
const walletManager = new WalletManager();

async function migrateExistingUsers() {
  console.log('🔄 Starting migration of existing users to file-based wallets...\n');

  try {
    // Get all users who have wallets in database
    const wallets = await prisma.wallet.findMany({
      include: {
        user: true
      }
    });

    console.log(`Found ${wallets.length} wallets to migrate\n`);

    let migrated = 0;
    let skipped = 0;
    let failed = 0;

    for (const wallet of wallets) {
      const userId = wallet.userId;
      const userName = wallet.user.name || wallet.user.email;

      try {
        // Check if file-based wallet already exists
        const existingFileWallet = await fileWalletManager.getWallet(userId);
        
        if (existingFileWallet) {
          console.log(`⏭️  Skipped ${userName} (${userId}) - file wallet already exists`);
          skipped++;
          continue;
        }

        // Export private key from database wallet
        console.log(`🔐 Exporting private key for ${userName} (${userId})...`);
        const privateKey = await walletManager.exportPrivateKey(userId);

        // Import to file-based wallet
        console.log(`📝 Creating file-based wallet for ${userName} (${userId})...`);
        await fileWalletManager.importWallet(userId, privateKey);

        console.log(`✅ Migrated ${userName} (${userId}) - ${wallet.address}\n`);
        migrated++;

      } catch (error: any) {
        console.error(`❌ Failed to migrate ${userName} (${userId}): ${error.message}\n`);
        failed++;
      }
    }

    console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log('📊 Migration Summary');
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    console.log(`✅ Migrated: ${migrated}`);
    console.log(`⏭️  Skipped: ${skipped}`);
    console.log(`❌ Failed: ${failed}`);
    console.log(`📊 Total: ${wallets.length}`);
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n');

    if (migrated > 0) {
      console.log('🎉 Migration completed successfully!');
      console.log('📁 File-based wallets are stored in: data/wallets.json\n');
    }

  } catch (error) {
    console.error('❌ Migration failed:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

// Run migration
migrateExistingUsers()
  .then(() => {
    console.log('✅ Migration script completed');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Migration script failed:', error);
    process.exit(1);
  });
