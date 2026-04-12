/**
 * File-Based Wallet Manager
 * Stores wallet data in data/wallets.json with per-user isolation
 */

import { ethers } from 'ethers';
import fs from 'fs-extra';
import path from 'path';
import { createCipheriv, createDecipheriv, randomBytes } from 'crypto';

const WALLETS_FILE = path.join(process.cwd(), 'data', 'wallets.json');
const ENCRYPTION_KEY = process.env.WALLET_ENCRYPTION_KEY || 'default-key-change-in-production-32b';
const ENCRYPTION_ALGORITHM = 'aes-256-gcm';

interface WalletData {
  userId: string;
  address: string;
  encryptedPrivateKey: string;
  iv: string;
  authTag: string;
  createdAt: string;
  lastUsed: string;
}

interface WalletsStorage {
  [userId: string]: WalletData;
}

interface TokenBalance {
  eth: string;
  reagent: string;
  pathusd: string;
}

export class FileWalletManager {
  private encryptionKey: Buffer;
  private provider: ethers.JsonRpcProvider;
  private reagentTokenAddress: string;
  private pathusdTokenAddress: string;

  constructor() {
    // Derive encryption key
    this.encryptionKey = Buffer.from(ENCRYPTION_KEY.slice(0, 32).padEnd(32, '0'));
    
    // Initialize provider
    const rpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    
    // Token addresses
    this.reagentTokenAddress = process.env.REAGENT_TOKEN_ADDRESS || '0x20C000000000000000000000a59277C0c1d65Bc5';
    this.pathusdTokenAddress = process.env.PATHUSD_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
    
    // Ensure data directory exists
    this.ensureDataDirectory();
  }

  private async ensureDataDirectory() {
    const dataDir = path.join(process.cwd(), 'data');
    await fs.ensureDir(dataDir);
    
    // Create wallets.json if it doesn't exist
    if (!await fs.pathExists(WALLETS_FILE)) {
      await fs.writeJson(WALLETS_FILE, {}, { spaces: 2 });
    }
  }

  private async readWallets(): Promise<WalletsStorage> {
    try {
      return await fs.readJson(WALLETS_FILE);
    } catch (error) {
      console.error('Error reading wallets file:', error);
      return {};
    }
  }

  private async writeWallets(wallets: WalletsStorage): Promise<void> {
    await fs.writeJson(WALLETS_FILE, wallets, { spaces: 2 });
  }

  /**
   * Encrypt private key
   */
  private encryptPrivateKey(privateKey: string): { encrypted: string; iv: string; authTag: string } {
    const iv = randomBytes(16);
    const cipher = createCipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);

    let encrypted = cipher.update(privateKey, 'utf8', 'hex');
    encrypted += cipher.final('hex');

    const authTag = cipher.getAuthTag();

