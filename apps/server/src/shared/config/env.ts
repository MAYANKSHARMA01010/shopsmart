import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITEST: z.string().optional(),
  SERVER_PORT: z.string().default(process.env.PORT || '5001'),

  
  // URLs & Domains
  FRONTEND_LOCAL_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_SERVER_URL: z.string().url().optional(),
  BACKEND_LOCAL_URL: z.string().url().default('http://localhost:5001'),
  BACKEND_SERVER_URL: z.string().url().optional(),
  
  // Databases
  DATABASE_URL: z.string().url().optional(),
  TEST_DATABASE_URL: z.string().url().optional(),
  
  // Redis & Caching
  REDIS_LOCAL_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_SERVER_URL: z.string().url().optional(),
  REDIS_CACHE_TTL_SECONDS: z.string().default('3600'),
  
  // Authentication & Security
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  BCRYPT_SALT_ROUNDS: z.string().default('12'),

  // Rate Limiting
  RATE_LIMIT_WINDOW_MS: z.string().default('900000'), // 15 minutes
  RATE_LIMIT_MAX_REQUESTS: z.string().default('100'),
  AUTH_RATE_LIMIT_MAX_REQUESTS: z.string().default('15'),
  HEALTHCHECK_RATE_LIMIT_WINDOW_MS: z.string().default('60000'), // 1 minute
  HEALTHCHECK_RATE_LIMIT_MAX: z.string().default('60'),

  // Checkout & Transactions
  DEFAULT_CURRENCY: z.string().default('INR'),
  CHECKOUT_TX_TIMEOUT_MS: z.string().default('45000'),
  CHECKOUT_TX_MAX_WAIT_MS: z.string().default('20000'),
  
  // Payment Gateway (Razorpay)
  RAZORPAY_KEY_ID: z.string().min(5),
  RAZORPAY_KEY_SECRET: z.string().min(5),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(5),

  // Email (SMTP)
  SMTP_HOST: z.string().optional(),
  SMTP_PORT: z.string().default('587'),
  SMTP_USER: z.string().optional(),
  SMTP_PASS: z.string().optional(),
  SMTP_FROM: z.string().default('ShopSmart <no-reply@shopsmart.local>'),

  // WhatsApp Provider (WAHA)
  WAHA_API_URL: z.string().default('http://localhost:3000'),
  WAHA_API_KEY: z.string().optional(),
  WAHA_SESSION: z.string().default('default'),

  // SMS Provider (httpSMS)
  HTTPSMS_API_URL: z.string().default('https://api.httpsms.com/v1'),
  HTTPSMS_API_KEY: z.string().optional(),
  HTTPSMS_FROM_PHONE: z.string().optional(),
  
  // Logging
  LOG_LEVEL: z.string().default('info'),
  LOG_FORMAT: z.string().default('text'),

}).superRefine((data, ctx) => {
  if (data.NODE_ENV === 'test' && !data.TEST_DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "TEST_DATABASE_URL is required in test environment.",
      path: ["TEST_DATABASE_URL"]
    });
  }
  if (data.NODE_ENV !== 'test' && !data.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "DATABASE_URL is required in development/production environments.",
      path: ["DATABASE_URL"]
    });
  }
  if (data.NODE_ENV === 'test' && data.TEST_DATABASE_URL && data.DATABASE_URL && data.TEST_DATABASE_URL === data.DATABASE_URL) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: "Unsafe configuration: TEST_DATABASE_URL must never equal DATABASE_URL.",
      path: ["TEST_DATABASE_URL"]
    });
  }
});

const _env = envSchema.safeParse(process.env);

if (!_env.success) {
  console.error('❌ Invalid environment variables:', _env.error.format());
  process.exit(1);
}

export const env = _env.data;
