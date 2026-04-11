/**
 * USD Balance Manager Service
 * Manages user USD balances for inscription fees and gas costs
 * 
 * Features:
 * - Track USD deposits and withdrawals
 * - Validate balance sufficiency
 * - Process inscription fee deductions
 * - Handle gas fee settlements
 * - Transaction history tracking
 */

import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

export interface BalanceInfo {
  userId: string;
  balance: string;
  lockedBalance: string;
  availableBalance: string;
}

export interface TransactionInfo {
  id: string;
  type: string;
  amount: string;
  balanceBefore: string;
  balanceAfter: string;
  description: string | null;
  referenceType: string | null;
  referenceId: string | null;
  createdAt: Date;
}

export interface DepositResult {
  success: boolean;
  newBalance: string;
  transactionId: string;
}

export interface DeductResult {
  success: boolean;
  newBalance: string;
  transactionId: string;
}

export class UsdBalanceManager {
  /**
   * Initialize balance for a new user
   * @param userId - User ID
   * @param walletId - Wallet ID
   * @returns Balance information
   */
  async initializeBalance(userId: string, walletId: string): Promise<BalanceInfo> {
    // Create balance record
    const balance = await prisma.usdBalance.create({
      data: {
        userId,
        walletId,
        balance: '0',
        lockedBalance: '0'
      }
    });

    return {
      userId: balance.userId,
      balance: balance.balance,
      lockedBalance: balance.lockedBalance,
      availableBalance: '0'
    };
  }

  /**
   * Get user's USD balance
   * @param userId - User ID
   * @returns Balance information
   */
  async getBalance(userId: string): Promise<BalanceInfo> {
    // Get or create balance record
    const balance = await this.getOrCreateBalance(userId);

    const balanceDecimal = new Decimal(balance.balance);
    const lockedDecimal = new Decimal(balance.lockedBalance);
    const availableDecimal = balanceDecimal.minus(lockedDecimal);

    return {
      userId: balance.userId,
      balance: balance.balance,
      lockedBalance: balance.lockedBalance,
      availableBalance: availableDecimal.toString()
    };
  }

