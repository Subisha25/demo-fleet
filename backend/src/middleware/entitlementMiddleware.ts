import { Request, Response, NextFunction } from 'express';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import {
  checkVehicleQuota,
  checkDriverQuota,
  checkCompanyQuota,
  checkUserQuota,
  checkBookingQuota,
  isSubscriptionExpired,
  getOrCreateSubscription,
  checkAndConsumeAllowance,
  rollbackAllowance,
} from '../services/quotaService';

export const requireVehicleQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const result = await checkVehicleQuota(tenantId);

    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return res.status(403).json({
        success: false,
        code: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        errorCode: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        resource: 'VEHICLES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Vehicle quota reached for your current subscription plan.',
        upgradeUrl: '/billing/current',
      });
    }

    // If tenant is trialing, concurrency-safely consume the one-time initial allowance
    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'VEHICLES');
      if (!consumption.allowed) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          errorCode: 'QUOTA_EXCEEDED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'VEHICLES',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 vehicle). Upgrade to an active paid plan to add more vehicles.',
          upgradeUrl: '/billing/current',
        });
      }

      // Atomic safety: If the vehicle creation route fails downstream, roll back the allowance
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          rollbackAllowance(tenantId, 'VEHICLES').catch(() => {});
        }
      });
    }

    next();
  } catch (error: any) {
    if (
      error?.name === 'SequelizeUniqueConstraintError' ||
      error?.parent?.code === 'ER_DUP_ENTRY' ||
      String(error?.message || error).includes('Duplicate') ||
      String(error?.message || error).includes('Lock wait timeout')
    ) {
      return res.status(403).json({
        success: false,
        code: 'QUOTA_EXCEEDED',
        errorCode: 'QUOTA_EXCEEDED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        resource: 'VEHICLES',
        current: 1,
        limit: 1,
        message: 'Initial one-time testing allowance for vehicle has already been consumed. Upgrade to an active paid plan to add more vehicles.',
        upgradeUrl: '/billing/current',
      });
    }
    console.error('Error verifying vehicle quota:', error);
    next(error);
  }
};

export const requireDriverQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const result = await checkDriverQuota(tenantId);

    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return res.status(403).json({
        success: false,
        code: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        errorCode: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        resource: 'DRIVERS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Driver quota reached for your current subscription plan.',
        upgradeUrl: '/billing/current',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'DRIVERS');
      if (!consumption.allowed) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          errorCode: 'QUOTA_EXCEEDED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'DRIVERS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 driver). Upgrade to an active paid plan to register more drivers.',
          upgradeUrl: '/billing/current',
        });
      }

      // Atomic safety: If driver creation fails, roll back the allowance
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          rollbackAllowance(tenantId, 'DRIVERS').catch(() => {});
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying driver quota:', error);
    next(error);
  }
};

export const requireCompanyQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const result = await checkCompanyQuota(tenantId);

    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return res.status(403).json({
        success: false,
        code: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        errorCode: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        resource: 'COMPANIES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Corporate company limit reached for your current subscription plan.',
        upgradeUrl: '/billing/current',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'COMPANIES');
      if (!consumption.allowed) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          errorCode: 'QUOTA_EXCEEDED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'COMPANIES',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 corporate account). Upgrade to an active paid plan to add more client accounts.',
          upgradeUrl: '/billing/current',
        });
      }

      // Atomic safety: If company creation fails, roll back the allowance
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          rollbackAllowance(tenantId, 'COMPANIES').catch(() => {});
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying company quota:', error);
    next(error);
  }
};

export const requireUserQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const result = await checkUserQuota(tenantId);

    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return res.status(403).json({
        success: false,
        code: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        errorCode: isExpired ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        resource: 'USERS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'User roster limit reached for your current subscription plan.',
        upgradeUrl: '/billing/current',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'USERS');
      if (!consumption.allowed) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          errorCode: 'QUOTA_EXCEEDED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'USERS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 user). Upgrade to an active paid plan to register more users.',
          upgradeUrl: '/billing/current',
        });
      }

      // Atomic safety: If user registration fails, roll back the allowance
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          rollbackAllowance(tenantId, 'USERS').catch(() => {});
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying user quota:', error);
    next(error);
  }
};

/**
 * Enforces policy for record updates, deletes, and exports.
 * Restricted free-access / trialing fleets can create 1 test record, but cannot modify/delete/export
 * until an active paid subscription is activated.
 * Expired / suspended subscriptions strictly block all modifications, updates, and deletes.
 */
export const requirePaidForModification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const sub = await getOrCreateSubscription(tenantId);

    if (isSubscriptionExpired(sub)) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_LOCKED',
        errorCode: 'SUBSCRIPTION_LOCKED',
        subCode: 'SUBSCRIPTION_EXPIRED',
        requiresUpgrade: true,
        status: sub.status,
        message: 'Your fleet subscription is expired or suspended. Operational data updates, deletions, and exports are locked. Please renew your subscription.',
        renewalUrl: '/billing/current',
      });
    }

    if (sub.status === 'TRIALING') {
      return res.status(403).json({
        success: false,
        code: 'RESTRICTED_FREE_ACCESS',
        requiresUpgrade: true,
        status: sub.status,
        message: 'Modifying, deleting, or exporting records is restricted on the initial free setup allowance. Please activate an eligible paid plan.',
        upgradeUrl: '/billing/current',
      });
    }

    next();
  } catch (error) {
    console.error('Error checking paid modification entitlement:', error);
    next(error);
  }
};

/**
 * Enforces active subscription status or trial booking allowance for bookings and dispatch operations.
 * Suspended/expired fleets cannot create new bookings.
 */
export const requireActiveSubscriptionForBookings = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) {
      return next();
    }

    const result = await checkBookingQuota(tenantId);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        code: result.max === 0 ? 'SUBSCRIPTION_LOCKED' : 'QUOTA_EXCEEDED',
        requiresUpgrade: true,
        resource: 'BOOKINGS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Booking dispatch operations are locked for your current subscription state.',
        renewalUrl: '/billing/current',
        upgradeUrl: '/billing/current',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'BOOKINGS');
      if (!consumption.allowed) {
        return res.status(403).json({
          success: false,
          code: 'QUOTA_EXCEEDED',
          requiresUpgrade: true,
          resource: 'BOOKINGS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free trial booking allowance reached (1/1 booking). Please subscribe to continue dispatching trips.',
          upgradeUrl: '/billing/current',
        });
      }

      // Atomic safety: If booking creation fails, roll back the allowance
      res.on('finish', () => {
        if (res.statusCode >= 400) {
          rollbackAllowance(tenantId, 'BOOKINGS').catch(() => {});
        }
      });
    }

    next();
  } catch (error) {
    console.error('Error checking active booking entitlement:', error);
    next(error);
  }
};
