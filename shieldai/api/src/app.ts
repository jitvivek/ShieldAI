/**
 * Express app setup — configures middleware, routes, Swagger docs, and error handling.
 */

import express from 'express';
import 'express-async-errors';
import cors from 'cors';
import helmet from 'helmet';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';

import { errorHandler } from './middleware/errorHandler';
import { requestIdMiddleware } from './middleware/requestId';
import { requestLogger } from './middleware/requestLogger';
import { registerRoutes } from './routes';

export function createApp(): express.Application {
  const app = express();

  // Security headers
  app.use(helmet());

  // CORS
  app.use(
    cors({
      origin: process.env['NODE_ENV'] === 'production' ? false : '*',
      methods: ['GET', 'POST', 'DELETE', 'OPTIONS'],
      allowedHeaders: ['Content-Type', 'Authorization', 'X-Request-Id'],
    }),
  );

  // Body parsing
  app.use(express.json({ limit: '1mb' }));
  app.use(express.urlencoded({ extended: false }));

  // Request ID generation (before logging)
  app.use(requestIdMiddleware);

  // Request/response logging
  app.use(requestLogger);

  // Swagger/OpenAPI documentation
  const swaggerSpec = swaggerJsdoc({
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'ShieldAI API',
        version: '1.0.0',
        description: 'LLM Prompt Injection Detection API — The trust layer for LLM applications',
        contact: { name: 'ShieldAI', url: 'https://shieldai.dev' },
        license: { name: 'MIT' },
      },
      servers: [
        { url: 'http://localhost:3000', description: 'Local development' },
      ],
      components: {
        securitySchemes: {
          BearerAuth: {
            type: 'http',
            scheme: 'bearer',
            description: 'API key in format: sk-shield-<40-hex-chars>',
          },
        },
      },
    },
    apis: ['./src/routes/**/*.ts'],
  });

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get('/openapi.json', (_req, res) => res.json(swaggerSpec));

  // Register API routes
  registerRoutes(app);

  // 404 handler
  app.use((_req, res) => {
    res.status(404).json({
      error: {
        code: 'NOT_FOUND',
        message: 'The requested endpoint does not exist',
      },
    });
  });

  // Global error handler (must be last)
  app.use(errorHandler);

  return app;
}
