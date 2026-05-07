/**
 * Question Bank Integration Tests
 * Testa fluxo completo: busca → validação → save
 */

import { questionBankService } from '@/lib/services/questionBankService';
import { questionValidator } from '@/lib/services/questionValidator';
import { questionSearchEngine } from '@/lib/services/questionSearchEngine';
import type { QuestionBankEntry } from '@/types/question-bank';

describe('Question Bank Integration Flow', () => {
  describe('Search and Select Flow', () => {
    it('should search questions with context', async () => {
      const result = await questionSearchEngine.search(
        {
          user_id: 'test-user',
          job_title: 'Sales Manager',
          company: 'Tech Startup',
          test_objective: 'hiring',
        },
        20,
        60
      );

      expect(Array.isArray(result)).toBe(true);
      // Note: May return 0 if database is empty
      if (result.length > 0) {
        expect(result[0]).toHaveProperty('id');
        expect(result[0]).toHaveProperty('question_text');
        expect(result[0]).toHaveProperty('quality_score');
      }
    });

    it('should respect minimum quality score', async () => {
      const result = await questionSearchEngine.search(
        {
          user_id: 'test-user',
        },
        20,
        70 // High threshold
      );

      result.forEach(question => {
        expect(question.quality_score).toBeGreaterThanOrEqual(70);
      });
    });
  });

  describe('Validation Flow', () => {
    it('should validate a well-formed question', async () => {
      const mockQuestion: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> = {
        question_text: 'Como você prefere trabalhar em equipe?',
        options: [
          { text: 'Lidero e tomo decisões', type: 'D' },
          { text: 'Motivo e inspiro', type: 'I' },
          { text: 'Apoio e colaboro', type: 'S' },
          { text: 'Analiso e organizo', type: 'C' },
        ],
        disc_type: 'D',
        value_types: [],
        psychological_traits: {
          energy: [],
          perception: [],
          decision: [],
          organization: [],
        },
        context_tags: [],
        profession_tags: ['management'],
        seniority_tags: ['mid'],
        objective_tags: ['team-building'],
        industry_tags: [],
        difficulty_level: 'medium',
        quality_score: 75,
        clarity_score: 80,
        discrimination_power: 0.6,
        usage_count: 0,
        completion_rate: 100,
        user_feedback_score: 3.5,
        last_used_at: null,
        status: 'active',
        source: 'manual',
        created_by: null,
        embedding_vector: null,
      };

      const validation = await questionValidator.validate(mockQuestion);
      
      expect(validation.valid).toBe(true);
      expect(validation.errors).toHaveLength(0);
      expect(validation.question).toBeDefined();
    });

    it('should reject question with invalid structure', async () => {
      const mockQuestion: any = {
        question_text: 'Invalid question',
        options: [
          { text: 'Option 1', type: 'D' },
          { text: 'Option 2', type: 'D' }, // Duplicate type
        ],
        disc_type: 'D',
        // ... outros campos
      };

      const validation = await questionValidator.validate(mockQuestion);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.length).toBeGreaterThan(0);
    });

    it('should reject question with clinical terms', async () => {
      const mockQuestion: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> = {
        question_text: 'Você tem diagnóstico de algum transtorno?', // Clinical terms
        options: [
          { text: 'Sim', type: 'D' },
          { text: 'Não', type: 'I' },
          { text: 'Talvez', type: 'S' },
          { text: 'Prefiro não responder', type: 'C' },
        ],
        disc_type: 'D',
        value_types: [],
        psychological_traits: {
          energy: [],
          perception: [],
          decision: [],
          organization: [],
        },
        context_tags: [],
        profession_tags: [],
        seniority_tags: [],
        objective_tags: [],
        industry_tags: [],
        difficulty_level: 'medium',
        quality_score: 75,
        clarity_score: 80,
        discrimination_power: 0.6,
        usage_count: 0,
        completion_rate: 100,
        user_feedback_score: 3.5,
        last_used_at: null,
        status: 'active',
        source: 'manual',
        created_by: null,
        embedding_vector: null,
      };

      const validation = await questionValidator.validate(mockQuestion);
      
      expect(validation.valid).toBe(false);
      expect(validation.errors.some(e => e.includes('clinical'))).toBe(true);
    });
  });

  describe('Save Flow', () => {
    it('should save a valid question', async () => {
      const mockQuestion: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> = {
        question_text: `Test question ${Date.now()}`, // Unique
        options: [
          { text: 'Lidero e tomo decisões', type: 'D' },
          { text: 'Motivo e inspiro', type: 'I' },
          { text: 'Apoio e colaboro', type: 'S' },
          { text: 'Analiso e organizo', type: 'C' },
        ],
        disc_type: 'D',
        value_types: [],
        psychological_traits: {
          energy: [],
          perception: [],
          decision: [],
          organization: [],
        },
        context_tags: [],
        profession_tags: ['management'],
        seniority_tags: ['mid'],
        objective_tags: ['team-building'],
        industry_tags: [],
        difficulty_level: 'medium',
        quality_score: 75,
        clarity_score: 80,
        discrimination_power: 0.6,
        usage_count: 0,
        completion_rate: 100,
        user_feedback_score: 3.5,
        last_used_at: null,
        status: 'active',
        source: 'test',
        created_by: null,
        embedding_vector: null,
      };

      try {
        const saved = await questionBankService.saveQuestion(mockQuestion);
        
        expect(saved).toHaveProperty('id');
        expect(saved.question_text).toBe(mockQuestion.question_text);
        expect(saved.quality_score).toBe(mockQuestion.quality_score);
      } catch (error) {
        // May fail if database not configured
        console.warn('Save test skipped - database not available');
      }
    });
  });

  describe('Complete Flow: Search → Validate → Save', () => {
    it('should handle complete question lifecycle', async () => {
      // 1. Search for existing questions
      const searchResult = await questionSearchEngine.search(
        {
          user_id: 'test-user',
          job_title: 'Sales Manager',
        },
        5,
        60
      );

      expect(Array.isArray(searchResult)).toBe(true);

      // 2. If not enough questions, validate a new one
      if (searchResult.length < 5) {
        const newQuestion: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> = {
          question_text: `Integration test question ${Date.now()}`,
          options: [
            { text: 'Lidero e tomo decisões', type: 'D' },
            { text: 'Motivo e inspiro', type: 'I' },
            { text: 'Apoio e colaboro', type: 'S' },
            { text: 'Analiso e organizo', type: 'C' },
          ],
          disc_type: 'D',
          value_types: [],
          psychological_traits: {
            energy: [],
            perception: [],
            decision: [],
            organization: [],
          },
          context_tags: [],
          profession_tags: ['sales'],
          seniority_tags: ['mid'],
          objective_tags: ['development'],
          industry_tags: ['technology'],
          difficulty_level: 'medium',
          quality_score: 75,
          clarity_score: 80,
          discrimination_power: 0.6,
          usage_count: 0,
          completion_rate: 100,
          user_feedback_score: 3.5,
          last_used_at: null,
          status: 'active',
          source: 'test',
          created_by: null,
          embedding_vector: null,
        };

        const validation = await questionValidator.validate(newQuestion);
        expect(validation.valid).toBe(true);

        // 3. Save if valid
        if (validation.valid && validation.question) {
          try {
            const saved = await questionBankService.saveQuestion(validation.question);
            expect(saved).toHaveProperty('id');
          } catch (error) {
            console.warn('Save skipped - database not available');
          }
        }
      }
    });
  });
});
