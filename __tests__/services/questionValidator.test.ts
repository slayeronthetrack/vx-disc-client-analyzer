/**
 * Question Validator Tests
 * Testa validação de estrutura, compliance e duplicação
 */

import { questionValidator } from '@/lib/services/questionValidator';
import type { QuestionBankEntry } from '@/types/question-bank';

describe('QuestionValidator', () => {
  const createMockQuestion = (overrides?: Partial<QuestionBankEntry>): Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> => ({
    question_text: 'Como você prefere trabalhar?',
    options: [
      { text: 'Lidero e decido', type: 'D' },
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
    ...overrides,
  });

  describe('checkStructure', () => {
    it('should validate question with 4 unique DISC types', async () => {
      const question = createMockQuestion();
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject question with less than 4 options', async () => {
      const question = createMockQuestion({
        options: [
          { text: 'Option 1', type: 'D' },
          { text: 'Option 2', type: 'I' },
        ],
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('4 options'))).toBe(true);
    });

    it('should reject question with duplicate DISC types', async () => {
      const question = createMockQuestion({
        options: [
          { text: 'Option 1', type: 'D' },
          { text: 'Option 2', type: 'D' },
          { text: 'Option 3', type: 'S' },
          { text: 'Option 4', type: 'C' },
        ],
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('unique'))).toBe(true);
    });

    it('should reject question with missing DISC type', async () => {
      const question = createMockQuestion({
        options: [
          { text: 'Option 1', type: 'D' },
          { text: 'Option 2', type: 'I' },
          { text: 'Option 3', type: 'S' },
          { text: 'Option 4', type: 'S' }, // Missing C
        ],
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
    });

    it('should reject question with empty text', async () => {
      const question = createMockQuestion({
        question_text: '',
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
      expect(result.errors.some(e => e.includes('text'))).toBe(true);
    });

    it('should reject question with empty option text', async () => {
      const question = createMockQuestion({
        options: [
          { text: '', type: 'D' },
          { text: 'Option 2', type: 'I' },
          { text: 'Option 3', type: 'S' },
          { text: 'Option 4', type: 'C' },
        ],
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
    });
  });

  describe('checkCompliance', () => {
    const clinicalTerms = [
      'diagnóstico',
      'terapia',
      'transtorno',
      'doença',
      'patologia',
      'sintoma',
      'tratamento',
      'medicação',
    ];

    clinicalTerms.forEach(term => {
      it(`should reject question with clinical term: ${term}`, async () => {
        const question = createMockQuestion({
          question_text: `Você tem ${term} de algo?`,
        });
        
        const result = await questionValidator.validate(question);
        
        expect(result.valid).toBe(false);
        expect(result.errors.some(e => e.toLowerCase().includes('clinical') || e.includes('clínico'))).toBe(true);
      });
    });

    it('should reject question with inappropriate language', async () => {
      const question = createMockQuestion({
        question_text: 'Você é um idiota?',
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(false);
    });

    it('should accept question without clinical terms', async () => {
      const question = createMockQuestion({
        question_text: 'Como você prefere trabalhar em equipe?',
      });
      
      const result = await questionValidator.validate(question);
      
      expect(result.valid).toBe(true);
    });
  });

  describe('validateBatch', () => {
    it('should validate multiple questions', async () => {
      const questions = [
        createMockQuestion({ question_text: 'Question 1' }),
        createMockQuestion({ question_text: 'Question 2' }),
        createMockQuestion({ question_text: 'Question 3' }),
      ];
      
      const results = await questionValidator.validateBatch(questions);
      
      expect(results).toHaveLength(3);
      results.forEach(result => {
        expect(result.valid).toBe(true);
      });
    });

    it('should identify invalid questions in batch', async () => {
      const questions = [
        createMockQuestion({ question_text: 'Valid question' }),
        createMockQuestion({ question_text: 'Você tem diagnóstico?' }), // Invalid
        createMockQuestion({ question_text: 'Another valid question' }),
      ];
      
      const results = await questionValidator.validateBatch(questions);
      
      expect(results).toHaveLength(3);
      expect(results[0].valid).toBe(true);
      expect(results[1].valid).toBe(false);
      expect(results[2].valid).toBe(true);
    });
  });

  describe('getValidationSummary', () => {
    it('should return summary of validation results', async () => {
      const results = [
        { valid: true, errors: [], question: createMockQuestion() },
        { valid: false, errors: ['Error 1'], question: null },
        { valid: true, errors: [], question: createMockQuestion() },
        { valid: false, errors: ['Error 2'], question: null },
      ];
      
      const summary = questionValidator.getValidationSummary(results);
      
      expect(summary.total).toBe(4);
      expect(summary.valid).toBe(2);
      expect(summary.invalid).toBe(2);
      expect(summary.validPercentage).toBe(50);
    });

    it('should handle empty results', () => {
      const summary = questionValidator.getValidationSummary([]);
      
      expect(summary.total).toBe(0);
      expect(summary.valid).toBe(0);
      expect(summary.invalid).toBe(0);
      expect(summary.validPercentage).toBe(0);
    });
  });
});
