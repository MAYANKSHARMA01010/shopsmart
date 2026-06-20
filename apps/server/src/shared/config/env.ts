import dotenv from 'dotenv';
import { z } from 'zod';

dotenv.config();

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  VITEST: z.string().optional(),
  SERVER_PORT: z.string().default('5001'),
  FRONTEND_LOCAL_URL: z.string().url().default('http://localhost:3000'),
  FRONTEND_SERVER_URL: z.string().url().optional(),
  BACKEND_LOCAL_URL: z.string().url().default('http://localhost:5001'),
  BACKEND_SERVER_URL: z.string().url().optional(),
  
  DATABASE_URL: z.string().url().optional(),
  TEST_DATABASE_URL: z.string().url().optional(),
  
  REDIS_LOCAL_URL: z.string().url().default('redis://localhost:6379'),
  REDIS_SERVER_URL: z.string().url().optional(),
  
  JWT_ACCESS_SECRET: z.string().min(32),
  JWT_REFRESH_SECRET: z.string().min(32),
  JWT_ACCESS_EXPIRES_IN: z.string().default('15m'),
  JWT_REFRESH_EXPIRES_IN: z.string().default('7d'),
  
  RAZORPAY_KEY_ID: z.string().min(5),
  RAZORPAY_KEY_SECRET: z.string().min(5),
  RAZORPAY_WEBHOOK_SECRET: z.string().min(5),
  
  BCRYPT_SALT_ROUNDS: z.string().default('12'),
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
