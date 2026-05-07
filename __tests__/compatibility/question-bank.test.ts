/**
 * Question Bank Compatibility Tests
 * Testa compatibilidade com perguntas DISC-only e conversão de perguntas antigas
 */

import { questionBankToExtended, questionBankArrayToExtended } from '@/types/question-bank';
import type { QuestionBankEntry } from '@/types/question-bank';

describe('Question Bank Compatibility', () => {
  describe('DISC-only Questions', () => {
    it('should handle question without value_types', () => {
      const question: QuestionBankEntry = {
        id: '1',
        question_text: 'Como você trabalha?',
        options: [
          { text: 'Lidero', type: 'D' },
          { text: 'Motivo', type: 'I' },
          { text: 'Apoio', type: 'S' },
          { text: 'Analiso', type: 'C' },
        ],
        disc_type: 'D',
        value_types: [], // Empty
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
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active',
        source: 'static',
        created_by: null,
        embedding_vector: null,
      };

      const extended = questionBankToExtended(question);
      
      expect(extended).toBeDefined();
      expect(extended.id).toBe('1');
      expect(extended.text).toBe('Como você trabalha?');
      expect(extended.options).toHaveLength(4);
      expect(extended.options[0].type).toBe('D');
      expect(extended.options[0].valueType).toBeUndefined();
      expect(extended.options[0].psychTraits).toBeUndefined();
    });

    it('should handle question without psychological_traits', () => {
      const question: QuestionBankEntry = {
        id: '2',
        question_text: 'Qual seu estilo?',
        options: [
          { text: 'Direto', type: 'D' },
          { text: 'Sociável', type: 'I' },
          { text: 'Calmo', type: 'S' },
          { text: 'Preciso', type: 'C' },
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
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active',
        source: 'static',
        created_by: null,
        embedding_vector: null,
      };

      const extended = questionBankToExtended(question);
      
      expect(extended).toBeDefined();
      expect(extended.options[0].psychTraits).toBeUndefined();
    });

    it('should convert array of DISC-only questions', () => {
      const questions: QuestionBankEntry[] = [
        {
          id: '1',
          question_text: 'Question 1',
          options: [
            { text: 'A', type: 'D' },
            { text: 'B', type: 'I' },
            { text: 'C', type: 'S' },
            { text: 'D', type: 'C' },
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
          created_at: new Date(),
          last_used_at: null,
          last_updated_at: new Date(),
          status: 'active',
          source: 'static',
          created_by: null,
          embedding_vector: null,
        },
        {
          id: '2',
          question_text: 'Question 2',
          options: [
            { text: 'A', type: 'D' },
            { text: 'B', type: 'I' },
            { text: 'C', type: 'S' },
            { text: 'D', type: 'C' },
          ],
          disc_type: 'I',
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
          created_at: new Date(),
          last_used_at: null,
          last_updated_at: new Date(),
          status: 'active',
          source: 'static',
          created_by: null,
          embedding_vector: null,
        },
      ];

      const extended = questionBankArrayToExtended(questions);
      
      expect(extended).toHaveLength(2);
      expect(extended[0].id).toBe('1');
      expect(extended[1].id).toBe('2');
    });
  });

  describe('Integrated Profile Questions', () => {
    it('should handle question with value_types', () => {
      const question: QuestionBankEntry = {
        id: '3',
        question_text: 'O que te motiva?',
        options: [
          { text: 'Resultados', type: 'D', valueType: 'economic' },
          { text: 'Pessoas', type: 'I', valueType: 'social' },
          { text: 'Harmonia', type: 'S', valueType: 'aesthetic' },
          { text: 'Conhecimento', type: 'C', valueType: 'theoretical' },
        ],
        disc_type: 'D',
        value_types: ['economic', 'social', 'aesthetic', 'theoretical'],
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
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active',
        source: 'ai-generated',
        created_by: null,
        embedding_vector: null,
      };

      const extended = questionBankToExtended(question);
      
      expect(extended.options[0].valueType).toBe('economic');
      expect(extended.options[1].valueType).toBe('social');
      expect(extended.options[2].valueType).toBe('aesthetic');
      expect(extended.options[3].valueType).toBe('theoretical');
    });

    it('should handle question with psychological_traits', () => {
      const question: QuestionBankEntry = {
        id: '4',
        question_text: 'Como você pensa?',
        options: [
          { 
            text: 'Ação rápida', 
            type: 'D',
            psychTraits: { energy: 'extrovert', decision: 'rational' }
          },
          { 
            text: 'Interação social', 
            type: 'I',
            psychTraits: { energy: 'extrovert', decision: 'emotional' }
          },
          { 
            text: 'Reflexão calma', 
            type: 'S',
            psychTraits: { energy: 'introvert', decision: 'emotional' }
          },
          { 
            text: 'Análise detalhada', 
            type: 'C',
            psychTraits: { energy: 'introvert', decision: 'rational' }
          },
        ],
        disc_type: 'D',
        value_types: [],
        psychological_traits: {
          energy: ['extrovert', 'introvert'],
          perception: [],
          decision: ['rational', 'emotional'],
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
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active',
        source: 'ai-generated',
        created_by: null,
        embedding_vector: null,
      };

      const extended = questionBankToExtended(question);
      
      expect(extended.options[0].psychTraits).toBeDefined();
      expect(extended.options[0].psychTraits?.energy).toBe('extrovert');
      expect(extended.options[0].psychTraits?.decision).toBe('rational');
    });

    it('should handle mixed questions (some with values, some without)', () => {
      const questions: QuestionBankEntry[] = [
        {
          id: '1',
          question_text: 'DISC only',
          options: [
            { text: 'A', type: 'D' },
            { text: 'B', type: 'I' },
            { text: 'C', type: 'S' },
            { text: 'D', type: 'C' },
          ],
          disc_type: 'D',
          value_types: [],
          psychological_traits: { energy: [], perception: [], decision: [], organization: [] },
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
          created_at: new Date(),
          last_used_at: null,
          last_updated_at: new Date(),
          status: 'active',
          source: 'static',
          created_by: null,
          embedding_vector: null,
        },
        {
          id: '2',
          question_text: 'With values',
          options: [
            { text: 'A', type: 'D', valueType: 'economic' },
            { text: 'B', type: 'I', valueType: 'social' },
            { text: 'C', type: 'S', valueType: 'aesthetic' },
            { text: 'D', type: 'C', valueType: 'theoretical' },
          ],
          disc_type: 'I',
          value_types: ['economic', 'social', 'aesthetic', 'theoretical'],
          psychological_traits: { energy: [], perception: [], decision: [], organization: [] },
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
          created_at: new Date(),
          last_used_at: null,
          last_updated_at: new Date(),
          status: 'active',
          source: 'ai-generated',
          created_by: null,
          embedding_vector: null,
        },
      ];

      const extended = questionBankArrayToExtended(questions);
      
      expect(extended).toHaveLength(2);
      expect(extended[0].options[0].valueType).toBeUndefined();
      expect(extended[1].options[0].valueType).toBe('economic');
    });
  });

  describe('Edge Cases', () => {
    it('should handle empty options array', () => {
      const question: QuestionBankEntry = {
        id: '5',
        question_text: 'Empty options',
        options: [],
        disc_type: 'D',
        value_types: [],
        psychological_traits: { energy: [], perception: [], decision: [], organization: [] },
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
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active',
        source: 'manual',
        created_by: null,
        embedding_vector: null,
      };

      const extended = questionBankToExtended(question);
      
      expect(extended.options).toHaveLength(0);
    });

    it('should handle empty questions array', () => {
      const extended = questionBankArrayToExtended([]);
      
      expect(extended).toHaveLength(0);
    });
  });
});
