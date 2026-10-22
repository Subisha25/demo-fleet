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
  const headerTenantId = (req.headers['x-tenant-id'] || req.headers['X-Tenant-ID']) as string | undefined;

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
      isPlatformSuperAdmin = tokenRole === 'superadmin' || tokenRole === 'SUPERADMIN';

      if (decoded.tenantId) {
        tokenTenantId = String(decoded.tenantId);
      } else {
        // Authenticated legacy Grace Cabs user without explicit tenantId claim
        tokenTenantId = ROOT_TENANT_ID;
      }
    } catch {
      // Invalid/expired token - authMiddleware will formally reject where required
    }
  }

  let resolvedTenantId: string | undefined;

  if (isAuthenticated && tokenTenantId) {
    if (isPlatformSuperAdmin) {
      // Platform SuperAdmin can target any tenant via header, or defaults to tokenTenantId
      resolvedTenantId = headerTenantId || tokenTenantId;
    } else {
      // Standard authenticated tenant user or legacy user
      // Security Check: CANNOT supply an arbitrary X-Tenant-ID to switch tenants!
      if (headerTenantId && headerTenantId !== tokenTenantId) {
        return res.status(403).json({
          success: false,
          message: 'Security Violation: Cannot access or switch to an unauthorized tenant.',
        });
      }
      resolvedTenantId = tokenTenantId;
    }
  } else {
    // Unauthenticated request
    // Security: Do NOT trust arbitrary X-Tenant-ID header from anonymous callers!
    // Never silently default anonymous requests to root tenant for protected data.
    resolvedTenantId = undefined;
  }

  const context: TenantContextData = {
    tenantId: resolvedTenantId || '',
    tenantCode: resolvedTenantId === ROOT_TENANT_ID ? ROOT_TENANT_CODE : (resolvedTenantId ? 'TENANT' : ''),
    userId: tokenUserId,
    role: tokenRole,
    companyId: tokenCompanyId,
    email: tokenEmail,
    isPlatformSuperAdmin,
  };

  if (resolvedTenantId) {
    (req as any).tenantId = resolvedTenantId;
    res.setHeader('X-Tenant-ID', resolvedTenantId);
  }

  // Propagate through AsyncLocalStorage
  tenantStorage.run(context, () => {
    next();
  });
};
