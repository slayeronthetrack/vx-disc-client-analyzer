export type DiscType = 'D' | 'I' | 'S' | 'C';

export interface Answer {
  questionId: number;
  optionIndex: number;
  discType: DiscType;
}

export interface Question {
  id: number;
  text: string;
  options: QuestionOption[];
}

export interface QuestionOption {
  text: string;
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
  strengths: string[];
  attentionPoints: string[];
  communication: string[];
  salesStrategy: string[];
}

export interface TestProgress {
  answers: Answer[];
  currentQuestion: number;
  timestamp: string;
}
