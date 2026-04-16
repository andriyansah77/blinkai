/**
 * PATCH /api/mining/schedule/:id - Update schedule
 * DELETE /api/mining/schedule/:id - Delete schedule
 */

import { NextRequest, NextResponse } from 'next/server';
import { getPrivySession } from "@/lib/privy-server";
import { mintingScheduler } from '@/lib/mining/minting-scheduler';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const scheduleId = params.id;

    // 2. Verify schedule ownership
    const schedule = await prisma.inscriptionSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCHEDULE_NOT_FOUND',
            message: 'Schedule not found'
          }
        },
        { status: 404 }
      );
    }

    if (schedule.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to update this schedule'
          }
        },
        { status: 403 }
      );
    }

    // 3. Parse request body
    const body = await request.json();
    const {
      frequency,
      customCron,
      enabled,
      maxExecutions,
      notifyOnPause
    } = body;

    // 4. Update schedule
    const result = await mintingScheduler.updateSchedule(scheduleId, {
      userId, // Include userId for validation
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
            code: 'UPDATE_FAILED',
            message: result.error || 'Failed to update schedule'
          }
        },
        { status: 400 }
      );
    }

    // 5. Return success
    return NextResponse.json({
      success: true,
      scheduleId: result.scheduleId,
      nextExecution: result.nextExecution,
      message: 'Schedule updated successfully'
    });

  } catch (error: any) {
    console.error('Schedule update error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to update schedule',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
    const scheduleId = params.id;

    // 2. Verify schedule ownership
    const schedule = await prisma.inscriptionSchedule.findUnique({
      where: { id: scheduleId }
    });

    if (!schedule) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SCHEDULE_NOT_FOUND',
            message: 'Schedule not found'
          }
        },
        { status: 404 }
      );
    }

    if (schedule.userId !== userId) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: 'You do not have permission to delete this schedule'
          }
        },
        { status: 403 }
      );
    }

    // 3. Delete schedule
    const result = await mintingScheduler.deleteSchedule(scheduleId);

    if (!result.success) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'DELETE_FAILED',
            message: result.error || 'Failed to delete schedule'
          }
        },
        { status: 400 }
      );
    }

    // 4. Return success
    return NextResponse.json({
      success: true,
      message: 'Schedule deleted successfully'
    });

  } catch (error: any) {
    console.error('Schedule deletion error:', error);
    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'INTERNAL_ERROR',
          message: 'Failed to delete schedule',
          details: process.env.NODE_ENV === 'development' ? error.message : undefined
        }
      },
      { status: 500 }
    );
  }
}
