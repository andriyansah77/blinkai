/**
 * ReAgent Minting Skill - TypeScript Integration
 * 
 * This module provides TypeScript integration for the Minting Skill,
 * enabling AI agents to mint REAGENT tokens on behalf of users.
 */

import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

export interface MintingSkillConfig {
  userId: string;
  apiBaseUrl?: string;
}

export interface BalanceInfo {
  success: boolean;
  address?: string;
  reagentBalance?: number;
  usdBalance?: number;
  error?: string;
}

export interface CostEstimate {
  success: boolean;
  feeUsd?: number;
  gasEstimate?: number;
  totalCostUsd?: number;
  tokensToEarn?: number;
  error?: string;
}

export interface MintingResult {
  success: boolean;
  txHash?: string;
  tokensEarned?: number;
  feeUsd?: number;
  gasUsed?: number;
  error?: any;
}

export class MintingSkill {
  private userId: string;
  private apiBaseUrl: string;

  constructor(config: MintingSkillConfig) {
    this.userId = config.userId;
    this.apiBaseUrl = config.apiBaseUrl || 'http://localhost:3000';
  }

  /**
   * Get user's balance information
   */
  async getBalance(): Promise<BalanceInfo> {
    try {
      const wallet = await prisma.wallet.findUnique({
        where: { userId: this.userId },
        select: {
          address: true,
          reagentBalance: true,
          pathusdBalance: true
        }
      });

      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found'
        };
      }

      const usdBalance = await prisma.usdBalance.findUnique({
        where: { userId: this.userId },
        select: { balance: true }
      });

