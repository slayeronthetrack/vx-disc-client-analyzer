/**
 * Integrated Profile Types
 * Tipos para análise integrada: DISC + Valores + Tipos Psicológicos
 */

import type { DISCType, DISCScores, DISCPercentages } from './database';

// ============================================================================
// TEORIA DOS VALORES
// ============================================================================

export type ValueType =
  | 'theoretical'   // Busca conhecimento, lógica e aprendizado
  | 'economic'      // Busca resultado, eficiência e retorno
  | 'aesthetic'     // Busca harmonia, beleza e equilíbrio
  | 'social'        // Busca ajudar pessoas e gerar impacto humano
  | 'political'     // Busca influência, liderança e poder de decisão
  | 'spiritual';    // Busca significado, coerência e propósito

export interface ValueScores {
  theoretical: number;
  economic: number;
  aesthetic: number;
  social: number;
  political: number;
  spiritual: number;
}

export interface ValuePercentages {
  theoretical: number;
  economic: number;
  aesthetic: number;
  social: number;
  political: number;
  spiritual: number;
}

export interface ValueProfile {
  dominant: ValueType;
  secondary: ValueType[];
  scores: ValueScores;
  percentages: ValuePercentages;
}

// ============================================================================
// TIPOS PSICOLÓGICOS
// ============================================================================

export type EnergyType = 'introvert' | 'extrovert';
export type PerceptionType = 'sensory' | 'intuitive';
export type DecisionType = 'rational' | 'emotional';
export type OrganizationType = 'structured' | 'flexible';

export interface PsychologicalTraits {
  energy?: EnergyType;
  perception?: PerceptionType;
  decision?: DecisionType;
  organization?: OrganizationType;
}

export interface PsychologicalScores {
  energy: {
    introvert: number;
    extrovert: number;
  };
  perception: {
    sensory: number;
    intuitive: number;
  };
  decision: {
    rational: number;
    emotional: number;
  };
  organization: {
    structured: number;
    flexible: number;
  };
}

export interface PsychologicalProfile {
  energy: EnergyType;
  perception: PerceptionType;
  decision: DecisionType;
  organization: OrganizationType;
  scores: PsychologicalScores;
  code: string; // Ex: "ENTJ-like", "ISFP-like"
}

// ============================================================================
// OPÇÕES DE PERGUNTA ESTENDIDAS
// ============================================================================

export interface ExtendedQuestionOption {
  text: string;
  type: DISCType;
  valueType?: ValueType;
  psychTraits?: PsychologicalTraits;
}

export interface ExtendedQuestion {
  id: number;
  text: string;
  options: ExtendedQuestionOption[];
}

// ============================================================================
// RESULTADO INTEGRADO
// ============================================================================

export interface IntegratedProfileResult {
  // DISC (sempre presente)
  disc: {
    dominant: DISCType;
    scores: DISCScores;
    percentages: DISCPercentages;
  };
  
  // Valores (opcional, depende das perguntas)
  values?: ValueProfile;
  
  // Tipos Psicológicos (opcional, depende das perguntas)
  psychological?: PsychologicalProfile;
  
  // Análise integrada da Marina
  integratedAnalysis: string;
  
  // Metadados
  metadata: {
    hasValues: boolean;
    hasPsychological: boolean;
    questionCount: number;
    calculatedAt: Date;
  };
}

// ============================================================================
// RESPOSTA ESTENDIDA
// ============================================================================

export interface ExtendedAnswer {
  questionId: number;
  selectedOptions: Array<{
    type: DISCType;
    valueType?: ValueType;
    psychTraits?: PsychologicalTraits;
  }>;
}

// ============================================================================
// HELPERS
// ============================================================================

export const VALUE_NAMES: Record<ValueType, string> = {
  theoretical: 'Teórico',
  economic: 'Econômico',
  aesthetic: 'Estético',
  social: 'Social',
  political: 'Político',
  spiritual: 'Espiritual/Propósito',
};

export const VALUE_DESCRIPTIONS: Record<ValueType, string> = {
  theoretical: 'Busca conhecimento, lógica e aprendizado contínuo',
  economic: 'Busca resultado, eficiência e retorno sobre investimento',
  aesthetic: 'Busca harmonia, beleza e equilíbrio nas coisas',
  social: 'Busca ajudar pessoas e gerar impacto humano positivo',
  political: 'Busca influência, liderança e poder de decisão',
  spiritual: 'Busca significado, coerência e propósito maior',
};

export const PSYCHOLOGICAL_NAMES = {
  energy: {
    introvert: 'Introvertido',
    extrovert: 'Extrovertido',
  },
  perception: {
    sensory: 'Sensorial',
    intuitive: 'Intuitivo',
  },
  decision: {
    rational: 'Racional',
    emotional: 'Emocional',
  },
  organization: {
    structured: 'Estruturado',
    flexible: 'Flexível',
  },
};

export const PSYCHOLOGICAL_DESCRIPTIONS = {
  energy: {
    introvert: 'Recarrega energia em momentos sozinho, prefere reflexão interna',
    extrovert: 'Recarrega energia com pessoas, prefere interação social',
  },
  perception: {
    sensory: 'Foca no concreto, detalhes e experiência prática',
    intuitive: 'Foca em padrões, possibilidades e visão de futuro',
  },
  decision: {
    rational: 'Decide com base em lógica, análise e objetividade',
    emotional: 'Decide com base em valores, impacto humano e empatia',
  },
  organization: {
    structured: 'Prefere planejamento, organização e previsibilidade',
    flexible: 'Prefere adaptação, espontaneidade e abertura',
  },
};
