/**
 * Performance Tracker
 * Tracks question usage, completion, and feedback for continuous learning
 */

import { supabase } from '../supabase/client';
import { createClient } from '../supabase/server';
import type {
  QuestionPerformanceMetrics,
  IPerformanceTracker,
} from '@/types/question-bank';

class PerformanceTrackerClass implements IPerformanceTracker {
  /**
   * Record question usage when selected for a test
   */
  async recordUsage(
    questionId: string,
    userId: string,
    context?: {
      test_objective?: string;
      job_title?: string;
      company?: string;
    }
  ): Promise<void> {
    try {
      const supabaseClient = await createClient();

      const { error } = await supabaseClient
        .from('question_performance')
        .insert({
          question_id: questionId,
          user_id: userId,
          selected_at: new Date().toISOString(),
          completed: false,
          // context_at_selection removido - campo não existe na tabela
        });

      if (error) throw error;

      // Update last_used_at and increment usage_count in question_bank
      // First, get current usage_count
      const { data: currentQuestion } = await supabaseClient
        .from('question_bank')
        .select('usage_count')
        .eq('id', questionId)
        .single();

      const newUsageCount = (currentQuestion?.usage_count || 0) + 1;

      await supabaseClient
        .from('question_bank')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: newUsageCount,
        })
        .eq('id', questionId);

