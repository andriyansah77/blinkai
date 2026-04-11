/**
 * Wallet Manager Service
 * Manages blockchain wallets for Tempo Network
 * 
 * Features:
 * - Auto-generate HD wallets
 * - Encrypt/decrypt private keys (AES-256)
 * - Import/export wallet functionality
 * - Query wallet balances
 */

import { ethers } from 'ethers';
import { createCipheriv, createDecipheriv, randomBytes, pbkdf2Sync } from 'crypto';
import { prisma } from '@/lib/prisma';

// Encryption configuration
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
const KEY_LENGTH = 32;
const IV_LENGTH = 16;
const AUTH_TAG_LENGTH = 16;

export interface WalletInfo {
  id: string;
  userId: string;
  address: string;
  reagentBalance: string;
  pathusdBalance: string;
  lastBalanceUpdate: Date;
  network: string;
  imported: boolean;
  createdAt: Date;
}

export interface TokenBalance {
  reagent: string;
  pathusd: string;
}

export class WalletManager {
  private encryptionKey: Buffer;

  constructor() {
    // Derive encryption key from environment variable
    this.encryptionKey = Buffer.from(ENCRYPTION_KEY.slice(0, KEY_LENGTH).padEnd(KEY_LENGTH, '0'));
  }

  /**
   * Generate a new HD wallet for a user
   * @param userId - User ID
   * @returns Wallet information
   */
  async generateWallet(userId: string): Promise<WalletInfo> {
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

    // Encrypt private key
    const { encrypted, iv, authTag } = this.encryptPrivateKey(privateKey);

    // Store in database
    const dbWallet = await prisma.wallet.create({
      data: {
        userId,
        address,
        encryptedPrivateKey: encrypted,
        keyIv: iv,
        network: 'tempo',
        imported: false,
        reagentBalance: '0',
        pathusdBalance: '0'
      }
    });

    return this.toWalletInfo(dbWallet);
  }

  /**
   * Import an existing wallet
   * @param userId - User ID
   * @param privateKey - Private key to import
   * @returns Wallet information
   */
  async importWallet(userId: string, privateKey: string): Promise<WalletInfo> {
    // Check if wallet already exists
    const existing = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (existing) {
      throw new Error('Wallet already exists for this user');
    }

    // Validate private key
    if (!this.validatePrivateKey(privateKey)) {
      throw new Error('Invalid private key format');
    }

    // Create wallet from private key
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    // Encrypt private key
    const { encrypted, iv, authTag } = this.encryptPrivateKey(privateKey);

    // Store in database
    const dbWallet = await prisma.wallet.create({
      data: {
        userId,
        address,
        encryptedPrivateKey: encrypted,
        keyIv: iv,
        network: 'tempo',
        imported: true,
        reagentBalance: '0',
        pathusdBalance: '0'
      }
    });

    return this.toWalletInfo(dbWallet);
  }

  /**
   * Get wallet for a user
   * @param userId - User ID
   * @returns Wallet information or null
   */
  async getWallet(userId: string): Promise<WalletInfo | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      return null;
    }

    return this.toWalletInfo(wallet);
  }

  /**
   * Get wallet by address
   * @param address - Wallet address
   * @returns Wallet information or null
   */
  async getWalletByAddress(address: string): Promise<WalletInfo | null> {
    const wallet = await prisma.wallet.findUnique({
      where: { address }
    });

    if (!wallet) {
      return null;
    }

    return this.toWalletInfo(wallet);
  }

  /**
   * Export private key (requires password re-authentication)
   * @param userId - User ID
   * @returns Decrypted private key
   */
  async exportPrivateKey(userId: string): Promise<string> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // Decrypt private key
    const privateKey = this.decryptPrivateKey(
      wallet.encryptedPrivateKey,
      wallet.keyIv
    );

    return privateKey;
  }

  /**
   * Encrypt private key using AES-256-GCM
   * @param privateKey - Private key to encrypt
   * @returns Encrypted data with IV and auth tag
   */
  encryptPrivateKey(privateKey: string): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(IV_LENGTH);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted: encrypted + authTag.toString('hex'),
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt private key using AES-256-GCM
   * @param encryptedData - Encrypted private key (includes auth tag)
   * @param ivHex - Initialization vector
   * @returns Decrypted private key
   */
  decryptPrivateKey(encryptedData: string, ivHex: string): string {
    try {
      const iv = Buffer.from(ivHex, 'hex');
      
      // Extract auth tag from end of encrypted data
      const authTag = Buffer.from(encryptedData.slice(-AUTH_TAG_LENGTH * 2), 'hex');
      const encrypted = encryptedData.slice(0, -AUTH_TAG_LENGTH * 2);

      const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
      decipher.setAuthTag(authTag);

      let decrypted = decipher.update(encrypted, 'hex', 'utf8');
      decrypted += decipher.final('utf8');

      return decrypted;
    } catch (error) {
      throw new Error('Failed to decrypt private key');
    }
  }

  /**
   * Validate private key format
   * @param privateKey - Private key to validate
   * @returns True if valid
   */
  validatePrivateKey(privateKey: string): boolean {
    try {
      // Try to create a wallet from the private key
      new ethers.Wallet(privateKey);
      return true;
    } catch {
      return false;
    }
  }

  /**
   * Validate Tempo network address
   * @param address - Address to validate
   * @returns True if valid
   */
  validateAddress(address: string): boolean {
    return ethers.isAddress(address);
  }

  /**
   * Get token balances from blockchain
   * Note: This is a placeholder. Actual implementation requires Tempo Network RPC
   * @param userId - User ID
   * @returns Token balances
   */
  async getTokenBalance(userId: string): Promise<TokenBalance> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // TODO: Implement actual blockchain query to Tempo Network
    // For now, return cached balances from database
    return {
      reagent: wallet.reagentBalance,
      pathusd: wallet.pathusdBalance
    };
  }

  /**
   * Sync balances from blockchain
   * @param userId - User ID
   * @returns Updated token balances
   */
  async syncBalances(userId: string): Promise<TokenBalance> {
    const wallet = await prisma.wallet.findUnique({
      where: { userId }
    });

    if (!wallet) {
      throw new Error('Wallet not found');
    }

    // TODO: Implement actual blockchain query to Tempo Network
    // For now, return current balances
    const balances: TokenBalance = {
      reagent: wallet.reagentBalance,
      pathusd: wallet.pathusdBalance
    };

    // Update last sync time
    await prisma.wallet.update({
      where: { userId },
      data: {
        lastBalanceUpdate: new Date()
      }
    });

    return balances;
  }

  /**
   * Convert database wallet to WalletInfo
   * @param dbWallet - Database wallet record
   * @returns Wallet information
   */
  private toWalletInfo(dbWallet: any): WalletInfo {
    return {
      id: dbWallet.id,
      userId: dbWallet.userId,
      address: dbWallet.address,
      reagentBalance: dbWallet.reagentBalance,
      pathusdBalance: dbWallet.pathusdBalance,
      lastBalanceUpdate: dbWallet.lastBalanceUpdate,
      network: dbWallet.network,
      imported: dbWallet.imported,
      createdAt: dbWallet.createdAt
    };
  }
}

// Export singleton instance
export const walletManager = new WalletManager();
