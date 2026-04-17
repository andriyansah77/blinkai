/**
 * DELETE /api/wallet/delete
 * Delete old wallet to allow creating new one
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';

export async function DELETE(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'UNAUTHORIZED',
            message: 'Authentication required'
          }
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Delete wallet and related data
    await prisma.$transaction(async (tx) => {
      // Delete USD balance
      await tx.usdBalance.deleteMany({
        where: { userId }
      });

      // Delete inscriptions
      await tx.inscription.deleteMany({
        where: { userId }
      });

      // Delete wallet
      await tx.wallet.delete({
        where: { userId }
      });
    });

    console.log(`[Wallet Delete] Deleted wallet for user ${userId}`);

    return NextResponse.json({
      success: true,
      message: 'Wallet deleted successfully'
    });

  } catch (error: any) {
    console.error('[Wallet Delete] Error:', error);
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'WALLET_NOT_FOUND',
            message: 'Wallet not found'
          }
        },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete wallet',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
