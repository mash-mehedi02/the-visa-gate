import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { StaffService } from './staff.service';
import { CreateStaffSchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';

export class StaffController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const staffList = await StaffService.list();
      return sendSuccess(res, staffList);
    } catch (error) {
      next(error);
    }
  }

  static async getById(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await StaffService.getById(req.params.id);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreateStaffSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const result = await StaffService.create(validated, actorId, req.ip);
      return sendSuccess(res, result, 'Staff member registered successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  static async update(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const result = await StaffService.update(req.params.id, req.body, actorId, req.ip);
      return sendSuccess(res, result, 'Staff member updated successfully');
    } catch (error) {
      next(error);
    }
  }

  static async referralReport(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const report = await StaffService.getReferralReport(req.query as any);
      return sendSuccess(res, report);
    } catch (error) {
      next(error);
    }
  }
}
