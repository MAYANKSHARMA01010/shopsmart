import { Router } from 'express';
import * as authController from '../auth/auth.controller';
import { authenticate } from '../../shared/middleware/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  changePasswordSchema,
  validateBody,
} from './auth.validator';
import { authRateLimiter } from '../../shared/middleware/rateLimit.middleware';

const router = Router();

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/logout', validateBody(refreshSchema), authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);
router.post('/change-password', authenticate, validateBody(changePasswordSchema), authController.changePassword);

// OTP Verification endpoints (5-minute expiry & one-time use)
router.post('/send-email-otp', authenticate, authRateLimiter, authController.sendEmailOtp);
router.post('/verify-email-otp', authenticate, authController.verifyEmailOtp);
router.post('/send-phone-otp', authenticate, authRateLimiter, authController.sendPhoneOtp);
router.post('/verify-phone-otp', authenticate, authController.verifyPhoneOtp);

// Direct verification endpoints (fallback)
router.post('/verify-email', authenticate, authController.verifyEmail);
router.post('/verify-phone', authenticate, authController.verifyPhone);

export default router;


