import { createServer } from 'node:http';
import { createApp } from './app.js';
import { env } from './config/env.js';
import { logger } from './common/utils/logger.js';

/** Process entry point: starts the HTTP server (and, later, the WebSocket + indexer). */
async function bootstrap(): Promise<void> {
  const app = createApp();
  const httpServer = createServer(app);

  // The realtime gateway (Socket.IO) attaches to this httpServer — see the realtime issues.
  // initRealtime(httpServer);

  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Stellar Tipz backend listening on http://localhost:${env.PORT}`);
  });

  const shutdown = (signal: string) => {
    logger.info(`${signal} received, shutting down...`);
    httpServer.close(() => process.exit(0));
  };
  process.on('SIGINT', () => shutdown('SIGINT'));
  process.on('SIGTERM', () => shutdown('SIGTERM'));
}

bootstrap().catch((err) => {
  logger.error({ err }, 'Fatal startup error');
  process.exit(1);
});
