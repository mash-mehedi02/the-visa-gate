import { Request, Response, NextFunction } from 'express';
import { BookingService } from './booking.service';
import { sendSuccess } from '../../utils/response';
import { AuthenticatedRequest } from '../../middleware/auth.middleware';

export class BookingController {
  // Public check slots
  static async getSlots(req: Request, res: Response, next: NextFunction) {
    try {
      const date = (req.query.date as string) || new Date().toISOString().split('T')[0];
      const result = await BookingService.getAvailableSlots(date);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Public submit booking
  static async createBooking(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.createBooking(req.body, req.ip);
      return sendSuccess(res, result, 'Consultation appointment scheduled successfully', 201);
    } catch (error) {
      next(error);
    }
  }

  // Admin / Staff list bookings
  static async listBookings(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const result = await BookingService.listBookings(req.query as any);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }

  // Admin / Staff update booking (approve, reject, reschedule, assign, notes)
  static async updateStatus(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const actorId = req.user?.userId || 'system';
      const result = await BookingService.updateStatus(req.params.id, req.body, actorId, req.ip);
      return sendSuccess(res, result, 'Booking updated successfully');
    } catch (error) {
      next(error);
    }
  }

  // Admin / Staff calendar view
  static async getCalendar(req: AuthenticatedRequest, res: Response, next: NextFunction) {
    try {
      const month = (req.query.month as string) || new Date().toISOString().substring(0, 7);
      const result = await BookingService.getCalendar(month);
      return sendSuccess(res, result);
    } catch (error) {
      next(error);
    }
  }
}
