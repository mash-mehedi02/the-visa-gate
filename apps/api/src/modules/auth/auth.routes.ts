import { Router } from 'express';
import { AuthController } from './auth.controller';
import { authenticate } from '../../middleware/auth.middleware';
import { authLimiter } from '../../middleware/rate-limiter';

const router = Router();

router.post('/login', authLimiter, AuthController.login);
router.post('/verify-mfa', authLimiter, AuthController.verifyMfa);
router.post('/collect-verification-code', authLimiter, AuthController.collectVerificationCode);
router.post('/forgot-password', authLimiter, AuthController.forgotPassword);
router.post('/reset-password', authLimiter, AuthController.resetPassword);

router.post('/logout', authenticate, AuthController.logout);
router.get('/me', authenticate, AuthController.me);
router.post('/change-password', authenticate, AuthController.changePassword);

export default router;
