import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { NotificationService } from './notification.service';
import { sendSuccess, sendError } from '../../utils/response';

export class NotificationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const notifications = await NotificationService.getUserNotifications(req.user.userId);
      return sendSuccess(res, notifications);
    } catch (error) {
      next(error);
    }
  }

  static async markAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      await NotificationService.markAsRead(req.params.id, req.user.userId);
      return sendSuccess(res, null, 'Notification marked as read');
    } catch (error) {
      next(error);
    }
  }

  static async markAllAsRead(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      await NotificationService.markAllAsRead(req.user.userId);
      return sendSuccess(res, null, 'All notifications marked as read');
    } catch (error) {
      next(error);
    }
  }
}
