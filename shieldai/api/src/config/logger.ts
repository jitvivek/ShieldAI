import pino from 'pino';

import { getEnv } from './env';

/**
 * Structured JSON logger using Pino.
 * In development, uses pretty-printing; in production, pure JSON.
 */
function createLogger(): pino.Logger {
  let level: string;
  try {
    level = getEnv().LOG_LEVEL;
  } catch {
    level = process.env['LOG_LEVEL'] ?? 'info';
  }

  const isProduction = process.env['NODE_ENV'] === 'production';

  return pino({
    level,
    name: 'shieldai',
    ...(isProduction
      ? {}
      : {
          transport: {
            target: 'pino/file',
            options: { destination: 1 }, // stdout
          },
        }),
    serializers: {
      err: pino.stdSerializers.err,
      req: pino.stdSerializers.req,
      res: pino.stdSerializers.res,
    },
    formatters: {
      level: (label) => ({ level: label }),
    },
    timestamp: pino.stdTimeFunctions.isoTime,
  });
}

export const logger = createLogger();
