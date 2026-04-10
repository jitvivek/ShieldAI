/**
 * Phase 2 — Policy Engine Service
 * Parses and evaluates YAML policy files. Dispatches to appropriate detector modules.
 * Policies are per-customer, stored in PostgreSQL, cached in Redis.
 */

import yaml from 'js-yaml';
import { PrismaClient } from '@prisma/client';

import { logger } from '../config/logger';
import { getRedis } from '../config/redis';
import {
  PolicyConfig,
  PolicyRule,
  PolicyResult,
  PolicyAction,
  PolicySeverity,
  OutputScanResult,
  PiiType,
} from '../types/guard';
import { detectPii, redactPii } from './piiDetector';

const prisma = new PrismaClient();
const POLICY_CACHE_TTL = 300; // 5 minutes

/**
 * Zod-like manual schema validation for policy YAML.
 */
function validatePolicyConfig(raw: unknown): PolicyConfig {
  if (!raw || typeof raw !== 'object') {
    throw new Error('Policy must be a YAML object');
  }

  const obj = raw as Record<string, unknown>;

  if (typeof obj['name'] !== 'string' || obj['name'].length === 0) {
    throw new Error('Policy must have a non-empty "name" field');
  }

  if (!Array.isArray(obj['policies'])) {
    throw new Error('Policy must have a "policies" array');
  }

  const validActions: PolicyAction[] = ['block', 'flag', 'redact', 'truncate'];
  const validSeverities: PolicySeverity[] = ['critical', 'high', 'medium', 'low'];
  const validDetectors = [
    'prompt_shield',
    'pii_detector',
    'content_classifier',
    'keyword_match',
    'length_check',
    'jailbreak_detector',
  ];

  const policies: PolicyRule[] = (obj['policies'] as unknown[]).map((p, i) => {
    const rule = p as Record<string, unknown>;

    if (typeof rule['name'] !== 'string') {
      throw new Error(`Policy rule #${i + 1} must have a "name" field`);
    }
    if (!validActions.includes(rule['action'] as PolicyAction)) {
      throw new Error(
        `Policy rule "${rule['name']}": invalid action "${rule['action']}". Valid: ${validActions.join(', ')}`,
      );
    }
    if (!validSeverities.includes(rule['severity'] as PolicySeverity)) {
      throw new Error(
        `Policy rule "${rule['name']}": invalid severity "${rule['severity']}". Valid: ${validSeverities.join(', ')}`,
      );
    }
    if (!validDetectors.includes(rule['detector'] as string)) {
      throw new Error(
        `Policy rule "${rule['name']}": invalid detector "${rule['detector']}". Valid: ${validDetectors.join(', ')}`,
      );
    }

    return {
      name: rule['name'] as string,
      action: rule['action'] as PolicyAction,
      severity: rule['severity'] as PolicySeverity,
      detector: rule['detector'] as string,
      patterns: Array.isArray(rule['patterns']) ? (rule['patterns'] as string[]) : undefined,
      categories: Array.isArray(rule['categories']) ? (rule['categories'] as string[]) : undefined,
      blocked_terms_file: typeof rule['blocked_terms_file'] === 'string' ? rule['blocked_terms_file'] : undefined,
      max_tokens: typeof rule['max_tokens'] === 'number' ? rule['max_tokens'] : undefined,
      threshold: typeof rule['threshold'] === 'number' ? rule['threshold'] : undefined,
    };
  });

  return {
    name: obj['name'] as string,
    version: typeof obj['version'] === 'number' ? obj['version'] : 1,
    policies,
  };
}

/**
 * Parse YAML policy string into validated PolicyConfig.
 */
export function parsePolicy(yamlContent: string): PolicyConfig {
  const raw = yaml.load(yamlContent);
  return validatePolicyConfig(raw);
}

/**
 * Load policy by name for a customer. Checks Redis cache first, then PostgreSQL.
 */