    return {
      encrypted,
      iv: iv.toString('hex'),
      authTag: authTag.toString('hex')
    };
  }

  /**
   * Decrypt private key
   */
  private decryptPrivateKey(encrypted: string, ivHex: string, authTagHex: string): string {
    const iv = Buffer.from(ivHex, 'hex');
    const authTag = Buffer.from(authTagHex, 'hex');
    const decipher = createDecipheriv(ENCRYPTION_ALGORITHM, this.encryptionKey, iv);
    decipher.setAuthTag(authTag);

    let decrypted = decipher.update(encrypted, 'hex', 'utf8');
    decrypted += decipher.final('utf8');

    return decrypted;
  }

  /**
   * Generate new wallet for user
   */
  async generateWallet(userId: string): Promise<{ address: string; privateKey: string }> {
    const wallets = await this.readWallets();

    // Check if wallet already exists
    if (wallets[userId]) {
      throw new Error('Wallet already exists for this user');
    }

    // Generate new wallet
    const wallet = ethers.Wallet.createRandom();
    const address = wallet.address;
    const privateKey = wallet.privateKey;

    // Encrypt private key
    const { encrypted, iv, authTag } = this.encryptPrivateKey(privateKey);

    // Store wallet data
    wallets[userId] = {
      userId,
      address,
      encryptedPrivateKey: encrypted,
      iv,
      authTag,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    await this.writeWallets(wallets);

    return { address, privateKey };
  }

  /**
   * Import existing wallet
   */
  async importWallet(userId: string, privateKey: string): Promise<{ address: string }> {
    const wallets = await this.readWallets();

    // Check if wallet already exists
    if (wallets[userId]) {
      throw new Error('Wallet already exists for this user');
    }

    // Validate and get address
    const wallet = new ethers.Wallet(privateKey);
    const address = wallet.address;

    // Encrypt private key
    const { encrypted, iv, authTag } = this.encryptPrivateKey(privateKey);

    // Store wallet data
    wallets[userId] = {
      userId,
      address,
      encryptedPrivateKey: encrypted,
      iv,
      authTag,
      createdAt: new Date().toISOString(),
      lastUsed: new Date().toISOString()
    };

    await this.writeWallets(wallets);

    return { address };
  }

  /**
   * Get wallet for user
   */
  async getWallet(userId: string): Promise<WalletData | null> {
    const wallets = await this.readWallets();
    return wallets[userId] || null;
  }

  /**
   * Get private key (decrypted)
   */
  async getPrivateKey(userId: string): Promise<string> {
    const wallets = await this.readWallets();
    const walletData = wallets[userId];

    if (!walletData) {
      throw new Error('Wallet not found');
    }

    return this.decryptPrivateKey(
      walletData.encryptedPrivateKey,
      walletData.iv,
      walletData.authTag
    );
  }

  /**
   * Get real-time balance from blockchain
   */
  async getBalance(userId: string): Promise<TokenBalance> {
    const walletData = await this.getWallet(userId);
    if (!walletData) {
      throw new Error('Wallet not found');
    }

    const address = walletData.address;

    // Get ETH balance
    const ethBalance = await this.provider.getBalance(address);
    const ethFormatted = ethers.formatEther(ethBalance);

    // Get REAGENT balance (TIP-20 token)
    let reagentBalance = '0';
    try {
      const reagentContract = new ethers.Contract(
        this.reagentTokenAddress,
        ['function balanceOf(address) view returns (uint256)'],
        this.provider
      );
      const balance = await reagentContract.balanceOf(address);
      reagentBalance = ethers.formatUnits(balance, 6); // 6 decimals
    } catch (error) {
      console.error('Error getting REAGENT balance:', error);
    }

    // Get PATHUSD balance (if address is set)
    let pathusdBalance = '0';
    if (this.pathusdTokenAddress !== '0x0000000000000000000000000000000000000000') {
      try {
        const pathusdContract = new ethers.Contract(
          this.pathusdTokenAddress,
          ['function balanceOf(address) view returns (uint256)'],
          this.provider
        );
        const balance = await pathusdContract.balanceOf(address);
        pathusdBalance = ethers.formatUnits(balance, 6); // 6 decimals
      } catch (error) {
        console.error('Error getting PATHUSD balance:', error);
      }
    }

    // Update last used
    const wallets = await this.readWallets();
    wallets[userId].lastUsed = new Date().toISOString();
    await this.writeWallets(wallets);

    return {
      eth: ethFormatted,
      reagent: reagentBalance,
      pathusd: pathusdBalance
    };
  }

  /**
   * Send ETH
   */
  async sendEth(userId: string, toAddress: string, amount: string): Promise<{ txHash: string; explorerUrl: string }> {
    const privateKey = await this.getPrivateKey(userId);
    const wallet = new ethers.Wallet(privateKey, this.provider);

    // Validate address
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Send transaction
    const tx = await wallet.sendTransaction({
      to: toAddress,
      value: ethers.parseEther(amount)
    });

    await tx.wait();

    return {
      txHash: tx.hash,
      explorerUrl: `https://explore.tempo.xyz/tx/${tx.hash}`
    };
  }

  /**
   * Send REAGENT tokens
   */
  async sendReagent(userId: string, toAddress: string, amount: string): Promise<{ txHash: string; explorerUrl: string }> {
    const privateKey = await this.getPrivateKey(userId);
    const wallet = new ethers.Wallet(privateKey, this.provider);

    // Validate address
    if (!ethers.isAddress(toAddress)) {
      throw new Error('Invalid recipient address');
    }

    // Create contract instance
    const reagentContract = new ethers.Contract(
      this.reagentTokenAddress,
      ['function transfer(address to, uint256 amount) returns (bool)'],
      wallet
    );

    // Send transaction
    const amountWei = ethers.parseUnits(amount, 6); // 6 decimals
    const tx = await reagentContract.transfer(toAddress, amountWei);
    await tx.wait();

    return {
      txHash: tx.hash,
      explorerUrl: `https://explore.tempo.xyz/tx/${tx.hash}`
    };
  }

  /**
   * Get transaction history
   */
  async getTransactionHistory(userId: string, limit: number = 10): Promise<any[]> {
    const walletData = await this.getWallet(userId);
    if (!walletData) {
      throw new Error('Wallet not found');
    }

    // Note: This is a placeholder. In production, you'd query the blockchain explorer API
    // or maintain a transaction log in the database
    return [];
  }

  /**
   * Delete wallet (careful!)
   */
  async deleteWallet(userId: string): Promise<void> {
    const wallets = await this.readWallets();
    delete wallets[userId];
    await this.writeWallets(wallets);
  }
}

// Export singleton
export const fileWalletManager = new FileWalletManager();
