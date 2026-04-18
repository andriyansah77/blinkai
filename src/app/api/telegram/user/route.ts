/**
 * GET /api/telegram/user
 * Get user info by Telegram ID for bot integration
 */

import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const telegramId = searchParams.get('telegram_id');

    if (!telegramId) {
      return NextResponse.json(
        { success: false, error: 'telegram_id required' },
        { status: 400 }
      );
    }

    // Find user by Telegram ID in channels
    const channel = await prisma.channel.findFirst({
      where: {
        type: 'telegram',
        config: {
          path: ['telegram_user_id'],
          equals: telegramId
        }
      },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            createdAt: true
          }
        }
      }
    });

    if (!channel || !channel.user) {
      return NextResponse.json(
        { success: false, error: 'User not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: channel.user.id,
      email: channel.user.email,
      name: channel.user.name,
      createdAt: channel.user.createdAt
    });

  } catch (error: any) {
    console.error('[Telegram User API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
