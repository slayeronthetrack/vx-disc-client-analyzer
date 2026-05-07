/**
 * Anti-Duplication System
 * Detects duplicate or similar questions using OpenAI embeddings and cosine similarity
 */

import OpenAI from 'openai';
import { supabase } from '../supabase/client';
import type {
  DuplicationCheckResult,
  IAntiDuplicationSystem,
} from '@/types/question-bank';

// Initialize OpenAI client
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

class AntiDuplicationSystemClass implements IAntiDuplicationSystem {
  private embeddingCache: Map<string, number[]> = new Map();

  /**
   * Get embedding vector for text using OpenAI
   * Uses text-embedding-3-small model (1536 dimensions)
   */
  async getEmbedding(text: string): Promise<number[]> {
    try {
      // Check cache first
      const cacheKey = text.trim().toLowerCase();
      if (this.embeddingCache.has(cacheKey)) {
        return this.embeddingCache.get(cacheKey)!;
      }

      // Call OpenAI Embeddings API
      const response = await openai.embeddings.create({
        model: 'text-embedding-3-small',
        input: text,
        encoding_format: 'float',
      });

      const embedding = response.data[0].embedding;

      // Cache the embedding
      this.embeddingCache.set(cacheKey, embedding);

      return embedding;
    } catch (error) {
      console.error('Error getting embedding:', error);
      throw new Error('Failed to generate embedding');
    }
  }

