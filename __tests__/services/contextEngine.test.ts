/**
 * Context Engine Tests
 * Testa extração de contexto de perfis de usuário
 */

import { contextEngine } from '@/lib/services/contextEngine';

describe('ContextEngine', () => {
  describe('extractContext', () => {
    describe('Profession Extraction', () => {
      it('should extract sales profession', () => {
        const result = contextEngine.extractContext({
          job_title: 'Sales Manager',
        });
        expect(result.profession).toBe('sales');
      });

      it('should extract engineering profession', () => {
        const result = contextEngine.extractContext({
          job_title: 'Software Engineer',
        });
        expect(result.profession).toBe('engineering');
      });

      it('should extract management profession', () => {
        const result = contextEngine.extractContext({
          job_title: 'Product Manager',
        });
        expect(result.profession).toBe('management');
      });

      it('should handle Portuguese job titles', () => {
        const result = contextEngine.extractContext({
          job_title: 'Gerente de Vendas',
        });
        expect(result.profession).toBe('sales');
      });
    });

    describe('Seniority Extraction', () => {
      it('should extract junior seniority', () => {
        const result = contextEngine.extractContext({
          job_title: 'Junior Developer',
        });
        expect(result.seniority).toBe('junior');
      });

      it('should extract senior seniority', () => {
        const result = contextEngine.extractContext({
          job_title: 'Senior Engineer',
        });
        expect(result.seniority).toBe('senior');
      });

      it('should extract executive seniority', () => {
        const result = contextEngine.extractContext({
          job_title: 'CEO',
        });
        expect(result.seniority).toBe('executive');
      });

      it('should default to mid when no seniority indicator', () => {
        const result = contextEngine.extractContext({
          job_title: 'Developer',
        });
        expect(result.seniority).toBe('mid');
      });
    });

    describe('Objective Extraction', () => {
      it('should extract hiring objective', () => {
        const result = contextEngine.extractContext({
          test_objective: 'Recrutamento de novos talentos',
        });
        expect(result.objective).toBe('hiring');
      });

      it('should extract self-knowledge objective', () => {
        const result = contextEngine.extractContext({
          test_objective: 'Autoconhecimento pessoal',
        });
        expect(result.objective).toBe('self-knowledge');
      });

      it('should extract team-building objective', () => {
        const result = contextEngine.extractContext({
          test_objective: 'Formação de equipe',
        });
        expect(result.objective).toBe('team-building');
      });

      it('should extract development objective', () => {
        const result = contextEngine.extractContext({
          test_objective: 'Desenvolvimento profissional',
        });
        expect(result.objective).toBe('development');
      });
    });

    describe('Industry Extraction', () => {
      it('should extract technology industry from company', () => {
        const result = contextEngine.extractContext({
          company: 'Tech Startup',
        });
        expect(result.industry).toBe('technology');
      });

      it('should extract finance industry', () => {
        const result = contextEngine.extractContext({
          company: 'Banco XYZ',
        });
        expect(result.industry).toBe('finance');
      });

      it('should extract healthcare industry', () => {
        const result = contextEngine.extractContext({
          company: 'Hospital ABC',
        });
        expect(result.industry).toBe('healthcare');
      });

      it('should extract industry from job title if company not provided', () => {
        const result = contextEngine.extractContext({
          job_title: 'Software Engineer',
        });
        expect(result.industry).toBe('technology');
      });
    });

    describe('Confidence Calculation', () => {
      it('should calculate 100% confidence when all fields extracted', () => {
        const result = contextEngine.extractContext({
          job_title: 'Senior Sales Manager',
          company: 'Tech Startup',
          test_objective: 'Hiring',
        });
        expect(result.confidence).toBe(1.0);
      });

      it('should calculate 50% confidence when half fields extracted', () => {
        const result = contextEngine.extractContext({
          job_title: 'Unknown Role',
          company: 'Unknown Company',
          test_objective: 'Hiring',
        });
        expect(result.confidence).toBeGreaterThanOrEqual(0.25);
        expect(result.confidence).toBeLessThanOrEqual(0.5);
      });

      it('should calculate 0% confidence when no fields extracted', () => {
        const result = contextEngine.extractContext({
          job_title: 'Unknown',
          company: 'Unknown',
          test_objective: 'Unknown',
        });
        expect(result.confidence).toBeLessThan(0.5);
      });
    });
  });

  describe('calculateContextScore', () => {
    const mockQuestion = {
      id: '1',
      question_text: 'Test question',
      profession_tags: ['sales'],
      seniority_tags: ['senior'],
      objective_tags: ['hiring'],
      industry_tags: ['technology'],
      // ... outros campos necessários
    } as any;

    it('should return 100 when all tags match', () => {
      const score = contextEngine.calculateContextScore(mockQuestion, {
        profession: 'sales',
        seniority: 'senior',
        industry: 'technology',
        test_objective: 'hiring',
      });
      expect(score).toBe(100);
    });

    it('should return 0 when no tags match', () => {
      const score = contextEngine.calculateContextScore(mockQuestion, {
        profession: 'engineering',
        seniority: 'junior',
        industry: 'finance',
        test_objective: 'self-knowledge',
      });
      expect(score).toBe(0);
    });

    it('should return partial score when some tags match', () => {
      const score = contextEngine.calculateContextScore(mockQuestion, {
        profession: 'sales',
        seniority: 'junior',
        industry: 'finance',
        test_objective: 'hiring',
      });
      expect(score).toBeGreaterThan(0);
      expect(score).toBeLessThan(100);
    });

    it('should return neutral score when no context provided', () => {
      const score = contextEngine.calculateContextScore(mockQuestion, {});
      expect(score).toBe(50);
    });
  });

  describe('matchTags', () => {
    it('should return 100 when all tags match', () => {
      const score = contextEngine.matchTags(
        ['sales', 'management'],
        ['sales', 'management', 'leadership']
      );
      expect(score).toBe(100);
    });

    it('should return 50 when half tags match', () => {
      const score = contextEngine.matchTags(
        ['sales', 'management'],
        ['sales', 'engineering']
      );
      expect(score).toBe(50);
    });

    it('should return 0 when no tags match', () => {
      const score = contextEngine.matchTags(
        ['sales', 'management'],
        ['engineering', 'operations']
      );
      expect(score).toBe(0);
    });

    it('should return 0 when question tags are empty', () => {
      const score = contextEngine.matchTags([], ['sales', 'management']);
      expect(score).toBe(0);
    });

    it('should return 0 when context tags are empty', () => {
      const score = contextEngine.matchTags(['sales', 'management'], []);
      expect(score).toBe(0);
    });
  });

  describe('getContextSummary', () => {
    it('should format context summary correctly', () => {
      const context = {
        profession: 'sales' as const,
        seniority: 'senior' as const,
        objective: 'hiring' as const,
        industry: 'technology' as const,
        confidence: 1.0,
      };

      const summary = contextEngine.getContextSummary(context);
      expect(summary).toContain('Profession: sales');
      expect(summary).toContain('Seniority: senior');
      expect(summary).toContain('Objective: hiring');
      expect(summary).toContain('Industry: technology');
      expect(summary).toContain('Confidence: 100%');
    });

    it('should handle partial context', () => {
      const context = {
        profession: 'sales' as const,
        seniority: null,
        objective: null,
        industry: null,
        confidence: 0.25,
      };

      const summary = contextEngine.getContextSummary(context);
      expect(summary).toContain('Profession: sales');
      expect(summary).toContain('Confidence: 25%');
      expect(summary).not.toContain('Seniority:');
    });
  });
});
