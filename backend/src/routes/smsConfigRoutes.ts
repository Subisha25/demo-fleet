import { Router, Response } from 'express';
import { AuthenticatedRequest, authMiddleware, requireFleetAdminOrSuperAdmin } from '../middleware/authMiddleware';
import { getTenantContext, ROOT_TENANT_ID } from '../context/tenantContext';
import {
  getTenantSmsConfig,
  upsertTenantSmsConfig,
  validateTenantSmsConnection,
  sendTenantTestSms,
  STANDARD_DLT_TEMPLATES,
} from '../services/tenantSmsConfigService';

const router = Router();

/**
 * Resolves the target tenantId enforcing tenant isolation:
 * - SuperAdmin can view any tenant via query/header or default to ROOT.
 * - Fleet Admins are strictly locked to their authenticated token's tenantId.
 */
function resolveTenantId(req: AuthenticatedRequest): string {
  const ctx = getTenantContext();
  const isSuper =
    req.role === 'superadmin' ||
    req.roles === 'superadmin' ||
    ctx?.isPlatformSuperAdmin;

  if (isSuper) {
    const headerTenant =
      (req.headers['x-tenant-id'] ||
        req.headers['X-Tenant-ID'] ||
        req.headers['x-selected-tenant-id'] ||
        req.query.tenantId) as string | undefined;

    if (headerTenant && headerTenant !== 'all' && headerTenant !== 'ALL') {
      return headerTenant.trim();
    }
    return ctx?.tenantId || req.tenantId || ROOT_TENANT_ID;
  }

  // Non-SuperAdmin is strictly locked to token tenant
  return req.tenantId || ctx?.tenantId || ROOT_TENANT_ID;
}

// 1. Get Tenant SMS Configuration
router.get(
  '/',
  authMiddleware,
  requireFleetAdminOrSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = resolveTenantId(req);
      const result = await getTenantSmsConfig(tenantId);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[SMS Config Routes] Error fetching SMS config:', err);
      return res.status(500).json({
        success: false,
        message: err.message || 'Failed to retrieve SMS configuration.',
      });
    }
  }
);

// 2. Save / Update Tenant SMS Configuration
router.put(
  '/',
  authMiddleware,
  requireFleetAdminOrSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = resolveTenantId(req);
      const result = await upsertTenantSmsConfig(tenantId, req.body);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[SMS Config Routes] Error updating SMS config:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Failed to update SMS configuration.',
      });
    }
  }
);

// 3. Safe Gateway Connection Validation (Read-only balance check, sends 0 SMS)
router.post(
  '/validate',
  authMiddleware,
  requireFleetAdminOrSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = resolveTenantId(req);
      const result = await validateTenantSmsConnection(tenantId);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[SMS Config Routes] Error validating SMS gateway:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Gateway validation failed.',
      });
    }
  }
);

// 4. Test SMS Dispatch (Explicit user action & confirmation required)
router.post(
  '/test-sms',
  authMiddleware,
  requireFleetAdminOrSuperAdmin,
  async (req: AuthenticatedRequest, res: Response) => {
    try {
      const tenantId = resolveTenantId(req);
      const { phone, confirmRealSms } = req.body;

      if (!confirmRealSms) {
        return res.status(400).json({
          success: false,
          message: 'Explicit user confirmation (confirmRealSms: true) is required before sending test SMS.',
        });
      }

      const result = await sendTenantTestSms(tenantId, phone, confirmRealSms);
      return res.status(200).json(result);
    } catch (err: any) {
      console.error('[SMS Config Routes] Error testing SMS dispatch:', err);
      return res.status(400).json({
        success: false,
        message: err.message || 'Test SMS dispatch failed.',
      });
    }
  }
);

// 5. Standard DLT Templates Catalog
router.get(
  '/templates',
  authMiddleware,
  requireFleetAdminOrSuperAdmin,
  async (_req: AuthenticatedRequest, res: Response) => {
    return res.status(200).json({
      success: true,
      templates: STANDARD_DLT_TEMPLATES,
    });
  }
);

export default router;
