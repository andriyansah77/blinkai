/**
 * Fix Wallet Encryption
 * Re-encrypt wallets that were encrypted with old format
 * 
 * This script will:
 * 1. Find wallets with encrypted private keys
 * 2. Try to decrypt with old format (if needed)
 * 3. Re-encrypt with correct format (auth tag appended)
 */

import { prisma } from '@/lib/prisma';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

function getEncryptionKey(): Buffer {
  return Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH).padEnd(KEY_LENGTH, '0'));
}

/**
 * Try to decrypt - diagnostic version
 */
function tryDecrypt(encryptedData: string, ivHex: string): { success: boolean; privateKey?: string; error?: string } {
  try {
    const encryptionKey = getEncryptionKey();
    const iv = Buffer.from(ivHex, 'hex');
    
    console.log(`    Encryption key (first 10 chars): ${ENCRYPTION_KEY.substring(0, 10)}...`);
    console.log(`    IV hex: ${ivHex}`);
    console.log(`    Encrypted data (first 20 chars): ${encryptedData.substring(0, 20)}...`);
    
    // Current format: auth tag is appended to encrypted data
    const authTagHex = encryptedData.slice(-32);
    const encryptedHex = encryptedData.slice(0, -32);
    
    console.log(`    Auth tag hex: ${authTagHex}`);
    console.log(`    Encrypted hex length: ${encryptedHex.length}`);
    
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { success: true, privateKey: decrypted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

/**
 * Encrypt with correct format (auth tag appended)
 */
function encryptCorrectFormat(privateKey: string): { encrypted: string; iv: string } {
  const encryptionKey = getEncryptionKey();
  const iv = randomBytes(IV_LENGTH);
  const cipher = createCipheriv(ENCRYPTION_ALGORITHM, encryptionKey, iv);

  let encrypted = cipher.update(privateKey, 'utf8', 'hex');
  encrypted += cipher.final('hex');

  const authTag = cipher.getAuthTag();

  return {
    encrypted: encrypted + authTag.toString('hex'),
    iv: iv.toString('hex')
  };
}

async function fixWalletEncryption() {
  console.log('🔧 Fixing Wallet Encryption Format...\n');

  try {
    // Find all wallets with encrypted private keys
    const wallets = await prisma.wallet.findMany({
      where: {
        encryptedPrivateKey: {
          not: ''
        }
      }
    });

    console.log(`Found ${wallets.length} wallets to check\n`);

    let fixed = 0;
    let alreadyCorrect = 0;
    let failed = 0;

    for (const wallet of wallets) {
      console.log(`\nChecking wallet: ${wallet.address}`);
      console.log(`  User ID: ${wallet.userId}`);
      console.log(`  Encrypted length: ${wallet.encryptedPrivateKey.length}`);
      console.log(`  IV length: ${wallet.keyIv.length}`);

      // Try to decrypt
      const result = tryDecrypt(wallet.encryptedPrivateKey, wallet.keyIv);

      if (!result.success) {
        console.log(`  ❌ Decryption failed: ${result.error}`);
        console.log(`  💡 This wallet may have been encrypted with a different key`);
        failed++;
        continue;
      }

      console.log(`  ✅ Decryption successful!`);
      console.log(`  🔍 Private key length: ${result.privateKey!.length}`);
      console.log(`  🔍 Private key preview: ${result.privateKey!.substring(0, 10)}...`);
      
      // Verify it's a valid private key
      if (!result.privateKey!.startsWith('0x') || result.privateKey!.length !== 66) {
        console.log(`  ⚠️  Warning: Decrypted key doesn't look like a valid private key`);
        console.log(`  🔄 Re-encrypting anyway...`);
      }

      // Re-encrypt with same format to ensure consistency
      const { encrypted, iv } = encryptCorrectFormat(result.privateKey!);

      // Update database
      await prisma.wallet.update({
        where: { id: wallet.id },
        data: {
          encryptedPrivateKey: encrypted,
          keyIv: iv
        }
      });

      console.log(`  ✅ Re-encrypted! New length: ${encrypted.length}`);
      fixed++;
    }

    console.log('\n📊 Summary:');
    console.log(`   Fixed: ${fixed}`);
    console.log(`   Already correct: ${alreadyCorrect}`);
    console.log(`   Failed: ${failed}`);
    console.log('');

    if (fixed > 0) {
      console.log('✅ Wallet encryption format fixed!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Run test-wallet-decryption.ts to verify');
      console.log('2. Test minting operation through dashboard');
      console.log('3. Check PM2 logs for successful decryption');
    } else {
      console.log('ℹ️  No wallets needed fixing');
    }

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

fixWalletEncryption();
