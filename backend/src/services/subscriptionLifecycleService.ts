import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';
import { TenantSubscription } from '../models/tenantSubscription';
import { Tenant } from '../models/tenant';
import { NotificationLog } from '../models/notificationLog';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { sendNotification } from './notificationService';

let lastLifecycleRunRecord: {
  timestamp: string;
  scanned: number;
  remindersSent: number;
  gracePeriodSet: number;
  suspendedSet: number;
} | null = null;

/**
 * Core engine evaluating subscription expiration, renewal reminders, grace periods, and suspensions.
 * Completely idempotent and safe to run on cron or manual administrative trigger.
 */
export async function runSubscriptionLifecycleEvaluation() {
  const now = new Date();
  const subs = await TenantSubscription.findAll({
    where: {
      status: {
        [Op.in]: ['ACTIVE', 'PAST_DUE', 'TRIALING'],
      },
    },
    include: [{ model: Tenant }],
  });

  let remindersSent = 0;
  let gracePeriodSet = 0;
  let suspendedSet = 0;

  for (const sub of subs) {
    // Skip Root platform tenant (Grace Cabs primary fleet never expires)
    if (sub.tenantId === ROOT_TENANT_ID) continue;

    if (!sub.currentPeriodEnd) continue;

    const end = new Date(sub.currentPeriodEnd);
    const diffMs = end.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));
    const recipientEmail = sub.tenant?.contactEmail || 'admin@gracecabs.com';

    // 1. Two-day renewal reminder (diffDays <= 2 and diffDays >= 0)
    if (diffDays <= 2 && diffDays >= 0 && sub.status === 'ACTIVE') {
      // Check if reminder was already sent in last 48 hours for this period
      const recentReminder = await NotificationLog.findOne({
        where: {
          referenceId: sub.subscriptionId,
          templateCode: 'SUBSCRIPTION_RENEWAL_REMINDER',
          createdAt: {
            [Op.gt]: new Date(now.getTime() - 48 * 60 * 60 * 1000),
          },
        },
      });

      if (!recentReminder) {
        await sendNotification({
          channel: 'EMAIL',
          recipient: recipientEmail,
          templateCode: 'SUBSCRIPTION_RENEWAL_REMINDER',
          subject: `Reminder: Your Grace Cabs Fleet Subscription Renews in ${Math.max(1, diffDays)} Days`,
          body: `Dear Fleet Administrator,\n\nYour ${sub.planTier} fleet subscription is scheduled to expire on ${end.toDateString()} (in ${Math.max(1, diffDays)} days).\n\nPlease renew promptly to maintain uninterrupted dispatch operations, driver tracking, and billing services.\n\nRenew your plan online at: /admin/billing/checkout`,
          referenceEntity: 'SUBSCRIPTION',
          referenceId: sub.subscriptionId,
        });
        remindersSent++;
      }
    }

    // 2. Overdue: Expired within 1 to 3 days (Grace Period: Day 1, 2, 3)
    if (diffDays < 0 && diffDays >= -3) {
      if (sub.status !== 'PAST_DUE') {
        await sub.update({ status: 'PAST_DUE' });
        if (sub.tenant) {
          await sub.tenant.update({ status: 'PAST_DUE' });
        }
        gracePeriodSet++;

        await sendNotification({
          channel: 'EMAIL',
          recipient: recipientEmail,
          templateCode: 'SUBSCRIPTION_GRACE_PERIOD_NOTICE',
          subject: `Action Required: Your Fleet Subscription is Past Due (3-Day Grace Period)`,
          body: `Dear Fleet Administrator,\n\nYour subscription expired on ${end.toDateString()}. You have entered a 3-day grace period.\n\nPlease renew immediately to prevent suspension of your dispatching and booking operations.\n\nRenew now: /admin/billing/checkout`,
          referenceEntity: 'SUBSCRIPTION',
          referenceId: sub.subscriptionId,
        });
      }
    }

    // 3. Overdue 4+ Days: Full Operation Suspension (Day 4+)
    if (diffDays < -3) {
      if (sub.status !== 'SUSPENDED') {
        await sub.update({ status: 'SUSPENDED' });
        if (sub.tenant) {
          await sub.tenant.update({ status: 'SUSPENDED' });
        }
        suspendedSet++;

        await sendNotification({
          channel: 'EMAIL',
          recipient: recipientEmail,
          templateCode: 'SUBSCRIPTION_RESTRICTION_NOTICE',
          subject: `Suspension Notice: Fleet Dispatch Restricted Due to Unpaid Subscription`,
          body: `Dear Fleet Administrator,\n\nYour subscription has exceeded the 3-day grace period and is now SUSPENDED. New bookings and trip dispatches are currently restricted.\n\nYour account data and billing history remain accessible. Pay your invoice now to instantly restore full fleet operations.\n\nRestore access: /admin/billing/checkout`,
          referenceEntity: 'SUBSCRIPTION',
          referenceId: sub.subscriptionId,
        });
      }
    }
  }

  lastLifecycleRunRecord = {
    timestamp: now.toISOString(),
    scanned: subs.length,
    remindersSent,
    gracePeriodSet,
    suspendedSet,
  };

  return lastLifecycleRunRecord;
}

