import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ApplicationService } from './application.service';
import { CreateApplicationSchema, UpdateApplicationSchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';

export class ApplicationController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await ApplicationService.list(req.query);
      return sendSuccess(res, result.applications, undefined, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const application = await ApplicationService.getById(req.params.id);
      return sendSuccess(res, application);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateApplicationSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const application = await ApplicationService.create(validated, actorId);
      return sendSuccess(res, application, 'Application created successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = UpdateApplicationSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const application = await ApplicationService.update(req.params.id, validated, actorId);
      return sendSuccess(res, application, 'Application updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async delete(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const result = await ApplicationService.delete(req.params.id, actorId);
      return sendSuccess(res, result, 'Application deleted successfully');
    } catch (error) {
      next(error);
    }
  }
}
