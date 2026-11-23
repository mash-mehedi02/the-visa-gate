import { Router } from 'express';
import { ReportController } from './report.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

router.get('/dashboard', ReportController.getDashboard);

export default router;
