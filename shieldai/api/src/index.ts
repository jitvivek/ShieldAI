/**
 * Server entry point — validates environment, initializes services, and starts listening.
 */

import { getEnv } from './config/env';
import { logger } from './config/logger';
import { getRedis, closeRedis } from './config/redis';
import { createApp } from './app';
import { loadRules } from './services/ruleEngine';
import { initializeEmbeddings } from './services/semanticSimilarity';

async function main(): Promise<void> {
  // Step 1: Validate environment variables (fail fast)
  const env = getEnv();
  logger.info({ nodeEnv: env.NODE_ENV, port: env.PORT }, 'Environment validated');

  // Step 2: Initialize Redis connection
  getRedis();

  // Step 3: Load detection rules from YAML
  loadRules();

  // Step 4: Create Express app
  const app = createApp();

  // Step 5: Start HTTP server
  const server = app.listen(env.PORT, () => {
    logger.info({ port: env.PORT }, 'ShieldAI API server started');
  });

  // Step 6: Initialize ML embeddings in background (non-blocking)
  initializeEmbeddings().catch((err) => {
    logger.warn({ err }, 'Failed to initialize embeddings — semantic similarity will be unavailable');
  });

  // Graceful shutdown
  const shutdown = async (signal: string) => {
    logger.info({ signal }, 'Received shutdown signal');

    server.close(() => {
      logger.info('HTTP server closed');
    });

    await closeRedis();
    logger.info('Redis connection closed');

    process.exit(0);
  };

  process.on('SIGTERM', () => shutdown('SIGTERM'));
  process.on('SIGINT', () => shutdown('SIGINT'));

  // Unhandled rejection handler
  process.on('unhandledRejection', (reason) => {
    logger.fatal({ reason }, 'Unhandled promise rejection');
    process.exit(1);
  });
}

main().catch((err) => {
  // eslint-disable-next-line no-console
  console.error('Fatal startup error:', err);
  process.exit(1);
});
