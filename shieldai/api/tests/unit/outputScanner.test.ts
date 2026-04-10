/**
 * Phase 2 — Output Scanner unit tests
 */

import { scanOutput } from '../../src/services/outputScanner';
import { PolicyConfig } from '../../src/types/guard';

// Mock the ML sidecar calls
jest.mock('../../src/services/semanticSimilarity', () => ({
  computeSimilarity: jest.fn().mockResolvedValue({ score: 0.1, nearestPattern: null }),
}));

jest.mock('../../src/config/redis', () => ({
  getRedis: jest.fn().mockReturnValue({
    get: jest.fn().mockResolvedValue(null),
    set: jest.fn().mockResolvedValue('OK'),
    del: jest.fn().mockResolvedValue(1),
  }),
}));

describe('OutputScanner', () => {
  it('should pass clean output', async () => {
    const result = await scanOutput('The weather in Delhi is 35°C today.');
    expect(result.verdict).toBe('pass');
    expect(result.piiDetected).toHaveLength(0);
    expect(result.canaryDetected).toBe(false);
  });

  it('should detect email PII', async () => {
    const result = await scanOutput('Contact john@example.com for help.');
    expect(result.piiDetected.length).toBeGreaterThan(0);
    expect(result.piiDetected[0]!.type).toBe('email');
  });

  it('should detect Aadhaar numbers', async () => {
    const result = await scanOutput('Your Aadhaar is 1234-5678-9012.');
    const aadhaarMatch = result.piiDetected.find((p) => p.type === 'aadhaar');
    expect(aadhaarMatch).toBeDefined();
  });

  it('should detect PAN cards', async () => {
    const result = await scanOutput('PAN: ABCDE1234F is registered.');
    const panMatch = result.piiDetected.find((p) => p.type === 'pan');
    expect(panMatch).toBeDefined();
  });

  it('should detect canary tokens', async () => {
    const result = await scanOutput('Here is the info: CANARY_SECRET_123', {
      canaryTokens: ['CANARY_SECRET_123'],
    });
    expect(result.canaryDetected).toBe(true);
    expect(result.verdict).toBe('block');
  });

  it('should handle empty output', async () => {
    const result = await scanOutput('');
    expect(result.verdict).toBe('pass');
    expect(result.processingTimeMs).toBe(0);
  });

  it('should evaluate policy rules', async () => {
    const policy: PolicyConfig = {
      name: 'test-policy',
      version: 1,
      policies: [
        {
          name: 'no_pii',
          action: 'block',
          severity: 'critical',
          detector: 'pii_detector',
          patterns: ['email'],
        },
      ],
    };

    const result = await scanOutput('Email me at test@example.com', { policy });
    expect(result.policyViolations.length).toBeGreaterThan(0);
  });

  it('should handle very long output without crashing', async () => {
    const longOutput = 'a'.repeat(60000);
    const result = await scanOutput(longOutput);
    expect(result.verdict).toBe('pass');
  });
});
