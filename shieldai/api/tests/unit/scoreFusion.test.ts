import { computeRiskScore, determineVerdict, generateExplanation } from '../../src/services/scoreFusion';

// Mock getEnv for determineVerdict
jest.mock('../../src/config/env', () => ({
  getEnv: () => ({
    THRESHOLD_SAFE: 0.3,
    THRESHOLD_SUSPICIOUS: 0.7,
  }),
}));

describe('Score Fusion Service', () => {
  describe('computeRiskScore()', () => {
    it('should return 0 when all signals are zero', () => {
      const result = computeRiskScore(0, 0, 0, 0);
      expect(result.score).toBe(0);
    });

    it('should return max score when all signals are max', () => {
      const result = computeRiskScore(1, 1, 1, 1);
      // Rule score > 0.9 triggers veto, capped at 0.95
      expect(result.score).toBe(0.95);
      expect(result.source).toBe('rule_veto');
    });

    it('should veto to high score when rule score > 0.9', () => {
      const result = computeRiskScore(0.95, 0.1, 0.1, 0.1);
      expect(result.score).toBeGreaterThan(0.85);
      expect(result.source).toBe('rule_veto');
    });

    it('should handle null ML score (graceful degradation)', () => {
      const result = computeRiskScore(0.5, null, 0.3, 0.4);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should handle null semantic score', () => {
      const result = computeRiskScore(0.5, 0.5, 0.3, null);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should handle all null optional scores', () => {
      const result = computeRiskScore(0.5, null, 0.3, null);
      expect(result.score).toBeGreaterThan(0);
      expect(result.score).toBeLessThanOrEqual(1);
    });

    it('should weight ML score most heavily', () => {
      const highML = computeRiskScore(0.5, 0.9, 0.5, 0.5);
      const lowML = computeRiskScore(0.5, 0.1, 0.5, 0.5);
      expect(highML.score).toBeGreaterThan(lowML.score);
    });

    it('should always return score between 0 and 1', () => {
      const testCases: [number, number | null, number, number | null][] = [
        [0, 0, 0, 0],
        [1, 1, 1, 1],
        [0.5, null, 0.3, null],
        [0.95, 0.95, 0.95, 0.95],
        [0.01, 0.01, 0.01, 0.01],
      ];

      for (const [r, m, e, s] of testCases) {
        const result = computeRiskScore(r, m, e, s);
        expect(result.score).toBeGreaterThanOrEqual(0);
        expect(result.score).toBeLessThanOrEqual(1);
      }
    });
  });

  describe('determineVerdict()', () => {
    it('should return pass for low scores', () => {
      const verdict = determineVerdict(0.1);
      expect(verdict).toBe('pass');
    });

    it('should return flag for medium scores', () => {
      const verdict = determineVerdict(0.55);
      expect(verdict).toBe('flag');
    });

    it('should return block for high scores', () => {
      const verdict = determineVerdict(0.85);
      expect(verdict).toBe('block');
    });

    it('should return block for score of 1.0', () => {
      const verdict = determineVerdict(1.0);
      expect(verdict).toBe('block');
    });

    it('should return pass for score of 0', () => {
      const verdict = determineVerdict(0);
      expect(verdict).toBe('pass');
    });
  });

  describe('generateExplanation()', () => {
    it('should return a string explanation for pass', () => {
      const explanation = generateExplanation('pass', 0.0, 0.1, 0.05, 0.1, [], []);
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should return a string explanation for block', () => {
      const explanation = generateExplanation(
        'block', 0.8, 0.95, 0.3, 0.85,
        ['DI001', 'DI003'], ['system_tag_open']
      );
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });

    it('should mention high-risk signals in block explanation', () => {
      const explanation = generateExplanation(
        'block', 0.8, 0.95, 0.3, 0.85,
        ['DI001', 'DI003'], []
      );
      expect(explanation.toLowerCase()).toMatch(/rule|ml|pattern|classifier|confidence/);
    });

    it('should handle null signal scores', () => {
      const explanation = generateExplanation('flag', 0.5, null, 0.3, null, ['DI001'], []);
      expect(typeof explanation).toBe('string');
      expect(explanation.length).toBeGreaterThan(0);
    });
  });
});
