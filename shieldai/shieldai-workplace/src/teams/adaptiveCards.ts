import type { ScanResult } from '../types/common';

export function buildWarningCard(result: ScanResult): Record<string, unknown> {
  const piiSummary = result.piiDetected.length > 0
    ? result.piiDetected.map((p) => `${p.type}: ${p.masked}`).join(', ')
    : 'None';

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: '⚠️ ShieldAI — Potential Risk Detected',
        weight: 'Bolder',
        size: 'Medium',
        color: 'Warning',
      },
      {
        type: 'TextBlock',
        text: result.userMessage,
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Category', value: result.category },
          { title: 'Language', value: result.language },
          { title: 'Risk Score', value: `${Math.round(result.riskScore * 100)}%` },
          { title: 'PII Detected', value: piiSummary },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Send Anyway',
        data: { action: 'send_anyway' },
        style: 'default',
      },
      {
        type: 'Action.Submit',
        title: 'Edit Message',
        data: { action: 'edit_message' },
        style: 'positive',
      },
    ],
  };
}

export function buildBlockCard(result: ScanResult): Record<string, unknown> {
  const dpdpRef = result.dpdpFlags.length > 0
    ? result.dpdpFlags.join('; ')
    : 'N/A';

  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: '🛡️ ShieldAI — Message Blocked',
        weight: 'Bolder',
        size: 'Medium',
        color: 'Attention',
      },
      {
        type: 'TextBlock',
        text: result.userMessage,
        wrap: true,
      },
      {
        type: 'FactSet',
        facts: [
          { title: 'Reason', value: result.category },
          { title: 'DPDP Reference', value: dpdpRef },
          { title: 'Action', value: 'Blocked — message was not sent to the AI bot' },
        ],
      },
      {
        type: 'TextBlock',
        text: 'Contact your IT administrator if you believe this is an error.',
        size: 'Small',
        isSubtle: true,
        wrap: true,
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Edit Message',
        data: { action: 'edit_message' },
      },
    ],
  };
}

export function buildStatsCard(stats: {
  scansToday: number;
  blocked: number;
  flagged: number;
  piiCaught: number;
}): Record<string, unknown> {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: '🛡️ ShieldAI — Daily Summary',
        weight: 'Bolder',
        size: 'Medium',
      },
      {
        type: 'ColumnSet',
        columns: [
          { type: 'Column', width: 'stretch', items: [{ type: 'TextBlock', text: `${stats.scansToday}`, weight: 'Bolder', horizontalAlignment: 'Center' }, { type: 'TextBlock', text: 'Scans', size: 'Small', horizontalAlignment: 'Center' }] },
          { type: 'Column', width: 'stretch', items: [{ type: 'TextBlock', text: `${stats.blocked}`, weight: 'Bolder', horizontalAlignment: 'Center', color: 'Attention' }, { type: 'TextBlock', text: 'Blocked', size: 'Small', horizontalAlignment: 'Center' }] },
          { type: 'Column', width: 'stretch', items: [{ type: 'TextBlock', text: `${stats.flagged}`, weight: 'Bolder', horizontalAlignment: 'Center', color: 'Warning' }, { type: 'TextBlock', text: 'Flagged', size: 'Small', horizontalAlignment: 'Center' }] },
          { type: 'Column', width: 'stretch', items: [{ type: 'TextBlock', text: `${stats.piiCaught}`, weight: 'Bolder', horizontalAlignment: 'Center' }, { type: 'TextBlock', text: 'PII Caught', size: 'Small', horizontalAlignment: 'Center' }] },
        ],
      },
    ],
  };
}

export function buildConfigCard(): Record<string, unknown> {
  return {
    type: 'AdaptiveCard',
    $schema: 'http://adaptivecards.io/schemas/adaptive-card.json',
    version: '1.5',
    body: [
      {
        type: 'TextBlock',
        text: '⚙️ ShieldAI Settings',
        weight: 'Bolder',
        size: 'Medium',
      },
      {
        type: 'Input.Toggle',
        title: 'PII Protection',
        id: 'piiProtection',
        value: 'true',
      },
      {
        type: 'Input.Toggle',
        title: 'Harmful Content Filter',
        id: 'harmfulFilter',
        value: 'true',
      },
      {
        type: 'Input.ChoiceSet',
        id: 'sensitivityLevel',
        label: 'Sensitivity',
        value: 'balanced',
        choices: [
          { title: 'Aggressive', value: 'aggressive' },
          { title: 'Balanced', value: 'balanced' },
          { title: 'Permissive', value: 'permissive' },
        ],
      },
    ],
    actions: [
      {
        type: 'Action.Submit',
        title: 'Save Settings',
        data: { action: 'save_config' },
      },
    ],
  };
}
