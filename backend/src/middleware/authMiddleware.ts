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
