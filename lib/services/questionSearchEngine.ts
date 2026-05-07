/**
 * Question Search Engine
 * Searches and ranks questions from question_bank based on context and quality
 */

import { supabase } from '../supabase/client';
import { contextEngine } from './contextEngine';
import type {
  QuestionBankEntry,
  UserContext,
  QuestionRanking,
  ContextMatchScore,
  IQuestionSearchEngine,
  ObjectiveTag,
  ExtractedContext,
} from '@/types/question-bank';

class QuestionSearchEngineClass implements IQuestionSearchEngine {
  /**
   * Search questions from the bank
   * 
   * @param context User context for personalization
   * @param count Number of questions to return
   * @param minQualityScore Minimum quality score threshold (default: 60)
   * @returns Array of questions matching criteria
   */
  async search(
    context: UserContext,
    count: number,
    minQualityScore: number = 60
  ): Promise<QuestionBankEntry[]> {
    try {
      // Extract context tags from user profile
      const extractedContext: ExtractedContext = contextEngine.extractContext({
        job_title: context.job_title,
        company: context.company,
        test_objective: context.test_objective,
      });

      // Log context extraction for debugging
      console.log('[QuestionSearchEngine] Extracted context:', contextEngine.getContextSummary(extractedContext));

      // Ensure minimum quality score is at least 40 (block poor questions)
      const effectiveMinScore = Math.max(minQualityScore, 40);

      // Build query
      let query = supabase
        .from('question_bank')
        .select('*')
        .eq('status', 'active')
        .gte('quality_score', effectiveMinScore);

      // Filter by context tags if available (with high confidence)
      if (extractedContext.confidence >= 0.5) {
        if (extractedContext.profession) {
          query = query.contains('profession_tags', [extractedContext.profession]);
        }
        if (extractedContext.seniority) {
          query = query.contains('seniority_tags', [extractedContext.seniority]);
        }
        if (extractedContext.industry) {
          query = query.contains('industry_tags', [extractedContext.industry]);
        }
      }

      // Execute query with limit
      const { data, error } = await query
        .order('quality_score', { ascending: false })
        .limit(count * 2); // Get more than needed for ranking

      if (error) throw error;

      const questions = (data || []) as QuestionBankEntry[];

      // If we have enough questions, rank them
      if (questions.length > 0) {
        const ranked = await this.rankQuestions(questions, context, extractedContext);
        return ranked.slice(0, count).map(r => r.question);
      }

      return [];
    } catch (error) {
      console.error('Error searching questions:', error);
      throw error;
    }
  }

  /**
   * Rank questions based on multiple factors
   * 
   * Weights:
   * - Quality Score: 40%
   * - Context Match: 35%
   * - Recency: 15%
   * - Diversity: 10%
   */
  async rankQuestions(
    questions: QuestionBankEntry[],
    context: UserContext,
    extractedContext?: ExtractedContext
  ): Promise<QuestionRanking[]> {
    // Extract context if not provided
    const extracted = extractedContext || contextEngine.extractContext({
      job_title: context.job_title,
      company: context.company,
      test_objective: context.test_objective,
    });

    const rankings: QuestionRanking[] = [];

    for (const question of questions) {
      // Calculate individual scores
      const qualityScore = question.quality_score / 100; // Normalize to 0-1
      
      // Use ContextEngine to calculate context match (0-100 scale)
      const contextMatchScore = contextEngine.calculateContextScore(
        question,
        {
          user_id: context.user_id || '',
          profession: extracted.profession || undefined,
          seniority: extracted.seniority || undefined,
          industry: extracted.industry || undefined,
          test_objective: context.test_objective,
        }
      );
      const contextMatch = contextMatchScore / 100; // Normalize to 0-1
      
      const recencyScore = this.calculateRecencyScore(question);
      const diversityScore = 0.5; // TODO: Implement diversity calculation

      // Calculate weighted rank score
      const rankScore =
        qualityScore * 0.4 +
        contextMatch * 0.35 +
        recencyScore * 0.15 +
        diversityScore * 0.1;

      rankings.push({
        question,
        rank_score: rankScore,
        quality_score_weight: qualityScore * 0.4,
        context_match_weight: contextMatch * 0.35,
        recency_weight: recencyScore * 0.15,
        diversity_weight: diversityScore * 0.1,
      });
    }

    // Sort by rank score (descending)
    return rankings.sort((a, b) => b.rank_score - a.rank_score);
  }

