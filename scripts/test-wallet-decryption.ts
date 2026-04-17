/**
 * Test Wallet Decryption
 * Verify that wallet decryption works correctly
 */

import { prisma } from '@/lib/prisma';
import { walletManager } from '@/lib/mining/wallet-manager';

async function testWalletDecryption() {
  console.log('🔐 Testing Wallet Decryption...\n');

  try {
    // Find a wallet with encrypted private key
    const wallet = await prisma.wallet.findFirst({
      where: {
        encryptedPrivateKey: {
          not: ''
        }
      },
      include: {
        user: true
      }
    });

    if (!wallet) {
      console.log('❌ No wallets found with encrypted private keys');
      console.log('💡 Create a wallet first through the dashboard');
      return;
    }

    console.log('✅ Found wallet to test:');
    console.log(`   User ID: ${wallet.userId}`);
    console.log(`   Address: ${wallet.address}`);
    console.log(`   Encrypted Key Length: ${wallet.encryptedPrivateKey.length}`);
    console.log(`   IV Length: ${wallet.keyIv.length}`);
    console.log('');

    // Test decryption
    console.log('🔓 Attempting to decrypt private key...');
    try {
      const privateKey = await walletManager.exportPrivateKey(wallet.userId);
      
      console.log('✅ Decryption successful!');
      console.log(`   Private Key Length: ${privateKey.length}`);
      console.log(`   Private Key Preview: ${privateKey.substring(0, 10)}...`);
      console.log('');

      // Validate the decrypted key
      console.log('🔍 Validating decrypted private key...');
      const isValid = walletManager.validatePrivateKey(privateKey);
      
      if (isValid) {
        console.log('✅ Private key is valid!');
        console.log('');
        console.log('🎉 Wallet decryption test PASSED!');
        console.log('');
        console.log('Next steps:');
        console.log('1. Test minting operation through dashboard');
        console.log('2. Check PM2 logs for decryption messages');
        console.log('3. Verify transaction on Tempo Explorer');
      } else {
        console.log('❌ Private key is invalid after decryption');
        console.log('💡 Check WALLET_ENCRYPTION_KEY in .env');
      }
    } catch (decryptError: any) {
      console.log('❌ Decryption failed!');
      console.log(`   Error: ${decryptError.message}`);
      console.log('');
      console.log('Possible causes:');
      console.log('1. WALLET_ENCRYPTION_KEY mismatch');
      console.log('2. Corrupted encrypted data');
      console.log('3. Auth tag extraction issue');
      console.log('');
      console.log('Debug info:');
      console.log(`   Encrypted data length: ${wallet.encryptedPrivateKey.length}`);
      console.log(`   Expected auth tag at: ${wallet.encryptedPrivateKey.length - 32}`);
      console.log(`   IV length: ${wallet.keyIv.length}`);
    }

  } catch (error: any) {
    console.error('❌ Test failed:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testWalletDecryption();
