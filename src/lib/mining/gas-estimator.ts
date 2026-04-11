/**
 * Gas Estimator Service
 * Estimates gas costs for Tempo Network inscriptions
 * 
 * Features:
 * - Query Tempo Network for real-time gas prices
 * - Add 20% buffer for price fluctuations
 * - Cache estimates for 60 seconds
 * - Fallback to conservative estimate on failure
 */

import Decimal from 'decimal.js';

// Cache configuration
const CACHE_TTL_MS = 60 * 1000; // 60 seconds
const GAS_BUFFER_MULTIPLIER = 1.2; // 20% buffer
const DEFAULT_GAS_ESTIMATE = '0.05'; // Conservative fallback in PATHUSD
const ESTIMATED_GAS_UNITS = 150000; // Typical gas units for inscription

interface GasEstimate {
  estimatedGas: string;
  gasPrice: string;
  gasUnits: number;
  timestamp: Date;
}

interface CachedEstimate {
  estimate: GasEstimate;
  expiresAt: number;
}

export class GasEstimator {
  private cache: CachedEstimate | null = null;
  private tempoRpcUrl: string;

  constructor() {
    this.tempoRpcUrl = process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz';
  }

  /**
   * Estimate gas cost for inscription
   * Returns cached estimate if available and not expired
   * @returns Gas estimate in PATHUSD
   */
  async estimateGasForInscription(): Promise<GasEstimate> {
    // Check cache first
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.estimate;
    }

    try {
      // Query Tempo Network for current gas price
      const gasPrice = await this.queryGasPrice();
      
      // Calculate gas cost
      const gasCost = this.calculateGasCost(gasPrice, ESTIMATED_GAS_UNITS);
      
      // Add 20% buffer for price fluctuations
      const bufferedCost = new Decimal(gasCost).mul(GAS_BUFFER_MULTIPLIER);

      const estimate: GasEstimate = {
        estimatedGas: bufferedCost.toString(),
        gasPrice: gasPrice.toString(),
        gasUnits: ESTIMATED_GAS_UNITS,
        timestamp: new Date()
      };

      // Cache the estimate
      this.cache = {
        estimate,
        expiresAt: Date.now() + CACHE_TTL_MS
      };

      return estimate;
    } catch (error) {
      console.error('Gas estimation failed, using fallback:', error);
      
      // Return conservative fallback estimate
      return {
        estimatedGas: DEFAULT_GAS_ESTIMATE,
        gasPrice: '0',
        gasUnits: ESTIMATED_GAS_UNITS,
        timestamp: new Date()
      };
    }
  }

  /**
   * Query Tempo Network for current gas price
   * @returns Gas price in wei
   */
  private async queryGasPrice(): Promise<string> {
    try {
      // Query Tempo Network RPC
      const response = await fetch(this.tempoRpcUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jsonrpc: '2.0',
          method: 'eth_gasPrice',
          params: [],
          id: 1
        })
      });

      if (!response.ok) {
        throw new Error(`RPC request failed: ${response.statusText}`);
      }

      const data = await response.json();
      
      if (data.error) {
        throw new Error(`RPC error: ${data.error.message}`);
      }

      // Return gas price in wei (hex string)
      return data.result;
    } catch (error) {
      console.error('Failed to query gas price from Tempo Network:', error);
      throw error;
    }
  }

  /**
   * Calculate gas cost in PATHUSD
   * @param gasPriceWei - Gas price in wei (hex string)
   * @param gasUnits - Estimated gas units
   * @returns Gas cost in PATHUSD
   */
  private calculateGasCost(gasPriceWei: string, gasUnits: number): string {
    try {
      // Convert hex gas price to decimal
      const gasPriceDecimal = new Decimal(parseInt(gasPriceWei, 16));
      
      // Calculate total cost in wei
      const totalWei = gasPriceDecimal.mul(gasUnits);
      
      // Convert wei to PATHUSD (assuming 1 ETH = 1 PATHUSD for Tempo Network)
      // 1 ETH = 10^18 wei
      const gasCostPathusd = totalWei.div(new Decimal(10).pow(18));
      
      return gasCostPathusd.toString();
    } catch (error) {
      console.error('Failed to calculate gas cost:', error);
      throw error;
    }
  }

  /**
   * Clear the cache (useful for testing)
   */
  clearCache(): void {
    this.cache = null;
  }

  /**
   * Get cached estimate if available
   * @returns Cached estimate or null
   */
  getCachedEstimate(): GasEstimate | null {
    if (this.cache && Date.now() < this.cache.expiresAt) {
      return this.cache.estimate;
    }
    return null;
  }
}

// Export singleton instance
export const gasEstimator = new GasEstimator();
