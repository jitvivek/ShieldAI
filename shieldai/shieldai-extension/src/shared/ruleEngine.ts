import type { RuleMatch, RuleCategory } from './types';
import directInjection from './rules/direct-injection.json';
import roleplayExploit from './rules/roleplay-exploit.json';
import hindiInjection from './rules/hindi-injection.json';
import hinglishInjection from './rules/hinglish-injection.json';
import harmfulContent from './rules/harmful-content.json';

const ALL_CATEGORIES = [
  directInjection,
  roleplayExploit,
  hindiInjection,
  hinglishInjection,
  harmfulContent,
] as unknown as RuleCategory[];

export function runRuleEngine(text: string, enableHindiHinglish = true): RuleMatch[] {
  const matches: RuleMatch[] = [];
  const normalizedText = text.toLowerCase();

  for (const category of ALL_CATEGORIES) {
    // Skip Hindi/Hinglish categories if disabled
    if (!enableHindiHinglish &&
        (category.category === 'hindi_injection' || category.category === 'hinglish_injection')) {
      continue;
    }

    for (const rule of category.rules) {
      try {
        const regex = new RegExp(rule.pattern, 'i');
        if (regex.test(normalizedText) || regex.test(text)) {
          matches.push({
            id: rule.id,
            name: rule.name,
            category: category.category,
            severity: rule.severity as RuleMatch['severity'],
            weight: rule.weight,
            description: rule.description,
          });
        }
      } catch {
        // Skip invalid regex patterns gracefully
      }
    }
  }

  return matches;
}

export function calculateRiskScore(matches: RuleMatch[]): number {
  if (matches.length === 0) return 0;

  // Use the highest weight match as the primary score
  const maxWeight = Math.max(...matches.map(m => m.weight));

  // Add a small bonus for multiple matches (capped at 0.1)
  const multiMatchBonus = Math.min((matches.length - 1) * 0.02, 0.1);

  return Math.min(maxWeight + multiMatchBonus, 1.0);
}

export function detectLanguage(text: string): string {
  const devanagariPattern = /[\u0900-\u097F]/;
  const tamilPattern = /[\u0B80-\u0BFF]/;
  const hinglishPatterns = /\b(bhai|yaar|kya|hai|nahi|haan|achha|theek|karo|batao|dikha)\b/i;

  if (devanagariPattern.test(text)) return 'Hindi';
  if (tamilPattern.test(text)) return 'Tamil';
  if (hinglishPatterns.test(text)) return 'Hinglish';
  return 'English';
}