export async function loadPolicy(customerId: string, policyName: string): Promise<PolicyConfig | null> {
  const cacheKey = `policy:${customerId}:${policyName}`;
  const redis = getRedis();

  // Check cache
  const cached = await redis.get(cacheKey);
  if (cached) {
    try {
      return JSON.parse(cached) as PolicyConfig;
    } catch {
      // Invalid cache, fall through
    }
  }

  // Load from DB
  const dbPolicy = await prisma.policy.findFirst({
    where: { customerId, name: policyName, isActive: true },
    orderBy: { version: 'desc' },
  });

  if (!dbPolicy) return null;

  const config = parsePolicy(dbPolicy.yamlContent);

  // Cache it
  await redis.set(cacheKey, JSON.stringify(config), 'EX', POLICY_CACHE_TTL);

  return config;
}

/**
 * Evaluate all policy rules against the given text.
 */
export function evaluatePolicies(
  text: string,
  policyConfig: PolicyConfig,
  context: {
    promptLeakScore?: number;
    piiMatches?: ReturnType<typeof detectPii>;
    jailbreakScore?: number;
    contentCategories?: string[];
  } = {},
): PolicyResult[] {
  const results: PolicyResult[] = [];

  for (const rule of policyConfig.policies) {
    const result = evaluateRule(text, rule, context);
    results.push(result);
  }

  return results;
}

/**
 * Evaluate a single policy rule.
 */
function evaluateRule(
  text: string,
  rule: PolicyRule,
  context: {
    promptLeakScore?: number;
    piiMatches?: ReturnType<typeof detectPii>;
    jailbreakScore?: number;
    contentCategories?: string[];
  },
): PolicyResult {
  const threshold = rule.threshold ?? 0.5;

  switch (rule.detector) {
    case 'prompt_shield': {
      const score = context.promptLeakScore ?? 0;
      const passed = score < (rule.threshold ?? 0.30);
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Prompt leak score ${(score * 100).toFixed(1)}% exceeds threshold`,
      };
    }

    case 'pii_detector': {
      const piiMatches = context.piiMatches ?? detectPii(text, rule.patterns as PiiType[] | undefined);
      const passed = piiMatches.length === 0;
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Found ${piiMatches.length} PII match(es): ${piiMatches.map((m) => m.type).join(', ')}`,
      };
    }

    case 'content_classifier': {
      const categories = context.contentCategories ?? [];
      const blockedCategories = rule.categories ?? [];
      const violations = categories.filter((c) => blockedCategories.includes(c));
      const passed = violations.length === 0;
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Content matched blocked categories: ${violations.join(', ')}`,
      };
    }

    case 'keyword_match': {
      // Simple keyword blocklist check
      const lowerText = text.toLowerCase();
      const blockedTerms = rule.patterns ?? [];
      const found = blockedTerms.filter((term) => lowerText.includes(term.toLowerCase()));
      const passed = found.length === 0;
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Blocked terms detected: ${found.join(', ')}`,
      };
    }

    case 'length_check': {
      const maxTokens = rule.max_tokens ?? 2000;
      // Approximate: 1 token ≈ 4 chars
      const approxTokens = Math.ceil(text.length / 4);
      const passed = approxTokens <= maxTokens;
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Response ~${approxTokens} tokens exceeds limit of ${maxTokens}`,
      };
    }

    case 'jailbreak_detector': {
      const score = context.jailbreakScore ?? 0;
      const passed = score < threshold;
      return {
        policyName: rule.name,
        passed,
        action: rule.action,
        severity: rule.severity,
        detail: passed ? undefined : `Jailbreak score ${(score * 100).toFixed(1)}% exceeds threshold`,
      };
    }

    default: {
      logger.warn({ detector: rule.detector, policy: rule.name }, 'Unknown policy detector');
      return {
        policyName: rule.name,
        passed: true,
        action: rule.action,
        severity: rule.severity,
        detail: `Unknown detector: ${rule.detector}`,
      };
    }
  }
}
