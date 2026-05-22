/**
 * Policy Builder Service
 * Provides available parameters for custom policy creation and
 * generates valid YAML policy from user-selected parameters.
 */

import yaml from 'js-yaml';

// ─── Parameter definitions exposed to users ───────────────────────────────────

export interface PolicyParameter {
  id: string;
  label: string;
  description: string;
  group: string;
}

export interface PolicyParameterGroup {
  id: string;
  label: string;
  description: string;
  parameters: PolicyParameter[];
}

export interface ThresholdOption {
  id: string;
  label: string;
  description: string;
  value: number;
}

export interface ActionOption {
  id: string;
  label: string;
  description: string;
}

export interface PolicyBuilderParams {
  groups: PolicyParameterGroup[];
  actions: ActionOption[];
  thresholds: ThresholdOption[];
  industries: { id: string; label: string; description: string }[];
}

export interface PolicyBuildRequest {
  name: string;
  description?: string;
  industry?: string;
  rules: PolicyRuleInput[];
}

export interface PolicyRuleInput {
  detector: string;
  action: string;
  severity: string;
  threshold?: number;
  patterns?: string[];
  categories?: string[];
  max_tokens?: number;
  custom_patterns?: string[];
}

// ─── Available parameters ─────────────────────────────────────────────────────

const PARAMETER_GROUPS: PolicyParameterGroup[] = [
  {
    id: 'pii_protection',
    label: 'PII Protection',
    description: 'Detect and handle personally identifiable information in outputs',
    parameters: [
      { id: 'aadhaar', label: 'Aadhaar Number', description: '12-digit Indian national ID (Verhoeff validated)', group: 'pii_protection' },
      { id: 'pan', label: 'PAN Card', description: 'Permanent Account Number (income tax ID)', group: 'pii_protection' },
      { id: 'email', label: 'Email Address', description: 'Email addresses (user@domain.com)', group: 'pii_protection' },
      { id: 'phone_india', label: 'Indian Phone', description: 'Indian mobile numbers (+91, 10-digit)', group: 'pii_protection' },
      { id: 'phone_intl', label: 'International Phone', description: 'International phone numbers', group: 'pii_protection' },
      { id: 'credit_card', label: 'Credit/Debit Card', description: '16-digit card numbers (Luhn validated)', group: 'pii_protection' },
      { id: 'upi_id', label: 'UPI ID', description: 'UPI payment addresses (user@bank)', group: 'pii_protection' },
      { id: 'ifsc', label: 'IFSC Code', description: 'Bank branch IFSC codes', group: 'pii_protection' },
      { id: 'ip_address', label: 'IP Address', description: 'IPv4 addresses', group: 'pii_protection' },
      { id: 'indian_passport', label: 'Indian Passport', description: 'Indian passport number', group: 'pii_protection' },
      { id: 'voter_id_epic', label: 'Voter ID (EPIC)', description: 'Voter ID / EPIC number', group: 'pii_protection' },
    ],
  },
  {
    id: 'content_safety',
    label: 'Content Safety',
    description: 'Block harmful, dangerous, or inappropriate content categories',
    parameters: [
      { id: 'weapons', label: 'Weapons & Explosives', description: 'Weapon/bomb creation instructions', group: 'content_safety' },
      { id: 'drugs', label: 'Drug Synthesis', description: 'Illegal drug manufacturing instructions', group: 'content_safety' },
      { id: 'self_harm', label: 'Self-Harm', description: 'Self-harm or suicide instructions', group: 'content_safety' },
      { id: 'violence', label: 'Violence', description: 'Instructions for violence against persons', group: 'content_safety' },
      { id: 'exploitation', label: 'Exploitation', description: 'Child exploitation or trafficking content', group: 'content_safety' },
      { id: 'explicit', label: 'Explicit/NSFW', description: 'Pornography, nudity, explicit sexual content', group: 'content_safety' },
      { id: 'hate_speech', label: 'Hate Speech', description: 'Caste, communal, religious hate speech', group: 'content_safety' },
      { id: 'bias', label: 'Bias & Discrimination', description: 'Caste supremacy, gender bias, LGBTQ+ hate', group: 'content_safety' },
    ],
  },
  {
    id: 'prompt_security',
    label: 'Prompt Security',
    description: 'Prevent prompt injection, jailbreaks, and system prompt leaks',
    parameters: [
      { id: 'prompt_leak', label: 'System Prompt Leak', description: 'Prevent leaking system prompt contents', group: 'prompt_security' },
      { id: 'jailbreak', label: 'Jailbreak Detection', description: 'Detect DAN, role override, and charter violations', group: 'prompt_security' },
      { id: 'injection', label: 'Prompt Injection', description: 'Detect direct injection attempts', group: 'prompt_security' },
    ],
  },
  {
    id: 'compliance',
    label: 'Regulatory Compliance',
    description: 'Enforce industry-specific regulatory requirements',
    parameters: [
      { id: 'financial_advice', label: 'Financial Advice Guard', description: 'Flag unauthorized investment/financial advice', group: 'compliance' },
      { id: 'medical_advice', label: 'Medical Advice Guard', description: 'Flag unauthorized medical diagnoses/prescriptions', group: 'compliance' },
      { id: 'legal_advice', label: 'Legal Advice Guard', description: 'Flag unauthorized legal recommendations', group: 'compliance' },
      { id: 'dpdp_data_retention', label: 'DPDP Data Retention', description: 'Enforce DPDP Act data minimization', group: 'compliance' },
      { id: 'internal_data_leak', label: 'Internal Data Leak', description: 'Block internal IDs, audit refs, SWIFT codes', group: 'compliance' },
    ],
  },
  {
    id: 'output_controls',
    label: 'Output Controls',
    description: 'Control response format, length, and quality',
    parameters: [
      { id: 'response_length', label: 'Response Length Limit', description: 'Truncate overly long responses', group: 'output_controls' },
      { id: 'canary_detection', label: 'Canary Token Detection', description: 'Detect leaked canary/watermark tokens', group: 'output_controls' },
      { id: 'disclaimer_required', label: 'Disclaimer Enforcement', description: 'Flag responses that give advice without disclaimers', group: 'output_controls' },
    ],
  },
];

