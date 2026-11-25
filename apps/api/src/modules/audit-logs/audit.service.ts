import { prisma } from '../../prisma';
import { store, MemoryAuditLog } from '../../data/store';
import crypto from 'crypto';

export interface CreateAuditLogParams {
  userId?: string | null;
  action: string;
  entityType: string;
  entityId?: string | null;
  details?: Record<string, any>;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export class AuditService {
  static async record(params: CreateAuditLogParams) {
    try {
      if (store.isPostgres) {
        return await prisma.auditLog.create({
          data: {
            userId: params.userId || null,
            action: params.action,
            entityType: params.entityType,
            entityId: params.entityId || null,
            details: params.details || undefined,
            ipAddress: params.ipAddress || null,
            userAgent: params.userAgent || null,
          },
        });
      } else {
        const user = params.userId ? store.users.find((u) => u.id === params.userId) : null;
        const log: MemoryAuditLog = {
          id: `aud-${crypto.randomUUID()}`,
          userId: params.userId || null,
          userName: user?.identifier || 'System',
          userRole: user?.role || 'SYSTEM',
          action: params.action,
          entityType: params.entityType,
          entityId: params.entityId || null,
          details: params.details || {},
          ipAddress: params.ipAddress || null,
          userAgent: params.userAgent || null,
          createdAt: new Date(),
        };
        store.auditLogs.unshift(log);
        return log;
      }
    } catch (error) {
      console.error('Failed to create audit log:', error);
      return null;
    }
  }

  static async list(page: number = 1, limit: number = 20) {
    if (store.isPostgres) {
      const skip = (page - 1) * limit;
      const [total, logs] = await Promise.all([
        prisma.auditLog.count(),
        prisma.auditLog.findMany({
          skip,
          take: limit,
          orderBy: { createdAt: 'desc' },
          include: {
            user: {
              select: {
                id: true,
                identifier: true,
                role: { select: { name: true } },
              },
            },
          },
        }),
      ]);

      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        logs: logs.map((l) => ({
          id: l.id,
          userId: l.userId,
          userName: l.user?.identifier || 'System',
          userRole: l.user?.role?.name || 'SYSTEM',
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        })),
      };
    } else {
      const total = store.auditLogs.length;
      const skip = (page - 1) * limit;
      const paginated = store.auditLogs.slice(skip, skip + limit);
      return {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
        logs: paginated.map((l) => ({
          id: l.id,
          userId: l.userId,
          userName: l.userName,
          userRole: l.userRole,
          action: l.action,
          entityType: l.entityType,
          entityId: l.entityId,
          details: l.details,
          ipAddress: l.ipAddress,
          createdAt: l.createdAt ? new Date(l.createdAt).toISOString() : new Date().toISOString(),
        })),
      };
    }
  }
}
