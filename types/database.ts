/**
 * Database Types
 * Types para o banco de dados Supabase
 */

export type UserRole = 'user' | 'admin';
export type DISCType = 'D' | 'I' | 'S' | 'C';
export type QuestionSource = 'ai' | 'fallback' | 'legacy';

export interface Profile {
  id: string;
  user_id: string;
  full_name: string;
  email: string;
  role: UserRole;
  job_title?: string;
  company?: string;
  test_objective?: string;
  profile_completed: boolean;
  created_at: string;
  updated_at: string;
}

export interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface DISCPercentages {
  D: number;
  I: number;
  S: number;
  C: number;
}

export interface QuestionOption {
  text: string;
  type: DISCType;
}

export interface Question {
  id: number;
  question: string;
  options: QuestionOption[];
}

export interface Answer {
  questionId: number;
  selectedOptions: DISCType[];
}

export interface DISCTestResult {
  scores: DISCScores;
  percentages: DISCPercentages;
  dominantProfile: DISCType;
  analysis: string;
}

export interface DISCTest {
  id: string;
  user_id: string;
  questions: Question[];
  answers: Answer[];
  result: DISCTestResult;
  ai_analysis: string;
  dominant_profile: DISCType;
  scores: DISCScores;
  question_count: number;
  question_source: QuestionSource;
  generated_questions?: any; // JSONB - estrutura completa das perguntas geradas
  
  // Novos campos - Integrated Profile
  value_scores?: any; // JSONB - ValueScores
  dominant_values?: string[]; // Array de ValueType
  value_percentages?: any; // JSONB - ValuePercentages
  psychological_scores?: any; // JSONB - PsychologicalScores
  psychological_profile?: any; // JSONB - PsychologicalProfile
  integrated_analysis?: string; // Análise integrada da Marina
  
  created_at: string;
}

export interface ChatMessage {
  id: string;
  user_id?: string;
  role: 'user' | 'assistant';
  message: string;
  created_at: string;
}

export interface UserState {
  user: any | null;
  profile: Profile | null;
  isAdmin: boolean;
  hasProfile: boolean;
  hasCompletedTest: boolean;
  latestTestResult: DISCTest | null;
  loading: boolean;
}
