import { z } from 'zod';

export const childSchema = z.object({
  name: z.string().min(1).max(50),
  age: z.number().int().min(8).max(17),
  ageTier: z.enum(['young', 'teen', 'older_teen']),
});

export const activitySchema = z.object({
  appName: z.string(),
  appPackage: z.string(),
  textPreview: z.string().max(80),
  direction: z.enum(['input', 'response']),
  verdict: z.enum(['safe', 'flagged', 'blocked']),
  riskScore: z.number().min(0).max(1),
  category: z.string().nullable(),
  language: z.string().nullable(),
});

export const settingsSchema = z.object({
  ageTier: z.enum(['young', 'teen', 'older_teen']),
  sensitivity: z.enum(['permissive', 'balanced', 'strict']),
  dailyLimitMins: z.number().min(15).max(240),
  bedtimeStart: z.string().regex(/^\d{2}:\d{2}$/),
  bedtimeEnd: z.string().regex(/^\d{2}:\d{2}$/),
});