const ACTIONS: ActionOption[] = [
  { id: 'block', label: 'Block', description: 'Completely block the response — returns error to user' },
  { id: 'flag', label: 'Flag', description: 'Allow the response but flag it for review in logs' },
  { id: 'redact', label: 'Redact', description: 'Replace detected content with masks (e.g., XXXX-XXXX-1234)' },
  { id: 'truncate', label: 'Truncate', description: 'Cut the response at the configured limit' },
];

const THRESHOLDS: ThresholdOption[] = [
  { id: 'strict', label: 'Strict (0.15)', description: 'Very sensitive — may have some false positives', value: 0.15 },
  { id: 'moderate', label: 'Moderate (0.30)', description: 'Balanced sensitivity — recommended for most use cases', value: 0.30 },
  { id: 'relaxed', label: 'Relaxed (0.50)', description: 'Lower sensitivity — only high-confidence detections', value: 0.50 },
  { id: 'very_relaxed', label: 'Very Relaxed (0.70)', description: 'Minimal — only clear-cut violations', value: 0.70 },
];

const INDUSTRIES = [
  { id: 'general', label: 'General', description: 'Standard policy for any application' },
  { id: 'bfsi', label: 'BFSI (Banking/Finance)', description: 'Banking, insurance, fintech — RBI/SEBI compliant' },
  { id: 'healthcare', label: 'Healthcare', description: 'Hospitals, telemedicine, health-tech' },
  { id: 'education', label: 'Education', description: 'EdTech platforms, schools, universities' },
  { id: 'ecommerce', label: 'E-Commerce', description: 'Retail, marketplace, customer support bots' },
  { id: 'government', label: 'Government', description: 'Public sector, citizen services' },
  { id: 'legal', label: 'Legal', description: 'Law firms, legal-tech, contract review' },
];

// ─── Financial advice patterns ────────────────────────────────────────────────

const FINANCIAL_PATTERNS = [
  'guaranteed returns',
  'risk free investment',
  'invest now',
  'double your money',
  'insider trading tip',
  'sure shot profit',
  'zero risk',
  'this is financial advice',
  'i recommend you invest',
  'you should definitely buy',
  'guaranteed profit',
];

const MEDICAL_PATTERNS = [
  'i prescribe',
  'take this medicine',
  'your diagnosis is',
  'you definitely have',
  'stop taking your medication',
  'this cures',
  'guaranteed cure',
  'no need to see a doctor',
];

const LEGAL_PATTERNS = [
  'this is legal advice',
  'you should sue',
  'i advise you to file',
  'guaranteed to win the case',
  'no need for a lawyer',
  'you will definitely win',
];

