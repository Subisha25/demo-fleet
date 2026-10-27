import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthenticatedRequest extends Request {
  userId?: any;
  role?: string;
  roles?: string;
  tenantId?: string;
  companyId?: string;
  email?: string;
}

export const authMiddleware = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  let token: string | undefined;

  if (req.headers.authorization?.startsWith('Bearer')) {
    token = req.headers.authorization.split(' ')[1];
  } else if (req.query && req.query.token) {
    // Also support ?token=... for document/PDF stream requests
    token = String(req.query.token);
  }

  if (!token) {
    return res.status(401).json({ message: 'Not authorized, Please add token' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as any;

    req.userId = decoded.userId !== undefined ? String(decoded.userId) : undefined;
    req.role = decoded.role || decoded.roles;
    req.roles = req.role;
    req.tenantId = decoded.tenantId;
    req.companyId = decoded.companyId;
    req.email = decoded.email;

    next();
  } catch (err) {
    return res.status(401).json({ message: 'Not valid' });
  }
};

/**
 * Strict role-based guard for platform-level SuperAdmin operations.
 * Blocks Fleet Admins, Company Managers, and Users with HTTP 403.
 */
export const requireSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.role || req.roles;
  const tenantId = req.tenantId;
  const email = req.email;

  // Root platform superadmin check
  const configuredSuperAdminEmail = (process.env.SUPERADMIN_EMAIL || 'subisha2002.m@gmail.com').toLowerCase();
  const isSuper = (role === 'superadmin' || role === 'SUPERADMIN') &&
    (tenantId === 'e7b8a1c0-0000-0000-0000-000000000001' || !tenantId || email?.toLowerCase() === configuredSuperAdminEmail);

  if (!isSuper) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Platform SuperAdmin privilege required.',
    });
  }

  next();
};

/**
 * Ensures caller is either Platform SuperAdmin or an authorized Fleet Admin.
 */
export const requireFleetAdminOrSuperAdmin = (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  const role = req.role || req.roles;
  const isAuthorized = role === 'superadmin' || role === 'SUPERADMIN' || role === 'fleet_admin' || role === 'admin';

  if (!isAuthorized) {
    return res.status(403).json({
      success: false,
      message: 'Forbidden: Fleet Admin or SuperAdmin privilege required.',
    });
  }

  next();
};