      console.log(`[PerformanceTracker] Recorded usage for question ${questionId}`);
    } catch (error) {
      console.error('Error recording usage:', error);
      // Don't throw - tracking failures shouldn't break the test flow
    }
  }

  /**
   * Record question completion when user answers
   */
  async recordCompletion(
    questionId: string,
    userId: string,
    selectedOption: string,
    timeToAnswer?: number
  ): Promise<void> {
    try {
      const supabaseClient = await createClient();

      // Find the most recent performance record for this question/user
      const { data: records, error: fetchError } = await supabaseClient
        .from('question_performance')
        .select('id')
        .eq('question_id', questionId)
        .eq('user_id', userId)
        .eq('completed', false)
        .order('selected_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (records && records.length > 0) {
        const { error: updateError } = await supabaseClient
          .from('question_performance')
          .update({
            completed: true,
            completed_at: new Date().toISOString(),
            selected_option: selectedOption,
            time_to_answer: timeToAnswer,
          })
          .eq('id', records[0].id);

        if (updateError) throw updateError;

        console.log(`[PerformanceTracker] Recorded completion for question ${questionId}`);
      }
    } catch (error) {
      console.error('Error recording completion:', error);
      // Don't throw - tracking failures shouldn't break the test flow
    }
  }

  /**
   * Record user feedback rating (1-5)
   */
  async recordFeedback(
    questionId: string,
    userId: string,
    rating: number,
    comment?: string
  ): Promise<void> {
    try {
      if (rating < 1 || rating > 5) {
        throw new Error('Rating must be between 1 and 5');
      }

      const supabaseClient = await createClient();

      // Find the most recent performance record for this question/user
      const { data: records, error: fetchError } = await supabaseClient
        .from('question_performance')
        .select('id')
        .eq('question_id', questionId)
        .eq('user_id', userId)
        .order('selected_at', { ascending: false })
        .limit(1);

      if (fetchError) throw fetchError;

      if (records && records.length > 0) {
        const { error: updateError } = await supabaseClient
          .from('question_performance')
          .update({
            user_feedback_rating: rating,
            user_feedback_comment: comment,
          })
          .eq('id', records[0].id);

        if (updateError) throw updateError;

        console.log(`[PerformanceTracker] Recorded feedback for question ${questionId}: ${rating}/5`);
      }
    } catch (error) {
      console.error('Error recording feedback:', error);
      // Don't throw - tracking failures shouldn't break the test flow
    }
  }

  /**
   * Get aggregated performance metrics for a question
   */
  async getMetrics(questionId: string): Promise<QuestionPerformanceMetrics> {
    try {
      const supabaseClient = await createClient();

      // Get all performance records for this question
      const { data: records, error } = await supabaseClient
        .from('question_performance')
        .select('*')
        .eq('question_id', questionId);

      if (error) throw error;

      const totalUsage = records?.length || 0;
      const completedRecords = records?.filter((r) => r.completed) || [];
      const completedCount = completedRecords.length;
      const completionRate = totalUsage > 0 ? (completedCount / totalUsage) * 100 : 0;

      // Calculate average feedback
      const feedbackRecords = records?.filter((r) => r.user_feedback_rating !== null) || [];
      const avgFeedback =
        feedbackRecords.length > 0
          ? feedbackRecords.reduce((sum, r) => sum + (r.user_feedback_rating || 0), 0) /
            feedbackRecords.length
          : 0;

      // Calculate average time to answer
      const timeRecords = completedRecords.filter((r) => r.time_to_answer !== null);
      const avgTimeToAnswer =
        timeRecords.length > 0
          ? timeRecords.reduce((sum, r) => sum + (r.time_to_answer || 0), 0) / timeRecords.length
          : 0;

      // Calculate discrimination power (variance in selected options)
      const discriminationPower = this.calculateDiscriminationPower(completedRecords);

      return {
        question_id: questionId,
        usage_count: totalUsage,
        completion_rate: Math.round(completionRate * 100) / 100,
        avg_time_to_answer: Math.round(avgTimeToAnswer * 100) / 100,
        avg_user_feedback: Math.round(avgFeedback * 100) / 100,
        discrimination_power: Math.round(discriminationPower * 100) / 100,
        last_calculated_at: new Date().toISOString(),
      };
    } catch (error) {
      console.error('Error getting metrics:', error);
      throw error;
    }
  }

  /**
   * Calculate discrimination power based on response variance
   * Higher variance = better discrimination between different personality types
   * Returns value between 0 and 1
   */
  calculateDiscriminationPower(
    records: Array<{ selected_option?: string | null }>
  ): number {
    if (records.length === 0) return 0;

    // Count selections for each option
    const optionCounts: Record<string, number> = {};
    let totalSelections = 0;

    for (const record of records) {
      if (record.selected_option) {
        optionCounts[record.selected_option] = (optionCounts[record.selected_option] || 0) + 1;
        totalSelections++;
      }
    }

    if (totalSelections === 0) return 0;

    // Calculate variance
    // Perfect discrimination: all 4 options selected equally (25% each)
    // Poor discrimination: one option selected 100%
    const optionKeys = Object.keys(optionCounts);
    if (optionKeys.length === 0) return 0;

    // Calculate proportions
    const proportions = optionKeys.map((key) => optionCounts[key] / totalSelections);

    // Calculate variance from uniform distribution (0.25 for 4 options)
    const expectedProportion = 0.25;
    const variance =
      proportions.reduce((sum, p) => sum + Math.pow(p - expectedProportion, 2), 0) /
      proportions.length;

    // Convert variance to discrimination power (0-1 scale)
    // Lower variance = higher discrimination
    // Max variance is 0.1875 (when one option is 100%)
    const maxVariance = 0.1875;
    const discriminationPower = 1 - Math.min(variance / maxVariance, 1);

    return discriminationPower;
  }

  /**
   * Batch record usage for multiple questions
   */
  async recordBatchUsage(
    questionIds: string[],
    userId: string,
    context?: {
      test_objective?: string;
      job_title?: string;
      company?: string;
    }
  ): Promise<void> {
    try {
      const supabaseClient = await createClient();

      // Insert all records at once
      const records = questionIds.map((questionId) => ({
        question_id: questionId,
        user_id: userId,
        selected_at: new Date().toISOString(),
        completed: false,
        // context_at_selection removido - campo não existe na tabela
      }));

      const { error } = await supabaseClient.from('question_performance').insert(records);

      if (error) throw error;

      // Update last_used_at and increment usage_count for all questions
      for (const questionId of questionIds) {
        // Get current usage_count
        const { data: currentQuestion } = await supabaseClient
          .from('question_bank')
          .select('usage_count')
          .eq('id', questionId)
          .single();

        const newUsageCount = (currentQuestion?.usage_count || 0) + 1;

        await supabaseClient
          .from('question_bank')
          .update({
            last_used_at: new Date().toISOString(),
            usage_count: newUsageCount,
          })
          .eq('id', questionId);
      }

      console.log(`[PerformanceTracker] Recorded batch usage for ${questionIds.length} questions`);
    } catch (error) {
      console.error('Error recording batch usage:', error);
      // Don't throw - tracking failures shouldn't break the test flow
    }
  }

  /**
   * Get metrics for multiple questions
   */
  async getBatchMetrics(questionIds: string[]): Promise<QuestionPerformanceMetrics[]> {
    const metrics: QuestionPerformanceMetrics[] = [];

    for (const questionId of questionIds) {
      try {
        const metric = await this.getMetrics(questionId);
        metrics.push(metric);
      } catch (error) {
        console.error(`Error getting metrics for question ${questionId}:`, error);
        // Continue with other questions
      }
    }

    return metrics;
  }
}

// Export singleton instance
export const performanceTracker = new PerformanceTrackerClass();
