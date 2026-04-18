/**
 * Simple Minting Engine - Server-Side Only
 * All minting is done server-side with master wallet
 * Users pay PATHUSD fee before minting
 */

import { ethers } from 'ethers';
import { prisma } from '@/lib/prisma';
import { simpleWalletManager } from './simple-wallet-manager';
import { usdBalanceManager } from './usd-balance-manager';

const TOKENS_PER_MINT = '10000'; // 10,000 REAGENT per mint
const AUTO_MINT_FEE = '0.05'; // 0.05 PATHUSD for auto
const MANUAL_MINT_FEE = '0.1'; // 0.1 PATHUSD for manual
const REAGENT_TOKEN_ADDRESS = process.env.REAGENT_TOKEN_ADDRESS || '0x20C000000000000000000000a59277C0c1d65Bc5';
const PATHUSD_TOKEN_ADDRESS = process.env.PATHUSD_TOKEN_ADDRESS || '0x20c0000000000000000000000000000000000000';
const TEMPO_CHAIN_ID = parseInt(process.env.TEMPO_CHAIN_ID || '4217');
const MASTER_WALLET_USER_ID = process.env.MASTER_WALLET_USER_ID || 'master'; // Master wallet user ID

export interface MintResult {
  success: boolean;
  inscriptionId?: string;
  txHash?: string;
  tokensEarned?: string;
  feePaid?: string;
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
      const userWallet = await simpleWalletManager.getWallet(userId);
      if (!userWallet) {
        return {
          success: false,
          error: 'Wallet not found. Please create a wallet first.'
        };
      }

      console.log(`[SimpleMinting] User wallet: ${userWallet.address}`);

      // 2. Check PATHUSD balance from blockchain and charge fee
      const fee = type === 'auto' ? AUTO_MINT_FEE : MANUAL_MINT_FEE;
      console.log(`[SimpleMinting] Fee for ${type} minting: ${fee} PATHUSD`);
      
      try {
        // Check user's PATHUSD balance on blockchain
        const provider = new ethers.JsonRpcProvider(
          process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
        );
        
        // Create PATHUSD token contract instance
        const pathusdContract = new ethers.Contract(
          PATHUSD_TOKEN_ADDRESS,
          [
            'function balanceOf(address account) view returns (uint256)',
            'function transfer(address to, uint256 amount) returns (bool)'
          ],
          provider
        );
        
        const pathusdBalance = await pathusdContract.balanceOf(userWallet.address);
        const pathusdBalanceFormatted = parseFloat(ethers.formatUnits(pathusdBalance, 6)); // PATHUSD uses 6 decimals
        
        console.log(`[SimpleMinting] User PATHUSD balance on blockchain: ${pathusdBalanceFormatted}`);
        
        // Check if user has enough PATHUSD for fee
        const feeAmount = parseFloat(fee);
        
        if (pathusdBalanceFormatted < feeAmount) {
          return {
            success: false,
            error: `Insufficient PATHUSD balance. Need ${feeAmount.toFixed(2)} PATHUSD, have ${pathusdBalanceFormatted.toFixed(2)} PATHUSD.`
          };
        }
        
        // Transfer PATHUSD fee from user to platform wallet
        const platformWalletAddress = process.env.PLATFORM_WALLET_ADDRESS;
        if (!platformWalletAddress) {
          throw new Error('Platform wallet address not configured. Please set PLATFORM_WALLET_ADDRESS in .env');
        }
        
        console.log(`[SimpleMinting] Transferring ${fee} PATHUSD fee from user to platform`);
        
        // Get nonce and gas price for fee transfer
        const nonce = await provider.getTransactionCount(userWallet.address, 'pending');
        const feeData = await provider.getFeeData();
        const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');
        
        // Encode ERC-20 transfer function call
        const iface = new ethers.Interface([
          'function transfer(address to, uint256 amount) returns (bool)'
        ]);
        const transferData = iface.encodeFunctionData('transfer', [
          platformWalletAddress,
          ethers.parseUnits(fee, 6) // PATHUSD uses 6 decimals
        ]);
        
        // Construct fee transfer transaction (ERC-20 transfer)
        const feeTransferTx: ethers.TransactionRequest = {
          to: PATHUSD_TOKEN_ADDRESS, // Send to PATHUSD contract
          from: userWallet.address,
          value: 0, // No native token transfer
          data: transferData, // ERC-20 transfer call
          gasLimit: 100000, // ERC-20 transfer needs more gas
          chainId: TEMPO_CHAIN_ID,
          nonce: nonce,
          gasPrice: gasPrice
        };
        
        // Sign and broadcast fee transfer with user's wallet
        const signedFeeTx = await simpleWalletManager.signTransaction(userId, feeTransferTx);
        const feeTxHash = await simpleWalletManager.broadcastTransaction(signedFeeTx);
        
        console.log(`[SimpleMinting] Fee transfer tx: ${feeTxHash}`);
        
        // Wait for fee transfer confirmation (quick check)
        await new Promise(resolve => setTimeout(resolve, 2000));
        
      } catch (feeError: any) {
        console.error('[SimpleMinting] Fee transfer failed:', feeError);
        return {
          success: false,
          error: `Failed to charge fee: ${feeError.message}`
        };
      }

