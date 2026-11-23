import { Router } from 'express';
import { StaffController } from './staff.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);

// Reports can be viewed by Admin and Staff
router.get('/reports/referrals', requireRole(RoleName.ADMIN, RoleName.STAFF), StaffController.referralReport);

// Staff management operations
router.get('/', requireRole(RoleName.ADMIN, RoleName.STAFF), StaffController.list);
router.get('/:id', requireRole(RoleName.ADMIN, RoleName.STAFF), StaffController.getById);
router.post('/', requireRole(RoleName.ADMIN), StaffController.create);
router.patch('/:id', requireRole(RoleName.ADMIN), StaffController.update);

export default router;