  /**
   * Deposit funds to user's balance
   * @param userId - User ID
   * @param amount - Amount to deposit (as string or number)
   * @param description - Description of deposit
   * @param adminId - Admin ID for manual deposits
   * @returns Deposit result
   */
  async deposit(
    userId: string,
    amount: string | number,
    description?: string,
    adminId?: string
  ): Promise<DepositResult> {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new Error('Deposit amount must be positive');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get or create balance
      const balance = await this.getOrCreateBalance(userId, tx);
      
      const currentBalance = new Decimal(balance.balance);
      const newBalance = currentBalance.plus(amountDecimal);

      // Update balance
      const updatedBalance = await tx.usdBalance.update({
        where: { id: balance.id },
        data: {
          balance: newBalance.toString()
        }
      });

      // Create transaction record
      const transaction = await tx.usdTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'deposit',
          amount: amountDecimal.toString(),
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description: description || 'Manual deposit',
          referenceType: 'manual',
          adminId
        }
      });

      return {
        success: true,
        newBalance: updatedBalance.balance,
        transactionId: transaction.id
      };
    });

    return result;
  }

  /**
   * Deduct funds from user's balance
   * @param userId - User ID
   * @param amount - Amount to deduct
   * @param type - Transaction type
   * @param description - Description of deduction
   * @param referenceType - Type of reference (inscription, trade, etc.)
   * @param referenceId - ID of related entity
   * @returns Deduct result
   */
  async deduct(
    userId: string,
    amount: string | number,
    type: 'inscription_fee' | 'gas_fee' | 'trade' | 'withdrawal',
    description?: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<DeductResult> {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new Error('Deduct amount must be positive');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get balance
      const balance = await tx.usdBalance.findUnique({
        where: { userId }
      });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const currentBalance = new Decimal(balance.balance);
      const lockedBalance = new Decimal(balance.lockedBalance);
      const availableBalance = currentBalance.minus(lockedBalance);

      // Check sufficient balance
      if (availableBalance.lt(amountDecimal)) {
        throw new Error('Insufficient balance');
      }

      const newBalance = currentBalance.minus(amountDecimal);

      // Update balance
      const updatedBalance = await tx.usdBalance.update({
        where: { id: balance.id },
        data: {
          balance: newBalance.toString()
        }
      });

      // Create transaction record
      const transaction = await tx.usdTransaction.create({
        data: {
          balanceId: balance.id,
          type,
          amount: `-${amountDecimal.toString()}`,
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description: description || `${type} deduction`,
          referenceType,
          referenceId
        }
      });

      return {
        success: true,
        newBalance: updatedBalance.balance,
        transactionId: transaction.id
      };
    });

    return result;
  }

  /**
   * Refund funds to user's balance
   * @param userId - User ID
   * @param amount - Amount to refund
   * @param description - Description of refund
   * @param referenceType - Type of reference
   * @param referenceId - ID of related entity
   * @returns Deposit result
   */
  async refund(
    userId: string,
    amount: string | number,
    description?: string,
    referenceType?: string,
    referenceId?: string
  ): Promise<DepositResult> {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new Error('Refund amount must be positive');
    }

    // Use transaction to ensure atomicity
    const result = await prisma.$transaction(async (tx) => {
      // Get balance
      const balance = await tx.usdBalance.findUnique({
        where: { userId }
      });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const currentBalance = new Decimal(balance.balance);
      const newBalance = currentBalance.plus(amountDecimal);

      // Update balance
      const updatedBalance = await tx.usdBalance.update({
        where: { id: balance.id },
        data: {
          balance: newBalance.toString()
        }
      });

      // Create transaction record
      const transaction = await tx.usdTransaction.create({
        data: {
          balanceId: balance.id,
          type: 'refund',
          amount: amountDecimal.toString(),
          balanceBefore: currentBalance.toString(),
          balanceAfter: newBalance.toString(),
          description: description || 'Refund',
          referenceType,
          referenceId
        }
      });

      return {
        success: true,
        newBalance: updatedBalance.balance,
        transactionId: transaction.id
      };
    });

    return result;
  }

  /**
   * Lock funds for escrow (e.g., trade orders)
   * @param userId - User ID
   * @param amount - Amount to lock
   * @returns Success status
   */
  async lockBalance(userId: string, amount: string | number): Promise<boolean> {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new Error('Lock amount must be positive');
    }

    await prisma.$transaction(async (tx) => {
      const balance = await tx.usdBalance.findUnique({
        where: { userId }
      });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const currentBalance = new Decimal(balance.balance);
      const currentLocked = new Decimal(balance.lockedBalance);
      const availableBalance = currentBalance.minus(currentLocked);

      if (availableBalance.lt(amountDecimal)) {
        throw new Error('Insufficient available balance to lock');
      }

      const newLocked = currentLocked.plus(amountDecimal);

      await tx.usdBalance.update({
        where: { id: balance.id },
        data: {
          lockedBalance: newLocked.toString()
        }
      });
    });

    return true;
  }

  /**
   * Unlock funds from escrow
   * @param userId - User ID
   * @param amount - Amount to unlock
   * @returns Success status
   */
  async unlockBalance(userId: string, amount: string | number): Promise<boolean> {
    const amountDecimal = new Decimal(amount);

    if (amountDecimal.lte(0)) {
      throw new Error('Unlock amount must be positive');
    }

    await prisma.$transaction(async (tx) => {
      const balance = await tx.usdBalance.findUnique({
        where: { userId }
      });

      if (!balance) {
        throw new Error('Balance not found');
      }

      const currentLocked = new Decimal(balance.lockedBalance);

      if (currentLocked.lt(amountDecimal)) {
        throw new Error('Insufficient locked balance to unlock');
      }

      const newLocked = currentLocked.minus(amountDecimal);

      await tx.usdBalance.update({
        where: { id: balance.id },
        data: {
          lockedBalance: newLocked.toString()
        }
      });
    });

    return true;
  }

  /**
   * Check if user has sufficient balance
   * @param userId - User ID
   * @param amount - Amount to check
   * @returns True if sufficient balance
   */
  async hasSufficientBalance(userId: string, amount: string | number): Promise<boolean> {
    const amountDecimal = new Decimal(amount);
    const balance = await this.getBalance(userId);
    const availableDecimal = new Decimal(balance.availableBalance);

    return availableDecimal.gte(amountDecimal);
  }

  /**
   * Get transaction history
   * @param userId - User ID
   * @param limit - Maximum number of transactions to return
   * @param offset - Number of transactions to skip
   * @returns Array of transactions
   */
  async getTransactions(
    userId: string,
    limit: number = 50,
    offset: number = 0
  ): Promise<TransactionInfo[]> {
    // Get balance first
    const balance = await prisma.usdBalance.findUnique({
      where: { userId }
    });

    if (!balance) {
      return [];
    }

    // Get transactions
    const transactions = await prisma.usdTransaction.findMany({
      where: { balanceId: balance.id },
      orderBy: { createdAt: 'desc' },
      take: limit,
      skip: offset
    });

    return transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      amount: tx.amount,
      balanceBefore: tx.balanceBefore,
      balanceAfter: tx.balanceAfter,
      description: tx.description,
      referenceType: tx.referenceType,
      referenceId: tx.referenceId,
      createdAt: tx.createdAt
    }));
  }

  /**
   * Get or create balance record for user
   * @param userId - User ID
   * @param tx - Optional Prisma transaction client
   * @returns Balance record
   */
  private async getOrCreateBalance(userId: string, tx?: any): Promise<any> {
    const client = tx || prisma;

    // Check if balance exists
    let balance = await client.usdBalance.findUnique({
      where: { userId }
    });

    if (!balance) {
      // Get user's wallet
      const wallet = await client.wallet.findUnique({
        where: { userId }
      });

      if (!wallet) {
        throw new Error('Wallet not found. User must have a wallet before creating balance.');
      }

      // Create balance
      balance = await client.usdBalance.create({
        data: {
          userId,
          walletId: wallet.id,
          balance: '0',
          lockedBalance: '0'
        }
      });
    }

    return balance;
  }

  /**
   * Get total transaction count for user
   * @param userId - User ID
   * @returns Total count
   */
  async getTransactionCount(userId: string): Promise<number> {
    const balance = await prisma.usdBalance.findUnique({
      where: { userId }
    });

    if (!balance) {
      return 0;
    }

    return await prisma.usdTransaction.count({
      where: { balanceId: balance.id }
    });
  }
}

// Export singleton instance
export const usdBalanceManager = new UsdBalanceManager();
