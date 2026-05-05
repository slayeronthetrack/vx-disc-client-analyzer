import type { Answer, DISCResult, DISCScores, DiscType } from '@/types/disc';
import { profileDescriptions } from '@/data/profiles';

export function calculateDISC(answers: Answer[]): DISCResult {
  const scores: Record<DiscType, number> = { D: 0, I: 0, S: 0, C: 0 };
  
  answers.forEach(answer => {
    scores[answer.discType]++;
  });
  
  const total = answers.length;
  
  const percentages: DISCScores = {
    D: Math.round((scores.D / total) * 100),
    I: Math.round((scores.I / total) * 100),
    S: Math.round((scores.S / total) * 100),
    C: Math.round((scores.C / total) * 100),
  };
  
  const dominant = (Object.entries(percentages)
    .sort((a, b) => b[1] - a[1])[0][0]) as DiscType;
  
  const profile = profileDescriptions[dominant];
  
  return {
    scores: percentages,
    dominant,
    profile,
  };
}
