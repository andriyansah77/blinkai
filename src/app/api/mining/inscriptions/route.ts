/**
 * GET /api/mining/inscriptions
 * Get inscription history for authenticated user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { prisma } from '@/lib/prisma';
import Decimal from 'decimal.js';

export async function GET(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: { code: 'UNAUTHORIZED', message: 'Authentication required' } },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Parse query parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status'); // pending, confirmed, failed

    // 3. Build query filter
    const where: any = { userId };
    if (status) {
      where.status = status;
    }

    // 4. Get inscriptions
    const [inscriptions, total] = await Promise.all([
      prisma.inscription.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        take: limit,
        skip: offset,
        select: {
          id: true,
          type: true,
          status: true,
          inscriptionFee: true,
          gasFee: true,
          gasEstimate: true,
          txHash: true,
          blockNumber: true,
          confirmations: true,
          tokensEarned: true,
          errorMessage: true,
          refunded: true,
          createdAt: true,
          confirmedAt: true
        }
      }),
      prisma.inscription.count({ where })
    ]);

    // 5. Calculate statistics manually (since fields are String type)
    const confirmedInscriptions = await prisma.inscription.findMany({
      where: { userId, status: 'confirmed' },
      select: {
        tokensEarned: true,
        inscriptionFee: true,
        gasFee: true
      }
    });

    let totalTokensEarned = new Decimal(0);
    let totalFeesPaid = new Decimal(0);

    for (const inscription of confirmedInscriptions) {
      totalTokensEarned = totalTokensEarned.plus(inscription.tokensEarned);
      totalFeesPaid = totalFeesPaid
        .plus(inscription.inscriptionFee)
        .plus(inscription.gasFee || '0');
    }

    // 6. Return response
    return NextResponse.json({
      success: true,
      inscriptions: inscriptions.map(i => ({
        id: i.id,
        type: i.type,
        status: i.status,
        inscriptionFee: i.inscriptionFee,
        gasFee: i.gasFee,
        gasEstimate: i.gasEstimate,
        txHash: i.txHash,
        blockNumber: i.blockNumber,
        confirmations: i.confirmations,
        tokensEarned: i.tokensEarned,
        errorMessage: i.errorMessage,
        refunded: i.refunded,
        createdAt: i.createdAt.toISOString(),
        confirmedAt: i.confirmedAt?.toISOString() || null
      })),
      pagination: {
        total,
        limit,
        offset,
        hasMore: offset + limit < total
      },
      stats: {
        totalInscriptions: confirmedInscriptions.length,
        totalTokensEarned: totalTokensEarned.toString(),
        totalFeesPaid: totalFeesPaid.toString()
      }
    });

  } catch (error: any) {
    console.error('Get inscriptions API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'An unexpected error occurred',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
