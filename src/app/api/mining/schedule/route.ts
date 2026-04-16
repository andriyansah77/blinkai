/**
 * POST /api/mining/schedule - Create minting schedule
 * GET /api/mining/schedules - Get user's schedules
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { mintingScheduler } from '@/lib/mining/minting-scheduler';

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

    // 2. Parse request body
    const body = await request.json();
    const {
      frequency,
      customCron,
      enabled = true,
      maxExecutions,
      notifyOnPause = true
    } = body;

    // 3. Validate frequency
    const validFrequencies = ['hourly', 'daily', 'weekly', 'monthly', 'custom'];
    if (!frequency || !validFrequencies.includes(frequency)) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'INVALID_FREQUENCY',
            message: 'Invalid frequency. Must be one of: hourly, daily, weekly, monthly, custom'
          }
        },
        { status: 400 }
      );
    }

    // 4. Validate custom cron if frequency is custom
    if (frequency === 'custom' && !customCron) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'MISSING_CRON',
            message: 'Custom cron expression is required when frequency is "custom"'
          }
        },
        { status: 400 }
      );
    }

    // 5. Create schedule
    const result = await mintingScheduler.createSchedule({
      userId,
      frequency,
      customCron,
      enabled,
      maxExecutions,
      notifyOnPause
    });

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCHEDULE_CREATION_FAILED',
            message: result.error || 'Failed to create schedule'
          }
        },
        { status: 400 }
      );
    }

    // 6. Return success
    return NextResponse.json({
      success: true,
      scheduleId: result.scheduleId,
      nextExecution: result.nextExecution,
      message: 'Schedule created successfully'
    });

  } catch (error: any) {
    console.error('Schedule creation error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to create schedule',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}

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

    // 2. Get user's schedules
    const result = await mintingScheduler.getUserSchedules(userId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FETCH_FAILED',
            message: result.error || 'Failed to fetch schedules'
          }
        },
        { status: 500 }
      );
    }

    // 3. Return schedules
    return NextResponse.json({
      success: true,
      schedules: result.schedules
    });

  } catch (error: any) {
    console.error('Fetch schedules error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to fetch schedules',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
