import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from './auth.middleware';
import { RoleName } from '@thevisagate/shared';
import { sendError } from '../utils/response';
import { prisma } from '../prisma';
import { store } from '../data/store';

export function requireRole(...allowedRoles: RoleName[]) {
  return (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401, null, 'UNAUTHORIZED');
    }

    // SUPER_ADMIN has access to all admin and staff roles
    const effectiveRoles = [...allowedRoles];
    if (allowedRoles.includes(RoleName.ADMIN)) {
      effectiveRoles.push(RoleName.SUPER_ADMIN);
    }

    if (!effectiveRoles.includes(req.user.role)) {
      return sendError(
        res,
        'Access denied: You do not have permission to perform this action.',
        403,
        { requiredRoles: allowedRoles, currentRole: req.user.role },
        'FORBIDDEN'
      );
    }

    next();
  };
}

export function requirePermission(permissionCode: string) {
  return async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return sendError(res, 'Unauthenticated user', 401, null, 'UNAUTHORIZED');
    }

    // SUPER_ADMIN and ADMIN inherently have all permissions
    if (req.user.role === RoleName.SUPER_ADMIN || req.user.role === RoleName.ADMIN) {
      return next();
    }

    // For Staff, query permissions from store/database
    try {
      if (!store.isPostgres) {
        const staff = store.staff.find((s) => s.userId === req.user?.userId);
        if (staff && staff.permissions && staff.permissions.includes(permissionCode)) {
          return next();
        }
        return sendError(
          res,
          `Permission denied: requires '${permissionCode}'`,
          403,
          null,
          'PERMISSION_DENIED'
        );
      }

      const user = await prisma.user.findUnique({
        where: { id: req.user.userId },
        include: {
          role: {
            include: {
              permissions: {
                include: {
                  permission: true,
                },
              },
            },
          },
        },
      });

      if (!user) {
        return sendError(res, 'User not found', 404);
      }

      const hasPermission = user.role.permissions.some(
        (rp) => rp.permission.code === permissionCode
      );

      if (!hasPermission) {
        return sendError(
          res,
          `Permission denied: requires '${permissionCode}'`,
          403,
          null,
          'PERMISSION_DENIED'
        );
      }

      next();
    } catch (error) {
      return sendError(res, 'Authorization check failed', 500, error);
    }
  };
}
