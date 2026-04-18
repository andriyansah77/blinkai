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
    
    // 1. Authenticate user (support both Privy session and X-User-ID header for bots)
    let userId: string | null = null;
    
    // Check for X-User-ID header (for Telegram bot / API calls)
    const userIdHeader = request.headers.get('X-User-ID');
    if (userIdHeader) {
      // Verify API key for bot requests
      const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
      const platformApiKey = process.env.PLATFORM_API_KEY;
      
      if (apiKey && platformApiKey && apiKey === platformApiKey) {
        userId = userIdHeader;
        console.log(`[SimpleMint API] Bot request authenticated for user: ${userId}`);
      } else {
        console.log('[SimpleMint API] Invalid API key for bot request');
        return NextResponse.json(
          {
            success: false,
            error: 'Invalid API key'
          },
          { status: 401 }
        );
      }
    } else {
      // Regular Privy session authentication
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
      userId = session.user.id;
      console.log(`[SimpleMint API] User authenticated: ${userId}`);
    }

    // 2. Verify userId is not null
    if (!userId) {
      console.log('[SimpleMint API] User ID is null');
      return NextResponse.json(
        {
          success: false,
          error: 'User ID not found'
        },
        { status: 400 }
      );
    }

    // 3. Get request body
    const body = await request.json().catch(() => ({}));
    const type = body.type || 'manual';

    console.log(`[SimpleMint API] Minting type: ${type}`);

    // 4. Execute minting
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
