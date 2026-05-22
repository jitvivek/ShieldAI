import { describe, it, expect, vi, beforeEach } from 'vitest';
import { scanForPii, hashUserId } from '../../src/core/piiScanner';

describe('PII Scanner', () => {
  it('detects PAN card numbers', () => {
    const result = scanForPii('My PAN is ABCPD1234E');
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('pan');
    expect(result[0]!.masked).toContain('****');
  });

  it('detects UPI IDs', () => {
    const result = scanForPii('Pay me at user@upi or test@paytm');
    expect(result.length).toBeGreaterThanOrEqual(1);
    expect(result.some((m) => m.type === 'upi_id')).toBe(true);
  });

  it('detects Indian phone numbers', () => {
    const result = scanForPii('Call me at +919876543210');
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('phone');
  });

  it('detects email addresses', () => {
    const result = scanForPii('Email: test@example.com');
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('email');
  });

  it('returns empty for safe text', () => {
    const result = scanForPii('Hello, how are you?');
    expect(result).toHaveLength(0);
  });

  it('detects IFSC codes', () => {
    const result = scanForPii('IFSC: SBIN0001234');
    expect(result).toHaveLength(1);
    expect(result[0]!.type).toBe('ifsc');
  });

  it('hashes user IDs consistently', () => {
    const hash1 = hashUserId('user123');
    const hash2 = hashUserId('user123');
    expect(hash1).toBe(hash2);
    expect(hash1.length).toBe(16);
  });

  it('hashes different users differently', () => {
    const hash1 = hashUserId('user1');
    const hash2 = hashUserId('user2');
    expect(hash1).not.toBe(hash2);
  });
});
