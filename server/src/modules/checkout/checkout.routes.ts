import { Router } from 'express';
import { initializeCheckout } from './checkout.controller';
import { idempotencyMiddleware } from '../../middlewares/idempotency';
import { validateCheckoutBody } from './checkout.validator';
import { authenticate } from '../../middlewares/auth.middleware';

const router = Router();

router.post(
  '/initialize',
  authenticate,
  idempotencyMiddleware,
  validateCheckoutBody,
  initializeCheckout
);

export default router;
