export type DiscType = 'D' | 'I' | 'S' | 'C';

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  text: string;
  discType: DiscType;
}

export interface Answer {
  questionId: number;
  selectedOption: number;
  discType: DiscType;
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DISCResult {
  scores: DISCScores;
  dominant: DiscType;
  profile: ProfileDescription;
}

export interface ProfileDescription {
  name: string;
  description: string;
  strengths: string[];
  communicationStyle: string[];
  salesApproach: string[];
}

export interface TestProgress {
  answers: Answer[];
  currentQuestion: number;
  timestamp: string;
}
