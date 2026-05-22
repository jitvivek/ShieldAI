import type { ScanResult } from '../types/common';
import type { KnownBlock, Block } from '@slack/bolt';

export function buildWarningBlocks(result: ScanResult): KnownBlock[] {
  const piiText = result.piiDetected.length > 0
    ? result.piiDetected.map((p) => `• ${p.type}: ${p.masked}`).join('\n')
    : 'None detected';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '⚠️ ShieldAI — Potential Risk Detected' },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: result.userMessage },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Category:*\n${result.category}` },
        { type: 'mrkdwn', text: `*Language:*\n${result.language}` },
        { type: 'mrkdwn', text: `*Risk Score:*\n${Math.round(result.riskScore * 100)}%` },
        { type: 'mrkdwn', text: `*PII Detected:*\n${piiText}` },
      ],
    },
    {
      type: 'actions',
      elements: [
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Send Anyway' },
          action_id: 'shieldai_send_anyway',
          style: 'danger',
        },
        {
          type: 'button',
          text: { type: 'plain_text', text: 'Edit Message' },
          action_id: 'shieldai_edit_message',
        },
      ],
    },
  ];
}

export function buildBlockedBlocks(result: ScanResult): KnownBlock[] {
  const dpdpText = result.dpdpFlags.length > 0
    ? result.dpdpFlags.join('\n')
    : 'N/A';

  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🛡️ ShieldAI — Message Blocked' },
    },
    {
      type: 'section',
      text: { type: 'mrkdwn', text: result.userMessage },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Reason:*\n${result.category}` },
        { type: 'mrkdwn', text: `*DPDP Reference:*\n${dpdpText}` },
      ],
    },
    {
      type: 'context',
      elements: [
        {
          type: 'mrkdwn',
          text: 'Contact your IT administrator if you believe this is an error.',
        },
      ],
    },
  ];
}

export function buildStatusBlocks(stats: {
  scansToday: number;
  blocked: number;
  flagged: number;
  piiCaught: number;
}): KnownBlock[] {
  return [
    {
      type: 'header',
      text: { type: 'plain_text', text: '🛡️ ShieldAI — Channel Status' },
    },
    {
      type: 'section',
      fields: [
        { type: 'mrkdwn', text: `*Scans Today:*\n${stats.scansToday}` },
        { type: 'mrkdwn', text: `*Blocked:*\n${stats.blocked}` },
        { type: 'mrkdwn', text: `*Flagged:*\n${stats.flagged}` },
        { type: 'mrkdwn', text: `*PII Caught:*\n${stats.piiCaught}` },
      ],
    },
  ];
}
