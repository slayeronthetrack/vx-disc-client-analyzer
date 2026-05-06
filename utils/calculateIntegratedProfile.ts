/**
 * Calculate Integrated Profile
 * Calcula DISC + Valores + Tipos Psicológicos
 */

import type {
  ExtendedAnswer,
  IntegratedProfileResult,
  ValueScores,
  ValuePercentages,
  ValueProfile,
  ValueType,
  PsychologicalScores,
  PsychologicalProfile,
  EnergyType,
  PerceptionType,
  DecisionType,
  OrganizationType,
} from '@/types/integrated-profile';
import type { DISCScores, DISCPercentages, DISCType } from '@/types/database';

// ============================================================================
// CÁLCULO DISC (mantém compatibilidade)
// ============================================================================

export function calculateDISCScores(answers: ExtendedAnswer[]): {
  scores: DISCScores;
  percentages: DISCPercentages;
  dominant: DISCType;
} {
  const scores: DISCScores = { D: 0, I: 0, S: 0, C: 0 };

  // DEBUG: Log das respostas recebidas
  console.log('[calculateDISCScores] Answers received:', {
    totalAnswers: answers.length,
    sample: answers.slice(0, 2).map(a => ({
      questionId: a.questionId,
      selectedOptions: a.selectedOptions,
    })),
  });

  // Contar cada seleção
  answers.forEach(answer => {
    answer.selectedOptions.forEach(option => {
      const type = option.type;
      console.log('[calculateDISCScores] Counting:', { type, currentScores: { ...scores } });
      scores[type]++;
    });
  });

  console.log('[calculateDISCScores] Final scores:', scores);

  // Calcular total
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Calcular percentagens
  const percentages: DISCPercentages = {
    D: total > 0 ? Math.round((scores.D / total) * 100) : 0,
    I: total > 0 ? Math.round((scores.I / total) * 100) : 0,
    S: total > 0 ? Math.round((scores.S / total) * 100) : 0,
    C: total > 0 ? Math.round((scores.C / total) * 100) : 0,
  };

  // Identificar dominante
  const dominant = (Object.entries(scores)
    .sort((a, b) => b[1] - a[1])[0][0]) as DISCType;

  return { scores, percentages, dominant };
}

// ============================================================================
// CÁLCULO DE VALORES
// ============================================================================

export function calculateValueScores(answers: ExtendedAnswer[]): ValueProfile | null {
  const scores: ValueScores = {
    theoretical: 0,
    economic: 0,
    aesthetic: 0,
    social: 0,
    political: 0,
    spiritual: 0,
  };

  let hasValueData = false;

  // Contar valores
  answers.forEach(answer => {
    answer.selectedOptions.forEach(option => {
      if (option.valueType) {
        scores[option.valueType]++;
        hasValueData = true;
      }
    });
  });

  // Se não tem dados de valores, retornar null
  if (!hasValueData) {
    return null;
  }

  // Calcular total
  const total = Object.values(scores).reduce((sum, score) => sum + score, 0);

  // Calcular percentagens
  const percentages: ValuePercentages = {
    theoretical: total > 0 ? Math.round((scores.theoretical / total) * 100) : 0,
    economic: total > 0 ? Math.round((scores.economic / total) * 100) : 0,
    aesthetic: total > 0 ? Math.round((scores.aesthetic / total) * 100) : 0,
    social: total > 0 ? Math.round((scores.social / total) * 100) : 0,
    political: total > 0 ? Math.round((scores.political / total) * 100) : 0,
    spiritual: total > 0 ? Math.round((scores.spiritual / total) * 100) : 0,
  };

  // Identificar dominante
  const sortedValues = Object.entries(scores)
    .sort((a, b) => b[1] - a[1]);

  const dominant = sortedValues[0][0] as ValueType;

  // Identificar secundários (top 2-3 após o dominante)
  const secondary = sortedValues
    .slice(1, 3)
    .filter(([_, score]) => score > 0)
    .map(([type, _]) => type as ValueType);

  return {
    dominant,
    secondary,
    scores,
    percentages,
  };
}

// ============================================================================
// CÁLCULO DE TIPOS PSICOLÓGICOS
// ============================================================================

