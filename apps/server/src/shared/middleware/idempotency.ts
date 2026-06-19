import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/AppError';
import logger from '../utils/logger';
import redis from '../utils/redis';

const isRedisReady = () => redis.status === 'ready';

export const idempotencyMiddleware = async (req: Request, res: Response, next: NextFunction) => {
  const idempotencyKey = req.headers['idempotency-key'];

  if (!idempotencyKey || typeof idempotencyKey !== 'string') {
    return next(new AppError('Idempotency-Key header is required', 400));
  }

  // If Redis is not connected, skip idempotency and process the request normally.
  // This degrades gracefully rather than blocking checkout entirely during Redis downtime.
  if (!isRedisReady()) {
    logger.warn('idempotency.redis_unavailable — skipping idempotency check', { idempotencyKey });
    return next();
  }

  const cacheKey = `shopsmart:idempotency:v1:${idempotencyKey}`;
  const ttlSeconds = 24 * 60 * 60; // 24 hours

  try {
    const cachedState = await redis.get(cacheKey);

    if (cachedState) {
      const state = JSON.parse(cachedState);

      if (state.status === 'IN_PROGRESS') {
        logger.warn('idempotency.conflict', { idempotencyKey });
        return next(new AppError('Request is already in progress', 409));
      }

      if (state.status === 'COMPLETED') {
        logger.info('idempotency.cache_hit', { idempotencyKey });
        return res.status(200).json(state.response);
      }
    }

    // Set as IN_PROGRESS
    const inProgressState = JSON.stringify({ status: 'IN_PROGRESS' });
    const setSuccess = await redis.set(cacheKey, inProgressState, 'EX', ttlSeconds, 'NX');

    if (!setSuccess) {
      logger.warn('idempotency.conflict', { idempotencyKey });
      return next(new AppError('Request is already in progress', 409));
    }

    // Intercept res.json to cache the completed response
    const originalJson = res.json;
    res.json = function (body: unknown) {
      if (res.statusCode >= 200 && res.statusCode < 300) {
        const completedState = JSON.stringify({ status: 'COMPLETED', response: body });
        redis.set(cacheKey, completedState, 'EX', ttlSeconds).catch((err: unknown) => {
          logger.error('idempotency.cache_error', { idempotencyKey, error: (err as Error).message });
        });
      } else {
        redis.del(cacheKey).catch((err: unknown) => {
          logger.error('idempotency.cache_error', { idempotencyKey, error: (err as Error).message });
        });
      }
      return originalJson.call(this, body);
    };

    next();
  } catch (error) {
    // Redis threw unexpectedly — degrade gracefully rather than blocking checkout
    logger.warn('idempotency.redis_error — skipping idempotency check', { idempotencyKey, error });
    next();
  }
};
