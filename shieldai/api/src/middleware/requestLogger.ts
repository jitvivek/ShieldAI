import { Request, Response, NextFunction } from 'express';

import { logger } from '../config/logger';

/**
 * Request/response logging middleware.
 * Logs incoming requests and outgoing responses with latency.
 * Never logs raw user input — only metadata.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  const start = Date.now();
  const requestId = req.requestId ?? 'unknown';

  // Log incoming request (no body/input logged for security)
  logger.info(
    {
      requestId,
      method: req.method,
      path: req.path,
      ip: req.ip,
      userAgent: req.get('user-agent'),
    },
    'Incoming request',
  );

  // Capture response finish
  res.on('finish', () => {
    const duration = Date.now() - start;
    const logData = {
      requestId,
      method: req.method,
      path: req.path,
      statusCode: res.statusCode,
      duration,
    };

    if (res.statusCode >= 500) {
      logger.error(logData, 'Request completed with server error');
    } else if (res.statusCode >= 400) {
      logger.warn(logData, 'Request completed with client error');
    } else {
      logger.info(logData, 'Request completed');
    }
  });

  next();
}
