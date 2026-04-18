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

    // Find user by Telegram ID in TelegramLink table
    const telegramLink = await prisma.telegramLink.findUnique({
      where: {
        telegramUserId: telegramId
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

    if (!telegramLink || !telegramLink.user) {
      return NextResponse.json(
        { success: false, error: 'User not found. Please link your Telegram account first by sending /start to the bot.' },
        { status: 404 }
      );
    }

    if (!telegramLink.active) {
      return NextResponse.json(
        { success: false, error: 'Telegram link is inactive' },
        { status: 403 }
      );
    }

    return NextResponse.json({
      success: true,
      userId: telegramLink.user.id,
      email: telegramLink.user.email,
      name: telegramLink.user.name,
      createdAt: telegramLink.user.createdAt
    });

  } catch (error: any) {
    console.error('[Telegram User API] Error:', error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
