/**
 * Quality Score Calculator
 * Calculates and updates quality scores for questions based on multiple factors
 */

import type {
  QualityScoreComponents,
  QualityScoreUpdate,
  IQualityScoreCalculator,
} from '@/types/question-bank';

class QualityScoreCalculatorClass implements IQualityScoreCalculator {
  /**
   * Calculate quality score from components
   * 
   * Formula: (clarity × 0.25) + (discrimination × 0.30) + (completion × 0.25) + (feedback × 0.20)
   * 
   * @param components Individual score components
   * @returns Quality score (0-100)
   */
  calculateScore(components: QualityScoreComponents): number {
    // Normalize discrimination_power (0-1) to 0-100
    const discriminationNormalized = components.discrimination_power * 100;
    
    // Normalize user_feedback (0-5) to 0-100
    const feedbackNormalized = (components.user_feedback / 5) * 100;
    
    // Calculate weighted average
    const score =
      components.clarity_score * 0.25 +
      discriminationNormalized * 0.30 +
      components.completion_rate * 0.25 +
      feedbackNormalized * 0.20;
    
    // Ensure score is within bounds
    return Math.max(0, Math.min(100, Math.round(score)));
  }

  /**
   * Update quality scores for multiple questions
   * 
   * @param questionIds Array of question IDs to update
   * @returns Array of quality score updates
   */
  async updateScores(questionIds: string[]): Promise<QualityScoreUpdate[]> {
    const updates: QualityScoreUpdate[] = [];
    
    // This will be implemented in Phase 7 when we have performance tracking
    // For now, return empty array
    console.log(`Quality score update requested for ${questionIds.length} questions`);
    
    return updates;
  }

  /**
   * Get quality score thresholds
   * 
   * @returns Threshold values for different quality levels
   */
  getThresholds(): { min_active: number; flagged: number; archived: number } {
    return {
      min_active: 60,  // Minimum score for active questions
      flagged: 40,     // Below this, question is flagged for review
      archived: 30,    // Below this, question should be archived
    };
  }

  /**
   * Determine status based on quality score
   * 
   * @param score Quality score (0-100)
   * @returns Recommended status
   */
  determineStatus(score: number): 'active' | 'flagged' | 'archived' {
    const thresholds = this.getThresholds();
    
    if (score < thresholds.archived) {
      return 'archived';
    }
    if (score < thresholds.flagged) {
      return 'flagged';
    }
    return 'active';
  }

  /**
   * Calculate score adjustment based on performance changes
   * 
   * @param oldComponents Previous component values
   * @param newComponents New component values
   * @returns Score adjustment (+/- points)
   */
  calculateAdjustment(
    oldComponents: QualityScoreComponents,
    newComponents: QualityScoreComponents
  ): number {
    const oldScore = this.calculateScore(oldComponents);
    const newScore = this.calculateScore(newComponents);
    
    return newScore - oldScore;
  }

  /**
   * Apply business rules for score adjustments
   * Based on requirements:
   * - completion_rate < 80% → reduce by 10 points
   * - user_feedback > 4.0 → increase by 5 points
   * - discrimination_power > 0.7 → increase by 10 points
   */
  applyBusinessRules(
    currentScore: number,
    components: QualityScoreComponents
  ): { newScore: number; adjustments: string[] } {
    let newScore = currentScore;
    const adjustments: string[] = [];

    // Rule 1: Low completion rate penalty
    if (components.completion_rate < 80) {
      newScore -= 10;
      adjustments.push('Completion rate < 80%: -10 points');
    }

    // Rule 2: High feedback bonus
    if (components.user_feedback > 4.0) {
      newScore += 5;
      adjustments.push('User feedback > 4.0: +5 points');
    }

    // Rule 3: High discrimination power bonus
    if (components.discrimination_power > 0.7) {
      newScore += 10;
      adjustments.push('Discrimination power > 0.7: +10 points');
    }

    // Ensure score stays within bounds
    newScore = Math.max(0, Math.min(100, newScore));

    return { newScore, adjustments };
  }

  /**
   * Validate quality score components
   * 
   * @param components Components to validate
   * @returns Validation result
   */
  validateComponents(components: QualityScoreComponents): {
    valid: boolean;
    errors: string[];
  } {
    const errors: string[] = [];

    // Validate clarity_score (0-100)
    if (components.clarity_score < 0 || components.clarity_score > 100) {
      errors.push('clarity_score must be between 0 and 100');
    }

    // Validate discrimination_power (0-1)
    if (components.discrimination_power < 0 || components.discrimination_power > 1) {
      errors.push('discrimination_power must be between 0 and 1');
    }

    // Validate completion_rate (0-100)
    if (components.completion_rate < 0 || components.completion_rate > 100) {
      errors.push('completion_rate must be between 0 and 100');
    }

    // Validate user_feedback (0-5)
    if (components.user_feedback < 0 || components.user_feedback > 5) {
      errors.push('user_feedback must be between 0 and 5');
    }

    return {
      valid: errors.length === 0,
      errors,
    };
  }

  /**
   * Get score category label
   * 
   * @param score Quality score (0-100)
   * @returns Category label
   */
  getScoreCategory(score: number): string {
    if (score >= 90) return 'Excellent';
    if (score >= 75) return 'Good';
    if (score >= 60) return 'Acceptable';
    if (score >= 40) return 'Needs Review';
    return 'Poor';
  }

  /**
   * Calculate expected score range based on components
   * Useful for detecting anomalies
   */
  getExpectedRange(components: QualityScoreComponents): {
    min: number;
    max: number;
    expected: number;
  } {
    const expected = this.calculateScore(components);
    
    // Allow ±10 points variance
    return {
      min: Math.max(0, expected - 10),
      max: Math.min(100, expected + 10),
      expected,
    };
  }
}

// Export singleton instance
export const qualityScoreCalculator = new QualityScoreCalculatorClass();
