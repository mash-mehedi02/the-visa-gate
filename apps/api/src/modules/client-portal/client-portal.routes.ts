import { Router } from 'express';
import { ClientPortalController } from './client-portal.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { upload } from '../../middleware/upload.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

// Only authenticated CLIENT users can access this module
router.use(authenticate);
router.use(requireRole(RoleName.CLIENT));

router.get('/profile', ClientPortalController.getProfile);
router.get('/applications', ClientPortalController.getApplications);
router.get('/applications/:applicationId/progress', ClientPortalController.getProgress);
router.get('/documents', ClientPortalController.getDocuments);
router.post('/avatar', upload.single('avatar'), ClientPortalController.updateAvatar);

export default router;
