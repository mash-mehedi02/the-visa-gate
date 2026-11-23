import { Router } from 'express';
import { PaymentController } from './payment.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

router.get('/', PaymentController.list);
router.post('/', PaymentController.create);
router.post('/:id/reverse', requireRole(RoleName.ADMIN), PaymentController.reverse);

export default router;
