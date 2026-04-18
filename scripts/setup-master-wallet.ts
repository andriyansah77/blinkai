/**
 * Setup Master Wallet for Minting
 * This wallet will have ISSUER_ROLE and mint tokens for all users
 */

import { simpleWalletManager } from '../src/lib/mining/simple-wallet-manager';
import { prisma } from '../src/lib/prisma';

const MASTER_WALLET_USER_ID = process.env.MASTER_WALLET_USER_ID || 'master';

async function setupMasterWallet() {
  console.log('========================================');
  console.log('Setting up Master Wallet');
  console.log('========================================\n');

  try {
    // 1. Check if master wallet already exists
    const existing = await simpleWalletManager.getWallet(MASTER_WALLET_USER_ID);
    
    if (existing) {
      console.log('✓ Master wallet already exists');
      console.log(`  Address: ${existing.address}`);
      console.log(`  User ID: ${MASTER_WALLET_USER_ID}`);
      console.log('\nMaster wallet is ready to use!');
      return;
    }

    // 2. Create master user if not exists
    let masterUser = await prisma.user.findUnique({
      where: { id: MASTER_WALLET_USER_ID }
    });

    if (!masterUser) {
      console.log('Creating master user...');
      masterUser = await prisma.user.create({
        data: {
          id: MASTER_WALLET_USER_ID,
          email: 'master@reagent.system',
          name: 'Master Wallet',
          password: '', // No password for system user
        }
      });
      console.log('✓ Master user created');
    }

    // 3. Generate master wallet
    console.log('\nGenerating master wallet...');
    const wallet = await simpleWalletManager.generateWallet(MASTER_WALLET_USER_ID);
    
    console.log('\n✓ Master wallet generated successfully!');
    console.log('\n========================================');
    console.log('IMPORTANT: Save these credentials!');
    console.log('========================================');
    console.log(`Address: ${wallet.address}`);
    console.log(`Mnemonic: ${wallet.mnemonic}`);
    console.log(`Private Key: ${wallet.privateKey}`);
    console.log('========================================\n');

    console.log('Next steps:');
    console.log('1. Fund this wallet with PATHUSD for gas fees');
    console.log('2. Grant ISSUER_ROLE to this address on REAGENT token contract');
    console.log('3. Add MASTER_WALLET_USER_ID=master to .env file');
    console.log('\nGrant ISSUER_ROLE command:');
    console.log(`   grantRole(ISSUER_ROLE, "${wallet.address}")`);
    console.log('\nISSUER_ROLE hash:');
    console.log('   0x114e74f6ea3bd819998f78687bfcb11b140da08e9b7d222fa9c1f1ba1f2aa122');

  } catch (error) {
    console.error('\n❌ Error setting up master wallet:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run if called directly
if (require.main === module) {
  setupMasterWallet()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

export { setupMasterWallet };
