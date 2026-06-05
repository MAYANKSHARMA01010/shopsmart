import dotenv from 'dotenv';
dotenv.config();

import express, { Request, Response } from 'express';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import logger from './utils/logger';
import productRoutes from './routes/productRoutes';
import categoryRoutes from './routes/categoryRoutes';
import { errorHandler, routeNotFoundHandler } from './middlewares/errorMiddleware';
import corsOptions from './config/cors';
import redis from './utils/redis';
import prisma from './config/database';

import helmet from 'helmet';
import { globalRateLimiter } from './middlewares/rateLimit.middleware';
import authRoutes from './routes/authRoutes';

const app = express();
const PORT = process.env.SERVER_PORT || 5001;

// Security & rate limiting middlewares
app.use(helmet());
app.use('/api', globalRateLimiter);

// Standard middlewares
app.use(cors(corsOptions));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.get('/favicon.ico', (req: Request, res: Response) => { res.status(204).end(); });

const healthCheckLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 60, // limit each IP to 60 requests per window
  standardHeaders: true,
  legacyHeaders: false,
});

// Health Check
app.get('/api/health', healthCheckLimiter, async (req: Request, res: Response) => {
  let redisStatus = 'disconnected';
  let dbStatus = 'disconnected';

  try {
    await redis.ping();
    redisStatus = 'connected';
  } catch (_err) {
    redisStatus = 'error';
  }

  try {
    // Use the shared prisma instance to test the connection
    await prisma.$queryRaw`SELECT 1`;
    dbStatus = 'connected';
  } catch (_err) {
    dbStatus = 'error';
  }

  res.json({
    status: dbStatus === 'connected' ? 'ok' : 'error',
    message: 'ShopSmart Backend Health Check',
    timestamp: new Date().toISOString(),
    database: dbStatus,
    redis: redisStatus,
  });
});

app.get('/', (req: Request, res: Response) => {
  res.json({ message: 'ShopSmart Backend Service v4 (TypeScript + Redis)', version: '4.0.0' });
});

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/products', productRoutes);
app.use('/api/categories', categoryRoutes);

// Error Handling
app.use(routeNotFoundHandler);
app.use(errorHandler);

if (require.main === module) {
  app.listen(PORT, () => {
    logger.info(`Server running on port ${PORT} in ${process.env.NODE_ENV} mode`);
  });
}

export default app;
