/**
 * GET /api/mining/stats
 * Get global mining statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

// Platform allocation: 100 million REAGENT tokens
const TOTAL_ALLOCATION = '100000000';
const TOKENS_PER_INSCRIPTION = '10000';

export async function GET(request: NextRequest) {
  try {
    // 1. Get total confirmed inscriptions
    const totalInscriptions = await prisma.inscription.count({
      where: { status: 'confirmed' }
    });

    // 2. Calculate total supply minted
    const totalSupplyMinted = new Decimal(totalInscriptions).mul(TOKENS_PER_INSCRIPTION);

    // 3. Calculate remaining allocation
    const remainingAllocation = new Decimal(TOTAL_ALLOCATION).minus(totalSupplyMinted);

    // 4. Calculate allocation percentage
    const allocationPercentage = totalSupplyMinted
      .div(TOTAL_ALLOCATION)
      .mul(100)
      .toFixed(2);

    // 5. Get recent inscriptions (last 24 hours)
    const oneDayAgo = new Date(Date.now() - 24 * 60 * 60 * 1000);
    const inscriptions24h = await prisma.inscription.count({
      where: {
        status: 'confirmed',
        confirmedAt: {
          gte: oneDayAgo
        }
      }
    });

    // 6. Get inscription type breakdown
    const typeBreakdown = await prisma.inscription.groupBy({
      by: ['type'],
      where: { status: 'confirmed' },
      _count: true
    });

    const autoCount = typeBreakdown.find(t => t.type === 'auto')?._count || 0;
    const manualCount = typeBreakdown.find(t => t.type === 'manual')?._count || 0;

    // 7. Get total unique users
    const uniqueUsers = await prisma.inscription.findMany({
      where: { status: 'confirmed' },
      select: { userId: true },
      distinct: ['userId']
    });

    // 8. Return statistics
    return NextResponse.json({
      success: true,
      stats: {
        totalInscriptions,
        totalSupplyMinted: totalSupplyMinted.toString(),
        remainingAllocation: remainingAllocation.toString(),
        allocationPercentage: parseFloat(allocationPercentage),
        inscriptions24h,
        uniqueUsers: uniqueUsers.length,
        typeBreakdown: {
          auto: autoCount,
          manual: manualCount,
          autoPercentage: totalInscriptions > 0 
            ? ((autoCount / totalInscriptions) * 100).toFixed(2)
            : '0',
          manualPercentage: totalInscriptions > 0
            ? ((manualCount / totalInscriptions) * 100).toFixed(2)
            : '0'
        },
        allocation: {
          total: TOTAL_ALLOCATION,
          tokensPerInscription: TOKENS_PER_INSCRIPTION
        }
      }
    });

  } catch (error: any) {
    console.error('Stats API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch mining statistics',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
