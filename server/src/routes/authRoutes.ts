import { Router } from 'express';
import * as authController from '../controllers/authController';
import { authenticate } from '../middlewares/auth.middleware';
import {
  registerSchema,
  loginSchema,
  refreshSchema,
  updateProfileSchema,
  validateBody,
} from '../validators/authValidator';
import { authRateLimiter } from '../middlewares/rateLimit.middleware';

const router = Router();

// Public auth routes with rate limiting
router.post('/register', authRateLimiter, validateBody(registerSchema), authController.register);
router.post('/login', authRateLimiter, validateBody(loginSchema), authController.login);
router.post('/refresh', validateBody(refreshSchema), authController.refresh);
router.post('/logout', validateBody(refreshSchema), authController.logout);

// Protected routes
router.get('/me', authenticate, authController.getMe);
router.put('/profile', authenticate, validateBody(updateProfileSchema), authController.updateProfile);

export default router;
