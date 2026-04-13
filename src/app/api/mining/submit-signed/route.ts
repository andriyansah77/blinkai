/**
 * POST /api/mining/submit-signed
 * Submit signed transaction from client
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inscriptionEngine } from '@/lib/mining/inscription-engine';
import { prisma } from '@/lib/prisma';
import { ethers } from 'ethers';

export async function POST(request: NextRequest) {
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

    // 2. Parse request body
    const body = await request.json();
    const { inscriptionId, signedTransaction } = body;

    if (!inscriptionId || !signedTransaction) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_PARAMETERS',
            message: 'inscriptionId and signedTransaction are required'
          }
        },
        { status: 400 }
      );
    }

    // 3. Verify inscription belongs to user
    const inscription = await prisma.inscription.findUnique({
      where: { id: inscriptionId }
    });

    if (!inscription || inscription.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_INSCRIPTION',
            message: 'Inscription not found or does not belong to user'
          }
        },
        { status: 404 }
      );
    }

    if (inscription.status !== 'pending_signature') {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_STATUS',
            message: `Inscription status is ${inscription.status}, expected pending_signature`
          }
        },
        { status: 400 }
      );
    }

    // 4. Submit signed transaction to blockchain
    const provider = new ethers.JsonRpcProvider(
      process.env.TEMPO_RPC_URL || 'https://rpc.tempo.xyz'
    );

    const txResponse = await provider.broadcastTransaction(signedTransaction);
    const txHash = txResponse.hash;

    // 5. Update inscription with tx hash
    await prisma.inscription.update({
      where: { id: inscriptionId },
      data: {
        txHash,
        status: 'pending',
        errorMessage: null
      }
    });

    // 6. Start monitoring transaction (async)
    inscriptionEngine.monitorTransaction(txHash, inscriptionId, userId).catch(error => {
      console.error('Transaction monitoring failed:', error);
    });

    return NextResponse.json({
      success: true,
      inscriptionId,
      txHash,
      message: 'Transaction submitted successfully',
      explorerUrl: `https://explore.tempo.xyz/tx/${txHash}`
    });

  } catch (error: any) {
    console.error('Submit signed transaction error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'SUBMISSION_FAILED',
          message: error.message || 'Failed to submit transaction',
          details: process.env.NODE_ENV === 'development' ? error.stack : undefined
        }
      },
      { status: 500 }
    );
  }
}
