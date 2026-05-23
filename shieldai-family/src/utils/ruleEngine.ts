import directInjection from './rules/direct-injection.json';
import roleplayExploit from './rules/roleplay-exploit.json';
import encodingEvasion from './rules/encoding-evasion.json';
import hindiInjection from './rules/hindi-injection.json';
import hinglishInjection from './rules/hinglish-injection.json';
import tamilInjection from './rules/tamil-injection.json';
import harmfulContent from './rules/harmful-content.json';
import explicitContent from './rules/explicit-content.json';
import ageInappropriate from './rules/age-inappropriate.json';
import cyberbullying from './rules/cyberbullying.json';
import personalSafety from './rules/personal-safety.json';

export interface RuleScanResult {
  score: number;
  category: string;
  matchedRules: string[];
  language: string;
}

interface Rule {
  id: string;
  pattern: string;
  severity: string;
  weight: number;
  description?: string;
}

const ALL_RULES: Record<string, Rule[]> = {
  direct_injection: directInjection.rules,
  roleplay_exploit: roleplayExploit.rules,
  encoding_evasion: encodingEvasion.rules,
  hindi_injection: hindiInjection.rules,
  hinglish_injection: hinglishInjection.rules,
  tamil_injection: tamilInjection.rules,
  harmful_content: harmfulContent.rules,
  explicit_content: explicitContent.rules,
  cyberbullying: cyberbullying.rules,
  personal_safety: personalSafety.rules,
};

class RuleEngine {
  scan(text: string, ageTier: string = 'teen'): RuleScanResult {
    let maxScore = 0;
    let topCategory = '';
    const matchedRules: string[] = [];

    for (const [category, rules] of Object.entries(ALL_RULES)) {
      for (const rule of rules) {
        try {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(text)) {
            matchedRules.push(rule.id);
            if (rule.weight > maxScore) {
              maxScore = rule.weight;
              topCategory = category;
            }
          }
        } catch {
          // Skip invalid regex
        }
      }
    }

    // Check age-inappropriate rules
    if (ageInappropriate.tiers[ageTier as keyof typeof ageInappropriate.tiers]) {
      const tierRules = ageInappropriate.tiers[ageTier as keyof typeof ageInappropriate.tiers].rules;
      for (const rule of tierRules) {
        try {
          const regex = new RegExp(rule.pattern, 'gi');
          if (regex.test(text)) {
            matchedRules.push(rule.id);
            if (rule.weight > maxScore) {
              maxScore = rule.weight;
              topCategory = 'age_inappropriate';
            }
          }
        } catch {
          // Skip invalid regex
        }
      }
    }

    return {
      score: maxScore,
      category: topCategory,
      matchedRules,
      language: '',
    };
  }
}

export const ruleEngine = new RuleEngine();
