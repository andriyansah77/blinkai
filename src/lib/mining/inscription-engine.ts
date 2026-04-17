/**
 * Inscription Engine
 * Executes blockchain transactions for REAGENT token minting
 * 
 * Features:
 * - Construct Tempo inscription transactions
 * - Sign transactions with user wallet
 * - Submit to Tempo Network
 * - Monitor transaction status
 * - Handle failures with automatic refunds
 */

import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { walletManager } from './wallet-manager';
import { usdBalanceManager } from './usd-balance-manager';
import { gasEstimator } from './gas-estimator';
import Decimal from 'decimal.js';

// Constants
const TOKENS_PER_INSCRIPTION = '10000'; // 10,000 REAGENT per inscription
const AUTO_INSCRIPTION_FEE = '0.5'; // 0.5 PATHUSD for auto
const MANUAL_INSCRIPTION_FEE = '1.0'; // 1.0 PATHUSD for manual
const MAX_CONFIRMATION_WAIT = 5 * 60 * 1000; // 5 minutes
const CONFIRMATION_POLL_INTERVAL = 10 * 1000; // 10 seconds

export interface InscriptionResult {
  success: boolean;
  inscriptionId?: string;
  txHash?: string;
  tokensEarned?: string;
  feePaid?: string;
  gasPaid?: string;
  gasUsed?: string;
  error?: string;
  requiresClientSigning?: boolean;
  unsignedTransaction?: {
    to?: string;
    from?: string;
    data?: string;
    value?: string;
    gasLimit?: string;
    gasPrice?: string;
    nonce?: number;
    chainId?: number;
  };
  message?: string;
}

export interface TransactionStatus {
  status: 'pending' | 'confirmed' | 'failed';
  confirmations: number;
  blockNumber?: number;
  gasUsed?: string;
}

export class InscriptionEngine {
  private provider: ethers.JsonRpcProvider;
  private inscriptionContractAddress: string;

  constructor() {
    const rpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
    // REAGENT token address (TIP-20 contract)
    // TODO: Replace with actual deployed REAGENT token address
    this.inscriptionContractAddress = process.env.REAGENT_TOKEN_ADDRESS || '0x0000000000000000000000000000000000000000';
  }

  /**
   * Execute inscription for a user
   * @param userId - User ID
   * @param type - Inscription type (auto or manual)
   * @param forceClientSigning - Force client-side signing even if wallet has private key
   * @returns Inscription result
   */
  async executeInscription(
    userId: string,
    type: 'auto' | 'manual',
    forceClientSigning: boolean = false
  ): Promise<InscriptionResult> {
    try {
      // 1. Validate user and wallet
      const wallet = await walletManager.getWallet(userId);
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not linked. Please connect your wallet first and refresh the page.'
        };
      }

      // 2. Determine fee based on type (for record keeping only)
      const inscriptionFee = type === 'auto' ? AUTO_INSCRIPTION_FEE : MANUAL_INSCRIPTION_FEE;

      // 3. Estimate gas (for display only)
      const gasEstimate = await gasEstimator.estimateGasForInscription();
      
      // Note: For external wallets (MetaMask), user pays gas directly
      // No pathUSD balance check needed - user will pay with their wallet

      // 4. Create inscription record
      const inscription = await prisma.inscription.create({
        data: {
          userId,
          walletId: wallet.id,
          type,
          status: 'pending',
          inscriptionFee: '0', // No fee for external wallet
          gasEstimate: gasEstimate.estimatedGas,
          gasFee: '0',
          tokensEarned: TOKENS_PER_INSCRIPTION
        }
      });

      // Note: No balance deduction for external wallets
      // User pays gas directly from their MetaMask wallet

