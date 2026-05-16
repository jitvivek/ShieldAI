/**
 * Compliance Engine — maps detection results to Indian regulations.
 * Covers DPDP Act 2023, IT Act 2000, IT Rules 2021, RBI, and SEBI frameworks.
 */

import { logger } from '../config/logger';

export interface RegulationSection {
  title: string;
  triggers: string[];
}

export interface Regulation {
  name: string;
  sections: Record<string, RegulationSection>;
  penalty?: string;
  applicableTo?: string[];
}

export interface ComplianceViolation {
  regulation: string;
  section: string;
  sectionTitle: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

export interface ComplianceMapping {
  violations: ComplianceViolation[];
  overallStatus: 'compliant' | 'needs_review' | 'violation';
}

export interface RegulationStatus {
  status: 'compliant' | 'needs_review' | 'violation' | 'not_applicable';
  violations30d: number;
  sectionsTriggered: string[];
  description: string;
  reason?: string;
}

export const INDIA_REGULATIONS: Record<string, Regulation> = {
  dpdp_act: {
    name: 'Digital Personal Data Protection Act, 2023',
    sections: {
      section_4: { title: 'Lawful purpose and consent', triggers: ['pii_processing_without_consent'] },
      section_5: { title: 'Notice and consent', triggers: ['pii_collection'] },
      section_6: { title: 'Legitimate uses', triggers: ['pii_processing'] },
      section_8: { title: 'Obligations of data fiduciary', triggers: ['pii_detected', 'data_breach'] },
      section_8_1: {
        title: 'Personal data processing',
        triggers: ['aadhaar_detected', 'pan_detected', 'upi_detected', 'phone_detected', 'email_detected', 'passport_detected'],
      },
      section_9: { title: "Processing of children's data", triggers: ['minor_data_detected'] },
      section_15: { title: 'Data breach notification', triggers: ['data_leak_detected'] },
    },
    penalty: 'Up to ₹250 crore per violation',
  },
  it_act: {
    name: 'Information Technology Act, 2000',
    sections: {
      section_43a: { title: 'Compensation for failure to protect data', triggers: ['pii_leaked'] },
      section_66: { title: 'Computer related offences', triggers: ['injection_detected', 'jailbreak_detected'] },
      section_69a: { title: 'Blocking of information', triggers: ['harmful_content_detected'] },
      section_72a: { title: 'Breach of lawful contract on PII', triggers: ['pii_leaked'] },
      section_79: { title: 'Intermediary guidelines', triggers: ['content_moderation_failure'] },
    },
  },
  it_rules_2021: {
    name: 'IT (Intermediary Guidelines) Rules, 2021',
    sections: {
      rule_3_1_b: { title: 'Due diligence by intermediary', triggers: ['pii_leaked', 'harmful_content'] },
      rule_3_2_b: { title: 'Content takedown', triggers: ['harmful_content_detected'] },
    },
  },
  rbi_framework: {
    name: 'RBI Framework on AI in Financial Services',
    sections: {
      data_localization: { title: 'Data must reside within India', triggers: ['cross_border_data_flag'] },
      explainability: { title: 'AI decisions must be explainable', triggers: ['opaque_ai_decision'] },
      bias_testing: { title: 'Regular bias testing required', triggers: ['bias_detected'] },
    },
    applicableTo: ['banking', 'nbfc', 'fintech', 'insurance'],
  },
  sebi_circular: {
    name: 'SEBI Circular on AI in Capital Markets',
    sections: {
      investment_advice: { title: 'AI-generated investment advice disclosure', triggers: ['financial_advice_detected'] },
      market_manipulation: { title: 'AI must not generate misleading market info', triggers: ['financial_misinfo'] },
    },
    applicableTo: ['capital_markets', 'broking', 'mutual_funds'],
  },
};

// Map PII types to regulatory trigger names
const PII_TYPE_TO_TRIGGER: Record<string, string> = {
  aadhaar: 'aadhaar_detected',
  pan: 'pan_detected',
  upi_id: 'upi_detected',
  indian_phone: 'phone_detected',
  email: 'email_detected',
  indian_passport: 'passport_detected',
  credit_card: 'pii_detected',
  ifsc: 'pii_detected',
  voter_id_epic: 'pii_detected',
  indian_bank_account: 'pii_detected',
};

// Map verdict categories to triggers
const VERDICT_TO_TRIGGERS: Record<string, string[]> = {
  direct_injection: ['injection_detected'],
  indirect_injection: ['injection_detected'],
  hindi_injection: ['injection_detected'],
  hinglish_injection: ['injection_detected'],
  tamil_injection: ['injection_detected'],
  transliterated_injection: ['injection_detected'],
  jailbreak: ['jailbreak_detected'],
  harmful_content: ['harmful_content_detected'],
};

interface ScanResult {
  verdict: string;
  category?: string;
  piiDetected?: Array<{ type: string; severity: string; dpdpSection: string }>;
}

/**
 * Map a scan result to regulatory violations.
 */
export function mapDetectionToRegulations(
  scanResult: ScanResult,
  customerIndustry?: string,
): ComplianceMapping {
  const violations: ComplianceViolation[] = [];
  const activeTriggers = new Set<string>();

  // Collect triggers from PII detections
  if (scanResult.piiDetected && scanResult.piiDetected.length > 0) {
    activeTriggers.add('pii_detected');
    for (const pii of scanResult.piiDetected) {
      const trigger = PII_TYPE_TO_TRIGGER[pii.type];
      if (trigger) activeTriggers.add(trigger);
    }
  }

  // Collect triggers from verdict/category
  if (scanResult.verdict === 'block' || scanResult.verdict === 'malicious') {
    const categoryTriggers = scanResult.category ? VERDICT_TO_TRIGGERS[scanResult.category] : [];
    if (categoryTriggers) {
      for (const t of categoryTriggers) activeTriggers.add(t);
    }
  }

  // Match triggers against all regulations
  for (const [regKey, regulation] of Object.entries(INDIA_REGULATIONS)) {
    // Skip industry-specific regulations if customer isn't in that industry
    if (regulation.applicableTo && customerIndustry && !regulation.applicableTo.includes(customerIndustry)) {
      continue;
    }

    for (const [sectionKey, section] of Object.entries(regulation.sections)) {
      const matchedTriggers = section.triggers.filter(t => activeTriggers.has(t));
      if (matchedTriggers.length > 0) {
        violations.push({
          regulation: regKey,
          section: sectionKey,
          sectionTitle: section.title,
          severity: deriveSeverity(regKey, sectionKey),
          description: buildDescription(regKey, sectionKey, matchedTriggers),
          remediation: buildRemediation(regKey, sectionKey),
        });
      }
    }
  }

  const overallStatus: ComplianceMapping['overallStatus'] =
    violations.length === 0
      ? 'compliant'
      : violations.some(v => v.severity === 'critical')
        ? 'violation'
        : 'needs_review';

  return { violations, overallStatus };
}

function deriveSeverity(regulation: string, section: string): ComplianceViolation['severity'] {
  if (regulation === 'dpdp_act' && ['section_8', 'section_8_1', 'section_15'].includes(section)) return 'critical';
  if (regulation === 'it_act' && section === 'section_66') return 'high';
  if (regulation === 'dpdp_act') return 'high';
  return 'medium';
}

function buildDescription(regulation: string, section: string, triggers: string[]): string {
  const triggerStr = triggers.join(', ');
  const reg = INDIA_REGULATIONS[regulation];
  const sec = reg?.sections[section];
  return `${reg?.name} — ${sec?.title}: triggered by [${triggerStr}]`;
}

function buildRemediation(regulation: string, section: string): string {
  const remediations: Record<string, string> = {
    'dpdp_act:section_8_1': 'Implement PII redaction before LLM processing. Configure output scanning to mask Aadhaar/PAN/UPI.',
    'dpdp_act:section_8': 'Review data processing practices. Ensure consent is obtained before processing personal data.',
    'dpdp_act:section_15': 'Implement data breach notification workflow. Alert CERT-In within 6 hours of confirmed breach.',
    'dpdp_act:section_9': 'Implement age verification. Do not process minors\' data without verifiable parental consent.',
    'it_act:section_66': 'Log and monitor injection attempts. Report persistent attacks to CERT-In.',
    'it_act:section_69a': 'Enable content moderation. Block harmful content generation.',
    'rbi_framework:data_localization': 'Ensure all data processing and storage occurs within Indian jurisdiction.',
    'rbi_framework:explainability': 'Provide explainable AI decision trails for all financial service interactions.',
  };
  return remediations[`${regulation}:${section}`] ?? 'Review compliance requirements and implement appropriate controls.';
}

/**
 * Generate recommendations based on current compliance status.
 */
export function generateRecommendations(violations: ComplianceViolation[]): string[] {
  const recommendations: string[] = [];
  const sections = new Set(violations.map(v => `${v.regulation}:${v.section}`));

  if (sections.has('dpdp_act:section_8_1')) {
    recommendations.push('Enable Aadhaar/PAN PII redaction in output scanning to achieve DPDP Section 8(1) compliance.');
  }
  if (violations.length > 10) {
    recommendations.push('Consider reducing data retention from 90 to 30 days per DPDP data minimization principle.');
  }
  if (sections.has('it_act:section_66')) {
    recommendations.push('Set up automated alerting for repeated injection attempts from the same source.');
  }
  if (recommendations.length === 0 && violations.length > 0) {
    recommendations.push('Review flagged detections and update policies to address identified compliance gaps.');
  }

  return recommendations;
}
