import { Request, Response, NextFunction } from 'express';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import {
  checkVehicleQuota,
  checkDriverQuota,
  checkCompanyQuota,
  checkUserQuota,
  checkBookingQuota,
  checkTaxQuota,
  checkPickupAreaQuota,
  checkPickupCityQuota,
  checkPackageQuota,
  checkPaymentModeQuota,
  checkFeatureEntitlement,
  checkThemeEntitlement,
  isSubscriptionExpired,
  getOrCreateSubscription,
  checkAndConsumeAllowance,
  rollbackAllowance,
} from '../services/quotaService';

/**
 * Helper to build consistent structured 403 quota/feature response
 */
function buildQuotaExceededResponse(res: Response, opts: {
  errorCode: string;
  resource: string;
  current: number | string;
  limit: number | string;
  planTier: string;
  recommendedPlan?: string;
  message: string;
  billingPeriod?: any;
  upgradeUrl?: string;
}) {
  return res.status(403).json({
    success: false,
    code: opts.errorCode,
    errorCode: opts.errorCode,
    subscriptionRequired: true,
    requiresUpgrade: true,
    resource: opts.resource,
    current: opts.current,
    limit: opts.limit,
    planTier: opts.planTier,
    recommendedPlan: opts.recommendedPlan || (opts.planTier === 'BASIC' ? 'PRO' : 'ENTERPRISE'),
    billingPeriod: opts.billingPeriod,
    message: opts.message,
    upgradeUrl: opts.upgradeUrl || '/billing/current',
  });
}

// 1. Vehicle Quota
export const requireVehicleQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkVehicleQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'VEHICLES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Vehicle quota reached for your current subscription plan.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'VEHICLES');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'VEHICLES',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 vehicle). Upgrade to an active paid plan to add more vehicles.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'VEHICLES').catch(() => {});
      });
    }

    next();
  } catch (error: any) {
    console.error('Error verifying vehicle quota:', error);
    next(error);
  }
};

// 2. Booking / Trip Quota (Period-based)
export const requireBookingQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkBookingQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'BOOKINGS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        billingPeriod: result.billingPeriod,
        message: result.message || 'Booking allowance reached for the current billing period.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'BOOKINGS');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'BOOKINGS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free trial booking allowance reached (1/1 booking). Upgrade to an active paid plan to dispatch more trips.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'BOOKINGS').catch(() => {});
      });
    }

    next();
  } catch (error) {
    console.error('Error checking booking quota:', error);
    next(error);
  }
};

// Backward-compatible alias for existing routes
export const requireActiveSubscriptionForBookings = requireBookingQuota;

// 3. Tax Configuration Quota
export const requireTaxQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkTaxQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'TAXES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Tax configuration limit reached for your current subscription plan.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'TAXES');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'TAXES',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 tax configuration). Upgrade to add more.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'TAXES').catch(() => {});
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying tax quota:', error);
    next(error);
  }
};

// 4. Driver Quota
export const requireDriverQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkDriverQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'DRIVERS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Driver quota reached for your current subscription plan.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'DRIVERS');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'DRIVERS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 driver). Upgrade to register more drivers.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'DRIVERS').catch(() => {});
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying driver quota:', error);
    next(error);
  }
};

// 5. Corporate Company Quota
export const requireCompanyQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkCompanyQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'COMPANIES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Corporate company limit reached for your current subscription plan.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'COMPANIES');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'COMPANIES',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 corporate account). Upgrade to add more client accounts.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'COMPANIES').catch(() => {});
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying company quota:', error);
    next(error);
  }
};

// 6. User Quota
export const requireUserQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkUserQuota(tenantId);
    if (!result.allowed) {
      const sub = await getOrCreateSubscription(tenantId);
      const isExpired = isSubscriptionExpired(sub);
      return buildQuotaExceededResponse(res, {
        errorCode: isExpired ? 'SUBSCRIPTION_EXPIRED' : 'QUOTA_EXCEEDED',
        resource: 'USERS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'User roster limit reached for your current subscription plan.',
      });
    }

    const sub = await getOrCreateSubscription(tenantId);
    if (sub.status === 'TRIALING') {
      const consumption = await checkAndConsumeAllowance(tenantId, 'USERS');
      if (!consumption.allowed) {
        return buildQuotaExceededResponse(res, {
          errorCode: 'QUOTA_EXCEEDED',
          resource: 'USERS',
          current: 1,
          limit: 1,
          planTier: sub.planTier,
          message: consumption.message || 'Free setup allowance reached (1/1 user). Upgrade to register more users.',
        });
      }
      res.on('finish', () => {
        if (res.statusCode >= 400) rollbackAllowance(tenantId, 'USERS').catch(() => {});
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying user quota:', error);
    next(error);
  }
};

// 7. Pickup Area Quota
export const requirePickupAreaQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkPickupAreaQuota(tenantId);
    if (!result.allowed) {
      return buildQuotaExceededResponse(res, {
        errorCode: 'QUOTA_EXCEEDED',
        resource: 'PICKUP_AREAS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Pickup area quota reached for your current plan.',
      });
    }
    next();
  } catch (error) {
    console.error('Error checking pickup area quota:', error);
    next(error);
  }
};