  /**
   * Calculate cosine similarity between two text strings
   * Returns value between 0 (completely different) and 1 (identical)
   */
  async calculateSimilarity(text1: string, text2: string): Promise<number> {
    try {
      // Get embeddings for both texts
      const [embedding1, embedding2] = await Promise.all([
        this.getEmbedding(text1),
        this.getEmbedding(text2),
      ]);

      // Calculate cosine similarity
      return this.cosineSimilarity(embedding1, embedding2);
    } catch (error) {
      console.error('Error calculating similarity:', error);
      throw error;
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private cosineSimilarity(vec1: number[], vec2: number[]): number {
    if (vec1.length !== vec2.length) {
      throw new Error('Vectors must have the same length');
    }

    let dotProduct = 0;
    let magnitude1 = 0;
    let magnitude2 = 0;

    for (let i = 0; i < vec1.length; i++) {
      dotProduct += vec1[i] * vec2[i];
      magnitude1 += vec1[i] * vec1[i];
      magnitude2 += vec2[i] * vec2[i];
    }

    magnitude1 = Math.sqrt(magnitude1);
    magnitude2 = Math.sqrt(magnitude2);

    if (magnitude1 === 0 || magnitude2 === 0) {
      return 0;
    }

    return dotProduct / (magnitude1 * magnitude2);
  }

  /**
   * Check if a question text is a duplicate of existing questions
   * 
   * @param questionText Text to check
   * @param threshold Similarity threshold (default: 0.85)
   * @returns Duplication check result
   */
  async isDuplicate(
    questionText: string,
    threshold: number = 0.85
  ): Promise<DuplicationCheckResult> {
    try {
      // Get embedding for the new question
      const newEmbedding = await this.getEmbedding(questionText);

      // Get all active questions with embeddings from database
      const { data: existingQuestions, error } = await supabase
        .from('question_bank')
        .select('id, question_text, embedding_vector')
        .eq('status', 'active')
        .not('embedding_vector', 'is', null);

      if (error) {
        console.error('Error fetching questions for duplication check:', error);
        // Don't throw - allow question to proceed if check fails
        return {
          is_duplicate: false,
          similarity_score: 0,
          similar_question_id: null,
          similar_question_text: null,
          threshold_used: threshold,
        };
      }

      // Check similarity with each existing question
      let maxSimilarity = 0;
      let mostSimilarQuestion: { id: string; text: string } | null = null;

      for (const question of existingQuestions || []) {
        if (!question.embedding_vector) continue;

        const similarity = this.cosineSimilarity(
          newEmbedding,
          question.embedding_vector as number[]
        );

        if (similarity > maxSimilarity) {
          maxSimilarity = similarity;
          mostSimilarQuestion = {
            id: question.id,
            text: question.question_text,
          };
        }
      }

      // Determine if it's a duplicate
      const isDuplicate = maxSimilarity >= threshold;

      return {
        is_duplicate: isDuplicate,
        similarity_score: maxSimilarity,
        similar_question_id: mostSimilarQuestion?.id || null,
        similar_question_text: mostSimilarQuestion?.text || null,
        threshold_used: threshold,
      };
    } catch (error) {
      console.error('Error in isDuplicate:', error);
      // Don't throw - allow question to proceed if check fails
      return {
        is_duplicate: false,
        similarity_score: 0,
        similar_question_id: null,
        similar_question_text: null,
        threshold_used: threshold,
      };
    }
  }

  /**
   * Cache embedding in database
   * Stores the embedding vector in the question_bank table
   */
  async cacheEmbedding(questionId: string, embedding: number[]): Promise<void> {
    try {
      const { error } = await supabase
        .from('question_bank')
        .update({ embedding_vector: embedding })
        .eq('id', questionId);

      if (error) {
        console.error('Error caching embedding:', error);
        // Don't throw - embedding cache is not critical
      }
    } catch (error) {
      console.error('Error in cacheEmbedding:', error);
      // Don't throw - embedding cache is not critical
    }
  }

  /**
   * Generate and cache embedding for a question
   */
  async generateAndCacheEmbedding(
    questionId: string,
    questionText: string
  ): Promise<number[]> {
    try {
      const embedding = await this.getEmbedding(questionText);
      await this.cacheEmbedding(questionId, embedding);
      return embedding;
    } catch (error) {
      console.error('Error generating and caching embedding:', error);
      throw error;
    }
  }

  /**
   * Batch generate embeddings for multiple questions
   * More efficient than generating one at a time
   */
  async batchGenerateEmbeddings(
    questions: Array<{ id: string; text: string }>
  ): Promise<Map<string, number[]>> {
    const embeddings = new Map<string, number[]>();

    try {
      // Process in batches of 10 to avoid rate limits
      const batchSize = 10;
      for (let i = 0; i < questions.length; i += batchSize) {
        const batch = questions.slice(i, i + batchSize);

        const batchPromises = batch.map(async (q) => {
          const embedding = await this.getEmbedding(q.text);
          embeddings.set(q.id, embedding);
          await this.cacheEmbedding(q.id, embedding);
        });

        await Promise.all(batchPromises);

        // Small delay between batches to respect rate limits
        if (i + batchSize < questions.length) {
          await new Promise((resolve) => setTimeout(resolve, 100));
        }
      }

      return embeddings;
    } catch (error) {
      console.error('Error in batch embedding generation:', error);
      throw error;
    }
  }

  /**
   * Find similar questions (not just duplicates)
   * Useful for suggesting related questions
   */
  async findSimilarQuestions(
    questionText: string,
    minSimilarity: number = 0.7,
    maxResults: number = 5
  ): Promise<Array<{ id: string; text: string; similarity: number }>> {
    try {
      const newEmbedding = await this.getEmbedding(questionText);

      const { data: existingQuestions, error } = await supabase
        .from('question_bank')
        .select('id, question_text, embedding_vector')
        .eq('status', 'active')
        .not('embedding_vector', 'is', null);

      if (error || !existingQuestions) {
        return [];
      }

      const similarities: Array<{ id: string; text: string; similarity: number }> = [];

      for (const question of existingQuestions) {
        if (!question.embedding_vector) continue;

        const similarity = this.cosineSimilarity(
          newEmbedding,
          question.embedding_vector as number[]
        );

        if (similarity >= minSimilarity) {
          similarities.push({
            id: question.id,
            text: question.question_text,
            similarity,
          });
        }
      }

      // Sort by similarity (descending) and return top results
      return similarities
        .sort((a, b) => b.similarity - a.similarity)
        .slice(0, maxResults);
    } catch (error) {
      console.error('Error finding similar questions:', error);
      return [];
    }
  }

  /**
   * Clear the in-memory embedding cache
   */
  clearCache(): void {
    this.embeddingCache.clear();
  }

  /**
   * Get cache statistics
   */
  getCacheStats(): { size: number; keys: string[] } {
    return {
      size: this.embeddingCache.size,
      keys: Array.from(this.embeddingCache.keys()),
    };
  }
}

// Export singleton instance
export const antiDuplicationSystem = new AntiDuplicationSystemClass();
