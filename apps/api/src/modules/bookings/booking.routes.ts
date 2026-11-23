import { Router } from 'express';
import { BookingController } from './booking.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

// Public booking endpoints
router.get('/slots', BookingController.getSlots);
router.post('/', BookingController.createBooking);

// Authenticated Admin / Staff endpoints
router.get('/calendar', authenticate, requireRole(RoleName.ADMIN, RoleName.STAFF), BookingController.getCalendar);
router.get('/', authenticate, requireRole(RoleName.ADMIN, RoleName.STAFF), BookingController.listBookings);
router.patch('/:id', authenticate, requireRole(RoleName.ADMIN, RoleName.STAFF), BookingController.updateStatus);

export default router;
