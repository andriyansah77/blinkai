/**
 * GET /api/mining/estimate
 * Estimate inscription cost
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { gasEstimator } from '@/lib/mining/gas-estimator';
import Decimal from 'decimal.js';

const AUTO_INSCRIPTION_FEE = '0.5';
const MANUAL_INSCRIPTION_FEE = '1.0';
const TOKENS_PER_INSCRIPTION = '10000';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user (optional for estimate)
    const session = await getServerSession(authOptions);

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const type = searchParams.get('type') || 'manual'; // auto or manual

    // 3. Get gas estimate
    const gasEstimate = await gasEstimator.estimateGasForInscription();

    // 4. Calculate costs
    const inscriptionFee = type === 'auto' ? AUTO_INSCRIPTION_FEE : MANUAL_INSCRIPTION_FEE;
    const totalCost = new Decimal(inscriptionFee).plus(gasEstimate.estimatedGas);

    // 5. Return estimate
    return NextResponse.json({
      success: true,
      estimate: {
        type,
        inscriptionFee,
        estimatedGas: gasEstimate.estimatedGas,
        gasPrice: gasEstimate.gasPrice,
        gasUnits: gasEstimate.gasUnits,
        totalCost: totalCost.toString(),
        tokensToEarn: TOKENS_PER_INSCRIPTION,
        timestamp: gasEstimate.timestamp.toISOString()
      },
      pricing: {
        auto: {
          fee: AUTO_INSCRIPTION_FEE,
          description: 'Automated inscription via AI agent'
        },
        manual: {
          fee: MANUAL_INSCRIPTION_FEE,
          description: 'Manual inscription via dashboard'
        }
      }
    });

  } catch (error: any) {
    console.error('Estimate API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to estimate inscription cost',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
