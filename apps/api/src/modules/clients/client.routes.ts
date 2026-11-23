import { Router } from 'express';
import { ClientController } from './client.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { upload } from '../../middleware/upload.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

router.get('/export/csv', ClientController.exportCsv);
router.get('/', ClientController.list);
router.get('/:id', ClientController.getById);
router.post('/', ClientController.create);
router.patch('/:id', ClientController.update);
router.post('/:id/avatar', upload.single('avatar'), ClientController.updateAvatar);
router.delete('/:id', requireRole(RoleName.ADMIN), ClientController.deleteClient);

export default router;