export function calculatePsychologicalProfile(
  answers: ExtendedAnswer[]
): PsychologicalProfile | null {
  const scores: PsychologicalScores = {
    energy: { introvert: 0, extrovert: 0 },
    perception: { sensory: 0, intuitive: 0 },
    decision: { rational: 0, emotional: 0 },
    organization: { structured: 0, flexible: 0 },
  };

  let hasPsychData = false;

  // Contar traços psicológicos
  answers.forEach(answer => {
    answer.selectedOptions.forEach(option => {
      if (option.psychTraits) {
        hasPsychData = true;

        if (option.psychTraits.energy) {
          scores.energy[option.psychTraits.energy]++;
        }
        if (option.psychTraits.perception) {
          scores.perception[option.psychTraits.perception]++;
        }
        if (option.psychTraits.decision) {
          scores.decision[option.psychTraits.decision]++;
        }
        if (option.psychTraits.organization) {
          scores.organization[option.psychTraits.organization]++;
        }
      }
    });
  });

  // Se não tem dados psicológicos, retornar null
  if (!hasPsychData) {
    return null;
  }

  // Determinar tipo dominante em cada eixo
  const energy: EnergyType =
    scores.energy.extrovert >= scores.energy.introvert ? 'extrovert' : 'introvert';

  const perception: PerceptionType =
    scores.perception.intuitive >= scores.perception.sensory ? 'intuitive' : 'sensory';

  const decision: DecisionType =
    scores.decision.rational >= scores.decision.emotional ? 'rational' : 'emotional';

  const organization: OrganizationType =
    scores.organization.structured >= scores.organization.flexible ? 'structured' : 'flexible';

  // Gerar código tipo MBTI-like
  const code = `${energy === 'extrovert' ? 'E' : 'I'}${perception === 'intuitive' ? 'N' : 'S'}${decision === 'rational' ? 'T' : 'F'}${organization === 'structured' ? 'J' : 'P'}-like`;

  return {
    energy,
    perception,
    decision,
    organization,
    scores,
    code,
  };
}

// ============================================================================
// CÁLCULO INTEGRADO
// ============================================================================

export function calculateIntegratedProfile(
  answers: ExtendedAnswer[]
): Omit<IntegratedProfileResult, 'integratedAnalysis'> {
  // Calcular DISC (sempre)
  const disc = calculateDISCScores(answers);

  // Calcular Valores (se disponível)
  const values = calculateValueScores(answers);

  // Calcular Tipos Psicológicos (se disponível)
  const psychological = calculatePsychologicalProfile(answers);

  // TODO: Futura integração com Question Bank
  // Quando perguntas vierem do banco inteligente, incluir metadata:
  // - question_ids: IDs das perguntas usadas
  // - context_tags: Tags de contexto das perguntas
  // - profession_tags: Tags de profissão
  // - seniority_tags: Tags de senioridade
  // - objective_tags: Tags de objetivo
  // - industry_tags: Tags de indústria
  // 
  // Essa metadata será passada para Marina e Lucas para análises mais contextualizadas

  return {
    disc: {
      dominant: disc.dominant,
      scores: disc.scores,
      percentages: disc.percentages,
    },
    values: values || undefined,
    psychological: psychological || undefined,
    metadata: {
      hasValues: values !== null,
      hasPsychological: psychological !== null,
      questionCount: answers.length,
      calculatedAt: new Date(),
      // TODO: Adicionar quando integrado com Question Bank:
      // questionMetadata: {
      //   question_ids: string[],
      //   context_tags: string[],
      //   profession_tags: string[],
      //   seniority_tags: string[],
      //   objective_tags: string[],
      //   industry_tags: string[]
      // }
    },
  };
}

// ============================================================================
// COMPATIBILIDADE COM FORMATO ANTIGO
// ============================================================================

/**
 * Converte respostas antigas (apenas DISC) para o novo formato
 */
export function convertLegacyAnswers(
  legacyAnswers: Array<{ questionId: number; discTypes: DISCType[] }>
): ExtendedAnswer[] {
  return legacyAnswers.map(answer => ({
    questionId: answer.questionId,
    selectedOptions: answer.discTypes.map(type => ({
      type,
      // Sem valueType nem psychTraits - compatibilidade
    })),
  }));
}