      // 3. Create inscription record
      const inscription = await prisma.inscription.create({
        data: {
          userId,
          walletId: userWallet.id,
          type,
          status: 'pending',
          inscriptionFee: fee,
          gasEstimate: '300000',
          gasFee: '0',
          tokensEarned: TOKENS_PER_MINT
        }
      });

      console.log(`[SimpleMinting] Inscription created: ${inscription.id}`);

      try {
        // 4. Deduct PATHUSD fee (DISABLED for now)
        // TODO: Implement proper PATHUSD balance system
        /*
        await usdBalanceManager.deduct(
          userId,
          fee,
          'inscription_fee',
          `${type} minting fee`,
          'inscription',
          inscription.id
        );
        
        console.log(`[SimpleMinting] PATHUSD fee deducted: ${fee}`);
        */

        // 5. Construct transaction (master wallet mints TO user address)
        const tx = await this.constructMintTransaction(userWallet.address);
        console.log(`[SimpleMinting] Transaction constructed`);

        // 6. Sign transaction with MASTER wallet (not user wallet)
        const signedTx = await simpleWalletManager.signTransaction(MASTER_WALLET_USER_ID, tx);
        console.log(`[SimpleMinting] Transaction signed by master wallet`);

        // 7. Broadcast transaction
        const txHash = await simpleWalletManager.broadcastTransaction(signedTx);
        console.log(`[SimpleMinting] Transaction broadcast: ${txHash}`);

        // 8. Update inscription
        await prisma.inscription.update({
          where: { id: inscription.id },
          data: {
            txHash,
            status: 'pending'
          }
        });

        // 9. Start monitoring (async)
        this.monitorTransaction(txHash, inscription.id, userId).catch(error => {
          console.error('[SimpleMinting] Monitoring failed:', error);
        });

        return {
          success: true,
          inscriptionId: inscription.id,
          txHash,
          tokensEarned: TOKENS_PER_MINT,
          feePaid: fee
        };

      } catch (txError: any) {
        console.error('[SimpleMinting] Transaction failed:', txError);
        
        // Refund PATHUSD fee if transaction failed (DISABLED for now)
        // TODO: Implement proper PATHUSD balance system
        /*
        try {
          await usdBalanceManager.refund(
            userId,
            fee,
            'Refund for failed minting',
            'inscription',
            inscription.id
          );
          console.log(`[SimpleMinting] PATHUSD fee refunded: ${fee}`);
        } catch (refundError) {
          console.error('[SimpleMinting] Refund failed:', refundError);
        }
        */
        
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
   * Master wallet mints TO user address
   */
  private async constructMintTransaction(toAddress: string): Promise<ethers.TransactionRequest> {
    // Get master wallet address
    const masterWallet = await simpleWalletManager.getWallet(MASTER_WALLET_USER_ID);
    if (!masterWallet) {
      throw new Error('Master wallet not found. Please setup master wallet first.');
    }

    // Get current nonce for master wallet
    const nonce = await this.provider.getTransactionCount(masterWallet.address, 'pending');

    // Get gas price
    const feeData = await this.provider.getFeeData();
    const gasPrice = feeData.gasPrice || ethers.parseUnits('20', 'gwei');

    // Encode mint function call
    const iface = new ethers.Interface([
      'function mint(address to, uint256 amount) external'
    ]);
    
    // Convert REAGENT amount to token units (6 decimals)
    const amountInUnits = ethers.parseUnits(TOKENS_PER_MINT, 6);
    const data = iface.encodeFunctionData('mint', [toAddress, amountInUnits]);

    return {
      to: REAGENT_TOKEN_ADDRESS,
      from: masterWallet.address, // FROM master wallet
      nonce,
      gasLimit: 300000,
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
