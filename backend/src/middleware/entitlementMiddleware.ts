import { Request, Response, NextFunction } from 'express';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import { checkVehicleQuota, checkDriverQuota, checkCompanyQuota } from '../services/quotaService';

export const requireVehicleQuota = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const ctx = getTenantContext();
    // Platform SuperAdmin bypasses quota checks
    if (ctx?.isPlatformSuperAdmin) {
      return next();
    }

    const tenantId = ctx?.tenantId || (req as any).tenantId || ROOT_TENANT_ID;
    const result = await checkVehicleQuota(tenantId);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        code: 'QUOTA_EXCEEDED',
        resource: 'VEHICLES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Vehicle quota reached for your current subscription plan.',
        upgradeUrl: '/admin/billing/upgrade',
      });
    }

    next();
  } catch (error) {
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
    const result = await checkDriverQuota(tenantId);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        code: 'QUOTA_EXCEEDED',
        resource: 'DRIVERS',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Driver quota reached for your current subscription plan.',
        upgradeUrl: '/admin/billing/upgrade',
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
    const result = await checkCompanyQuota(tenantId);

    if (!result.allowed) {
      return res.status(403).json({
        success: false,
        code: 'QUOTA_EXCEEDED',
        resource: 'COMPANIES',
        current: result.current,
        limit: result.max,
        planTier: result.planTier,
        message: result.message || 'Corporate company limit reached for your current subscription plan.',
        upgradeUrl: '/admin/billing/upgrade',
      });
    }

    next();
  } catch (error) {
    console.error('Error verifying company quota:', error);
    next(error);
  }
};
