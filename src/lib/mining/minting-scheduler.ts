/**
 * Minting Scheduler Service
 * 
 * Manages recurring minting operations using cron jobs.
 * Features:
 * - Create recurring minting schedules
 * - Balance validation before execution
 * - Automatic pause on insufficient funds
 * - Schedule modification and cancellation
 * - Integration with Hermes cron system
 */

import cron from 'node-cron';
import { prisma } from '@/lib/prisma';
import { inscriptionEngine } from './inscription-engine';
import { usdBalanceManager } from './usd-balance-manager';
import Decimal from 'decimal.js';

// Store active cron jobs
const activeCronJobs = new Map<string, cron.ScheduledTask>();

export interface ScheduleConfig {
  userId: string;
  frequency: 'hourly' | 'daily' | 'weekly' | 'monthly' | 'custom';
  customCron?: string; // For custom frequency
  enabled: boolean;
  maxExecutions?: number; // Optional limit on total executions
  notifyOnPause?: boolean; // Send notification when paused
}

export interface ScheduleResult {
  success: boolean;
  scheduleId?: string;
  nextExecution?: Date;
  error?: string;
}

export class MintingScheduler {
  /**
   * Create a new minting schedule
   */
  async createSchedule(config: ScheduleConfig): Promise<ScheduleResult> {
    try {
      // Validate user has sufficient balance for at least one execution
      const hasBalance = await this.validateBalance(config.userId);
      if (!hasBalance) {
        return {
          success: false,
          error: 'Insufficient balance to create schedule. Please deposit funds first.'
        };
      }

      // Convert frequency to cron expression
      const cronExpression = this.frequencyToCron(config.frequency, config.customCron);
      if (!cronExpression) {
        return {
          success: false,
          error: 'Invalid frequency or cron expression'
        };
      }

      // Validate cron expression
      if (!cron.validate(cronExpression)) {
        return {
          success: false,
          error: 'Invalid cron expression'
        };
      }

      // Create schedule in database
      const schedule = await prisma.inscriptionSchedule.create({
        data: {
          userId: config.userId,
          frequency: config.frequency,
          cronExpression,
          enabled: config.enabled,
          maxExecutions: config.maxExecutions,
          executionCount: 0,
          lastExecution: null,
          nextExecution: this.getNextExecutionTime(cronExpression),
          notifyOnPause: config.notifyOnPause ?? true
        }
      });

      // Start cron job if enabled
      if (config.enabled) {
        await this.startCronJob(schedule.id, cronExpression, config.userId);
      }

      return {
        success: true,
        scheduleId: schedule.id,
        nextExecution: schedule.nextExecution || undefined
      };

    } catch (error: any) {
      console.error('Failed to create schedule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Update an existing schedule
   */
  async updateSchedule(
    scheduleId: string,
    updates: Partial<ScheduleConfig>
  ): Promise<ScheduleResult> {
    try {
      const schedule = await prisma.inscriptionSchedule.findUnique({
        where: { id: scheduleId }
      });

      if (!schedule) {
        return {
          success: false,
          error: 'Schedule not found'
        };
      }

      // Prepare update data
      const updateData: any = {};

      if (updates.frequency !== undefined) {
        updateData.frequency = updates.frequency;
        updateData.cronExpression = this.frequencyToCron(
          updates.frequency,
          updates.customCron
        );
      }

      if (updates.enabled !== undefined) {
        updateData.enabled = updates.enabled;
      }

      if (updates.maxExecutions !== undefined) {
        updateData.maxExecutions = updates.maxExecutions;
      }

      if (updates.notifyOnPause !== undefined) {
        updateData.notifyOnPause = updates.notifyOnPause;
      }

      // Update next execution time if cron changed
      if (updateData.cronExpression) {
        updateData.nextExecution = this.getNextExecutionTime(updateData.cronExpression);
      }

      // Update in database
      const updatedSchedule = await prisma.inscriptionSchedule.update({
        where: { id: scheduleId },
        data: updateData
      });

      // Restart cron job if enabled
      this.stopCronJob(scheduleId);
      if (updatedSchedule.enabled) {
        await this.startCronJob(
          scheduleId,
          updatedSchedule.cronExpression,
          updatedSchedule.userId
        );
      }

      return {
        success: true,
        scheduleId: updatedSchedule.id,
        nextExecution: updatedSchedule.nextExecution || undefined
      };

    } catch (error: any) {
      console.error('Failed to update schedule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Delete a schedule
   */
  async deleteSchedule(scheduleId: string): Promise<{ success: boolean; error?: string }> {
    try {
      // Stop cron job
      this.stopCronJob(scheduleId);

      // Delete from database
      await prisma.inscriptionSchedule.delete({
        where: { id: scheduleId }
      });

      return { success: true };

    } catch (error: any) {
      console.error('Failed to delete schedule:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  /**
   * Get user's schedules
   */
  async getUserSchedules(userId: string) {
    try {
      const schedules = await prisma.inscriptionSchedule.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' }
      });

      return {
        success: true,
        schedules
      };

    } catch (error: any) {
      console.error('Failed to get schedules:', error);
      return {
        success: false,
        error: error.message,
        schedules: []
      };
    }
  }

  /**
   * Pause a schedule (set enabled to false)
   */
  async pauseSchedule(scheduleId: string, reason?: string): Promise<{ success: boolean }> {
    try {
      await prisma.inscriptionSchedule.update({
        where: { id: scheduleId },
        data: {
          enabled: false,
          pauseReason: reason
        }
      });

      this.stopCronJob(scheduleId);

      return { success: true };

    } catch (error) {
      console.error('Failed to pause schedule:', error);
      return { success: false };
    }
  }

  /**
   * Resume a paused schedule
   */
  async resumeSchedule(scheduleId: string): Promise<{ success: boolean }> {
    try {
      const schedule = await prisma.inscriptionSchedule.findUnique({
        where: { id: scheduleId }
      });

      if (!schedule) {
        return { success: false };
      }

      // Validate balance before resuming
      const hasBalance = await this.validateBalance(schedule.userId);
      if (!hasBalance) {
        return { success: false };
      }

      await prisma.inscriptionSchedule.update({
        where: { id: scheduleId },
        data: {
          enabled: true,
          pauseReason: null
        }
      });

      await this.startCronJob(scheduleId, schedule.cronExpression, schedule.userId);

      return { success: true };

    } catch (error) {
      console.error('Failed to resume schedule:', error);
      return { success: false };
    }
  }

  /**
   * Execute scheduled minting
   */
  private async executeScheduledMinting(scheduleId: string, userId: string): Promise<void> {
    try {
      const schedule = await prisma.inscriptionSchedule.findUnique({
        where: { id: scheduleId }
      });

      if (!schedule || !schedule.enabled) {
        return;
      }

      // Check if max executions reached
      if (schedule.maxExecutions && schedule.executionCount >= schedule.maxExecutions) {
        await this.pauseSchedule(scheduleId, 'Maximum executions reached');
        return;
      }

      // Validate balance
      const hasBalance = await this.validateBalance(userId);
      if (!hasBalance) {
        await this.pauseSchedule(scheduleId, 'Insufficient balance');
        
        // Send notification if enabled
        if (schedule.notifyOnPause) {
          await this.sendPauseNotification(userId, scheduleId, 'Insufficient balance');
        }
        return;
      }

      // Execute minting (auto type for scheduled minting)
      const result = await inscriptionEngine.executeInscription(userId, 'auto');

      // Update schedule
      await prisma.inscriptionSchedule.update({
        where: { id: scheduleId },
        data: {
          executionCount: { increment: 1 },
          lastExecution: new Date(),
          nextExecution: this.getNextExecutionTime(schedule.cronExpression),
          lastExecutionStatus: result.success ? 'success' : 'failed'
        }
      });

      console.log(`Scheduled minting executed for user ${userId}: ${result.success ? 'success' : 'failed'}`);

    } catch (error) {
      console.error('Failed to execute scheduled minting:', error);
    }
  }

  /**
   * Start cron job for a schedule
   */
  private async startCronJob(scheduleId: string, cronExpression: string, userId: string): Promise<void> {
    try {
      // Stop existing job if any
      this.stopCronJob(scheduleId);

      // Create new cron job
      const task = cron.schedule(cronExpression, async () => {
        await this.executeScheduledMinting(scheduleId, userId);
      });

      // Store in active jobs
      activeCronJobs.set(scheduleId, task);

      console.log(`Started cron job for schedule ${scheduleId}: ${cronExpression}`);

    } catch (error) {
      console.error('Failed to start cron job:', error);
    }
  }

  /**
   * Stop cron job for a schedule
   */
  private stopCronJob(scheduleId: string): void {
    const task = activeCronJobs.get(scheduleId);
    if (task) {
      task.stop();
      activeCronJobs.delete(scheduleId);
      console.log(`Stopped cron job for schedule ${scheduleId}`);
    }
  }

  /**
   * Validate user has sufficient balance for minting
   */
  private async validateBalance(userId: string): Promise<boolean> {
    try {
      // Auto minting costs 0.5 PATHUSD + gas (estimate 0.001)
      const requiredAmount = new Decimal('0.501');
      return await usdBalanceManager.hasSufficientBalance(userId, requiredAmount.toString());
    } catch (error) {
      console.error('Failed to validate balance:', error);
      return false;
    }
  }

  /**
   * Convert frequency to cron expression
   */
  private frequencyToCron(frequency: string, customCron?: string): string | null {
    switch (frequency) {
      case 'hourly':
        return '0 * * * *'; // Every hour at minute 0
      case 'daily':
        return '0 0 * * *'; // Every day at midnight
      case 'weekly':
        return '0 0 * * 0'; // Every Sunday at midnight
      case 'monthly':
        return '0 0 1 * *'; // First day of month at midnight
      case 'custom':
        return customCron || null;
      default:
        return null;
    }
  }

  /**
   * Get next execution time from cron expression
   */
  private getNextExecutionTime(cronExpression: string): Date {
    // Simple implementation - in production, use a proper cron parser
    // For now, return 1 hour from now
    return new Date(Date.now() + 60 * 60 * 1000);
  }

  /**
   * Send notification when schedule is paused
   */
  private async sendPauseNotification(
    userId: string,
    scheduleId: string,
    reason: string
  ): Promise<void> {
    try {
      // TODO: Implement notification system (email, push, etc.)
      console.log(`Notification: Schedule ${scheduleId} paused for user ${userId}. Reason: ${reason}`);
      
      // For now, just log. In production, integrate with notification service
    } catch (error) {
      console.error('Failed to send pause notification:', error);
    }
  }

  /**
   * Initialize scheduler - load and start all enabled schedules
   */
  async initialize(): Promise<void> {
    try {
      const enabledSchedules = await prisma.inscriptionSchedule.findMany({
        where: { enabled: true }
      });

      for (const schedule of enabledSchedules) {
        await this.startCronJob(
          schedule.id,
          schedule.cronExpression,
          schedule.userId
        );
      }

      console.log(`Initialized ${enabledSchedules.length} active schedules`);

    } catch (error) {
      console.error('Failed to initialize scheduler:', error);
    }
  }

  /**
   * Shutdown scheduler - stop all cron jobs
   */
  shutdown(): void {
    activeCronJobs.forEach((task, scheduleId) => {
      task.stop();
      console.log(`Stopped cron job for schedule ${scheduleId}`);
    });
    activeCronJobs.clear();
  }
}

// Export singleton instance
export const mintingScheduler = new MintingScheduler();

// Initialize on module load
mintingScheduler.initialize().catch(error => {
  console.error('Failed to initialize minting scheduler:', error);
});

// Graceful shutdown
process.on('SIGTERM', () => {
  console.log('SIGTERM received, shutting down scheduler...');
  mintingScheduler.shutdown();
});

process.on('SIGINT', () => {
  console.log('SIGINT received, shutting down scheduler...');
  mintingScheduler.shutdown();
});
