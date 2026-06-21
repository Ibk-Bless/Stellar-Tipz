import pino from 'pino';
import { env } from '../../config/env.js';

/** Shared structured logger. Import this everywhere instead of console.log. */
export const logger = pino({
  level: env.LOG_LEVEL,
  transport:
    env.NODE_ENV === 'development'
      ? { target: 'pino-pretty', options: { colorize: true } }
      : undefined,
});
