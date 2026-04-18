/**
 * POST /api/mining/mine-chat
 * Auto mine REAGENT tokens from chat using MetaMask
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { inscriptionEngine } from '@/lib/mining/inscription-engine';

export async function POST(request: NextRequest) {
  try {
    // 1. Authenticate user
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // 2. Execute inscription (will return unsigned tx for MetaMask)
    const result = await inscriptionEngine.executeInscription(
      userId,
      'auto', // Type is auto for chat mining
      false   // Don't force client signing
    );

    return NextResponse.json(result);

  } catch (error: any) {
    console.error('Mine chat API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to mine tokens'
      },
      { status: 500 }
    );
  }
}
