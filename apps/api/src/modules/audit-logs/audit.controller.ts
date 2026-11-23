import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { AuditService } from './audit.service';
import { sendSuccess } from '../../utils/response';

export class AuditController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const page = Number(req.query.page) || 1;
      const limit = Number(req.query.limit) || 20;
      const result = await AuditService.list(page, limit);
      return sendSuccess(res, result.logs, undefined, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }
}
