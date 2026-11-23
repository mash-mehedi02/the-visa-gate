import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { ReportService } from './report.service';
import { sendSuccess } from '../../utils/response';

export class ReportController {
  static async getDashboard(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const data = await ReportService.getDashboardMetrics();
      return sendSuccess(res, data);
    } catch (error) {
      next(error);
    }
  }
}
