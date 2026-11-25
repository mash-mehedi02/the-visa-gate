import { Router } from 'express';
import { WorkflowController } from './workflow.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

// Templates
router.get('/templates', WorkflowController.listTemplates);
router.get('/templates/:id', WorkflowController.getTemplateById);
router.post('/templates', requireRole(RoleName.ADMIN), WorkflowController.createTemplate);
router.put('/templates/:id', requireRole(RoleName.ADMIN), WorkflowController.updateTemplate);
router.delete('/templates/:id', requireRole(RoleName.ADMIN), WorkflowController.deleteTemplate);

// Application steps
router.get('/applications/:applicationId/steps', WorkflowController.getApplicationSteps);
router.post('/applications/:applicationId/steps', WorkflowController.addStep);
router.post('/applications/:applicationId/steps/reorder', WorkflowController.reorderSteps);
router.post('/applications/:applicationId/apply-template', WorkflowController.applyTemplate);
router.patch('/steps/:id', WorkflowController.updateStep);
router.delete('/steps/:id', WorkflowController.deleteStep);

export default router;