const INTERNAL_DATA_PATTERNS = [
  'internal account number',
  'customer transaction id',
  'internal audit reference',
  'bank internal memo',
  'swift code internal',
  'internal routing number',
  'employee id',
  'internal ticket',
];

// ─── Public exports ───────────────────────────────────────────────────────────

/**
 * Return all available parameters for the policy builder UI.
 */
export function getBuilderParameters(): PolicyBuilderParams {
  return {
    groups: PARAMETER_GROUPS,
    actions: ACTIONS,
    thresholds: THRESHOLDS,
    industries: INDUSTRIES,
  };
}

/**
 * Build a valid YAML policy from user-selected parameters.
 */
export function buildPolicy(request: PolicyBuildRequest): { yaml_content: string; validation: { valid: boolean; warnings: string[] } } {
  const warnings: string[] = [];

  if (!request.name || request.name.trim().length === 0) {
    throw new Error('Policy name is required');
  }

  if (!request.rules || request.rules.length === 0) {
    throw new Error('At least one rule is required');
  }

  const policyRules: Record<string, unknown>[] = [];

  for (const rule of request.rules) {
    const policyRule: Record<string, unknown> = {};

    switch (rule.detector) {
      case 'pii_detector': {
        const patterns = rule.patterns ?? ['email', 'phone_india', 'aadhaar', 'pan', 'credit_card'];
        policyRule['name'] = `no_pii_${rule.action}`;
        policyRule['action'] = rule.action;
        policyRule['severity'] = rule.severity || 'high';
        policyRule['detector'] = 'pii_detector';
        policyRule['patterns'] = patterns;
        break;
      }

      case 'content_classifier': {
        const categories = rule.categories ?? ['weapons', 'drugs', 'self_harm', 'violence'];
        policyRule['name'] = `no_harmful_content`;
        policyRule['action'] = rule.action;
        policyRule['severity'] = rule.severity || 'critical';
        policyRule['detector'] = 'content_classifier';
        policyRule['categories'] = categories;
        break;
      }

      case 'prompt_shield': {
        policyRule['name'] = `no_system_prompt_leak`;
        policyRule['action'] = rule.action;
        policyRule['severity'] = rule.severity || 'critical';
        policyRule['detector'] = 'prompt_shield';
        if (rule.threshold !== undefined) {
          policyRule['threshold'] = rule.threshold;
        }
        break;
      }

      case 'jailbreak_detector': {
        policyRule['name'] = `no_jailbreak`;
        policyRule['action'] = rule.action;
        policyRule['severity'] = rule.severity || 'critical';
        policyRule['detector'] = 'jailbreak_detector';
        if (rule.threshold !== undefined) {
          policyRule['threshold'] = rule.threshold;
        }
        break;
      }

      case 'keyword_match': {
        let patterns: string[] = [];
        let name = 'custom_keyword_block';

        if (rule.categories?.includes('financial_advice')) {
          patterns = [...patterns, ...FINANCIAL_PATTERNS];
          name = 'no_financial_advice';
        }
        if (rule.categories?.includes('medical_advice')) {
          patterns = [...patterns, ...MEDICAL_PATTERNS];
          name = 'no_medical_advice';
        }
        if (rule.categories?.includes('legal_advice')) {
          patterns = [...patterns, ...LEGAL_PATTERNS];
          name = 'no_legal_advice';
        }
        if (rule.categories?.includes('internal_data_leak')) {
          patterns = [...patterns, ...INTERNAL_DATA_PATTERNS];
          name = 'no_internal_data_leak';
        }
        if (rule.custom_patterns && rule.custom_patterns.length > 0) {
          patterns = [...patterns, ...rule.custom_patterns];
          name = 'custom_keyword_match';
        }

        if (patterns.length === 0) {
          warnings.push('keyword_match rule has no patterns — skipped');
          continue;
        }

        policyRule['name'] = name;
        policyRule['action'] = rule.action;
        policyRule['severity'] = rule.severity || 'high';
        policyRule['detector'] = 'keyword_match';
        policyRule['patterns'] = patterns;
        break;
      }

      case 'length_check': {
        policyRule['name'] = 'response_length_limit';
        policyRule['action'] = 'truncate';
        policyRule['severity'] = rule.severity || 'low';
        policyRule['detector'] = 'length_check';
        policyRule['max_tokens'] = rule.max_tokens ?? 2000;
        break;
      }

      default:
        warnings.push(`Unknown detector "${rule.detector}" — skipped`);
        continue;
    }

    policyRules.push(policyRule);
  }

  if (policyRules.length === 0) {
    throw new Error('No valid rules could be generated from the provided parameters');
  }

  const policyObject = {
    name: request.name.toLowerCase().replace(/[^a-z0-9_-]/g, '-'),
    version: 1,
    ...(request.description ? { description: request.description } : {}),
    ...(request.industry ? { industry: request.industry } : {}),
    policies: policyRules,
  };

  const yamlContent = yaml.dump(policyObject, { lineWidth: 120, noRefs: true });

  return {
    yaml_content: yamlContent,
    validation: { valid: true, warnings },
  };
}

