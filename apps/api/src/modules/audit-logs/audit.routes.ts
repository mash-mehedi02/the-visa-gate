import { Router } from 'express';
import { AuditController } from './audit.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN)); // Audit logs restricted strictly to Admin

router.get('/', AuditController.list);

export default router;
