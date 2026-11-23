import { Router, Request, Response, NextFunction } from 'express';
import { ContactInquirySchema } from '@thevisagate/shared';
import { sendSuccess } from '../../utils/response';
import { NotificationService } from '../notifications/notification.service';
import { AuditService } from '../audit-logs/audit.service';
import { FirebaseDatabaseService } from '../../services/firebase.service';
import { store } from '../../data/store';

const router = Router();

router.post('/', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const validated = ContactInquirySchema.parse(req.body);

    // Save to Firebase Firestore database in parallel
    await FirebaseDatabaseService.saveInquiry(validated);

    // Notify all active Admin accounts
    const adminUsers = store.users.filter((u) => u.role === 'ADMIN');
    for (const admin of adminUsers) {
      await NotificationService.create({
        userId: admin.id,
        title: `New Website Inquiry: ${validated.destinationCountry} (${validated.visaType})`,
        message: `From: ${validated.fullName} (${validated.phone}, ${validated.email})\nMessage: ${validated.message}`,
        type: 'INFO',
        linkUrl: '/admin/dashboard',
      });
    }

    await AuditService.record({
      action: 'PUBLIC_INQUIRY_SUBMITTED',
      entityType: 'INQUIRY',
      details: {
        name: validated.fullName,
        destination: validated.destinationCountry,
        visaType: validated.visaType,
      },
      ipAddress: req.ip,
    });

    return sendSuccess(res, { received: true }, 'Thank you for contacting The Visa Gate. Our expert team will review your inquiry and contact you shortly.');
  } catch (error) {
    next(error);
  }
});

export default router;
