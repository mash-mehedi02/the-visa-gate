import { Response, NextFunction } from 'express';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';
import { PaymentService } from './payment.service';
import { CreatePaymentSchema, ReversePaymentSchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';

export class PaymentController {
  static async list(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await PaymentService.list(req.query);
      return sendSuccess(res, result.payments, undefined, 200, {
        total: result.total,
        page: result.page,
        limit: result.limit,
        totalPages: result.totalPages,
      });
    } catch (error) {
      next(error);
    }
  }

  static async create(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = CreatePaymentSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const payment = await PaymentService.recordPayment(validated, actorId);
      return sendSuccess(res, payment, 'Payment recorded and receipt generated', 201);
    } catch (error) {
      next(error);
    }
  }

  static async reverse(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const validated = ReversePaymentSchema.parse(req.body);
      const actorId = req.user?.userId || 'system';
      const payment = await PaymentService.reversePayment(req.params.id, validated.reason, actorId);
      return sendSuccess(res, payment, 'Payment reversal recorded successfully');
    } catch (error) {
      next(error);
    }
  }
}
