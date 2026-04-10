/**
 * Phase 2 — Policy Engine unit tests
 */

import { parsePolicy, evaluatePolicies } from '../../src/services/policyEngine';

describe('PolicyEngine', () => {
  describe('parsePolicy', () => {
    it('should parse valid policy YAML', () => {
      const yaml = `
name: test-policy
version: 1
policies:
  - name: no_pii
    action: block
    severity: critical
    detector: pii_detector
    patterns: [email, phone_india]
  - name: length_limit
    action: truncate
    severity: low
    detector: length_check
    max_tokens: 1000
`;
      const config = parsePolicy(yaml);
      expect(config.name).toBe('test-policy');
      expect(config.version).toBe(1);
      expect(config.policies).toHaveLength(2);
      expect(config.policies[0]!.detector).toBe('pii_detector');
      expect(config.policies[1]!.max_tokens).toBe(1000);
    });

    it('should reject YAML without name', () => {
      const yaml = `
policies:
  - name: test
    action: block
    severity: high
    detector: pii_detector
`;
      expect(() => parsePolicy(yaml)).toThrow('non-empty "name"');
    });

    it('should reject invalid action', () => {
      const yaml = `
name: bad-policy
policies:
  - name: test
    action: destroy
    severity: high
    detector: pii_detector
`;
      expect(() => parsePolicy(yaml)).toThrow('invalid action');
    });

    it('should reject invalid severity', () => {
      const yaml = `
name: bad-policy
policies:
  - name: test
    action: block
    severity: extreme
    detector: pii_detector
`;
      expect(() => parsePolicy(yaml)).toThrow('invalid severity');
    });

    it('should reject invalid detector', () => {
      const yaml = `
name: bad-policy
policies:
  - name: test
    action: block
    severity: high
    detector: magic_detector
`;
      expect(() => parsePolicy(yaml)).toThrow('invalid detector');
    });
  });

  describe('evaluatePolicies', () => {
    it('should pass text with no PII against pii_detector', () => {
      const config = parsePolicy(`
name: test
version: 1
policies:
  - name: no_pii
    action: block
    severity: critical
    detector: pii_detector
    patterns: [email]
`);
      const results = evaluatePolicies('Hello world, no PII here!', config);
      expect(results[0]!.passed).toBe(true);
    });

    it('should detect PII in text', () => {
      const config = parsePolicy(`
name: test
version: 1
policies:
  - name: no_pii
    action: block
    severity: critical
    detector: pii_detector
    patterns: [email]
`);
      const results = evaluatePolicies('Contact: john@example.com', config);
      expect(results[0]!.passed).toBe(false);
      expect(results[0]!.action).toBe('block');
    });

    it('should enforce length limits', () => {
      const config = parsePolicy(`
name: test
version: 1
policies:
  - name: length
    action: truncate
    severity: low
    detector: length_check
    max_tokens: 10
`);
      const longText = 'a'.repeat(1000);
      const results = evaluatePolicies(longText, config);
      expect(results[0]!.passed).toBe(false);
    });

    it('should detect blocked keywords', () => {
      const config = parsePolicy(`
name: test
version: 1
policies:
  - name: brand_safety
    action: flag
    severity: medium
    detector: keyword_match
    patterns: [competitor_name, bad_word]
`);
      const results = evaluatePolicies('Check out competitor_name for better service.', config);
      expect(results[0]!.passed).toBe(false);
    });

    it('should use prompt shield context', () => {
      const config = parsePolicy(`
name: test
version: 1
policies:
  - name: no_leak
    action: block
    severity: critical
    detector: prompt_shield
    threshold: 0.20
`);
      const results = evaluatePolicies('some text', config, { promptLeakScore: 0.5 });
      expect(results[0]!.passed).toBe(false);
    });
  });
});
