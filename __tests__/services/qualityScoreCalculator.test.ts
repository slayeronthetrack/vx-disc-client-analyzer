/**
 * Quality Score Calculator Tests
 * Testa cálculo de quality score com diferentes componentes
 */

import { qualityScoreCalculator } from '@/lib/services/qualityScoreCalculator';
import type { QualityScoreComponents } from '@/types/question-bank';

describe('QualityScoreCalculator', () => {
  describe('calculateScore', () => {
    it('should calculate score with perfect components', () => {
      const components: QualityScoreComponents = {
        clarity: 100,
        discrimination: 100,
        completion: 100,
        feedback: 100,
      };

      const score = qualityScoreCalculator.calculateScore(components);
      expect(score).toBe(100);
    });

    it('should calculate score with weighted formula', () => {
      const components: QualityScoreComponents = {
        clarity: 80,      // 25% weight = 20
        discrimination: 90, // 30% weight = 27
        completion: 70,   // 25% weight = 17.5
        feedback: 60,     // 20% weight = 12
      };

      const score = qualityScoreCalculator.calculateScore(components);
      // 20 + 27 + 17.5 + 12 = 76.5
      expect(score).toBe(77); // Rounded
    });

    it('should calculate score with zero components', () => {
      const components: QualityScoreComponents = {
        clarity: 0,
        discrimination: 0,
        completion: 0,
        feedback: 0,
      };

      const score = qualityScoreCalculator.calculateScore(components);
      expect(score).toBe(0);
    });

    it('should handle mixed components', () => {
      const components: QualityScoreComponents = {
        clarity: 100,
        discrimination: 0,
        completion: 50,
        feedback: 50,
      };

      const score = qualityScoreCalculator.calculateScore(components);
      // (100 * 0.25) + (0 * 0.30) + (50 * 0.25) + (50 * 0.20) = 47.5
      expect(score).toBe(48);
    });
  });

  describe('getThresholds', () => {
    it('should return correct thresholds', () => {
      const thresholds = qualityScoreCalculator.getThresholds();
      
      expect(thresholds.min_active).toBe(60);
      expect(thresholds.flagged).toBe(40);
      expect(thresholds.archived).toBe(30);
    });
  });

  describe('determineStatus', () => {
    it('should return active for score >= 60', () => {
      expect(qualityScoreCalculator.determineStatus(60)).toBe('active');
      expect(qualityScoreCalculator.determineStatus(75)).toBe('active');
      expect(qualityScoreCalculator.determineStatus(100)).toBe('active');
    });

    it('should return flagged for score 40-59', () => {
      expect(qualityScoreCalculator.determineStatus(40)).toBe('flagged');
      expect(qualityScoreCalculator.determineStatus(50)).toBe('flagged');
      expect(qualityScoreCalculator.determineStatus(59)).toBe('flagged');
    });

    it('should return archived for score < 40', () => {
      expect(qualityScoreCalculator.determineStatus(0)).toBe('archived');
      expect(qualityScoreCalculator.determineStatus(30)).toBe('archived');
      expect(qualityScoreCalculator.determineStatus(39)).toBe('archived');
    });
  });

  describe('validateComponents', () => {
    it('should validate correct components', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: 70,
        completion: 90,
        feedback: 85,
      };

      const result = qualityScoreCalculator.validateComponents(components);
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject components with values > 100', () => {
      const components: QualityScoreComponents = {
        clarity: 150,
        discrimination: 70,
        completion: 90,
        feedback: 85,
      };

      const result = qualityScoreCalculator.validateComponents(components);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('clarity must be between 0 and 100');
    });

    it('should reject components with negative values', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: -10,
        completion: 90,
        feedback: 85,
      };

      const result = qualityScoreCalculator.validateComponents(components);
      expect(result.valid).toBe(false);
      expect(result.errors).toContain('discrimination must be between 0 and 100');
    });

    it('should reject missing components', () => {
      const components = {
        clarity: 80,
        discrimination: 70,
        // completion missing
        feedback: 85,
      } as any;

      const result = qualityScoreCalculator.validateComponents(components);
      expect(result.valid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('applyBusinessRules', () => {
    it('should reduce score when completion < 80%', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: 70,
        completion: 70, // < 80%
        feedback: 85,
      };

      const baseScore = 75;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      expect(result.newScore).toBe(65); // 75 - 10
      expect(result.adjustments).toContain('Low completion rate: -10 points');
    });

    it('should increase score when feedback > 4.0', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: 70,
        completion: 90,
        feedback: 85, // > 80 (4.0 on 0-5 scale)
      };

      const baseScore = 75;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      expect(result.newScore).toBe(80); // 75 + 5
      expect(result.adjustments).toContain('High user feedback: +5 points');
    });

    it('should increase score when discrimination > 0.7', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: 75, // > 70 (0.7 on 0-1 scale)
        completion: 90,
        feedback: 70,
      };

      const baseScore = 75;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      expect(result.newScore).toBe(85); // 75 + 10
      expect(result.adjustments).toContain('High discrimination power: +10 points');
    });

    it('should apply multiple adjustments', () => {
      const components: QualityScoreComponents = {
        clarity: 80,
        discrimination: 75, // > 70
        completion: 70,     // < 80
        feedback: 85,       // > 80
      };

      const baseScore = 75;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      // 75 - 10 (completion) + 5 (feedback) + 10 (discrimination) = 80
      expect(result.newScore).toBe(80);
      expect(result.adjustments).toHaveLength(3);
    });

    it('should not go below 0', () => {
      const components: QualityScoreComponents = {
        clarity: 10,
        discrimination: 10,
        completion: 10,
        feedback: 10,
      };

      const baseScore = 5;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      expect(result.newScore).toBeGreaterThanOrEqual(0);
    });

    it('should not go above 100', () => {
      const components: QualityScoreComponents = {
        clarity: 100,
        discrimination: 100,
        completion: 100,
        feedback: 100,
      };

      const baseScore = 95;
      const result = qualityScoreCalculator.applyBusinessRules(baseScore, components);
      
      expect(result.newScore).toBeLessThanOrEqual(100);
    });
  });

  describe('getScoreCategory', () => {
    it('should categorize excellent scores', () => {
      expect(qualityScoreCalculator.getScoreCategory(90)).toBe('excellent');
      expect(qualityScoreCalculator.getScoreCategory(100)).toBe('excellent');
    });

    it('should categorize good scores', () => {
      expect(qualityScoreCalculator.getScoreCategory(70)).toBe('good');
      expect(qualityScoreCalculator.getScoreCategory(89)).toBe('good');
    });

    it('should categorize fair scores', () => {
      expect(qualityScoreCalculator.getScoreCategory(50)).toBe('fair');
      expect(qualityScoreCalculator.getScoreCategory(69)).toBe('fair');
    });

    it('should categorize poor scores', () => {
      expect(qualityScoreCalculator.getScoreCategory(0)).toBe('poor');
      expect(qualityScoreCalculator.getScoreCategory(49)).toBe('poor');
    });
  });
});
