/**
 * POST /api/mining/inscribe
 * Execute manual inscription
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import { inscriptionEngine } from '@/lib/mining/inscription-engine';
import { prisma } from '@/lib/prisma';

// Rate limiting: 10 inscriptions per hour
const RATE_LIMIT_WINDOW = 60 * 60 * 1000; // 1 hour in ms
const RATE_LIMIT_MAX = 10;

interface RateLimitEntry {
  count: number;
  resetAt: number;
}

// In-memory rate limit store (use Redis in production)
const rateLimitStore = new Map<string, RateLimitEntry>();

function checkRateLimit(userId: string): { allowed: boolean; remaining: number; resetAt: number } {
  const now = Date.now();
  const entry = rateLimitStore.get(userId);

  if (!entry || now >= entry.resetAt) {
    // Create new entry
    const newEntry: RateLimitEntry = {
      count: 1,
      resetAt: now + RATE_LIMIT_WINDOW
    };
    rateLimitStore.set(userId, newEntry);
    return {
      allowed: true,
      remaining: RATE_LIMIT_MAX - 1,
      resetAt: newEntry.resetAt
    };
  }

  if (entry.count >= RATE_LIMIT_MAX) {
    return {
      allowed: false,
      remaining: 0,
      resetAt: entry.resetAt
    };
  }

  entry.count++;
  return {
    allowed: true,
    remaining: RATE_LIMIT_MAX - entry.count,
    resetAt: entry.resetAt
  };
}

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

    // 2. Check rate limit
    const rateLimit = checkRateLimit(userId);
    if (!rateLimit.allowed) {
      const resetDate = new Date(rateLimit.resetAt);
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'RATE_LIMIT_EXCEEDED',
            message: `Rate limit exceeded. Maximum ${RATE_LIMIT_MAX} inscriptions per hour. Try again after ${resetDate.toLocaleTimeString()}.`,
            resetAt: resetDate.toISOString()
          }
        },
        { status: 429 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const { confirm } = body;

    if (!confirm) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'CONFIRMATION_REQUIRED',
            message: 'Please confirm the inscription by setting confirm: true'
          }
        },
        { status: 400 }
      );
    }

    // 4. Execute inscription
    const result = await inscriptionEngine.executeInscription(userId, 'manual');

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INSCRIPTION_FAILED',
            message: result.error || 'Inscription failed'
          }
        },
        { status: 400 }
      );
    }

    // 5. Return success response
    return NextResponse.json({
      success: true,
      inscriptionId: result.inscriptionId,
      txHash: result.txHash,
      tokensEarned: result.tokensEarned,
      feePaid: result.feePaid,
      rateLimit: {
        remaining: rateLimit.remaining,
        resetAt: new Date(rateLimit.resetAt).toISOString()
      }
    });

  } catch (error: any) {
    console.error('Inscription API error:', error);
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
