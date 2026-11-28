import { Request, Response, NextFunction } from 'express';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { TenantSubscription } from '../models/tenantSubscription';
import { SubscriptionInvoice } from '../models/subscriptionInvoice';
import { TrialExtensionRequest } from '../models/trialExtensionRequest';
import { PLAN_CATALOG, getOrCreateSubscription } from '../services/quotaService';

export interface SubscriptionLockEvaluation {
  isLocked: boolean;
  lockReason: 'NONE' | 'PAYMENT_PENDING' | 'EXPIRED' | 'SUSPENDED' | 'TRIAL_EXPIRED';
  subscriptionStatus: string;
  planTier: 'BASIC' | 'PRO' | 'ENTERPRISE' | 'FREE_TRIAL' | null;
  billingCycle: 'MONTHLY' | 'ANNUAL';
  payableAmount: number;
  baseAmount: number;
  taxAmount: number;
  currency: string;
  periodEnd?: Date | null;
  message: string;
  availablePlans?: Array<{
    planTier: string;
    name: string;
    priceMonthlyINR: number;
    priceAnnualINR: number;
    gstPercent: number;
  }>;
  trialDetails?: {
    trialStatus: string;
    originalTrialDays: number;
    extendedTrialDays: number;
    totalTrialDays: number;
    trialStartDate?: Date | null;
    originalTrialExpiry?: Date | null;
    currentTrialExpiry?: Date | null;
    remainingDays: number;
    remainingMs: number;
    trialExtensionHistory?: any[];
    latestExtensionRequest?: any;
    pendingExtensionRequest?: any;
    isDemo?: boolean;
  };
}

/**
 * Authoritative evaluation of a tenant's subscription lock status.
 * Evaluates:
 * Case A — Active & Paid & Within Validity: Unlocked
 * Case B — Active 7-Day Free Trial (TRIALING and within trial period): Unlocked
 * Case C — Free Trial Expired (TRIALING and past trial period): Locked
 * Case D — Subscription Expired (PAST_DUE or past periodEnd): Locked
 * Case E — Suspended / Cancelled: Locked
 */
