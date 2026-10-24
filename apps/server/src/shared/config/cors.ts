import { CorsOptions } from 'cors';
import { env } from './env';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.FRONTEND_LOCAL_URL,
      env.FRONTEND_SERVER_URL,
      'http://localhost:3000',
      'http://127.0.0.1:3000',
      'http://localhost:8200',
      'http://127.0.0.1:8200',
    ].filter(Boolean) as string[];

    // 1. Allow same-origin requests (no origin header)
    // 2. Allow configured frontends or any localhost in development mode
    const isLocalhost = origin && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/.test(origin);
    if (!origin || allowedOrigins.includes(origin) || (env.NODE_ENV === 'development' && isLocalhost)) {
      callback(null, true);
    } else {
      // 3. Block everyone else
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: [
    'Content-Type',
    'Authorization',
    'Idempotency-Key',
    'idempotency-key',
    'X-Requested-With',
    'x-requested-with',
    'Accept',
    'Origin',
  ],
  credentials: true,
};

export default corsOptions;
