import { describe, it, expect, vi } from 'vitest';

// Mock botbuilder
vi.mock('botbuilder', () => ({
  TurnContext: vi.fn(),
  MessageFactory: {
    text: (t: string) => ({ text: t }),
    attachment: (a: unknown) => ({ attachments: [a] }),
  },
  CardFactory: {
    adaptiveCard: (c: unknown) => c,
  },
}));

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
  isTeamsBot: vi.fn().mockReturnValue(false),
}));

vi.mock('../../src/core/auditLogger', () => ({
  buildAuditEntry: vi.fn().mockReturnValue({}),
  logAudit: vi.fn(),
}));

vi.mock('../../src/core/notificationService', () => ({
  notifyAdmins: vi.fn(),
}));

import { interceptTeamsMessage } from '../../src/teams/messageInterceptor';
import { scan } from '../../src/core/scanner';

describe('Teams Message Interceptor', () => {
  it('skips messages without text', async () => {
    const context = {
      activity: { text: '', from: { id: 'user1' }, channelId: 'ch1', conversation: { id: 'conv1' }, entities: [] },
      sendActivity: vi.fn(),
    } as unknown as Parameters<typeof interceptTeamsMessage>[0];

    await interceptTeamsMessage(context);
    expect(context.sendActivity).not.toHaveBeenCalled();
  });

  it('skips non-bot messages', async () => {
    const context = {
      activity: {
        text: 'Hello',
        from: { id: 'user1' },
        channelId: 'ch1',
        conversation: { id: 'conv1' },
        entities: [],
      },
      sendActivity: vi.fn(),
    } as unknown as Parameters<typeof interceptTeamsMessage>[0];

    await interceptTeamsMessage(context);
    // No bot detected, so scanner should not be called
    expect(context.sendActivity).not.toHaveBeenCalled();
  });
});
