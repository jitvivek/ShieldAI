/**
 * Rule Engine Service — Loads regex patterns from YAML files and evaluates
 * text against them. Runs on BOTH the normalized text and the deleetified text.
 * Also performs structural pattern detection for injection markers.
 */

import fs from 'fs';
import path from 'path';

import yaml from 'js-yaml';

import { logger } from '../config/logger';
import { RuleEngineResult, MatchedRule, RuleFile, RuleDefinition } from '../types/detection';

// Compiled rules cache for performance
interface CompiledRule {
  id: string;
  name: string;
  regex: RegExp;
  severity: 'low' | 'medium' | 'high' | 'critical';
  weight: number;
  category: string;
  pattern: string;
  description: string;
}

let compiledRules: CompiledRule[] = [];
let rulesLoaded = false;

/**
 * Structural injection patterns — detect chat template delimiters and system prompt formatting.
 */
const STRUCTURAL_PATTERNS: Array<{ name: string; regex: RegExp }> = [
  { name: 'system_tag_open', regex: /\[SYSTEM\]\s*:/i },
  { name: 'im_start_system', regex: /<\|im_start\|>\s*system/i },
  { name: 'llama_sys_tag', regex: /<<SYS>>/i },
  { name: 'inst_tag', regex: /\[INST\]/i },
  { name: 'end_inst_tag', regex: /\[\/INST\]/i },
  { name: 'im_end_tag', regex: /<\|im_end\|>/i },
  { name: 'im_start_user', regex: /<\|im_start\|>\s*user/i },
  { name: 'im_start_assistant', regex: /<\|im_start\|>\s*assistant/i },
  { name: 'system_colon_format', regex: /^system\s*:/im },
  { name: 'assistant_colon_format', regex: /^assistant\s*:/im },
  { name: 'human_colon_format', regex: /^human\s*:/im },
  { name: 'hidden_text_html', regex: /<div\s+style=["'].*?display\s*:\s*none/i },
  { name: 'hidden_text_small', regex: /<span\s+style=["'].*?font-size\s*:\s*0/i },
  { name: 'html_comment_injection', regex: /<!--[\s\S]*?(ignore|system|instruction|override)/i },
  { name: 'markdown_hidden_link', regex: /\[.*?\]\(.*?(javascript|data):/i },
  { name: 'large_base64_block', regex: /[A-Za-z0-9+/]{50,}={0,2}/ },
  { name: 'prompt_boundary_marker', regex: /={5,}|#{5,}|-{5,}/},
  { name: 'anthropic_human_tag', regex: /\\n\\nHuman:|\\n\\nAssistant:/i },
  { name: 'openai_role_format', regex: /\{"role"\s*:\s*"system"/i },
];

/**
 * Load all YAML rule files from the rules directory.
 * Compiles regex patterns for fast evaluation.
 */
export function loadRules(rulesDir?: string): void {
  const dir = rulesDir ?? path.resolve(process.cwd(), '..', 'rules');

  if (!fs.existsSync(dir)) {
    // Try alternate path for Docker environment
    const altDir = path.resolve(process.cwd(), 'rules');
    if (!fs.existsSync(altDir)) {
      logger.warn({ dir }, 'Rules directory not found — rule engine will have no rules');
      compiledRules = [];
      rulesLoaded = true;
      return;
    }
    return loadRulesFromDir(altDir);
  }

  loadRulesFromDir(dir);
}

function loadRulesFromDir(dir: string): void {
  const files = fs.readdirSync(dir).filter((f) => f.endsWith('.yaml') || f.endsWith('.yml'));

  compiledRules = [];

  for (const file of files) {
    try {
      const content = fs.readFileSync(path.join(dir, file), 'utf-8');
      const ruleFile = yaml.load(content) as RuleFile;

      if (!ruleFile?.rules || !Array.isArray(ruleFile.rules)) {
        logger.warn({ file }, 'Skipping invalid rule file — no rules array found');
        continue;
      }

      for (const rule of ruleFile.rules) {
        try {
          const compiled: CompiledRule = {
            id: rule.id,
            name: rule.name,
            regex: new RegExp(rule.pattern, 'i'),
            severity: rule.severity,
            weight: rule.weight,
            category: ruleFile.category,
            pattern: rule.pattern,
            description: rule.description,
          };
          compiledRules.push(compiled);
        } catch (err) {
          logger.warn({ ruleId: rule.id, file, err }, 'Failed to compile rule regex');
        }
      }

      logger.info({ file, ruleCount: ruleFile.rules.length }, 'Loaded rule file');
    } catch (err) {
      logger.error({ file, err }, 'Failed to load rule file');
    }
  }

  rulesLoaded = true;
  logger.info({ totalRules: compiledRules.length }, 'Rule engine initialized');
}

/**
 * Evaluate text against all loaded rules and structural patterns.
 * Tests both normalized and deleetified text variants.
 */
export function evaluate(normalizedText: string, deleetifiedText: string): RuleEngineResult {
  const start = performance.now();

  if (!rulesLoaded) {
    loadRules();
  }

  const matchedRules: MatchedRule[] = [];
  const seenRuleIds = new Set<string>();

  // Test both text variants against all rules
  const textsToTest = [
    { text: normalizedText, label: 'normalized' },
    { text: deleetifiedText, label: 'deleetified' },
  ];

  for (const { text } of textsToTest) {
    for (const rule of compiledRules) {
      // Skip if already matched this rule
      if (seenRuleIds.has(rule.id)) continue;

      const match = rule.regex.exec(text);
      if (match) {
        seenRuleIds.add(rule.id);
        matchedRules.push({
          ruleId: rule.id,
          category: rule.category,
          severity: rule.severity,
          weight: rule.weight,
          matchedText: match[0]!.substring(0, 100), // Truncate for safety
          pattern: rule.pattern,
        });
      }
    }
  }

  // Structural pattern detection
  const structuralFlags: string[] = [];
  const fullText = `${normalizedText}\n${deleetifiedText}`;

  for (const pattern of STRUCTURAL_PATTERNS) {
    if (pattern.regex.test(fullText)) {
      structuralFlags.push(pattern.name);
    }
  }

  // Compute aggregate score from matched rules
  // Use the maximum weight among matched rules, boosted by count
  let score = 0;
  if (matchedRules.length > 0) {
    const maxWeight = Math.max(...matchedRules.map((r) => r.weight));
    const countBoost = Math.min(0.1, matchedRules.length * 0.02);
    score = Math.min(1.0, maxWeight + countBoost);
  }

  // Structural flags add to the score
  if (structuralFlags.length > 0) {
    score = Math.min(1.0, score + structuralFlags.length * 0.05);
  }

  const processingTimeMs = Math.round((performance.now() - start) * 100) / 100;

  return {
    score,
    matchedRules,
    structuralFlags,
    processingTimeMs,
  };
}

/**
 * Get the total number of loaded rules.
 */
export function getRuleCount(): number {
  return compiledRules.length;
}

/**
 * Force reload rules from disk (used for hot-reload in development).
 */
export function reloadRules(rulesDir?: string): void {
  rulesLoaded = false;
  loadRules(rulesDir);
}

/**
 * Get all compiled rules grouped by category (for API/admin use).
 */
export function getRulesByCategory(): Record<string, RuleDefinition[]> {
  const grouped: Record<string, RuleDefinition[]> = {};

  for (const rule of compiledRules) {
    if (!grouped[rule.category]) {
      grouped[rule.category] = [];
    }
    grouped[rule.category]!.push({
      id: rule.id,
      name: rule.name,
      pattern: rule.pattern,
      severity: rule.severity,
      weight: rule.weight,
      description: rule.description,
    });
  }

  return grouped;
}
