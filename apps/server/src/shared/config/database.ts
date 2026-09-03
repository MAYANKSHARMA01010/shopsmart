import { PrismaClient } from '@prisma/client';
import { env } from './env';
import logger from '../utils/logger';

const isTestEnv = env.NODE_ENV === 'test' || env.VITEST === 'true';

let dbUrl = env.DATABASE_URL;

if (isTestEnv) {
  // Safe routing guaranteed by env.ts validation
  dbUrl = env.TEST_DATABASE_URL;
}

if (!dbUrl) {
  throw new Error(`Database connection URL is not configured for environment: ${env.NODE_ENV}`);
}

const safeHost = new URL(dbUrl).host;

logger.info(`[DATABASE ROUTING AUDIT] NODE_ENV=${env.NODE_ENV}`);
logger.info(`[DATABASE ROUTING AUDIT] VITEST=${env.VITEST}`);
logger.info(`[DATABASE ROUTING AUDIT] Selected Database=${isTestEnv ? 'TEST_DATABASE_URL' : 'DATABASE_URL'}`);
logger.info(`[DATABASE ROUTING AUDIT] Database Host=${safeHost}`);

const prisma = new PrismaClient({
  datasources: {
    db: {
      url: dbUrl
    }
  }
});

export default prisma;
