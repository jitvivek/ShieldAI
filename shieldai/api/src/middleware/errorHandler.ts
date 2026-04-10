import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';

import { logger } from '../config/logger';

/**
 * Global error handler middleware.
 * Catches all unhandled errors, logs them, and returns a consistent error response.
 * Handles Zod validation errors, known error types, and unexpected errors.
 */
export function errorHandler(err: Error, req: Request, res: Response, _next: NextFunction): void {
  const requestId = req.requestId ?? 'unknown';

  // Zod validation error
  if (err instanceof ZodError) {
    const formattedErrors = err.errors.map((e) => ({
      field: e.path.join('.'),
      message: e.message,
    }));

    logger.warn({ requestId, errors: formattedErrors }, 'Validation error');

    res.status(400).json({
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Request validation failed',
        details: formattedErrors,
      },
    });
    return;
  }

  // Known application errors
  if (err instanceof AppError) {
    logger.warn({ requestId, code: err.code, statusCode: err.statusCode }, err.message);

    res.status(err.statusCode).json({
      error: {
        code: err.code,
        message: err.message,
      },
    });
    return;
  }

  // Unexpected errors — log full error, return generic message
  logger.error({ requestId, err }, 'Unhandled error');

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'An unexpected error occurred',
    },
  });
}

/**
 * Application-level error class with HTTP status code and error code.
 */
export class AppError extends Error {
  public readonly statusCode: number;
  public readonly code: string;

  constructor(message: string, statusCode: number, code: string) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.name = 'AppError';
    Object.setPrototypeOf(this, AppError.prototype);
  }
}
