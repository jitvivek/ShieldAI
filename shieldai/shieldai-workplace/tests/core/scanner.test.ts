import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scan } from '../../src/core/scanner';
import type { ScanRequest } from '../../src/types/common';

// Mock fetch for API calls
vi.stubGlobal('fetch', vi.fn().mockResolvedValue({
  ok: true,
  json: async () => ({
    verdict: 'safe',
    risk_score: 0.1,
    category: 'none',
    detected_language: 'en',
  }),
}));

describe('Scanner', () => {
  const baseRequest: ScanRequest = {
    text: 'Hello, how are you?',
    userId: 'user123',
    platform: 'teams',
    channelId: 'channel1',
    isToBot: true,
    isBotResponse: false,
    orgId: 'default',
  };

  it('returns safe for harmless text', async () => {
    const result = await scan(baseRequest);
    expect(result.verdict).toBe('safe');
    expect(result.shouldBlock).toBe(false);
    expect(result.shouldFlag).toBe(false);
  });

  it('detects PII and elevates verdict', async () => {
    const result = await scan({
      ...baseRequest,
      text: 'My PAN is ABCPD1234E',
    });
    expect(result.piiDetected.length).toBeGreaterThan(0);
    expect(result.verdict).not.toBe('safe');
  });

  it('includes platform in admin message', async () => {
    const result = await scan(baseRequest);
    expect(result.adminMessage).toContain('teams');
  });

  it('handles Slack platform', async () => {
    const result = await scan({ ...baseRequest, platform: 'slack' });
    expect(result.adminMessage).toContain('slack');
  });
});
