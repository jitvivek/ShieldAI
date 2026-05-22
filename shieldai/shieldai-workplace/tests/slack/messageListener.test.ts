import { describe, it, expect, vi } from 'vitest';

vi.mock('../../src/core/scanner', () => ({
  scan: vi.fn().mockResolvedValue({
    verdict: 'safe',
    riskScore: 0.1,
    category: 'none',
    language: 'en',
    piiDetected: [],
    policyViolations: [],
    dpdpFlags: [],
    shouldBlock: false,
    shouldFlag: false,
    userMessage: 'Safe',
    adminMessage: 'test',
  }),
}));

vi.mock('../../src/core/botDetector', () => ({
  isSlackBot: vi.fn().mockReturnValue(false),
}));

vi.mock('../../src/core/auditLogger', () => ({
  buildAuditEntry: vi.fn().mockReturnValue({}),
  logAudit: vi.fn(),
}));

vi.mock('../../src/core/notificationService', () => ({
  notifyAdmins: vi.fn(),
}));

import { handleSlackMessage } from '../../src/slack/messageListener';

describe('Slack Message Listener', () => {
  const mockClient = {
    conversations: { members: vi.fn().mockResolvedValue({ members: [] }) },
    users: { info: vi.fn() },
    chat: {
      postEphemeral: vi.fn(),
      delete: vi.fn(),
    },
  };

  it('skips bot messages', async () => {
    await handleSlackMessage(
      { subtype: undefined, bot_id: 'B123', text: 'hello', user: 'U1', channel: 'C1', ts: '1' },
      mockClient as any
    );
    expect(mockClient.chat.postEphemeral).not.toHaveBeenCalled();
  });

  it('skips messages without text', async () => {
    await handleSlackMessage(
      { text: '', user: 'U1', channel: 'C1', ts: '1' },
      mockClient as any
    );
    expect(mockClient.chat.postEphemeral).not.toHaveBeenCalled();
  });

  it('skips subtype messages (edits, joins, etc)', async () => {
    await handleSlackMessage(
      { subtype: 'message_changed', text: 'hello', user: 'U1', channel: 'C1', ts: '1' },
      mockClient as any
    );
    expect(mockClient.chat.postEphemeral).not.toHaveBeenCalled();
  });
});
