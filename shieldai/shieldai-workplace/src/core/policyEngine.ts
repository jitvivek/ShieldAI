import fs from 'fs';
import path from 'path';
import yaml from 'js-yaml';
import pino from 'pino';
import type { PolicyConfig, PolicyRule, PolicyViolation } from '../types/common';

const logger = pino({ name: 'policy-engine' });

const policyCache = new Map<string, PolicyConfig>();

const POLICIES_DIR = path.resolve(process.cwd(), 'policies');

function loadPolicyFromFile(name: string): PolicyConfig | null {
  try {
    const filePath = path.join(POLICIES_DIR, `${name}.yaml`);
    if (!fs.existsSync(filePath)) return null;
    const content = fs.readFileSync(filePath, 'utf-8');
    return yaml.load(content) as PolicyConfig;
  } catch (err) {
    logger.error({ err, name }, 'Failed to load policy file');
    return null;
  }
}

export function loadPolicy(orgId: string, policyName?: string): PolicyConfig | null {
  const name = policyName || 'default';
  if (policyCache.has(name)) return policyCache.get(name)!;

  const policy = loadPolicyFromFile(name);
  if (policy) {
    policyCache.set(name, policy);
  }
  return policy;
}

export function loadPolicyFromYaml(yamlContent: string): PolicyConfig | null {
  try {
    return yaml.load(yamlContent) as PolicyConfig;
  } catch {
    return null;
  }
}

interface EvalContext {
  piiTypes: string[];
  category: string;
  verdict: string;
}

export function evaluatePolicy(policy: PolicyConfig, ctx: EvalContext): PolicyViolation[] {
  const violations: PolicyViolation[] = [];

  for (const rule of policy.policies) {
    let triggered = false;

    if (rule.detector === 'pii_scanner' && rule.patterns) {
      triggered = rule.patterns.some((p) => ctx.piiTypes.includes(p));
    } else if (rule.detector === 'content_classifier' && rule.categories) {
      triggered = rule.categories.includes(ctx.category);
    } else if (rule.detector === 'all') {
      triggered = true;
    }

    if (triggered) {
      violations.push({
        policyName: rule.name,
        action: rule.action,
        message: rule.message,
        detector: rule.detector,
      });
    }
  }

  return violations;
}

export function clearPolicyCache(): void {
  policyCache.clear();
}
