import { Router } from 'express';
import { ApplicationController } from './application.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

router.get('/', ApplicationController.list);
router.get('/:id', ApplicationController.getById);
router.post('/', ApplicationController.create);
router.patch('/:id', ApplicationController.update);
router.delete('/:id', ApplicationController.delete);

export default router;