// 8. Pickup City Quota
export const requirePickupCityQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkPickupCityQuota(tenantId);
    if (!result.allowed) {
      return buildQuotaExceededResponse(res, {
        errorCode: 'QUOTA_EXCEEDED',
        resource: 'PICKUP_CITIES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Pickup city quota reached for your current plan.',
      });
    }
    next();
  } catch (error) {
    console.error('Error checking pickup city quota:', error);
    next(error);
  }
};

// 9. Package Quota
export const requirePackageQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkPackageQuota(tenantId);
    if (!result.allowed) {
      return buildQuotaExceededResponse(res, {
        errorCode: 'QUOTA_EXCEEDED',
        resource: 'PACKAGES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Rental package quota reached for your current plan.',
      });
    }
    next();
  } catch (error) {
    console.error('Error checking package quota:', error);
    next(error);
  }
};

// 10. Payment Mode Quota
export const requirePaymentModeQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const result = await checkPaymentModeQuota(tenantId);
    if (!result.allowed) {
      return buildQuotaExceededResponse(res, {
        errorCode: 'QUOTA_EXCEEDED',
        resource: 'PAYMENT_MODES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        recommendedPlan: result.recommendedPlan,
        message: result.message || 'Payment mode quota reached for your current plan.',
      });
    }
    next();
  } catch (error) {
    console.error('Error checking payment mode quota:', error);
    next(error);
  }
};

// 11. Feature Flag Guard Middleware Factory
export const requireFeature = (featureName: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const ctx = getTenantContext();
      if (ctx?.isPlatformSuperAdmin) return next();

      const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
      if (tenantId === ROOT_TENANT_ID) return next();

      const result = await checkFeatureEntitlement(tenantId, featureName);
      if (!result.allowed) {
        return res.status(403).json({
          success: false,
          code: 'FEATURE_LOCKED',
          errorCode: 'FEATURE_LOCKED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          feature: featureName,
          planTier: result.planTier,
          recommendedPlan: result.recommendedPlan,
          message: result.message || 'This feature is not included in your current plan. Upgrade to access it.',
          upgradeUrl: '/billing/current',
        });
      }
      next();
    } catch (error) {
      console.error(`Error checking feature ${featureName}:`, error);
      next(error);
    }
  };
};

// 12. Theme Customization Level Guard
export const requireThemeCustomization = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const body = req.body || {};
    // Detect whether request contains custom color hex codes or preset selection
    const isCustomPalette = Boolean(body.primaryColor || body.secondaryColor || body.headerColor || body.footerColor);
    const isPresetSelection = Boolean(body.themePreset);

    if (isCustomPalette) {
      const check = await checkThemeEntitlement(tenantId, 'CUSTOM');
      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          code: 'FEATURE_LOCKED',
          errorCode: 'FEATURE_LOCKED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'THEME',
          current: check.allowedLevel,
          limit: 'CUSTOM',
          planTier: check.planTier,
          recommendedPlan: check.recommendedPlan,
          message: check.message,
          upgradeUrl: '/billing/current',
        });
      }
    } else if (isPresetSelection) {
      const check = await checkThemeEntitlement(tenantId, 'PRESETS');
      if (!check.allowed) {
        return res.status(403).json({
          success: false,
          code: 'FEATURE_LOCKED',
          errorCode: 'FEATURE_LOCKED',
          subscriptionRequired: true,
          requiresUpgrade: true,
          resource: 'THEME',
          current: check.allowedLevel,
          limit: 'PRESETS',
          planTier: check.planTier,
          recommendedPlan: check.recommendedPlan,
          message: check.message,
          upgradeUrl: '/billing/current',
        });
      }
    }

    next();
  } catch (error) {
    console.error('Error verifying theme customization entitlement:', error);
    next(error);
  }
};

/**
 * 13. Paid Modification Guard:
 * Expired / suspended subscriptions strictly block all modifications, updates, and deletes.
 * Trialing fleets cannot modify/delete records until an active paid subscription is activated.
 */
export const requirePaidForModification = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    if (ctx?.isPlatformSuperAdmin) return next();

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    if (tenantId === ROOT_TENANT_ID) return next();

    const sub = await getOrCreateSubscription(tenantId);

    if (isSubscriptionExpired(sub)) {
      return res.status(403).json({
        success: false,
        code: 'SUBSCRIPTION_EXPIRED',
        errorCode: 'SUBSCRIPTION_EXPIRED',
        subscriptionRequired: true,
        requiresUpgrade: true,
        status: sub.status,
        planTier: sub.planTier,
        message: 'Your fleet subscription is expired or suspended. Operational data updates, deletions, and exports are locked. Please renew your subscription.',
        renewalUrl: '/billing/current',
        upgradeUrl: '/billing/current',
      });
    }

    if (sub.status === 'TRIALING') {
      return res.status(403).json({
        success: false,
        code: 'RESTRICTED_FREE_ACCESS',
        errorCode: 'RESTRICTED_FREE_ACCESS',
        subscriptionRequired: true,
        requiresUpgrade: true,
        status: sub.status,
        planTier: sub.planTier,
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
