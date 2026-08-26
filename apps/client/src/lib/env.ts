import { z } from 'zod';

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  NEXT_PUBLIC_LOCAL_FRONTEND_URL: z.string().url().default('http://localhost:3000'),
  NEXT_PUBLIC_SERVER_FRONTEND_URL: z.string().url().optional(),
  NEXT_PUBLIC_LOCAL_BACKEND_URL: z.string().url().default('http://localhost:5001/api/v1'),
  NEXT_PUBLIC_SERVER_BACKEND_URL: z.string().url().optional(),
  NEXT_PUBLIC_DEFAULT_CURRENCY: z.string().default('INR'),
  NEXT_PUBLIC_DEFAULT_APP_NAME: z.string().default('ShopSmart'),
  NEXT_PUBLIC_RAZORPAY_KEY_ID: z.string().min(5).optional(), // Optional because tests/mocks might not provide it fully
});

const processEnv = {
  NODE_ENV: process.env.NODE_ENV,
  NEXT_PUBLIC_LOCAL_FRONTEND_URL: process.env.NEXT_PUBLIC_LOCAL_FRONTEND_URL,
  NEXT_PUBLIC_SERVER_FRONTEND_URL: process.env.NEXT_PUBLIC_SERVER_FRONTEND_URL,
  NEXT_PUBLIC_LOCAL_BACKEND_URL: process.env.NEXT_PUBLIC_LOCAL_BACKEND_URL,
  NEXT_PUBLIC_SERVER_BACKEND_URL: process.env.NEXT_PUBLIC_SERVER_BACKEND_URL,
  NEXT_PUBLIC_DEFAULT_CURRENCY: process.env.NEXT_PUBLIC_DEFAULT_CURRENCY,
  NEXT_PUBLIC_DEFAULT_APP_NAME: process.env.NEXT_PUBLIC_DEFAULT_APP_NAME,
  NEXT_PUBLIC_RAZORPAY_KEY_ID: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
};

const _env = envSchema.safeParse(processEnv);

if (!_env.success) {
  console.error('❌ Invalid client environment variables:', _env.error.format());
  throw new Error('Invalid client environment variables');
}

export const env = _env.data;
