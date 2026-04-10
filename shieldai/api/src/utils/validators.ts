import { z } from 'zod';

/**
 * Zod validation schemas for API request/response payloads.
 */

/** POST /v1/detect request body */
export const detectRequestSchema = z.object({
  input: z
    .string()
    .min(1, 'Input must not be empty')
    .max(50000, 'Input must not exceed 50,000 characters'),
  config: z
    .object({
      threshold: z.number().min(0).max(1).optional(),
      categories: z.string().optional().default('all'),
      include_breakdown: z.boolean().optional().default(true),
      language_hint: z.string().optional().default('auto'),
    })
    .optional(),
});

export type DetectRequestInput = z.infer<typeof detectRequestSchema>;

/** POST /v1/api-keys request body */
export const createApiKeySchema = z.object({
  name: z.string().min(1).max(100).optional().default('Default'),
  tier: z.enum(['free', 'starter', 'growth', 'enterprise']).optional().default('free'),
  customer_email: z.string().email(),
  customer_name: z.string().min(1).max(200).optional(),
  company: z.string().max(200).optional(),
});

export type CreateApiKeyInput = z.infer<typeof createApiKeySchema>;

/** Query params for GET /v1/logs */
export const logsQuerySchema = z.object({
  page: z.coerce.number().int().positive().optional().default(1),
  per_page: z.coerce.number().int().min(1).max(100).optional().default(50),
  verdict: z.enum(['pass', 'flag', 'block']).optional(),
  start_date: z.string().datetime().optional(),
  end_date: z.string().datetime().optional(),
});

export type LogsQueryInput = z.infer<typeof logsQuerySchema>;

/** Authorization header extraction */
export const authHeaderSchema = z
  .string()
  .regex(/^Bearer\s+sk-shield-[a-f0-9]{40}$/, 'Invalid authorization header format');
