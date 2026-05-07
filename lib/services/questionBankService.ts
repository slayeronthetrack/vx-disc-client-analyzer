/**
 * Question Bank Service
 * Orchestrates question selection, validation, and management
 */

import { supabase } from '../supabase/client';
import { qualityScoreCalculator } from './qualityScoreCalculator';
import { antiDuplicationSystem } from './antiDuplicationSystem';
import type {
  QuestionBankEntry,
  QuestionSearchRequest,
  QuestionSearchResult,
  IQuestionBankService,
  QualityScoreComponents,
} from '@/types/question-bank';

class QuestionBankServiceClass implements IQuestionBankService {
  /**
   * Main method: Select questions for a test
   * 
   * Flow:
   * 1. Search question bank
   * 2. If insufficient, will be handled by caller (generate new questions)
   * 3. Return result
   */
  async selectQuestions(request: QuestionSearchRequest): Promise<QuestionSearchResult> {
    const startTime = Date.now();
    
    try {
      // For now, just search the bank
      // Generation logic will be added in Phase 5
      const { data: questions, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('status', 'active')
        .gte('quality_score', request.min_quality_score || 60)
        .order('quality_score', { ascending: false })
        .limit(request.question_count);

      if (error) throw error;

      const foundCount = questions?.length || 0;
      const searchTime = Date.now() - startTime;

      return {
        questions: (questions || []) as QuestionBankEntry[],
        found_count: foundCount,
        source: foundCount >= request.question_count ? 'bank' : 'mixed',
        search_time_ms: searchTime,
      };
    } catch (error) {
      console.error('Error selecting questions:', error);
      throw error;
    }
  }

  /**
   * Save a new question to the bank
   * Checks for duplicates before saving
   */
  async saveQuestion(
    question: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'>
  ): Promise<QuestionBankEntry> {
    try {
      // Check for duplicates first
      const duplicationCheck = await antiDuplicationSystem.isDuplicate(
        question.question_text,
        0.85
      );

      if (duplicationCheck.is_duplicate) {
        console.warn(
          `Question is a duplicate (similarity: ${duplicationCheck.similarity_score.toFixed(2)}). Similar question: ${duplicationCheck.similar_question_id}`
        );
        // Return the existing question instead of creating a duplicate
        const existing = await this.getQuestionById(duplicationCheck.similar_question_id!);
        if (existing) {
          return existing;
        }
      }

      // Flag for review if similarity is between 0.70 and 0.85
      if (duplicationCheck.similarity_score >= 0.70 && duplicationCheck.similarity_score < 0.85) {
        console.warn(
          `Question may be similar to existing question (similarity: ${duplicationCheck.similarity_score.toFixed(2)}). Flagging for review.`
        );
        question.status = 'flagged';
      }

      // Insert the question
      const { data, error } = await supabase
        .from('question_bank')
        .insert(question)
        .select()
        .single();

      if (error) throw error;

      const savedQuestion = data as QuestionBankEntry;

      // Generate and cache embedding asynchronously (don't wait)
      antiDuplicationSystem
        .generateAndCacheEmbedding(savedQuestion.id, savedQuestion.question_text)
        .catch((err) => console.error('Error caching embedding:', err));

      return savedQuestion;
    } catch (error) {
      console.error('Error saving question:', error);
      throw error;
    }
  }

  /**
   * Get a question by ID
   */
  async getQuestionById(id: string): Promise<QuestionBankEntry | null> {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        if (error.code === 'PGRST116') return null; // Not found
        throw error;
      }

      return data as QuestionBankEntry;
    } catch (error) {
      console.error('Error getting question by ID:', error);
      throw error;
    }
  }

  /**
   * Update quality score of a question
   */
  async updateQualityScore(
    questionId: string,
    newScore: number,
    reason: string
  ): Promise<void> {
    try {
      // Validate score
      if (newScore < 0 || newScore > 100) {
        throw new Error('Quality score must be between 0 and 100');
      }

      // Determine new status based on score
      const newStatus = qualityScoreCalculator.determineStatus(newScore);

      const { error } = await supabase
        .from('question_bank')
        .update({
          quality_score: newScore,
          status: newStatus,
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      // Log the update
      console.log(`Quality score updated for question ${questionId}: ${newScore} (${reason}) - Status: ${newStatus}`);
    } catch (error) {
      console.error('Error updating quality score:', error);
      throw error;
    }
  }

  /**
   * Recalculate quality score from components
   */
  async recalculateQualityScore(
    questionId: string,
    components: QualityScoreComponents
  ): Promise<void> {
    try {
      // Validate components
      const validation = qualityScoreCalculator.validateComponents(components);
      if (!validation.valid) {
        throw new Error(`Invalid components: ${validation.errors.join(', ')}`);
      }

      // Calculate new score
      const newScore = qualityScoreCalculator.calculateScore(components);

      // Apply business rules
      const { newScore: adjustedScore, adjustments } = qualityScoreCalculator.applyBusinessRules(
        newScore,
        components
      );

      // Update in database
      await this.updateQualityScore(
        questionId,
        adjustedScore,
        `Recalculated from components. Adjustments: ${adjustments.join('; ')}`
      );
    } catch (error) {
      console.error('Error recalculating quality score:', error);
      throw error;
    }
  }

  /**
   * Archive a question (soft delete)
   */
  async archiveQuestion(questionId: string, reason: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({
          status: 'archived',
          last_updated_at: new Date().toISOString(),
        })
        .eq('id', questionId);

      if (error) throw error;

      // Log the archival
      console.log(`Question ${questionId} archived: ${reason}`);
    } catch (error) {
      console.error('Error archiving question:', error);
      throw error;
    }
  }

  /**
   * Get questions by status
   */
  async getQuestionsByStatus(status: 'active' | 'flagged' | 'archived'): Promise<QuestionBankEntry[]> {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .eq('status', status)
        .order('quality_score', { ascending: false });

      if (error) throw error;
      return (data || []) as QuestionBankEntry[];
    } catch (error) {
      console.error('Error getting questions by status:', error);
      throw error;
    }
  }

  /**
   * Get all questions (for admin)
   */
  async getAllQuestions(): Promise<QuestionBankEntry[]> {
    try {
      const { data, error } = await supabase
        .from('question_bank')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      return (data || []) as QuestionBankEntry[];
    } catch (error) {
      console.error('Error getting all questions:', error);
      throw error;
    }
  }

  /**
   * Update last_used_at timestamp
   */
  async updateLastUsed(questionId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({
          last_used_at: new Date().toISOString(),
          usage_count: supabase.rpc('increment', { row_id: questionId }),
        })
        .eq('id', questionId);

      if (error) throw error;
    } catch (error) {
      console.error('Error updating last_used_at:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Increment usage count
   */
  async incrementUsageCount(questionId: string): Promise<void> {
    try {
      const { data: question, error: fetchError } = await supabase
        .from('question_bank')
        .select('usage_count')
        .eq('id', questionId)
        .single();

      if (fetchError) throw fetchError;

      const { error: updateError } = await supabase
        .from('question_bank')
        .update({
          usage_count: (question.usage_count || 0) + 1,
        })
        .eq('id', questionId);

      if (updateError) throw updateError;
    } catch (error) {
      console.error('Error incrementing usage count:', error);
      // Don't throw - this is not critical
    }
  }

  /**
   * Check if a question is a duplicate
   * Returns the existing question if duplicate found
   */
  async checkDuplication(questionText: string): Promise<{
    isDuplicate: boolean;
    existingQuestion: QuestionBankEntry | null;
    similarity: number;
  }> {
    try {
      const result = await antiDuplicationSystem.isDuplicate(questionText, 0.85);

      if (result.is_duplicate && result.similar_question_id) {
        const existing = await this.getQuestionById(result.similar_question_id);
        return {
          isDuplicate: true,
          existingQuestion: existing,
          similarity: result.similarity_score,
        };
      }

      return {
        isDuplicate: false,
        existingQuestion: null,
        similarity: result.similarity_score,
      };
    } catch (error) {
      console.error('Error checking duplication:', error);
      return {
        isDuplicate: false,
        existingQuestion: null,
        similarity: 0,
      };
    }
  }

  /**
   * Find similar questions to a given text
   */
  async findSimilarQuestions(
    questionText: string,
    minSimilarity: number = 0.7,
    maxResults: number = 5
  ): Promise<Array<{ question: QuestionBankEntry; similarity: number }>> {
    try {
      const similar = await antiDuplicationSystem.findSimilarQuestions(
        questionText,
        minSimilarity,
        maxResults
      );

      const results = await Promise.all(
        similar.map(async (s) => {
          const question = await this.getQuestionById(s.id);
          return question ? { question, similarity: s.similarity } : null;
        })
      );

      return results.filter((r): r is { question: QuestionBankEntry; similarity: number } => r !== null);
    } catch (error) {
      console.error('Error finding similar questions:', error);
      return [];
    }
  }
}

// Export singleton instance
export const questionBankService = new QuestionBankServiceClass();
