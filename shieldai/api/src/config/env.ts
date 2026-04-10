import { z } from 'zod';

/**
 * Environment variable validation schema.
 * Validates all required env vars at startup — fail fast with clear errors.
 */
const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.coerce.number().int().positive().default(3000),
  LOG_LEVEL: z.enum(['fatal', 'error', 'warn', 'info', 'debug', 'trace']).default('info'),

  // PostgreSQL
  DATABASE_URL: z.string().url().startsWith('postgresql://'),

  // Redis
  REDIS_URL: z.string().url().startsWith('redis://'),

  // ML Sidecar
  ML_SERVICE_URL: z.string().url().default('http://ml-service:8000'),
  ML_SERVICE_TIMEOUT_MS: z.coerce.number().int().positive().default(500),

  // Rate limiting
  RATE_LIMIT_FREE_PER_MINUTE: z.coerce.number().int().positive().default(100),
  RATE_LIMIT_FREE_PER_DAY: z.coerce.number().int().positive().default(1000),
  RATE_LIMIT_PAID_PER_MINUTE: z.coerce.number().int().positive().default(1000),

  // Detection thresholds
  THRESHOLD_SAFE: z.coerce.number().min(0).max(1).default(0.3),
  THRESHOLD_SUSPICIOUS: z.coerce.number().min(0).max(1).default(0.7),

  // API key cache
  API_KEY_CACHE_TTL_SECONDS: z.coerce.number().int().positive().default(300),
});

export type Env = z.infer<typeof envSchema>;

let cachedEnv: Env | null = null;

/**
 * Parse and validate environment variables. Throws on invalid config.
 * Results are cached after first successful parse.
 */
export function getEnv(): Env {
  if (cachedEnv) return cachedEnv;

  const result = envSchema.safeParse(process.env);

  if (!result.success) {
    const formatted = result.error.format();
    const messages = Object.entries(formatted)
      .filter(([key]) => key !== '_errors')
      .map(([key, val]) => {
        const errors = (val as { _errors?: string[] })._errors ?? [];
        return `  ${key}: ${errors.join(', ')}`;
      })
      .join('\n');

    throw new Error(`Environment validation failed:\n${messages}`);
  }

  cachedEnv = result.data;
  return cachedEnv;
}
