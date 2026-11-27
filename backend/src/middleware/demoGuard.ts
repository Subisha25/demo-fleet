import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { getTenantContext } from '../context/tenantContext';

/**
 * Middleware: demoGuard
 * Strictly enforces that Demo View / demo preview callers CANNOT perform write or mutate operations.
 * Allows all GET / OPTIONS / HEAD queries for browsing and exploring pages.
 * Blocks all POST / PUT / PATCH / DELETE mutation attempts with HTTP 403 DEMO_MODE_READ_ONLY.
 */
export const demoGuard = (req: Request, res: Response, next: NextFunction) => {
  // Check if request is tagged as demo via headers
  const isDemoHeader =
    req.headers['x-demo-mode'] === 'true' ||
    req.headers['x-demo-view'] === 'true' ||
    req.headers['x-tenant-id'] === 'demo-tenant';

  // Check demo query parameter
  const isDemoQuery = req.query?.demo === 'true';

  let isDemoToken = false;

  // Extract from Authorization header or query token
  let rawToken: string | undefined;
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    rawToken = authHeader.split(' ')[1];
  } else if (req.query && req.query.token) {
    rawToken = String(req.query.token);
  }

  if (rawToken) {
    try {
      const secret = config.security.jwtSecret || process.env.JWT_SECRET || 'jk23DFEo';
      const decoded: any = jwt.verify(rawToken, secret);
      if (decoded && (decoded.isDemo || decoded.role === 'demo' || decoded.tenantId === 'demo-tenant')) {
        isDemoToken = true;
      }
    } catch (e) {
      const unverified: any = jwt.decode(rawToken);
      if (unverified && (unverified.isDemo || unverified.role === 'demo' || unverified.tenantId === 'demo-tenant')) {
        isDemoToken = true;
      }
    }
  }

  // Check user or tenant context attached to the request
  const isDemoUser =
    (req as any).user?.isDemo ||
    (req as any).user?.role === 'demo' ||
    (req as any).role === 'demo' ||
    (req as any).tenantId === 'demo-tenant';

  const ctx = getTenantContext();
  const isDemoContext = ctx?.tenantId === 'demo-tenant';

  if (isDemoHeader || isDemoQuery || isDemoToken || isDemoUser || isDemoContext) {
    // Permit public demo session creation & initialization endpoints
    if (
      req.path.includes('/demo-session') ||
      req.path.includes('/public/demo')
    ) {
      return next();
    }

    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(req.method.toUpperCase())) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE_READ_ONLY',
        isDemoReadOnly: true,
        message: 'Demo Preview is read-only. This action is unavailable.',
      });
    }
  }

  return next();
};
