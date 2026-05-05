import type { Answer, DISCResult, DISCScores, DiscType } from '@/types';
import { profileDescriptions } from '@/data/profiles';

export function calculateDISC(answers: Answer[]): DISCResult {
  // Inicializar contadores
  const scores: Record<DiscType, number> = { D: 0, I: 0, S: 0, C: 0 };
  
  // Contar respostas por tipo
  answers.forEach(answer => {
    scores[answer.discType]++;
  });
  
  const total = answers.length;
  
  // Calcular percentuais
  const percentages: DISCScores = {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };
  
  // Identificar perfil dominante
  const dominant = (Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])[0][0]) as DiscType;
  
  // Buscar descrição do perfil
  const profile = profileDescriptions[dominant];
  
  return {
    scores: percentages,
    dominant,
    profile,
  };
}
