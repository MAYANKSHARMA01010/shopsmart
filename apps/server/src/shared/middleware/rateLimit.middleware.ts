import rateLimit from 'express-rate-limit';
import { env } from '../config/env';

export const globalRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  limit: Number(env.RATE_LIMIT_MAX_REQUESTS),
  message: {
    status: 'fail',
    message: 'Too many requests from this IP, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});

export const authRateLimiter = rateLimit({
  windowMs: Number(env.RATE_LIMIT_WINDOW_MS),
  limit: Number(env.AUTH_RATE_LIMIT_MAX_REQUESTS),
  message: {
    status: 'fail',
    message: 'Too many authentication attempts, please try again later',
  },
  standardHeaders: true,
  legacyHeaders: false,
});
