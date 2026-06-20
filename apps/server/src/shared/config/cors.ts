import { CorsOptions } from 'cors';
import { env } from './env';

const corsOptions: CorsOptions = {
  origin: (origin, callback) => {
    const allowedOrigins = [
      env.FRONTEND_LOCAL_URL,
      env.FRONTEND_SERVER_URL, // This should be your ALB DNS name
      'http://127.0.0.1:3000'
    ].filter(Boolean) as string[];

    // 1. Allow same-origin requests (no origin header)
    // 2. Allow our specific frontend URL
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      // 3. Block everyone else
      callback(new Error('Not allowed by CORS'));
    }
  },
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
};

export default corsOptions;
