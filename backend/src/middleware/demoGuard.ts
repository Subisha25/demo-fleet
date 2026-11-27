import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';
import { getTenantContext } from '../context/tenantContext';

/**
 * Check if the request is destined for an unauthenticated public route,
 * such as self-service fleet registration, account activation, public booking, or authentication.
 * These endpoints must NEVER be blocked by Demo View read-only guards.
 */
export const isPublicExemptRoute = (req: Request): boolean => {
  const p = (req.originalUrl || req.path || '').toLowerCase();

  // Self-service fleet registration endpoints
  if (
    p.includes('/register-fleet') ||
    p.includes('/public/register') ||
    p.includes('/tenants/register')
  ) {
    return true;
  }

  // Account activation endpoints
  if (
    p.includes('/activation/') ||
    p.includes('/verify-activation-token') ||
    p.includes('/activate-account')
  ) {
    return true;
  }

  // Public booking customer flows
  if (p.includes('/public/booking')) {
    return true;
  }

  // Authentication & credential recovery endpoints
  if (
    p.includes('/auth/login') ||
    p.includes('/auth/emplogin') ||
    p.includes('/auth/fleet-login') ||
    p.includes('/auth/userlogin') ||
    p.includes('/auth/vendorlogin') ||
    p.includes('/auth/companylogin') ||
    p.includes('/auth/send-otp') ||
    p.includes('/auth/verify-otp') ||
    p.includes('/auth/resend-otp') ||
    p.includes('/auth/forgetpassword') ||
    p.includes('/auth/forgot-password') ||
    p.includes('/public/login')
  ) {
    return true;
  }

  // Demo session initialization & teardown
  if (
    p.includes('/demo-session') ||
    p.includes('/public/demo')
  ) {
    return true;
  }

  // Public metadata, contact info & subscription plan viewing
  if (
    p.includes('/subscription/plans') ||
    p.includes('/contact-info') ||
    p.includes('/public/slug') ||
    p.includes('/public/fleet-by-slug') ||
    p.includes('/plan-summary')
  ) {
    return true;
  }

  return false;
};

/**
 * Middleware: demoGuard
 * Strictly enforces that Demo View / demo preview callers CANNOT perform write or mutate operations.
 * Allows all GET / OPTIONS / HEAD queries for browsing and exploring pages.
 * Blocks all POST / PUT / PATCH / DELETE mutation attempts with HTTP 403 DEMO_MODE_READ_ONLY on tenant operations.
 * Explicitly bypasses public unauthenticated onboarding, auth, and activation routes.
 */
export const demoGuard = (req: Request, res: Response, next: NextFunction) => {
  // CRITICAL: Public exempt routes (e.g. self-service fleet registration, public booking, login)
  // must NEVER be blocked by Demo View read-only restrictions.
  if (isPublicExemptRoute(req)) {
    return next();
  }

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