/**
 * Get a recommended policy preset for a given industry.
 */
export function getIndustryPreset(industry: string): PolicyBuildRequest {
  switch (industry) {
    case 'bfsi':
      return {
        name: 'bfsi-policy',
        description: 'Banking/Finance/Insurance policy — RBI/SEBI compliant',
        industry: 'bfsi',
        rules: [
          { detector: 'pii_detector', action: 'block', severity: 'critical', patterns: ['email', 'phone_india', 'aadhaar', 'pan', 'credit_card', 'upi_id', 'ifsc'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.15 },
          { detector: 'jailbreak_detector', action: 'block', severity: 'critical', threshold: 0.5 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence', 'hate_speech'] },
          { detector: 'keyword_match', action: 'flag', severity: 'high', categories: ['financial_advice', 'internal_data_leak'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 1500 },
        ],
      };

    case 'healthcare':
      return {
        name: 'healthcare-policy',
        description: 'Healthcare — prevents unauthorized medical advice and PII leaks',
        industry: 'healthcare',
        rules: [
          { detector: 'pii_detector', action: 'block', severity: 'critical', patterns: ['aadhaar', 'pan', 'email', 'phone_india', 'credit_card'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.20 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence'] },
          { detector: 'keyword_match', action: 'flag', severity: 'high', categories: ['medical_advice'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 2000 },
        ],
      };

    case 'education':
      return {
        name: 'education-policy',
        description: 'Education — safe environment for students',
        industry: 'education',
        rules: [
          { detector: 'pii_detector', action: 'redact', severity: 'high', patterns: ['email', 'phone_india', 'aadhaar'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.25 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence', 'explicit', 'hate_speech', 'bias'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 3000 },
        ],
      };

    case 'ecommerce':
      return {
        name: 'ecommerce-policy',
        description: 'E-Commerce — customer support safety',
        industry: 'ecommerce',
        rules: [
          { detector: 'pii_detector', action: 'redact', severity: 'high', patterns: ['email', 'phone_india', 'credit_card', 'upi_id'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.30 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'self_harm', 'violence', 'hate_speech'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 2000 },
        ],
      };

    case 'government':
      return {
        name: 'government-policy',
        description: 'Government services — strict security and data protection',
        industry: 'government',
        rules: [
          { detector: 'pii_detector', action: 'block', severity: 'critical', patterns: ['aadhaar', 'pan', 'email', 'phone_india', 'voter_id_epic', 'indian_passport'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.15 },
          { detector: 'jailbreak_detector', action: 'block', severity: 'critical', threshold: 0.4 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence', 'hate_speech', 'bias'] },
          { detector: 'keyword_match', action: 'block', severity: 'critical', categories: ['internal_data_leak'] },
          { detector: 'length_check', action: 'truncate', severity: 'medium', max_tokens: 1000 },
        ],
      };

    case 'legal':
      return {
        name: 'legal-policy',
        description: 'Legal industry — prevents unauthorized legal advice',
        industry: 'legal',
        rules: [
          { detector: 'pii_detector', action: 'block', severity: 'critical', patterns: ['aadhaar', 'pan', 'email', 'phone_india', 'credit_card'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.20 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence'] },
          { detector: 'keyword_match', action: 'flag', severity: 'high', categories: ['legal_advice'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 2500 },
        ],
      };

    default: // general
      return {
        name: 'custom-policy',
        description: 'General-purpose safety policy',
        industry: 'general',
        rules: [
          { detector: 'pii_detector', action: 'redact', severity: 'high', patterns: ['email', 'phone_india', 'aadhaar', 'pan', 'credit_card'] },
          { detector: 'prompt_shield', action: 'block', severity: 'critical', threshold: 0.30 },
          { detector: 'content_classifier', action: 'block', severity: 'critical', categories: ['weapons', 'drugs', 'self_harm', 'violence'] },
          { detector: 'length_check', action: 'truncate', severity: 'low', max_tokens: 2000 },
        ],
      };
  }
}
