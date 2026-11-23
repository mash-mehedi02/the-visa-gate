import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ClientPortalService } from './client-portal.service';
import { sendSuccess, sendError } from '../../utils/response';

export class ClientPortalController {
  static async getProfile(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const profile = await ClientPortalService.getClientProfile(req.user.userId);
      return sendSuccess(res, profile);
    } catch (error) {
      next(error);
    }
  }

  static async getApplications(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const apps = await ClientPortalService.getApplications(req.user.userId);
      return sendSuccess(res, apps);
    } catch (error) {
      next(error);
    }
  }

  static async getProgress(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const progress = await ClientPortalService.getApplicationProgress(req.user.userId, req.params.applicationId);
      return sendSuccess(res, progress);
    } catch (error) {
      next(error);
    }
  }

  static async getDocuments(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      const applicationId = req.query.applicationId as string | undefined;
      const documents = await ClientPortalService.getSubmittedDocuments(req.user.userId, applicationId);
      return sendSuccess(res, documents);
    } catch (error) {
      next(error);
    }
  }

  static async updateAvatar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      if (!req.user) return sendError(res, 'Unauthenticated', 401);
      if (!req.file) return sendError(res, 'Please provide an image file', 400);
      const result = await ClientPortalService.updateAvatar(req.user.userId, req.file);
      return sendSuccess(res, result, 'Profile photo updated successfully');
    } catch (error) {
      next(error);
    }
  }
}
