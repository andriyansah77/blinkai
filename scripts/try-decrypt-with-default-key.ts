/**
 * Try Decrypt with Default Key
 * Test if wallets were encrypted with the default key
 */

import { prisma } from '@/lib/prisma';
import { createDecipheriv } from 'crypto';

const DEFAULT_KEY = 'default-key-change-in-production-32b';
const CURRENT_KEY = process.env.WALLET_ENCRYPTION_KEY || DEFAULT_KEY;
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const KEY_LENGTH = 32;

function getKey(keyString: string): Buffer {
  return Buffer.from(keyString.slice(0, KEY_LENGTH).padEnd(KEY_LENGTH, '0'));
}

function tryDecrypt(encryptedData: string, ivHex: string, keyString: string): { success: boolean; privateKey?: string; error?: string } {
  try {
    const key = getKey(keyString);
    const iv = Buffer.from(ivHex, 'hex');
    
    const authTagHex = encryptedData.slice(-32);
    const encryptedHex = encryptedData.slice(0, -32);
    
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, key, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return { success: true, privateKey: decrypted };
  } catch (error: any) {
    return { success: false, error: error.message };
  }
}

async function testDecryption() {
  console.log('🔍 Testing Wallet Decryption with Different Keys...\n');

  try {
    const wallet = await prisma.wallet.findFirst({
      where: {
        encryptedPrivateKey: {
          not: ''
        }
      }
    });

    if (!wallet) {
      console.log('❌ No wallets found');
      return;
    }

    console.log(`Testing wallet: ${wallet.address}`);
    console.log(`User ID: ${wallet.userId}\n`);

    // Try with current key
    console.log('1️⃣  Trying with CURRENT key from .env...');
    console.log(`   Key: ${CURRENT_KEY.substring(0, 10)}...`);
    let result = tryDecrypt(wallet.encryptedPrivateKey, wallet.keyIv, CURRENT_KEY);
    if (result.success) {
      console.log(`   ✅ SUCCESS! Private key: ${result.privateKey!.substring(0, 10)}...\n`);
      return;
    }
    console.log(`   ❌ Failed: ${result.error}\n`);

    // Try with default key
    console.log('2️⃣  Trying with DEFAULT key...');
    console.log(`   Key: ${DEFAULT_KEY.substring(0, 10)}...`);
    result = tryDecrypt(wallet.encryptedPrivateKey, wallet.keyIv, DEFAULT_KEY);
    if (result.success) {
      console.log(`   ✅ SUCCESS! Private key: ${result.privateKey!.substring(0, 10)}...\n`);
      console.log('💡 Wallets were encrypted with DEFAULT key!');
      console.log('   You need to either:');
      console.log('   1. Change WALLET_ENCRYPTION_KEY back to default');
      console.log('   2. Re-create all wallets with new key');
      return;
    }
    console.log(`   ❌ Failed: ${result.error}\n`);

    // Try with empty key
    console.log('3️⃣  Trying with EMPTY key...');
    result = tryDecrypt(wallet.encryptedPrivateKey, wallet.keyIv, '');
    if (result.success) {
      console.log(`   ✅ SUCCESS! Private key: ${result.privateKey!.substring(0, 10)}...\n`);
      return;
    }
    console.log(`   ❌ Failed: ${result.error}\n`);

    console.log('❌ Could not decrypt with any known key');
    console.log('\n💡 Possible solutions:');
    console.log('1. Check if WALLET_ENCRYPTION_KEY was different when wallets were created');
    console.log('2. Look for backup .env files');
    console.log('3. Re-create wallets (users will need to import again)');

  } catch (error: any) {
    console.error('❌ Error:', error.message);
  } finally {
    await prisma.$disconnect();
  }
}

testDecryption();
