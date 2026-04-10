/**
 * Phase 2 — PII Detector unit tests
 */

import { detectPii, redactPii } from '../../src/services/piiDetector';

describe('PiiDetector', () => {
  describe('detectPii', () => {
    it('should detect email addresses', () => {
      const matches = detectPii('Contact us at support@shieldai.dev for help.');
      expect(matches.some((m) => m.type === 'email')).toBe(true);
    });

    it('should detect Indian phone numbers', () => {
      const matches = detectPii('Call +919876543210 for support.');
      expect(matches.some((m) => m.type === 'phone_india')).toBe(true);
    });

    it('should detect Aadhaar numbers', () => {
      const matches = detectPii('Aadhaar: 1234-5678-9012');
      expect(matches.some((m) => m.type === 'aadhaar')).toBe(true);
    });

    it('should detect PAN card numbers', () => {
      const matches = detectPii('PAN: ABCDE1234F');
      expect(matches.some((m) => m.type === 'pan')).toBe(true);
    });

    it('should detect credit card numbers', () => {
      const matches = detectPii('Card: 4111-1111-1111-1111');
      const ccMatch = matches.find((m) => m.type === 'credit_card');
      expect(ccMatch).toBeDefined();
    });

    it('should detect IP addresses', () => {
      const matches = detectPii('Server at 192.168.1.100');
      expect(matches.some((m) => m.type === 'ip_address')).toBe(true);
    });

    it('should return empty for clean text', () => {
      const matches = detectPii('Hello, this is a normal message with no PII.');
      expect(matches).toHaveLength(0);
    });

    it('should mask detected values', () => {
      const matches = detectPii('Email: test@example.com');
      const emailMatch = matches.find((m) => m.type === 'email');
      expect(emailMatch).toBeDefined();
      expect(emailMatch!.value).not.toBe('test@example.com');
      expect(emailMatch!.value).toContain('***');
    });

    it('should filter by allowed types', () => {
      const text = 'Email: test@ex.com, Phone: +919876543210';
      const emailOnly = detectPii(text, ['email']);
      expect(emailOnly.every((m) => m.type === 'email')).toBe(true);
    });

    it('should validate Aadhaar with correct length', () => {
      const matches = detectPii('Aadhaar: 123-456-789'); // Only 9 digits = invalid
      const aadhaar = matches.find((m) => m.type === 'aadhaar');
      expect(aadhaar).toBeUndefined();
    });

    it('should validate IP octets', () => {
      const matches = detectPii('IP: 999.999.999.999');
      const ip = matches.find((m) => m.type === 'ip_address');
      expect(ip).toBeUndefined();
    });
  });

  describe('redactPii', () => {
    it('should redact PII from text', () => {
      const text = 'Contact test@example.com for help.';
      const matches = detectPii(text);
      const redacted = redactPii(text, matches);
      expect(redacted).toContain('[REDACTED]');
      expect(redacted).not.toContain('test@example.com');
    });

    it('should handle no matches', () => {
      const text = 'No PII here.';
      const redacted = redactPii(text, []);
      expect(redacted).toBe(text);
    });

    it('should handle multiple PII in same text', () => {
      const text = 'Email: a@b.com, Phone: +919876543210';
      const matches = detectPii(text);
      const redacted = redactPii(text, matches);
      expect(redacted.match(/\[REDACTED\]/g)?.length).toBeGreaterThanOrEqual(1);
    });
  });
});
