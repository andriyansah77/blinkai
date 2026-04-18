/**
 * POST /api/mining/simple-mint
 * Simple minting endpoint - server-side signing only
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { simpleMintingEngine } from '@/lib/mining/simple-minting-engine';

export async function POST(request: NextRequest) {
  try {
    console.log('[SimpleMint API] Request received');
    
    // 1. Authenticate user
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      console.log('[SimpleMint API] Unauthorized - no session');
      return NextResponse.json(
        {
          success: false,
          error: 'Authentication required'
        },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    console.log(`[SimpleMint API] User authenticated: ${userId}`);

    // 2. Get request body
    const body = await request.json().catch(() => ({}));
    const type = body.type || 'manual';

    console.log(`[SimpleMint API] Minting type: ${type}`);

    // 3. Execute minting
    const result = await simpleMintingEngine.mint(userId, type);

    console.log(`[SimpleMint API] Minting result:`, result);

    if (result.success) {
      return NextResponse.json({
        success: true,
        inscriptionId: result.inscriptionId,
        txHash: result.txHash,
        tokensEarned: result.tokensEarned,
        message: 'Transaction submitted successfully'
      });
    } else {
      return NextResponse.json(
        {
          success: false,
          error: result.error
        },
        { status: 400 }
      );
    }

  } catch (error: any) {
    console.error('[SimpleMint API] Error:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Minting failed'
      },
      { status: 500 }
    );
  }
}
