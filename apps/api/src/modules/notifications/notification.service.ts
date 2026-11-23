import { prisma } from '../../prisma';
import { store, MemoryNotification } from '../../data/store';
import crypto from 'crypto';

export interface CreateNotificationParams {
  userId: string;
  title: string;
  message: string;
  type?: 'INFO' | 'WARNING' | 'SUCCESS' | 'URGENT';
  linkUrl?: string;
}

export class NotificationService {
  static async create(params: CreateNotificationParams) {
    try {
      if (store.isPostgres) {
        return await prisma.notification.create({
          data: {
            userId: params.userId,
            title: params.title,
            message: params.message,
            type: params.type || 'INFO',
            linkUrl: params.linkUrl || null,
          },
        });
      } else {
        const notif: MemoryNotification = {
          id: `notif-${crypto.randomUUID()}`,
          userId: params.userId,
          title: params.title,
          message: params.message,
          type: params.type || 'INFO',
          isRead: false,
          linkUrl: params.linkUrl || null,
          createdAt: new Date(),
        };
        store.notifications.unshift(notif);
        return notif;
      }
    } catch (error) {
      console.error('Failed to create notification:', error);
      return null;
    }
  }

  static async getUserNotifications(userId: string, limit: number = 20) {
    if (store.isPostgres) {
      return prisma.notification.findMany({
        where: { userId },
        orderBy: { createdAt: 'desc' },
        take: limit,
      });
    } else {
      return store.notifications.filter((n) => n.userId === userId).slice(0, limit);
    }
  }

  static async markAsRead(notificationId: string, userId: string) {
    if (store.isPostgres) {
      return prisma.notification.updateMany({
        where: { id: notificationId, userId },
        data: { isRead: true },
      });
    } else {
      const n = store.notifications.find((notif) => notif.id === notificationId && notif.userId === userId);
      if (n) n.isRead = true;
      return n;
    }
  }

  static async markAllAsRead(userId: string) {
    if (store.isPostgres) {
      return prisma.notification.updateMany({
        where: { userId, isRead: false },
        data: { isRead: true },
      });
    } else {
      store.notifications.filter((n) => n.userId === userId).forEach((n) => (n.isRead = true));
      return { count: 1 };
    }
  }
}