      return {
        success: true,
        address: wallet.address,
        reagentBalance: parseFloat(wallet.reagentBalance),
        usdBalance: usdBalance?.balance ? parseFloat(usdBalance.balance) : 0
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Estimate minting cost
   */
  async estimateCost(): Promise<CostEstimate> {
    try {
      // Import GasEstimator dynamically to avoid circular dependencies
      const { GasEstimator } = await import('@/lib/mining/gas-estimator');
      const gasEstimator = new GasEstimator();
      
      const gasEstimate = await gasEstimator.estimateGasForInscription();
      const feeUsd = 1.0; // Manual minting fee
      const totalCostUsd = feeUsd + parseFloat(gasEstimate.estimatedGas);

      return {
        success: true,
        feeUsd,
        gasEstimate: parseFloat(gasEstimate.estimatedGas),
        totalCostUsd,
        tokensToEarn: 10000
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Validate if user has sufficient balance
   */
  async validateBalance(requiredAmount: number): Promise<boolean> {
    const balance = await this.getBalance();
    if (!balance.success) {
      return false;
    }
    return (balance.usdBalance || 0) >= requiredAmount;
  }

  /**
   * Execute minting operation
   */
  async executeMint(): Promise<MintingResult> {
    try {
      // Import InscriptionEngine dynamically
      const { InscriptionEngine } = await import('@/lib/mining/inscription-engine');
      const mintingEngine = new InscriptionEngine();

      // Estimate cost first
      const estimate = await this.estimateCost();
      if (!estimate.success) {
        return {
          success: false,
          error: estimate.error
        };
      }

      // Validate balance
      const hasBalance = await this.validateBalance(estimate.totalCostUsd || 0);
      if (!hasBalance) {
        const balance = await this.getBalance();
        return {
          success: false,
          error: {
            code: 'INSUFFICIENT_BALANCE',
            message: `Insufficient balance. Required: $${estimate.totalCostUsd?.toFixed(2)}, Available: $${balance.usdBalance?.toFixed(2)}`
          }
        };
      }

      // Execute minting
      const result = await mintingEngine.executeInscription(this.userId, 'manual');
      
      // Convert InscriptionResult to MintingResult
      return {
        success: result.success,
        txHash: result.txHash,
        tokensEarned: result.tokensEarned ? parseFloat(result.tokensEarned) : undefined,
        feeUsd: result.feePaid ? parseFloat(result.feePaid) : undefined,
        gasUsed: result.gasPaid ? parseFloat(result.gasPaid) : undefined,
        error: result.error
      };

    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Execute minting with user-friendly feedback
   * This is the main method that AI agents should call
   */
  async mintWithFeedback(): Promise<string> {
    try {
      // Step 1: Get current balance
      const balance = await this.getBalance();
      if (!balance.success) {
        return `❌ Failed to check balance: ${balance.error}`;
      }

      const usdBalance = balance.usdBalance || 0;
      const reagentBalance = balance.reagentBalance || 0;

      // Step 2: Estimate cost
      const estimate = await this.estimateCost();
      if (!estimate.success) {
        return `❌ Failed to estimate cost: ${estimate.error}`;
      }

      const totalCost = estimate.totalCostUsd || 0;
      const tokensToEarn = estimate.tokensToEarn || 10000;

      // Step 3: Validate balance
      if (usdBalance < totalCost) {
        return (
          `❌ Insufficient balance for minting.\n\n` +
          `💰 Current Balance: $${usdBalance.toFixed(2)} USD\n` +
          `💵 Required: $${totalCost.toFixed(2)} USD\n` +
          `📉 Shortfall: $${(totalCost - usdBalance).toFixed(2)} USD\n\n` +
          `Please deposit more funds to continue.`
        );
      }

      // Step 4: Execute minting
      const result = await this.executeMint();

      if (result.success) {
        const txHash = result.txHash || 'N/A';
        const tokensEarned = result.tokensEarned || tokensToEarn;
        const feePaid = result.feeUsd || 0;
        const gasUsed = result.gasUsed || 0;

        return (
          `✅ Minting successful!\n\n` +
          `🪙 Tokens Earned: ${tokensEarned.toLocaleString()} REAGENT\n` +
          `💵 Fee Paid: $${feePaid.toFixed(2)} USD\n` +
          `⛽ Gas Used: ${gasUsed.toFixed(6)} ETH\n` +
          `🔗 Transaction: ${txHash.slice(0, 10)}...${txHash.slice(-8)}\n\n` +
          `💰 New Balance: $${(usdBalance - totalCost).toFixed(2)} USD\n` +
          `🪙 Total REAGENT: ${(reagentBalance + tokensEarned).toLocaleString()}\n\n` +
          `View on Explorer: https://explore.tempo.xyz/tx/${txHash}`
        );
      } else {
        const errorMsg = typeof result.error === 'object' 
          ? result.error.message || 'Unknown error'
          : result.error || 'Unknown error';

        return (
          `❌ Minting failed: ${errorMsg}\n\n` +
          `Please try again or contact support if the issue persists.`
        );
      }
    } catch (error: any) {
      return `❌ Unexpected error: ${error.message}`;
    }
  }

  /**
   * Get minting history
   */
  async getHistory(page: number = 1, limit: number = 10, status?: string) {
    try {
      const where: any = { userId: this.userId };
      if (status) {
        where.status = status;
      }

      const inscriptions = await prisma.inscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip: (page - 1) * limit,
        take: limit
      });

      const total = await prisma.inscription.count({ where });

      return {
        success: true,
        inscriptions,
        pagination: {
          page,
          limit,
          total,
          totalPages: Math.ceil(total / limit)
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get global mining statistics
   */
  async getStats() {
    try {
      const totalInscriptions = await prisma.inscription.count();
      
      // Calculate total supply manually (since tokensEarned is String)
      const allInscriptions = await prisma.inscription.findMany({
        where: { status: 'confirmed' },
        select: { tokensEarned: true }
      });
      
      let totalSupplyMinted = new Decimal(0);
      for (const inscription of allInscriptions) {
        totalSupplyMinted = totalSupplyMinted.plus(inscription.tokensEarned);
      }

      const inscriptions24h = await prisma.inscription.count({
        where: {
          createdAt: {
            gte: new Date(Date.now() - 24 * 60 * 60 * 1000)
          }
        }
      });

      const uniqueUsers = await prisma.inscription.groupBy({
        by: ['userId'],
        _count: true
      });

      const typeBreakdown = await prisma.inscription.groupBy({
        by: ['type'],
        _count: true
      });

      const autoCount = typeBreakdown.find(t => t.type === 'auto')?._count || 0;
      const manualCount = typeBreakdown.find(t => t.type === 'manual')?._count || 0;
      const totalCount = autoCount + manualCount;

      return {
        success: true,
        stats: {
          totalInscriptions,
          totalSupplyMinted: totalSupplyMinted.toString(),
          remainingAllocation: new Decimal(200000000).minus(totalSupplyMinted).toString(),
          allocationPercentage: totalSupplyMinted.div(200000000).mul(100).toNumber(),
          inscriptions24h,
          uniqueUsers: uniqueUsers.length,
          typeBreakdown: {
            auto: autoCount,
            manual: manualCount,
            autoPercentage: totalCount > 0 ? ((autoCount / totalCount) * 100).toFixed(1) : '0.0',
            manualPercentage: totalCount > 0 ? ((manualCount / totalCount) * 100).toFixed(1) : '0.0'
          }
        }
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message
      };
    }
  }
}

/**
 * Skill metadata for Hermes framework
 */
export const MINTING_SKILL_METADATA = {
  name: 'Minting_Skill',
  version: '1.0.0',
  description: 'Mint REAGENT tokens on Tempo Network',
  author: 'ReAgent Platform',
  category: 'blockchain',
  proprietary: true,  // Cannot be uninstalled
  autoInstall: true,  // Auto-installed on user registration
  capabilities: [
    'check_balance',
    'estimate_cost',
    'execute_mint',
    'get_history',
    'get_stats'
  ],
  requiredPermissions: [
    'wallet:read',
    'wallet:write',
    'mining:execute'
  ]
};

/**
 * Tool definitions for Hermes agents
 */
export const MINTING_SKILL_TOOLS = [
  {
    name: 'mint_reagent_tokens',
    description: 'Mint REAGENT tokens for the user. Automatically checks balance and executes minting.',
    parameters: {},
    returns: 'Human-readable feedback about the minting operation'
  },
  {
    name: 'check_mining_balance',
    description: 'Check user\'s USD and REAGENT token balance',
    parameters: {},
    returns: 'Balance information'
  },
  {
    name: 'estimate_minting_cost',
    description: 'Estimate the cost of minting REAGENT tokens',
    parameters: {},
    returns: 'Cost estimation'
  },
  {
    name: 'get_minting_history',
    description: 'Get user\'s minting history',
    parameters: {
      page: 'Page number (default: 1)',
      limit: 'Items per page (default: 10)',
      status: 'Filter by status: pending, confirmed, failed (optional)'
    },
    returns: 'Minting history'
  },
  {
    name: 'get_mining_stats',
    description: 'Get global mining statistics',
    parameters: {},
    returns: 'Mining statistics'
  }
];