/**
 * Controller endpoint to manually run lifecycle check or inspect status.
 */
export const runLifecycleEvaluation = async (req: Request, res: Response) => {
  try {
    const report = await runSubscriptionLifecycleEvaluation();
    return res.status(200).json({
      success: true,
      message: 'Subscription lifecycle evaluation completed successfully.',
      report,
      summary: {
        remindersSent: report.remindersSent,
        gracePeriodNotices: report.gracePeriodSet,
        suspendedTenants: report.suspendedSet,
      },
    });
  } catch (error: any) {
    console.error('Error running lifecycle evaluation:', error);
    return res.status(500).json({ success: false, message: 'Internal Server Error' });
  }
};

/**
 * Controller endpoint to inspect last scheduler execution status.
 */
export const getLifecycleStatus = (req: Request, res: Response) => {
  return res.status(200).json({
    success: true,
    lastRun: lastLifecycleRunRecord,
  });
};

/**
 * Strict middleware enforcing active subscription status for restricted operations (dispatching, bookings).
 * Allows billing, payments, profile, and settings even when suspended so operator can self-service renew.
 */
export const requireActiveSubscription = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    // Platform SuperAdmin always bypasses
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const sub = await TenantSubscription.findOne({ where: { tenantId } });
    if (sub && sub.status === 'SUSPENDED') {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_SUSPENDED',
        status: sub.status,
        message: 'Your fleet subscription is currently suspended due to unpaid renewal. Please renew to resume trip dispatching.',
        renewalUrl: '/admin/billing/checkout',
      });
    }

    next();
  } catch (err) {
    next(err);
  }
};

let schedulerTimer: NodeJS.Timeout | null = null;

/**
 * Initializes automated in-process background scheduling for subscription lifecycles.
 * Executes automatically on server boot and repeats at the specified interval.
 */
export function startLifecycleBackgroundTimer(intervalHours = 6) {
  if (schedulerTimer) {
    return;
  }

  const intervalMs = Math.max(1, intervalHours) * 60 * 60 * 1000;
  console.log(`[LifecycleScheduler] In-process scheduler registered (interval: every ${intervalHours} hours).`);

  // Initial delayed evaluation 20s after boot to allow models to finish loading
  setTimeout(async () => {
    try {
      console.log('[LifecycleScheduler] Running startup subscription evaluation...');
      const result = await runSubscriptionLifecycleEvaluation();
      console.log(`[LifecycleScheduler] Startup evaluation complete: scanned ${result.scanned}, reminders sent: ${result.remindersSent}, grace periods: ${result.gracePeriodSet}, suspended: ${result.suspendedSet}`);
    } catch (err) {
      console.error('[LifecycleScheduler] Startup evaluation error:', err);
    }
  }, 20000);

  // Periodic timer
  schedulerTimer = setInterval(async () => {
    try {
      console.log('[LifecycleScheduler] Running periodic subscription evaluation...');
      const result = await runSubscriptionLifecycleEvaluation();
      console.log(`[LifecycleScheduler] Periodic evaluation complete: scanned ${result.scanned}, reminders sent: ${result.remindersSent}, grace periods: ${result.gracePeriodSet}, suspended: ${result.suspendedSet}`);
    } catch (err) {
      console.error('[LifecycleScheduler] Periodic evaluation error:', err);
    }
  }, intervalMs);
}

