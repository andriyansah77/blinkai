/**
 * POST /api/telegram/link
 * Link Telegram account to platform user
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from '@/lib/privy-server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  try {
    // Authenticate user (support both Privy session and API key)
    let userId: string | null = null;
    
    // Check for X-User-ID header (for bot requests)
    const userIdHeader = request.headers.get('X-User-ID');
    if (userIdHeader) {
      const apiKey = request.headers.get('Authorization')?.replace('Bearer ', '');
      const platformApiKey = process.env.PLATFORM_API_KEY;
      
      if (apiKey && platformApiKey && apiKey === platformApiKey) {
        userId = userIdHeader;
      } else {
        return NextResponse.json(
          { success: false, error: 'Invalid API key' },
          { status: 401 }
        );
      }
    } else {
      // Regular Privy session authentication
      const session = await getPrivySession(request);
      if (!session?.user?.id) {
        return NextResponse.json(
          { success: false, error: 'Authentication required' },
          { status: 401 }
        );
      }
      userId = session.user.id;
    }

    // Get request body
    const body = await request.json();
    const { telegramUserId, telegramUsername, telegramFirstName, telegramLastName } = body;

    if (!telegramUserId) {
      return NextResponse.json(
        { success: false, error: 'telegramUserId required' },
        { status: 400 }
      );
    }

    // Check if Telegram ID is already linked to another user
    const existingLink = await prisma.telegramLink.findUnique({
      where: { telegramUserId }
    });

    if (existingLink && existingLink.userId !== userId) {
      return NextResponse.json(
        { success: false, error: 'This Telegram account is already linked to another user' },
        { status: 409 }
      );
    }

    // Create or update link
    const telegramLink = await prisma.telegramLink.upsert({
      where: { userId },
      create: {
        userId,
        telegramUserId,
        telegramUsername,
        telegramFirstName,
        telegramLastName,
        active: true
      },
      update: {
        telegramUserId,
        telegramUsername,
        telegramFirstName,
        telegramLastName,
        active: true,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account linked successfully',
      telegramLink: {
        id: telegramLink.id,
        telegramUserId: telegramLink.telegramUserId,
        telegramUsername: telegramLink.telegramUsername
      }
    });

  } catch (error: any) {
    console.error('[Telegram Link API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/telegram/link
 * Unlink Telegram account
 */
export async function DELETE(request: NextRequest) {
  try {
    const session = await getPrivySession(request);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    const userId = session.user.id;

    // Deactivate link
    await prisma.telegramLink.updateMany({
      where: { userId },
      data: { active: false }
    });

    return NextResponse.json({
      success: true,
      message: 'Telegram account unlinked successfully'
    });

  } catch (error: any) {
    console.error('[Telegram Unlink API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
