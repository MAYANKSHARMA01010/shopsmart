/**
 * Global test setup for server integration tests.
 * Runs once before any test file in the suite.
 */
import { afterAll } from 'vitest';
import prisma from '../src/config/database';
import redis from '../src/utils/redis';

afterAll(async () => {
  try {
    await prisma.$disconnect();
  } catch {
    // silent — DB may not be connected in all environments
  }

  try {
    if (redis.status === 'ready' || redis.status === 'connecting') {
      await redis.quit();
    }
  } catch {
    // silent — Redis may not be connected in all environments
  }
});
