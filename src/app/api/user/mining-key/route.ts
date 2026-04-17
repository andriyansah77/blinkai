/**
 * GET /api/user/mining-key
 * Get or create user's mining API key for AI agent access
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';
import crypto from 'crypto';

export async function GET(request: NextRequest) {
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

    // 2. Get or create API key config
    let apiKeyConfig = await prisma.apiKeyConfig.findUnique({
      where: { userId },
      select: {
        miningApiKey: true,
        mode: true,
      }
    });

    // 3. If no API key exists, create one
    if (!apiKeyConfig || !apiKeyConfig.miningApiKey) {
      const newApiKey = `rgt_${crypto.randomBytes(32).toString('hex')}`;
      
      apiKeyConfig = await prisma.apiKeyConfig.upsert({
        where: { userId },
        create: {
          userId,
          miningApiKey: newApiKey,
          mode: 'platform',
        },
        update: {
          miningApiKey: newApiKey,
        },
        select: {
          miningApiKey: true,
          mode: true,
        }
      });
    }

    // 4. Return API key
    return NextResponse.json({
      success: true,
      apiKey: apiKeyConfig.miningApiKey,
      mode: apiKeyConfig.mode,
      usage: {
        description: "Use this API key to allow your AI agent to mint REAGENT tokens",
        environment_variable: "REAGENT_API_KEY",
        example: `export REAGENT_API_KEY="${apiKeyConfig.miningApiKey}"`
      }
    });

  } catch (error: any) {
    console.error('Mining key API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to get mining API key',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/user/mining-key
 * Regenerate user's mining API key
 */
export async function POST(request: NextRequest) {
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

    // 2. Generate new API key
    const newApiKey = `rgt_${crypto.randomBytes(32).toString('hex')}`;

    // 3. Update API key
    await prisma.apiKeyConfig.upsert({
      where: { userId },
      create: {
        userId,
        miningApiKey: newApiKey,
        mode: 'platform',
      },
      update: {
        miningApiKey: newApiKey,
      }
    });

    // 4. Return new API key
    return NextResponse.json({
      success: true,
      apiKey: newApiKey,
      message: 'API key regenerated successfully. Update your AI agent configuration.'
    });

  } catch (error: any) {
    console.error('Mining key regeneration error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to regenerate mining API key',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
