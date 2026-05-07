/**
 * Performance Tracker Tests
 * Testa registro de uso, conclusão, feedback e métricas
 */

import { performanceTracker } from '@/lib/services/performanceTracker';

describe('PerformanceTracker', () => {
  const mockQuestionId = 'test-question-id';
  const mockUserId = 'test-user-id';

  describe('recordUsage', () => {
    it('should record question usage', async () => {
      await expect(
        performanceTracker.recordUsage(mockQuestionId, mockUserId, {
          test_objective: 'hiring',
          job_title: 'Sales Manager',
          company: 'Tech Corp',
        })
      ).resolves.not.toThrow();
    });

    it('should handle missing context', async () => {
      await expect(
        performanceTracker.recordUsage(mockQuestionId, mockUserId)
      ).resolves.not.toThrow();
    });

    it('should not throw on database errors', async () => {
      // Should handle errors gracefully
      await expect(
        performanceTracker.recordUsage('invalid-id', mockUserId)
      ).resolves.not.toThrow();
    });
  });

  describe('recordCompletion', () => {
    it('should record question completion', async () => {
      await expect(
        performanceTracker.recordCompletion(
          mockQuestionId,
          mockUserId,
          'D',
          5000 // 5 seconds
        )
      ).resolves.not.toThrow();
    });

    it('should handle completion without time', async () => {
      await expect(
        performanceTracker.recordCompletion(
          mockQuestionId,
          mockUserId,
          'I'
        )
      ).resolves.not.toThrow();
    });
  });

  describe('recordFeedback', () => {
    it('should record valid feedback rating', async () => {
      await expect(
        performanceTracker.recordFeedback(
          mockQuestionId,
          mockUserId,
          4,
          'Great question!'
        )
      ).resolves.not.toThrow();
    });

    it('should accept rating without comment', async () => {
      await expect(
        performanceTracker.recordFeedback(
          mockQuestionId,
          mockUserId,
          5
        )
      ).resolves.not.toThrow();
    });

    it('should handle invalid rating gracefully', async () => {
      // Should not throw even with invalid rating
      await expect(
        performanceTracker.recordFeedback(
          mockQuestionId,
          mockUserId,
          10 // Invalid: > 5
        )
      ).resolves.not.toThrow();
    });
  });

  describe('calculateDiscriminationPower', () => {
    it('should return 1.0 for perfect distribution', () => {
      const records = [
        { selected_option: 'D' },
        { selected_option: 'I' },
        { selected_option: 'S' },
        { selected_option: 'C' },
      ];
      
      const power = performanceTracker.calculateDiscriminationPower(records);
      
      expect(power).toBeGreaterThan(0.9);
      expect(power).toBeLessThanOrEqual(1.0);
    });

    it('should return low score for skewed distribution', () => {
      const records = [
        { selected_option: 'D' },
        { selected_option: 'D' },
        { selected_option: 'D' },
        { selected_option: 'D' },
      ];
      
      const power = performanceTracker.calculateDiscriminationPower(records);
      
      expect(power).toBeLessThan(0.3);
    });

    it('should return 0 for empty records', () => {
      const power = performanceTracker.calculateDiscriminationPower([]);
      
      expect(power).toBe(0);
    });

    it('should handle records without selected_option', () => {
      const records = [
        { selected_option: null },
        { selected_option: undefined },
      ];
      
      const power = performanceTracker.calculateDiscriminationPower(records as any);
      
      expect(power).toBe(0);
    });

    it('should calculate intermediate scores correctly', () => {
      const records = [
        { selected_option: 'D' },
        { selected_option: 'D' },
        { selected_option: 'I' },
        { selected_option: 'S' },
      ];
      
      const power = performanceTracker.calculateDiscriminationPower(records);
      
      expect(power).toBeGreaterThan(0.3);
      expect(power).toBeLessThan(0.9);
    });
  });

  describe('recordBatchUsage', () => {
    it('should record usage for multiple questions', async () => {
      const questionIds = ['q1', 'q2', 'q3'];
      
      await expect(
        performanceTracker.recordBatchUsage(questionIds, mockUserId, {
          test_objective: 'self-knowledge',
        })
      ).resolves.not.toThrow();
    });

    it('should handle empty array', async () => {
      await expect(
        performanceTracker.recordBatchUsage([], mockUserId)
      ).resolves.not.toThrow();
    });
  });

  describe('getMetrics', () => {
    it('should return metrics structure', async () => {
      const metrics = await performanceTracker.getMetrics(mockQuestionId);
      
      expect(metrics).toHaveProperty('question_id');
      expect(metrics).toHaveProperty('usage_count');
      expect(metrics).toHaveProperty('completion_rate');
      expect(metrics).toHaveProperty('avg_time_to_answer');
      expect(metrics).toHaveProperty('avg_user_feedback');
      expect(metrics).toHaveProperty('discrimination_power');
      expect(metrics).toHaveProperty('last_calculated_at');
    });

    it('should return zero metrics for unused question', async () => {
      const metrics = await performanceTracker.getMetrics('unused-question');
      
      expect(metrics.usage_count).toBe(0);
      expect(metrics.completion_rate).toBe(0);
      expect(metrics.avg_time_to_answer).toBe(0);
      expect(metrics.avg_user_feedback).toBe(0);
      expect(metrics.discrimination_power).toBe(0);
    });
  });

  describe('getBatchMetrics', () => {
    it('should return metrics for multiple questions', async () => {
      const questionIds = ['q1', 'q2', 'q3'];
      
      const metrics = await performanceTracker.getBatchMetrics(questionIds);
      
      expect(Array.isArray(metrics)).toBe(true);
      expect(metrics.length).toBeLessThanOrEqual(questionIds.length);
    });

    it('should handle empty array', async () => {
      const metrics = await performanceTracker.getBatchMetrics([]);
      
      expect(metrics).toHaveLength(0);
    });

    it('should continue on individual errors', async () => {
      const questionIds = ['valid-id', 'invalid-id', 'another-valid-id'];
      
      const metrics = await performanceTracker.getBatchMetrics(questionIds);
      
      // Should not throw, may return partial results
      expect(Array.isArray(metrics)).toBe(true);
    });
  });
});