  /**
   * Calculate recency score (0-1)
   * Prefer questions that haven't been used recently
   */
  private calculateRecencyScore(question: QuestionBankEntry): number {
    if (!question.last_used_at) {
      return 1.0; // Never used = highest recency score
    }

    const now = new Date();
    const lastUsed = new Date(question.last_used_at);
    const daysSinceLastUse = (now.getTime() - lastUsed.getTime()) / (1000 * 60 * 60 * 24);

    // Score decreases as days since last use increases
    // 0 days = 0.0, 30+ days = 1.0
    return Math.min(daysSinceLastUse / 30, 1.0);
  }

  /**
   * Map test objective string to ObjectiveTag
   */
  private mapTestObjectiveToTag(objective: string): ObjectiveTag | null {
    const lowerObjective = objective.toLowerCase();

    if (lowerObjective.includes('hiring') || lowerObjective.includes('recrutamento')) {
      return 'hiring';
    }
    if (lowerObjective.includes('self') || lowerObjective.includes('autoconhecimento')) {
      return 'self-knowledge';
    }
    if (lowerObjective.includes('team') || lowerObjective.includes('equipe')) {
      return 'team-building';
    }
    if (lowerObjective.includes('development') || lowerObjective.includes('desenvolvimento')) {
      return 'development';
    }

    return null;
  }

  /**
   * Match context for a single question
   * Uses ContextEngine for consistent context matching
   */
  async matchContext(
    question: QuestionBankEntry,
    context: UserContext
  ): Promise<ContextMatchScore> {
    // Extract context from user profile
    const extracted = contextEngine.extractContext({
      job_title: context.job_title,
      company: context.company,
      test_objective: context.test_objective,
    });

    // Calculate overall match score using ContextEngine
    const matchScore = contextEngine.calculateContextScore(question, {
      user_id: context.user_id || '',
      profession: extracted.profession || undefined,
      seniority: extracted.seniority || undefined,
      industry: extracted.industry || undefined,
      test_objective: context.test_objective,
    });

    // Calculate individual component matches for detailed breakdown
    const professionMatch = extracted.profession && question.profession_tags.includes(extracted.profession) ? 100 : 0;
    const seniorityMatch = extracted.seniority && question.seniority_tags.includes(extracted.seniority) ? 100 : 0;
    const industryMatch = extracted.industry && question.industry_tags.includes(extracted.industry) ? 100 : 0;
    
    const objectiveTag = context.test_objective ? this.mapTestObjectiveToTag(context.test_objective) : null;
    const objectiveMatch = objectiveTag && question.objective_tags.includes(objectiveTag) ? 100 : 0;

    return {
      question_id: question.id,
      match_score: matchScore,
      profession_match: professionMatch,
      seniority_match: seniorityMatch,
      objective_match: objectiveMatch,
      industry_match: industryMatch,
    };
  }

  /**
   * Ensure balanced DISC distribution
   * Returns ~25% of each type (D, I, S, C)
   */
  async ensureBalancedDistribution(
    questions: QuestionBankEntry[],
    targetCount: number
  ): Promise<QuestionBankEntry[]> {
    const perType = Math.ceil(targetCount / 4);
    const balanced: QuestionBankEntry[] = [];

    // Group by DISC type
    const byType: Record<string, QuestionBankEntry[]> = {
      D: questions.filter(q => q.disc_type === 'D'),
      I: questions.filter(q => q.disc_type === 'I'),
      S: questions.filter(q => q.disc_type === 'S'),
      C: questions.filter(q => q.disc_type === 'C'),
    };

    // Take perType from each
    for (const type of ['D', 'I', 'S', 'C']) {
      balanced.push(...byType[type].slice(0, perType));
    }

    return balanced.slice(0, targetCount);
  }
}

// Export singleton instance
export const questionSearchEngine = new QuestionSearchEngineClass();