      try {
        // Always use client-side signing for security
        // No private keys stored on server
        console.log('[InscriptionEngine] Using client-side signing');
        
        // Return unsigned transaction for client-side signing
        const tx = await this.constructInscriptionTransaction(wallet.address);
        
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: { 
            status: 'pending_signature',
            errorMessage: 'Awaiting client-side signature'
          }
        });
        
        return {
          success: true,
          inscriptionId: inscription.id,
          requiresClientSigning: true,
          unsignedTransaction: {
            to: tx.to?.toString(),
            from: tx.from?.toString(),
            data: tx.data?.toString(),
            value: tx.value?.toString() || '0',
            gasLimit: tx.gasLimit?.toString(),
            gasPrice: tx.gasPrice?.toString(),
            nonce: tx.nonce != null ? Number(tx.nonce) : undefined,
            chainId: tx.chainId != null ? Number(tx.chainId) : undefined
          },
          message: 'Please sign the transaction with your wallet'
        };

      } catch (blockchainError: any) {
        // Handle blockchain submission failure
        console.error('Blockchain transaction failed:', blockchainError);

        await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            status: 'failed',
            errorMessage: blockchainError.message || 'Transaction submission failed'
          }
        });

        // No refund needed for external wallets

        return {
          success: false,
          error: `Transaction failed: ${blockchainError.message || 'Unknown error'}`
        };
      }

    } catch (error: any) {
      console.error('Inscription execution failed:', error);
      return {
        success: false,
        error: error.message || 'Inscription failed'
      };
    }
  }

  /**
   * Construct mint transaction for TIP-20 REAGENT token
   * @param fromAddress - User's wallet address (must have ISSUER_ROLE)
   * @returns Unsigned transaction
   */
  private async constructInscriptionTransaction(fromAddress: string): Promise<ethers.TransactionRequest> {
    try {
      // Get current nonce
      const nonce = await this.provider.getTransactionCount(fromAddress, 'pending');

      // Get gas price
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

      // Encode TIP-20 mint function call
      // mint(address to, uint256 amount)
      const mintData = this.encodeMintData(fromAddress, TOKENS_PER_INSCRIPTION);

      const tx: ethers.TransactionRequest = {
        to: this.inscriptionContractAddress, // REAGENT TIP-20 token address
        from: fromAddress,
        nonce,
        gasLimit: 150000, // Sufficient for TIP-20 mint
        gasPrice,
        data: mintData,
        value: 0, // No native token transfer
        chainId: parseInt(process.env.TEMPO_CHAIN_ID || '4217') // Tempo mainnet chain ID
      };

      return tx;
    } catch (error) {
      console.error('Failed to construct transaction:', error);
      throw new Error('Failed to construct mint transaction');
    }
  }

  /**
   * Encode mint data for TIP-20 contract call
   * @param toAddress - Recipient address
   * @param amount - Amount to mint (in token units with 6 decimals)
   * @returns Encoded data
   */
  private encodeMintData(toAddress: string, amount: string): string {
    // TIP-20 uses standard ERC-20 mint function
    // mint(address to, uint256 amount)
    const iface = new ethers.Interface([
      'function mint(address to, uint256 amount) external'
    ]);
    
    // Convert REAGENT amount to token units (TIP-20 uses 6 decimals)
    const amountInUnits = ethers.parseUnits(amount, 6);
    
    return iface.encodeFunctionData('mint', [toAddress, amountInUnits]);
  }

  /**
   * Sign transaction with private key
   * @param tx - Unsigned transaction
   * @param privateKey - User's private key
   * @returns Signed transaction
   */
  private async signTransaction(
    tx: ethers.TransactionRequest,
    privateKey: string
  ): Promise<string> {
    try {
      const wallet = new ethers.Wallet(privateKey, this.provider);
      const signedTx = await wallet.signTransaction(tx);
      return signedTx;
    } catch (error) {
      console.error('Failed to sign transaction:', error);
      throw new Error('Failed to sign transaction');
    }
  }

  /**
   * Submit signed transaction to blockchain
   * @param signedTx - Signed transaction
   * @returns Transaction hash
   */
  private async submitTransaction(signedTx: string): Promise<string> {
    try {
      const txResponse = await this.provider.broadcastTransaction(signedTx);
      return txResponse.hash;
    } catch (error: any) {
      console.error('Failed to submit transaction:', error);
      throw new Error(`Failed to submit transaction: ${error.message}`);
    }
  }

  /**
   * Monitor transaction status and update inscription (PUBLIC)
   * @param txHash - Transaction hash
   * @param inscriptionId - Inscription ID
   * @param userId - User ID
   */
  async monitorTransaction(
    txHash: string,
    inscriptionId: string,
    userId: string
  ): Promise<void> {
    const startTime = Date.now();

    while (Date.now() - startTime < MAX_CONFIRMATION_WAIT) {
      try {
        const status = await this.getTransactionStatus(txHash);

        if (status.status === 'confirmed') {
          // Transaction confirmed
          await this.handleConfirmedTransaction(inscriptionId, userId, status);
          return;
        } else if (status.status === 'failed') {
          // Transaction failed
          await this.handleFailedTransaction(inscriptionId, userId, 'Transaction failed on blockchain');
          return;
        }

        // Still pending, wait and retry
        await new Promise(resolve => setTimeout(resolve, CONFIRMATION_POLL_INTERVAL));
      } catch (error) {
        console.error('Error monitoring transaction:', error);
        // Continue monitoring despite errors
      }
    }

    // Timeout - mark as failed
    await this.handleFailedTransaction(inscriptionId, userId, 'Transaction confirmation timeout');
  }

  /**
   * Get transaction status from blockchain
   * @param txHash - Transaction hash
   * @returns Transaction status
   */
  async getTransactionStatus(txHash: string): Promise<TransactionStatus> {
    try {
      const receipt = await this.provider.getTransactionReceipt(txHash);

      if (!receipt) {
        // Transaction not yet mined
        return {
          status: 'pending',
          confirmations: 0
        };
      }

      // Check if transaction succeeded
      if (receipt.status === 0) {
        return {
          status: 'failed',
          confirmations: 0,
          blockNumber: receipt.blockNumber
        };
      }

      // Get current block number for confirmations
      const currentBlock = await this.provider.getBlockNumber();
      const confirmations = currentBlock - receipt.blockNumber + 1;

      return {
        status: confirmations >= 1 ? 'confirmed' : 'pending',
        confirmations,
        blockNumber: receipt.blockNumber,
        gasUsed: receipt.gasUsed.toString()
      };
    } catch (error) {
      console.error('Failed to get transaction status:', error);
      throw error;
    }
  }

  /**
   * Handle confirmed transaction
   * @param inscriptionId - Inscription ID
   * @param userId - User ID
   * @param status - Transaction status
   */
  private async handleConfirmedTransaction(
    inscriptionId: string,
    userId: string,
    status: TransactionStatus
  ): Promise<void> {
    try {
      // Get inscription to calculate actual gas
      const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId },
        include: { wallet: true }
      });

      if (!inscription) {
        throw new Error('Inscription not found');
      }

      // Calculate actual gas fee
      const gasUsed = status.gasUsed || '0';
      const feeData = await this.provider.getFeeData();
      const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
      const actualGasFee = new Decimal(gasUsed).mul(gasPrice.toString()).div(new Decimal(10).pow(18));

      // Only deduct pathUSD for managed wallets (wallets with encrypted private keys)
      // External wallets pay gas directly from their own wallet
      const isExternalWallet = !inscription.wallet?.encryptedPrivateKey;
      
      if (!isExternalWallet) {
        // Deduct actual gas fee for managed wallets only
        await usdBalanceManager.deduct(
          userId,
          actualGasFee.toString(),
          'gas_fee',
          'Gas fee for inscription',
          'inscription',
          inscriptionId
        );
      }

      // Update inscription status
      await prisma.inscription.update({
        where: { id: inscriptionId },
        data: {
          status: 'confirmed',
          gasFee: actualGasFee.toString(),
          blockNumber: status.blockNumber,
          confirmations: status.confirmations,
          confirmedAt: new Date()
        }
      });

      // Update wallet balance cache
      const wallet = await prisma.wallet.findUnique({
        where: { id: inscription.walletId }
      });

      if (wallet) {
        const currentReagent = new Decimal(wallet.reagentBalance);
        const newReagent = currentReagent.plus(TOKENS_PER_INSCRIPTION);

        await prisma.wallet.update({
          where: { id: wallet.id },
          data: {
            reagentBalance: newReagent.toString(),
            lastBalanceUpdate: new Date()
          }
        });
      }

      console.log(`Inscription ${inscriptionId} confirmed successfully`);
    } catch (error) {
      console.error('Failed to handle confirmed transaction:', error);
    }
  }

  /**
   * Handle failed transaction
   * @param inscriptionId - Inscription ID
   * @param userId - User ID
   * @param errorMessage - Error message
   */
  private async handleFailedTransaction(
    inscriptionId: string,
    userId: string,
    errorMessage: string
  ): Promise<void> {
    try {
      // Update inscription status
      await prisma.inscription.update({
        where: { id: inscriptionId },
        data: {
          status: 'failed',
          errorMessage
        }
      });

      // Refund inscription fee
      await this.refundFailedInscription(inscriptionId, userId);

      console.log(`Inscription ${inscriptionId} failed: ${errorMessage}`);
    } catch (error) {
      console.error('Failed to handle failed transaction:', error);
    }
  }

  /**
   * Refund failed inscription
   * @param inscriptionId - Inscription ID
   * @param userId - User ID
   */
  async refundFailedInscription(inscriptionId: string, userId: string): Promise<void> {
    try {
      const inscription = await prisma.inscription.findUnique({
        where: { id: inscriptionId }
      });

      if (!inscription) {
        throw new Error('Inscription not found');
      }

      if (inscription.refunded) {
        console.log(`Inscription ${inscriptionId} already refunded`);
        return;
      }

      // Refund inscription fee
      await usdBalanceManager.refund(
        userId,
        inscription.inscriptionFee,
        'Refund for failed inscription',
        'inscription',
        inscriptionId
      );

      // Mark as refunded
      await prisma.inscription.update({
        where: { id: inscriptionId },
        data: { refunded: true }
      });

      console.log(`Refunded ${inscription.inscriptionFee} PATHUSD for inscription ${inscriptionId}`);
    } catch (error) {
      console.error('Failed to refund inscription:', error);
      throw error;
    }
  }
}

// Export singleton instance
export const inscriptionEngine = new InscriptionEngine();
