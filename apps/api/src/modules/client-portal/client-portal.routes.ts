import { Router } from 'express';
import { ClientPortalController } from './client-portal.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

// Only authenticated CLIENT users can access this module
router.use(authenticate);
router.use(requireRole(RoleName.CLIENT));

router.get('/profile', ClientPortalController.getProfile);
router.get('/applications', ClientPortalController.getApplications);
router.get('/applications/:applicationId/progress', ClientPortalController.getProgress);
router.get('/documents', ClientPortalController.getDocuments);
// NOTE: Avatar upload is intentionally not exposed to clients.
// Profile photos are managed by admin/staff only via /api/v1/clients/:id/avatar.

export default router;