export async function evaluateTenantSubscriptionLock(
  tenantId: string,
  isPlatformSuperAdmin = false
): Promise<SubscriptionLockEvaluation> {
  // Demo preview session is always non-locked in preview mode
  if (tenantId === 'demo-tenant') {
    return {
      isLocked: false,
      lockReason: 'NONE',
      subscriptionStatus: 'DEMO_PREVIEW',
      planTier: 'PRO',
      billingCycle: 'MONTHLY',
      payableAmount: 0,
      baseAmount: 0,
      taxAmount: 0,
      currency: 'INR',
      periodEnd: null,
      message: 'Demo preview mode is active.',
      trialDetails: {
        trialStatus: 'DEMO_PREVIEW',
        originalTrialDays: 7,
        extendedTrialDays: 0,
        totalTrialDays: 7,
        remainingDays: 7,
        remainingMs: 7 * 24 * 60 * 60 * 1000,
        isDemo: true,
      },
    };
  }

  // SuperAdmin and ROOT platform tenant are NEVER locked
  if (isPlatformSuperAdmin || tenantId === ROOT_TENANT_ID) {
    return {
      isLocked: false,
      lockReason: 'NONE',
      subscriptionStatus: 'ACTIVE',
      planTier: 'ENTERPRISE',
      billingCycle: 'ANNUAL',
      payableAmount: 0,
      baseAmount: 0,
      taxAmount: 0,
      currency: 'INR',
      periodEnd: null,
      message: 'Platform administrator has unrestricted access.',
    };
  }

  const sub = await getOrCreateSubscription(tenantId);
  const isPaidTier = Boolean(sub.planTier && ['BASIC', 'PRO', 'ENTERPRISE'].includes(sub.planTier));
  const planTier = (isPaidTier ? sub.planTier! : 'BASIC') as 'BASIC' | 'PRO' | 'ENTERPRISE';
  const plan = PLAN_CATALOG[planTier] || PLAN_CATALOG.BASIC;
  const billingCycle = (sub.billingCycle === 'ANNUAL' ? 'ANNUAL' : 'MONTHLY') as 'MONTHLY' | 'ANNUAL';

  const rawBase = billingCycle === 'ANNUAL'
    ? (plan.priceAnnualINR || Math.round(plan.priceMonthlyINR * 12 * 0.85))
    : (sub.agreedPrice || plan.priceMonthlyINR);
  const baseAmount = Number(rawBase) || 349;

  // 18% GST (CGST 9% + SGST 9%)
  const taxAmount = Math.round(baseAmount * 0.18 * 100) / 100;
  const payableAmount = Math.round((baseAmount + taxAmount) * 100) / 100;

  // Case E: Suspended / Cancelled
  if (sub.status === 'SUSPENDED' || sub.status === 'CANCELED') {
    return {
      isLocked: true,
      lockReason: 'SUSPENDED',
      subscriptionStatus: sub.status,
      planTier,
      billingCycle,
      payableAmount,
      baseAmount,
      taxAmount,
      currency: 'INR',
      periodEnd: sub.currentPeriodEnd,
      message: 'Your fleet subscription is currently suspended or canceled. Please renew your plan to restore access.',
    };
  }

  const now = new Date();

  // Case B & C: Free Trial Lifecycle (status === 'TRIALING')
  if (sub.status === 'TRIALING') {
    const isAwaitingActivation = (sub.trialStartDate === null || sub.trialEndsAt === null);

    if (isAwaitingActivation) {
      // Pending activation: Trial has NOT started yet. 0 days consumed.
      return {
        isLocked: false,
        lockReason: 'NONE',
        subscriptionStatus: 'PENDING_ACTIVATION',
        planTier: 'FREE_TRIAL',
        billingCycle,
        payableAmount: 0,
        baseAmount: 0,
        taxAmount: 0,
        currency: 'INR',
        periodEnd: null,
        message: 'Account is awaiting initial activation. The 7-day free trial will start upon setting your password.',
        trialDetails: {
          trialStatus: 'PENDING_ACTIVATION',
          originalTrialDays: 7,
          extendedTrialDays: 0,
          totalTrialDays: 7,
          trialStartDate: null,
          originalTrialExpiry: null,
          currentTrialExpiry: null,
          remainingDays: 7,
          remainingMs: 7 * 24 * 60 * 60 * 1000,
          trialExtensionHistory: sub.trialExtensionHistory || [],
          latestExtensionRequest: null,
          pendingExtensionRequest: null,
        },
      };
    }

    const trialEnd = sub.trialEndsAt
      ? new Date(sub.trialEndsAt)
      : (sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd) : null);

    const isTrialValid = trialEnd ? trialEnd.getTime() >= now.getTime() : false;

    const originalTrialDays = 7;
    const totalTrialDays = sub.trialDurationDays || 7;
    const extendedTrialDays = Math.max(0, totalTrialDays - originalTrialDays);
    const trialStart = sub.trialStartDate ? new Date(sub.trialStartDate) : null;
    const originalTrialExpiry = trialStart ? new Date(trialStart.getTime() + 7 * 24 * 60 * 60 * 1000) : null;
    const remainingMs = trialEnd ? Math.max(0, trialEnd.getTime() - now.getTime()) : 0;
    const remainingDays = Math.ceil(remainingMs / (24 * 60 * 60 * 1000));

    let latestExtensionRequest: any = null;
    try {
      latestExtensionRequest = await TrialExtensionRequest.findOne({
        where: { tenantId },
        order: [['requestedAt', 'DESC']],
      });
    } catch (e) {
      // Non-fatal
    }

    const trialDetails = {
      trialStatus: isTrialValid ? 'TRIAL_ACTIVE' : 'TRIAL_EXPIRED',
      originalTrialDays,
      extendedTrialDays,
      totalTrialDays,
      trialStartDate: trialStart,
      originalTrialExpiry,
      currentTrialExpiry: trialEnd,
      remainingDays,
      remainingMs,
      trialExtensionHistory: sub.trialExtensionHistory || [],
      latestExtensionRequest: latestExtensionRequest ? {
        requestId: latestExtensionRequest.requestId,
        requestedDays: latestExtensionRequest.requestedDays,
        approvedDays: latestExtensionRequest.approvedDays,
        status: latestExtensionRequest.status,
        reason: latestExtensionRequest.reason,
        adminNotes: latestExtensionRequest.adminNotes,
        requestedAt: latestExtensionRequest.requestedAt,
        reviewedAt: latestExtensionRequest.reviewedAt,
      } : null,
      pendingExtensionRequest: latestExtensionRequest?.status === 'PENDING' ? {
        requestId: latestExtensionRequest.requestId,
        requestedDays: latestExtensionRequest.requestedDays,
        requestedAt: latestExtensionRequest.requestedAt,
      } : null,
    };

    if (isTrialValid) {
      // ACTIVE FREE TRIAL: Full operational access! Never locked, no payment popup during trial.
      return {
        isLocked: false,
        lockReason: 'NONE',
        subscriptionStatus: 'TRIAL_ACTIVE',
        planTier: (sub.planTier || 'FREE_TRIAL') as any,
        billingCycle,
        payableAmount: 0,
        baseAmount: 0,
        taxAmount: 0,
        currency: 'INR',
        periodEnd: trialEnd,
        message: 'Your free trial is active. You have full operational access across CABZ.',
        trialDetails,
      };
    }

    // Trial period has passed! Check if tenant completed a paid subscription
    const paidInvoice = await SubscriptionInvoice.findOne({
      where: {
        tenantId,
        paymentStatus: 'PAID',
      },
    });

    if (paidInvoice && sub.currentPeriodEnd && new Date(sub.currentPeriodEnd).getTime() >= now.getTime()) {
      return {
        isLocked: false,
        lockReason: 'NONE',
        subscriptionStatus: 'ACTIVE_PAID',
        planTier: (sub.planTier || 'BASIC') as any,
        billingCycle,
        payableAmount,
        baseAmount,
        taxAmount,
        currency: 'INR',
        periodEnd: sub.currentPeriodEnd,
        message: 'Subscription is active and in good standing.',
      };
    }

    // Free trial expired and no verified payment: Restricted access with subscription-required lock
    // Rule: Do NOT show PRO or ₹411.82 before customer selects a plan!
    return {
      isLocked: true,
      lockReason: 'EXPIRED',
      subscriptionStatus: 'TRIAL_EXPIRED',
      planTier: (sub.planTier || 'FREE_TRIAL') as any,
      billingCycle,
      payableAmount: 0,
      baseAmount: 0,
      taxAmount: 0,
      currency: 'INR',
      periodEnd: trialEnd,
      message: 'Your free trial has ended. To continue managing your fleet, vehicles, drivers and bookings, please choose a subscription plan and complete the payment.',
      availablePlans: [
        { planTier: 'BASIC', name: 'Starter Mobility', priceMonthlyINR: 299, priceAnnualINR: 3050, gstPercent: 18 },
        { planTier: 'PRO', name: 'Growth Fleet Pro', priceMonthlyINR: 349, priceAnnualINR: 3560, gstPercent: 18 },
        { planTier: 'ENTERPRISE', name: 'Enterprise Mobility Suite', priceMonthlyINR: 549, priceAnnualINR: 5600, gstPercent: 18 },
      ],
      trialDetails,
    };
  }

  // Case D: Subscription Expired (date has passed or status is PAST_DUE)
  const isPastDueStatus = sub.status === 'PAST_DUE';
  const isPeriodEnded = sub.currentPeriodEnd ? new Date(sub.currentPeriodEnd).getTime() < now.getTime() : false;

  if (isPastDueStatus || isPeriodEnded) {
    return {
      isLocked: true,
      lockReason: 'EXPIRED',
      subscriptionStatus: 'EXPIRED',
      planTier,
      billingCycle,
      payableAmount,
      baseAmount,
      taxAmount,
      currency: 'INR',
      periodEnd: sub.currentPeriodEnd,
      message: 'Your subscription has expired. Please renew your plan to continue using CABZ.',
    };
  }

  // Case A: Active & Paid & Within Validity Period
  return {
    isLocked: false,
    lockReason: 'NONE',
    subscriptionStatus: 'ACTIVE_PAID',
    planTier,
    billingCycle,
    payableAmount,
    baseAmount,
    taxAmount,
    currency: 'INR',
    periodEnd: sub.currentPeriodEnd,
    message: 'Subscription is active and in good standing.',
  };
}

