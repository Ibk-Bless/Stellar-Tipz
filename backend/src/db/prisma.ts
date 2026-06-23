import { PrismaClient } from '@prisma/client';
import { env } from '../config/env.js';

/** Singleton Prisma client. Import `prisma` everywhere you need DB access. */
export const prisma = new PrismaClient({
  log: env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
});
