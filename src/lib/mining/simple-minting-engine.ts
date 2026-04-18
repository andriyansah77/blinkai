/**
 * Simple Minting Engine - Server-Side Only
 * All minting is done server-side with encrypted private keys
 */

import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { simpleWalletManager } from './simple-wallet-manager';

const TOKENS_PER_MINT = '10000'; // 10,000 REAGENT per mint
const REAGENT_TOKEN_ADDRESS = process.env.REAGENT_TOKEN_ADDRESS || '0x20C000000000000000000000a59277C0c1d65Bc5';
const TEMPO_CHAIN_ID = parseInt(process.env.TEMPO_CHAIN_ID || '4217');

export interface MintResult {
  success: boolean;
  inscriptionId?: string;
  txHash?: string;
  tokensEarned?: string;
  error?: string;
}

export class SimpleMintingEngine {
  private provider: ethers.JsonRpcProvider;

  constructor() {
    const rpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';
    this.provider = new ethers.JsonRpcProvider(rpcUrl);
  }

  /**
   * Mint REAGENT tokens for user
   * @param userId - User ID
   * @param type - 'auto' for AI agent, 'manual' for user
   */
  async mint(userId: string, type: 'auto' | 'manual' = 'manual'): Promise<MintResult> {
    console.log(`[SimpleMinting] Starting mint for user ${userId}, type: ${type}`);
    
    try {
      // 1. Get user wallet
      const wallet = await simpleWalletManager.getWallet(userId);
      if (!wallet) {
        return {
          success: false,
          error: 'Wallet not found. Please create a wallet first.'
        };
      }

      console.log(`[SimpleMinting] Wallet found: ${wallet.address}`);

      // 2. Create inscription record
      const inscription = await prisma.inscription.create({
        data: {
          userId,
          walletId: wallet.id,
          type,
          status: 'pending',
          inscriptionFee: '0',
          gasEstimate: '150000',
          gasFee: '0',
          tokensEarned: TOKENS_PER_MINT
        }
      });

      console.log(`[SimpleMinting] Inscription created: ${inscription.id}`);

      try {
        // 3. Construct transaction
        const tx = await this.constructMintTransaction(wallet.address);
        console.log(`[SimpleMinting] Transaction constructed`);

        // 4. Sign transaction
        const signedTx = await simpleWalletManager.signTransaction(userId, tx);
        console.log(`[SimpleMinting] Transaction signed`);

        // 5. Broadcast transaction
        const txHash = await simpleWalletManager.broadcastTransaction(signedTx);
        console.log(`[SimpleMinting] Transaction broadcast: ${txHash}`);

        // 6. Update inscription
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            txHash,
            status: 'pending'
          }
        });

        // 7. Start monitoring (async)
        this.monitorTransaction(txHash, inscription.id, userId).catch(error => {
          console.error('[SimpleMinting] Monitoring failed:', error);
        });

        return {
          success: true,
          inscriptionId: inscription.id,
          txHash,
          tokensEarned: TOKENS_PER_MINT
        };

      } catch (txError: any) {
        console.error('[SimpleMinting] Transaction failed:', txError);
        
        // Update inscription as failed
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            status: 'failed',
            errorMessage: txError.message
          }
        });

        return {
          success: false,
          error: `Transaction failed: ${txError.message}`
        };
      }

    } catch (error: any) {
      console.error('[SimpleMinting] Mint failed:', error);
      return {
        success: false,
        error: error.message || 'Minting failed'
      };
    }
  }

  /**
   * Construct mint transaction
   */
  private async constructMintTransaction(fromAddress: string): Promise<ethers.TransactionRequest> {
    // Get current nonce
    const nonce = await this.provider.getTransactionCount(fromAddress, 'pending');

    // Get gas price
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

    // Encode mint function call
    const iface = new ethers.Interface([
      'function mint(address to, uint256 amount) external'
    ]);
    
    // Convert REAGENT amount to token units (6 decimals)
    const amountInUnits = ethers.parseUnits(TOKENS_PER_MINT, 6);
    const data = iface.encodeFunctionData('mint', [fromAddress, amountInUnits]);

    return {
      to: REAGENT_TOKEN_ADDRESS,
      from: fromAddress,
      nonce,
      gasLimit: 300000, // Increased from 150000 to 300000
      gasPrice,
      data,
      value: 0,
      chainId: TEMPO_CHAIN_ID
    };
  }

  /**
   * Monitor transaction confirmation
   */
  private async monitorTransaction(txHash: string, inscriptionId: string, userId: string): Promise<void> {
    console.log(`[SimpleMinting] Monitoring transaction: ${txHash}`);
    
    const maxWait = 5 * 60 * 1000; // 5 minutes
    const pollInterval = 10 * 1000; // 10 seconds
    const startTime = Date.now();

    while (Date.now() - startTime < maxWait) {
      try {
        const receipt = await this.provider.getTransactionReceipt(txHash);

        if (receipt) {
          if (receipt.status === 1) {
            // Success
            console.log(`[SimpleMinting] Transaction confirmed: ${txHash}`);
            
            await prisma.inscription.update({
              where: { id: inscriptionId },
              data: {
                status: 'confirmed',
                blockNumber: receipt.blockNumber,
                confirmedAt: new Date()
              }
            });

            // Update wallet balance
            const wallet = await prisma.wallet.findFirst({
              where: { userId }
            });

            if (wallet) {
              const currentBalance = parseFloat(wallet.reagentBalance);
              const newBalance = currentBalance + parseFloat(TOKENS_PER_MINT);

              await prisma.wallet.update({
                where: { id: wallet.id },
                data: {
                  reagentBalance: newBalance.toString(),
                  lastBalanceUpdate: new Date()
                }
              });
            }

            return;
          } else {
            // Failed
            console.log(`[SimpleMinting] Transaction failed: ${txHash}`);
            
            await prisma.inscription.update({
              where: { id: inscriptionId },
              data: {
                status: 'failed',
                errorMessage: 'Transaction failed on blockchain'
              }
            });

            return;
          }
        }

        // Still pending, wait and retry
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      } catch (error) {
        console.error('[SimpleMinting] Monitoring error:', error);
      }
    }

    // Timeout
    console.log(`[SimpleMinting] Transaction timeout: ${txHash}`);
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: {
        status: 'failed',
        errorMessage: 'Transaction confirmation timeout'
      }
    });
  }
}

// Export singleton
export const simpleMintingEngine = new SimpleMintingEngine();
