import { Router } from 'express';

/**
 * Example module router — copy this pattern for new modules.
 * Mounted in src/app.ts via:  app.use(`${env.API_BASE_PATH}/health`, healthRouter)
 */
export const healthRouter = Router();

healthRouter.get('/', (_req, res) => {
  res.json({ status: 'ok', service: 'stellar-tipz-backend', time: new Date().toISOString() });
});
