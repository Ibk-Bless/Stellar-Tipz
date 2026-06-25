import cors from 'cors';
import express, { type Express } from 'express';
import helmet from 'helmet';
import pinoHttp from 'pino-http';
import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './common/middleware/errorHandler.js';
import { logger } from './common/utils/logger.js';
import { authRouter } from './modules/auth/auth.routes.js';

/**
 * Builds and configures the Express application (no listening here — see server.ts).
 *
 * Feature modules register their routers below. As you implement a module
 * (see the GitHub issues), import its router and mount it under env.API_BASE_PATH.
 * Example:
 *   import { tipsRouter } from './modules/tips/tips.routes.js';
 *   app.use(`${env.API_BASE_PATH}/tips`, tipsRouter);
 */
export function createApp(): Express {
  const app = express();

  app.use(helmet());
  app.use(cors({ origin: env.CORS_ORIGIN.split(','), credentials: true }));
  app.use(express.json({ limit: '1mb' }));
  app.use(pinoHttp({ logger }));

  // Health check (implemented in the health module issue; basic version inline for scaffolding).
  app.get('/health', (_req, res) => {
    res.json({ status: 'ok', service: 'stellar-tipz-backend', time: new Date().toISOString() });
  });

  // ── Feature routers mount here ───────────────────────────────
  app.use(`${env.API_BASE_PATH}/auth`, authRouter);
  // app.use(`${env.API_BASE_PATH}/profiles`, profilesRouter);
  // app.use(`${env.API_BASE_PATH}/tips`, tipsRouter);
  // ... (one issue per module)
  // ─────────────────────────────────────────────────────────────

  app.use(notFoundHandler);
  app.use(errorHandler);

  return app;
}
