import { Router } from 'express';
import { CountryController } from './country.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { requireRole } from '../../middleware/rbac.middleware';
import { RoleName } from '@thevisagate/shared';

const router = Router();

// Publicly accessible endpoints
router.get('/world-list', CountryController.getWorldList);
router.get('/programs', CountryController.listPrograms);
router.get('/', CountryController.list);
router.get('/:id', CountryController.getById);

// Admin-restricted destination & program management
router.post('/', authenticate, requireRole(RoleName.ADMIN), CountryController.createCountry);
router.patch('/:id', authenticate, requireRole(RoleName.ADMIN), CountryController.updateCountry);
router.delete('/:id', authenticate, requireRole(RoleName.ADMIN), CountryController.deleteCountry);

router.post('/programs', authenticate, requireRole(RoleName.ADMIN), CountryController.createProgram);
router.patch('/programs/:id', authenticate, requireRole(RoleName.ADMIN), CountryController.updateProgram);
router.delete('/programs/:id', authenticate, requireRole(RoleName.ADMIN), CountryController.deleteProgram);

export default router;
