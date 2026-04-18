/**
 * Simple Wallet Manager - Server-Side Only
 * All wallets are managed server-side with encrypted private keys
 * No browser wallet integration needed
 */

import { ethers } from 'ethers';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';
import { prisma } from '@/lib/prisma';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;

export interface SimpleWallet {
  id: string;
  userId: string;
  address: string;
  reagentBalance: string;
  pathusdBalance: string;
  createdAt: Date;
}

export class SimpleWalletManager {
  private encryptionKey: Buffer;

  constructor() {
    // Derive encryption key
    this.encryptionKey = Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH).padEnd(KEY_LENGTH, '0'));
  }

  /**
   * Generate new wallet for user
   * Always stores encrypted private key for server-side signing
   */
  async generateWallet(userId: string): Promise<SimpleWallet & { mnemonic: string; privateKey: string }> {
    console.log(`[SimpleWallet] Generating wallet for user ${userId}`);
    
    // Check if wallet already exists
    const existing = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existing) {
      throw new Error('Wallet already exists for this user');
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;
    const mnemonic = wallet.mnemonic?.phrase || '';

    // Encrypt private key
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');
    const authTag = cipher.getAuthTag();

    // Store encrypted key with auth tag
    const encryptedWithTag = encrypted + authTag.toString('hex');

    // Save to database
    const dbWallet = await prisma.wallet.create({
      data: {
        userId,
        address,
        encryptedPrivateKey: encryptedWithTag,
        keyIv: iv.toString('hex'),
        network: 'tempo',
        imported: false,
        reagentBalance: '0',
        pathusdBalance: '0'
      }
    });

    console.log(`[SimpleWallet] Wallet created: ${address}`);
    console.log(`[SimpleWallet] Encrypted key length: ${encryptedWithTag.length}`);
    console.log(`[SimpleWallet] IV length: ${iv.toString('hex').length}`);

    return {
      id: dbWallet.id,
      userId: dbWallet.userId,
      address: dbWallet.address,
      reagentBalance: dbWallet.reagentBalance,
      pathusdBalance: dbWallet.pathusdBalance,
      createdAt: dbWallet.createdAt,
      mnemonic,
      privateKey
    };
  }

  /**
   * Get wallet for user
   */
  async getWallet(userId: string): Promise<SimpleWallet | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return null;
    }

    return {
      id: wallet.id,
      userId: wallet.userId,
      address: wallet.address,
      reagentBalance: wallet.reagentBalance,
      pathusdBalance: wallet.pathusdBalance,
      createdAt: wallet.createdAt
    };
  }

  /**
   * Decrypt private key for signing
   */
  async getPrivateKey(userId: string): Promise<string> {
    console.log(`[SimpleWallet] Getting private key for user ${userId}`);
    
    const wallet = await prisma.wallet.findUnique({
      where: { userId },
      select: {
        encryptedPrivateKey: true,
        keyIv: true
      }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    if (!wallet.encryptedPrivateKey || !wallet.keyIv) {
      throw new Error('Wallet does not have encrypted private key');
    }

    try {
      const iv = Buffer.from(wallet.keyIv, 'hex');
      
      // Auth tag is the last 32 hex characters (16 bytes)
      const authTagHex = wallet.encryptedPrivateKey.slice(-32);
      const encryptedHex = wallet.encryptedPrivateKey.slice(0, -32);
      
      const authTag = Buffer.from(authTagHex, 'hex');

      const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encryptedHex, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      console.log(`[SimpleWallet] Private key decrypted successfully`);
      return decrypted;
    } catch (error: any) {
      console.error('[SimpleWallet] Decryption failed:', error.message);
      throw new Error(`Failed to decrypt private key: ${error.message}`);
    }
  }

  /**
   * Sign transaction with user's private key
   */
  async signTransaction(userId: string, transaction: ethers.TransactionRequest): Promise<string> {
    console.log(`[SimpleWallet] Signing transaction for user ${userId}`);
    
    const privateKey = await this.getPrivateKey(userId);
    
    // Create wallet instance
    const provider = new ethers.JsonRpcProvider(
      process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
    );
    const wallet = new ethers.Wallet(privateKey, provider);
    
    // Sign transaction
    const signedTx = await wallet.signTransaction(transaction);
    
    console.log(`[SimpleWallet] Transaction signed successfully`);
    return signedTx;
  }

  /**
   * Broadcast signed transaction
   */
  async broadcastTransaction(signedTx: string): Promise<string> {
    console.log(`[SimpleWallet] Broadcasting transaction`);
    
    const provider = new ethers.JsonRpcProvider(
      process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
    );
    
    const txResponse = await provider.broadcastTransaction(signedTx);
    
    console.log(`[SimpleWallet] Transaction broadcast: ${txResponse.hash}`);
    return txResponse.hash;
  }
}

// Export singleton
export const simpleWalletManager = new SimpleWalletManager();
