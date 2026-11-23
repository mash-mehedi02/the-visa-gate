import { Router } from 'express';
import { DocumentController } from './document.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { upload } from '../../middleware/upload.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

// Token-gated short-lived signed download (valid for 15 mins, verified via cryptographic HMAC-SHA256 signature)
router.get('/download-signed', DocumentController.downloadSigned);

// All subsequent routes strictly require Staff or Admin authentication
router.use(authenticate);
router.use(requireRole(RoleName.ADMIN, RoleName.STAFF));

// Document types reference library
router.get('/types', DocumentController.listTypes);

// List private documents for specific application or client
router.get('/application/:applicationId', DocumentController.listByApplication);
router.get('/client/:clientId', DocumentController.listByClient);

// Staff document actions
router.post('/upload', upload.single('file'), DocumentController.upload);
router.post('/:id/replace', upload.single('file'), DocumentController.replace);
router.patch('/:id/status', DocumentController.updateStatus);
router.delete('/:id', DocumentController.delete);

// Generate short-lived signed access link (for secure viewing without exposing persistent URLs)
router.get('/:id/signed-url', DocumentController.getSignedUrl);

// Direct authenticated stream download
router.get('/:id/download', DocumentController.download);

export default router;
