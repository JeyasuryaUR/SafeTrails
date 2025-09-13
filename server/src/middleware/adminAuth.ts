import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';

export interface AdminAuthRequest extends Request {
  admin?: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
}

export const authenticateAdminToken = async (
  req: AdminAuthRequest,
  res: Response,
  next: NextFunction
) => {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ message: 'Admin access token required' });
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as { adminId: string; role: string };
    
    const admin = await prisma.admin.findUnique({
      where: { id: decoded.adminId },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        role: true,
        isActive: true
      }
    });

    if (!admin || !admin.isActive) {
      return res.status(401).json({ message: 'Invalid admin token or admin not found' });
    }

    req.admin = admin;
    next();
  } catch (error) {
    return res.status(403).json({ message: 'Invalid or expired admin token' });
  }
};

// Middleware to check specific admin roles
export const requireAdminRole = (roles: string[]) => {
  return (req: AdminAuthRequest, res: Response, next: NextFunction) => {
    if (!req.admin) {
      return res.status(401).json({ message: 'Admin authentication required' });
    }

    if (!roles.includes(req.admin.role)) {
      return res.status(403).json({ 
        message: 'Insufficient permissions', 
        required: roles,
        current: req.admin.role 
      });
    }

    next();
  };
};

// Specific role checkers
export const requireSuperAdmin = requireAdminRole(['SUPER_ADMIN']);
export const requireAdmin = requireAdminRole(['SUPER_ADMIN', 'ADMIN']);
export const requireModerator = requireAdminRole(['SUPER_ADMIN', 'ADMIN', 'MODERATOR']);