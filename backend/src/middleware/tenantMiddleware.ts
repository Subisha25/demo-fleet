import { Request, Response, NextFunction } from 'express';
import { tenantStorage, TenantContextData, ROOT_TENANT_ID, ROOT_TENANT_CODE } from '../context/tenantContext';
import jwt from 'jsonwebtoken';

/**
 * Tenant resolution middleware.
 * Resolves tenant from HTTP headers, host/subdomain, or JWT token.
 * Falls back to Grace Cabs Root Tenant to guarantee existing functionality never breaks.
 */
/**
 * Strict server-side tenant resolution middleware.
 * - Anonymous callers are NEVER assigned an arbitrary tenant from headers.
 * - Non-superadmin authenticated users are locked to their token's tenantId.
 * - Attempting to forge X-Tenant-ID header outside membership returns HTTP 403 Forbidden.
 * - Only verified Platform SuperAdmins may supply X-Tenant-ID for cross-tenant administration.
 * - Legacy Grace Cabs users without tenantId in token are mapped to ROOT_TENANT_ID.
 */
export const tenantMiddleware = (req: Request, res: Response, next: NextFunction) => {
  const rawHeaderTenantId = (req.headers['x-tenant-id'] || req.headers['X-Tenant-ID'] || req.headers['x-selected-tenant-id'] || req.headers['X-Selected-Tenant-ID']) as string | undefined;
  const headerTenantId = rawHeaderTenantId?.trim();

  let tokenTenantId: string | undefined;
  let tokenRole: string | undefined;
  let tokenUserId: string | undefined;
  let tokenCompanyId: string | undefined;
  let tokenEmail: string | undefined;
  let isPlatformSuperAdmin = false;
  let isAuthenticated = false;

  const authHeader = req.headers.authorization;
  let rawToken: string | undefined;
  if (authHeader?.startsWith('Bearer ')) {
    rawToken = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    rawToken = String(req.query.token);
  }

  if (rawToken) {
    try {
      const decoded = jwt.verify(rawToken, process.env.JWT_SECRET!) as any;
      isAuthenticated = true;
      tokenRole = decoded.role || decoded.roles;
      tokenUserId = decoded.userId ? String(decoded.userId) : undefined;
      tokenCompanyId = decoded.companyId;
      tokenEmail = decoded.email;

      if (decoded.tenantId) {
        tokenTenantId = String(decoded.tenantId);
      } else {
        // Authenticated legacy Grace Cabs user without explicit tenantId claim
        tokenTenantId = ROOT_TENANT_ID;
      }

      // Strict Platform SuperAdmin validation:
      // Must have role superadmin AND belong to root tenant / root admin identity
      const configuredSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || 'subisha2002.m@gmail.com').toLowerCase();
      isPlatformSuperAdmin = (tokenRole === 'superadmin' || tokenRole === 'SUPERADMIN') &&
        (tokenTenantId === ROOT_TENANT_ID || !decoded.tenantId || tokenEmail?.toLowerCase() === configuredSuperAdminEmail);
    } catch {
      // Invalid/expired token - authMiddleware will formally reject where required
    }
  }

  let resolvedTenantId: string | undefined;
  let selectedTenantId: string | undefined;

  if (isAuthenticated && tokenTenantId) {
    if (isPlatformSuperAdmin) {
      if (!headerTenantId || headerTenantId === 'all' || headerTenantId === 'ALL') {
        // SuperAdmin viewing All Fleets (platform aggregate)
        resolvedTenantId = ROOT_TENANT_ID;
        selectedTenantId = 'all';
        // Cleanse headers so downstream services checking !req.headers['x-tenant-id'] treat it as All Fleets
        delete req.headers['x-tenant-id'];
        delete req.headers['X-Tenant-ID'];
        delete req.headers['x-selected-tenant-id'];
        delete req.headers['X-Selected-Tenant-ID'];
      } else {
        // SuperAdmin viewing a specific selected fleet
        resolvedTenantId = headerTenantId;
        selectedTenantId = headerTenantId;
        req.headers['x-tenant-id'] = headerTenantId;
      }
    } else {
      // Standard authenticated tenant user (Fleet Admin, Company Manager, User)
      // Security Check: CANNOT supply 'all' or an arbitrary X-Tenant-ID to switch tenants!
      if (headerTenantId && headerTenantId !== tokenTenantId) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Cannot access or switch to an unauthorized tenant.',
        });
      }
      resolvedTenantId = tokenTenantId;
      selectedTenantId = tokenTenantId;
    }
  } else {
    // Unauthenticated request
    // Security: Do NOT trust arbitrary X-Tenant-ID header from anonymous callers!
    resolvedTenantId = undefined;
    selectedTenantId = undefined;
  }

  const isInspectionMode = (
    req.headers['x-inspection-mode'] === 'true' ||
    req.headers['X-Inspection-Mode'] === 'true' ||
    req.headers['x-inspection-mode'] === '1'
  );

  // Read-only inspection enforcement: SuperAdmin inspecting a customer fleet cannot perform ANY operational mutations!
  if (isInspectionMode && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(req.method.toUpperCase())) {
    return res.status(403).json({
      success: false,
      message: 'Inspection Mode: Modifications are strictly disabled in read-only fleet inspection.',
    });
  }

  const context: TenantContextData = {
    tenantId: resolvedTenantId || '',
    tenantCode: resolvedTenantId === ROOT_TENANT_ID ? ROOT_TENANT_CODE : (resolvedTenantId ? 'TENANT' : ''),
    selectedTenantId,
    userId: tokenUserId,
    role: tokenRole,
    companyId: tokenCompanyId,
    email: tokenEmail,
    isPlatformSuperAdmin,
    isInspectionMode,
  };

  if (resolvedTenantId) {
    (req as any).tenantId = resolvedTenantId;
    res.setHeader('X-Tenant-ID', resolvedTenantId);
  }
  if (isInspectionMode) {
    res.setHeader('X-Inspection-Mode', 'true');
  }
  (req as any).tenantContext = context;

  // Propagate through AsyncLocalStorage
  tenantStorage.run(context, () => {
    next();
  });
};
