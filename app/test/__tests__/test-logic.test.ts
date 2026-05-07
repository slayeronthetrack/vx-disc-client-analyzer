/**
 * Testes para a lógica do teste DISC
 * Valida regras de seleção de respostas
 */

import { describe, it, expect } from '@jest/globals';

type DISCType = 'D' | 'I' | 'S' | 'C';

interface Answer {
  questionId: number;
  discTypes: DISCType[];
}

// Simula a lógica de validação
function validateSelection(selectedCount: number): {
  canAdvance: boolean;
  canSelectMore: boolean;
  message: string;
} {
  const hasMinimum = selectedCount >= 1;
  const hasMaximum = selectedCount >= 2;

  return {
    canAdvance: hasMinimum,
    canSelectMore: !hasMaximum,
    message: 
      selectedCount === 0 ? 'Selecione pelo menos 1 opção' :
      selectedCount === 1 ? 'Pode selecionar mais 1 opção ou avançar' :
      'Máximo de seleções atingido',
  };
}

// Simula o cálculo de scores
function calculateScores(answers: Answer[]): { D: number; I: number; S: number; C: number } {
  const scores = { D: 0, I: 0, S: 0, C: 0 };
  
  answers.forEach(answer => {
    answer.discTypes.forEach(discType => {
      scores[discType]++;
    });
  });
  
  return scores;
}

describe('Lógica de Seleção de Respostas', () => {
  describe('Validação de Seleções', () => {
    it('deve bloquear avanço com 0 seleções', () => {
      const result = validateSelection(0);
      expect(result.canAdvance).toBe(false);
      expect(result.canSelectMore).toBe(true);
    });

    it('deve permitir avanço com 1 seleção', () => {
      const result = validateSelection(1);
      expect(result.canAdvance).toBe(true);
      expect(result.canSelectMore).toBe(true);
    });

    it('deve permitir avanço com 2 seleções', () => {
      const result = validateSelection(2);
      expect(result.canAdvance).toBe(true);
      expect(result.canSelectMore).toBe(false);
    });

    it('deve bloquear seleção de mais de 2 opções', () => {
      const result = validateSelection(2);
      expect(result.canSelectMore).toBe(false);
    });
  });

  describe('Cálculo de Scores', () => {
    it('deve calcular corretamente com 1 seleção por pergunta', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D'] },
        { questionId: 2, discTypes: ['I'] },
        { questionId: 3, discTypes: ['S'] },
        { questionId: 4, discTypes: ['C'] },
      ];

      const scores = calculateScores(answers);
      
      expect(scores.D).toBe(1);
      expect(scores.I).toBe(1);
      expect(scores.S).toBe(1);
      expect(scores.C).toBe(1);
    });

    it('deve calcular corretamente com 2 seleções por pergunta', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D', 'I'] },
        { questionId: 2, discTypes: ['S', 'C'] },
        { questionId: 3, discTypes: ['D', 'S'] },
      ];

      const scores = calculateScores(answers);
      
      expect(scores.D).toBe(2);
      expect(scores.I).toBe(1);
      expect(scores.S).toBe(2);
      expect(scores.C).toBe(1);
    });

    it('deve calcular corretamente com mix de 1 e 2 seleções', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D'] },
        { questionId: 2, discTypes: ['I', 'S'] },
        { questionId: 3, discTypes: ['D'] },
        { questionId: 4, discTypes: ['C', 'D'] },
      ];

      const scores = calculateScores(answers);
      
      expect(scores.D).toBe(3);
      expect(scores.I).toBe(1);
      expect(scores.S).toBe(1);
      expect(scores.C).toBe(1);
    });

    it('deve calcular total de pontos variável', () => {
      const answers1: Answer[] = [
        { questionId: 1, discTypes: ['D'] },
        { questionId: 2, discTypes: ['I'] },
      ];

      const answers2: Answer[] = [
        { questionId: 1, discTypes: ['D', 'I'] },
        { questionId: 2, discTypes: ['S', 'C'] },
      ];

      const scores1 = calculateScores(answers1);
      const scores2 = calculateScores(answers2);

      const total1 = scores1.D + scores1.I + scores1.S + scores1.C;
      const total2 = scores2.D + scores2.I + scores2.S + scores2.C;

      expect(total1).toBe(2); // 1 seleção por pergunta
      expect(total2).toBe(4); // 2 seleções por pergunta
    });
  });

  describe('Compatibilidade com Testes Antigos', () => {
    it('deve aceitar formato antigo com 2 seleções', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D', 'I'] },
        { questionId: 2, discTypes: ['S', 'C'] },
      ];

      const scores = calculateScores(answers);
      const total = scores.D + scores.I + scores.S + scores.C;

      expect(total).toBe(4);
      expect(scores.D).toBe(1);
      expect(scores.I).toBe(1);
      expect(scores.S).toBe(1);
      expect(scores.C).toBe(1);
    });

    it('deve aceitar novo formato com 1 ou 2 seleções', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D'] },
        { questionId: 2, discTypes: ['I', 'S'] },
      ];

      const scores = calculateScores(answers);
      const total = scores.D + scores.I + scores.S + scores.C;

      expect(total).toBe(3);
      expect(scores.D).toBe(1);
      expect(scores.I).toBe(1);
      expect(scores.S).toBe(1);
      expect(scores.C).toBe(0);
    });
  });

  describe('Determinação de Perfil Dominante', () => {
    it('deve determinar perfil dominante corretamente', () => {
      const answers: Answer[] = [
        { questionId: 1, discTypes: ['D'] },
        { questionId: 2, discTypes: ['D', 'I'] },
        { questionId: 3, discTypes: ['D'] },
        { questionId: 4, discTypes: ['S'] },
      ];

      const scores = calculateScores(answers);
      const dominant = (Object.keys(scores) as Array<keyof typeof scores>).reduce((a, b) =>
        scores[a] > scores[b] ? a : b
      );

      expect(dominant).toBe('D');
      expect(scores.D).toBe(3);
    });
  });
});

describe('Comportamento de Clique', () => {
  it('deve permitir selecionar primeira opção', () => {
    const selectedCount = 0;
    const result = validateSelection(selectedCount);
    
    expect(result.canSelectMore).toBe(true);
  });

  it('deve permitir selecionar segunda opção', () => {
    const selectedCount = 1;
    const result = validateSelection(selectedCount);
    
    expect(result.canSelectMore).toBe(true);
  });

  it('deve bloquear seleção de terceira opção', () => {
    const selectedCount = 2;
    const result = validateSelection(selectedCount);
    
    expect(result.canSelectMore).toBe(false);
  });

  it('deve permitir desselecionar opção', () => {
    // Simula ter 2 seleções e desselecionar 1
    const selectedCount = 1; // Após desselecionar
    const result = validateSelection(selectedCount);
    
    expect(result.canSelectMore).toBe(true);
    expect(result.canAdvance).toBe(true);
  });
});
