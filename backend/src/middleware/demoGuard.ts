import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import config from '../config/config';

/**
 * Middleware: demoGuard
 * Strictly enforces that demo sessions / demo mode callers CANNOT perform write/mutate operations.
 * Allows all GET / OPTIONS queries for browsing and exploring pages.
 * Rejects POST / PUT / PATCH / DELETE with 403 DEMO_MODE_READ_ONLY.
 */
export const demoGuard = (req: Request, res: Response, next: NextFunction) => {
  // Check if request is tagged as demo
  const isDemoHeader = req.headers['x-demo-mode'] === 'true' || req.headers['x-demo-view'] === 'true';
  let isDemoToken = false;

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    try {
      const token = authHeader.split(' ')[1];
      const decoded: any = jwt.verify(token, config.security.jwtSecret || process.env.JWT_SECRET || 'jk23DFEo');
      if (decoded && (decoded.isDemo || decoded.role === 'demo' || decoded.tenantId === 'demo-tenant')) {
        isDemoToken = true;
      }
    } catch (e) {
      const unverified: any = jwt.decode(authHeader.split(' ')[1]);
      if (unverified && (unverified.isDemo || unverified.role === 'demo' || unverified.tenantId === 'demo-tenant')) {
        isDemoToken = true;
      }
    }
  }

  const isDemoUser = (req as any).user?.isDemo || (req as any).user?.role === 'demo' || (req as any).role === 'demo';

  if (isDemoHeader || isDemoToken || isDemoUser) {
    // Permit public demo session creation
    if (req.path.includes('/demo-session') || req.path.includes('/public/demo')) {
      return next();
    }

    const mutatingMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];
    if (mutatingMethods.includes(req.method.toUpperCase())) {
      return res.status(403).json({
        success: false,
        code: 'DEMO_MODE_READ_ONLY',
        isDemoReadOnly: true,
        message: "You're viewing the CABZ Demo Preview. Register your fleet and start your free trial to access operational features.",
      });
    }
  }

  return next();
};