/**
 * Express Middleware: requireSubscriptionAccess
 * Blocks all protected fleet operational requests if tenant subscription requires payment, is expired, or is suspended.
 */
export const requireSubscriptionAccess = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    const isSuperAdmin = ctx?.isPlatformSuperAdmin ||
      (req as any).user?.role === 'superadmin' ||
      (req as any).role === 'superadmin';

    if (isSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId ||
      (req as any).tenantId ||
      (req as any).user?.tenantId ||
      (req.headers && (req.headers['x-tenant-id'] as string)) ||
      ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    // Always permit profile info, current user context, and session termination
    const exemptPaths = ['/profile', '/getCurrentUser', '/logout', '/public', '/contact-info'];
    if (exemptPaths.some((p) => req.path.startsWith(p))) {
      return next();
    }

    const evaluation = await evaluateTenantSubscriptionLock(tenantId, false);

    if (evaluation.isLocked) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_PAYMENT_REQUIRED',
        subscriptionRequired: true,
        requiresPayment: true,
        isLocked: true,
        lockReason: evaluation.lockReason,
        subscriptionStatus: evaluation.subscriptionStatus,
        planTier: evaluation.planTier,
        billingCycle: evaluation.billingCycle,
        payableAmount: evaluation.payableAmount,
        baseAmount: evaluation.baseAmount,
        taxAmount: evaluation.taxAmount,
        currency: evaluation.currency,
        periodEnd: evaluation.periodEnd,
        message: evaluation.message,
      });
    }

    return next();
  } catch (error) {
    console.error('Error in requireSubscriptionAccess middleware:', error);
    return next(error);
  }
};

/**
 * Controller endpoint: GET /api/tenants/current/subscription-lock-status
 */
export const getSubscriptionLockStatus = async (req: Request, res: Response) => {
  try {
    const ctx = getTenantContext();
    const isSuperAdmin = ctx?.isPlatformSuperAdmin ||
      (req as any).user?.role === 'superadmin' ||
      (req as any).role === 'superadmin';

    const tenantId = ctx?.tenantId ||
      (req as any).tenantId ||
      (req as any).user?.tenantId ||
      (req.headers && (req.headers['x-tenant-id'] as string)) ||
      ROOT_TENANT_ID;

    const evaluation = await evaluateTenantSubscriptionLock(tenantId, isSuperAdmin);

    return res.status(200).json({
      success: true,
      ...evaluation,
    });
  } catch (error) {
    console.error('Error fetching subscription lock status:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve subscription lock status.',
    });
  }
};
