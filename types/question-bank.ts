/**
 * Question Bank Types
 * Tipos para o sistema de banco de perguntas inteligente
 */

import type { ValueType, PsychologicalTraits } from './integrated-profile';
import type { DISCType } from './database';

// ============================================================================
// QUESTION BANK TYPES
// ============================================================================

export interface QuestionBankEntry {
  id: string;
  question_text: string;
  options: QuestionBankOption[];
  
  // Classification
  disc_type: DISCType;
  value_types: ValueType[];
  psychological_traits: PsychologicalTraitsCoverage;
  
  // Context
  context_tags: string[];
  profession_tags: ProfessionTag[];
  seniority_tags: SeniorityTag[];
  objective_tags: ObjectiveTag[];
  industry_tags: IndustryTag[];
  difficulty_level: DifficultyLevel;
  
  // Quality
  quality_score: number; // 0-100
  clarity_score: number; // 0-100
  discrimination_power: number; // 0-1
  
  // Usage
  usage_count: number;
  completion_rate: number; // 0-100
  user_feedback_score: number; // 0-5
  
  // Timestamps
  created_at: Date;
  last_used_at: Date | null;
  last_updated_at: Date;
  
  // Status
  status: QuestionStatus;
  source: QuestionSource;
  created_by: string | null;
  embedding_vector: number[] | null;
}

export interface QuestionBankOption {
  text: string;
  type: DISCType;
  value_type?: ValueType;
  psych_traits?: PsychologicalTraits;
}

export interface PsychologicalTraitsCoverage {
  energy: ('introvert' | 'extrovert')[];
  perception: ('sensory' | 'intuitive')[];
  decision: ('rational' | 'emotional')[];
  organization: ('structured' | 'flexible')[];
}

export type QuestionStatus = 'active' | 'flagged' | 'archived';
export type QuestionSource = 'static' | 'ai-generated' | 'manual';
export type DifficultyLevel = 'easy' | 'medium' | 'hard';

// Context Tags
export type ProfessionTag = 'sales' | 'engineering' | 'management' | 'operations' | 'creative' | 'support' | 'finance' | 'hr';
export type SeniorityTag = 'junior' | 'mid' | 'senior' | 'executive';
export type ObjectiveTag = 'self-knowledge' | 'team-building' | 'hiring' | 'development';
export type IndustryTag = 'technology' | 'finance' | 'healthcare' | 'retail' | 'services' | 'manufacturing' | 'education';

// ============================================================================
// SEARCH TYPES
// ============================================================================

export interface QuestionSearchRequest {
  question_count: number;
  user_context: UserContext;
  exclude_question_ids?: string[]; // For avoiding repetition
  min_quality_score?: number; // Default: 60
}

export interface UserContext {
  user_id: string;
  job_title?: string;
  company?: string;
  test_objective?: string;
  seniority?: SeniorityTag;
  industry?: IndustryTag;
  profession?: ProfessionTag;
}

export interface QuestionSearchResult {
  questions: QuestionBankEntry[];
  found_count: number;
  source: 'bank' | 'mixed' | 'generated' | 'fallback';
  search_time_ms: number;
  generation_time_ms?: number;
}

export interface QuestionRanking {
  question: QuestionBankEntry;
  rank_score: number;
  quality_score_weight: number; // 40%
  context_match_weight: number; // 35%
  recency_weight: number; // 15%
  diversity_weight: number; // 10%
}

// ============================================================================
// VALIDATION TYPES
// ============================================================================

export interface QuestionValidationResult {
  valid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  question: QuestionBankEntry | null;
}

export interface ValidationError {
  type: 'structure' | 'duplication' | 'compliance' | 'metadata';
  message: string;
  field?: string;
}

export interface ValidationWarning {
  type: 'quality' | 'context' | 'metadata';
  message: string;
  field?: string;
}

// ============================================================================
// PERFORMANCE TYPES
// ============================================================================

export interface QuestionPerformanceRecord {
  id: string;
  question_id: string;
  user_id: string;
  test_id: string | null;
  user_context: UserContext;
  selected_at: Date;
  completed: boolean;
  time_to_answer: number | null; // seconds
  user_feedback_rating: number | null; // 1-5
  selected_option_disc_type: DISCType | null;
  resulting_dominant_profile: DISCType | null;
  created_at: Date;
}

export interface QuestionPerformanceMetrics {
  question_id: string;
  usage_count: number;
  completion_rate: number; // 0-100
  avg_time_to_answer: number; // seconds
  avg_user_feedback: number; // 0-5
  discrimination_power: number; // 0-1
  last_calculated_at: string;
}

// ============================================================================
// QUALITY SCORE TYPES
// ============================================================================

export interface QualityScoreComponents {
  clarity_score: number; // 0-100 (25% weight)
  discrimination_power: number; // 0-1 → 0-100 (30% weight)
  completion_rate: number; // 0-100 (25% weight)
  user_feedback: number; // 0-5 → 0-100 (20% weight)
}

export interface QualityScoreUpdate {
  question_id: string;
  old_score: number;
  new_score: number;
  components: QualityScoreComponents;
  reason: string;
  updated_at: Date;
}

// ============================================================================
// ANTI-DUPLICATION TYPES
// ============================================================================

export interface DuplicationCheckResult {
  is_duplicate: boolean;
  similarity_score: number; // 0-1
  similar_question_id: string | null;
  similar_question_text: string | null;
  threshold_used: number; // 0.85
}

export interface EmbeddingCache {
  question_id: string;
  embedding: number[];
  created_at: Date;
  expires_at: Date;
}

// ============================================================================
// CONTEXT ENGINE TYPES
// ============================================================================

export interface ExtractedContext {
  profession: ProfessionTag | null;
  seniority: SeniorityTag | null;
  objective: ObjectiveTag | null;
  industry: IndustryTag | null;
  confidence: number; // 0-1
}

export interface ContextMatchScore {
  question_id: string;
  match_score: number; // 0-100
  profession_match: number; // 0-100
  seniority_match: number; // 0-100
  objective_match: number; // 0-100
  industry_match: number; // 0-100
}

// ============================================================================
// SERVICE INTERFACES
// ============================================================================

export interface IQuestionBankService {
  selectQuestions(request: QuestionSearchRequest): Promise<QuestionSearchResult>;
  saveQuestion(question: Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'>): Promise<QuestionBankEntry>;
  getQuestionById(id: string): Promise<QuestionBankEntry | null>;
  updateQualityScore(questionId: string, newScore: number, reason: string): Promise<void>;
  archiveQuestion(questionId: string, reason: string): Promise<void>;
}

export interface IQuestionSearchEngine {
  search(context: UserContext, count: number, minQualityScore: number): Promise<QuestionBankEntry[]>;
  rankQuestions(questions: QuestionBankEntry[], context: UserContext): Promise<QuestionRanking[]>;
  matchContext(question: QuestionBankEntry, context: UserContext): Promise<ContextMatchScore>;
}

export interface IQuestionValidator {
  validate(question: QuestionBankEntry): Promise<QuestionValidationResult>;
  checkStructure(question: QuestionBankEntry): ValidationError[];
  checkCompliance(question: QuestionBankEntry): ValidationError[];
  checkDuplication(question: QuestionBankEntry): Promise<DuplicationCheckResult>;
}

export interface IAntiDuplicationSystem {
  calculateSimilarity(text1: string, text2: string): Promise<number>;
  isDuplicate(questionText: string, threshold: number): Promise<DuplicationCheckResult>;
  cacheEmbedding(questionId: string, embedding: number[]): Promise<void>;
  getEmbedding(text: string): Promise<number[]>;
}

export interface IContextEngine {
  extractContext(userProfile: { job_title?: string; company?: string; test_objective?: string }): ExtractedContext;
  matchTags(questionTags: string[], contextTags: string[]): number; // 0-100
  calculateContextScore(question: QuestionBankEntry, context: UserContext): number; // 0-100
}

export interface IPerformanceTracker {
  recordUsage(questionId: string, userId: string, context?: { test_objective?: string; job_title?: string; company?: string }): Promise<void>;
  recordCompletion(questionId: string, userId: string, selectedOption: string, timeToAnswer?: number): Promise<void>;
  recordFeedback(questionId: string, userId: string, rating: number, comment?: string): Promise<void>;
  getMetrics(questionId: string): Promise<QuestionPerformanceMetrics>;
  calculateDiscriminationPower(records: Array<{ selected_option?: string | null }>): number;
}

export interface IQualityScoreCalculator {
  calculateScore(components: QualityScoreComponents): number; // 0-100
  updateScores(questionIds: string[]): Promise<QualityScoreUpdate[]>;
  getThresholds(): { min_active: number; flagged: number; archived: number };
}


// ============================================================================
// COMPATIBILITY WITH EXISTING TYPES
// ============================================================================

import type { ExtendedQuestion, ExtendedQuestionOption } from './integrated-profile';

/**
 * Converte QuestionBankEntry para ExtendedQuestion (formato usado no teste)
 */
export function questionBankToExtended(bankQuestion: QuestionBankEntry): ExtendedQuestion {
  return {
    id: parseInt(bankQuestion.id.substring(0, 8), 16), // Convert UUID to number for compatibility
    text: bankQuestion.question_text,
    options: bankQuestion.options.map(opt => ({
      text: opt.text,
      type: opt.type,
      valueType: opt.value_type,
      psychTraits: opt.psych_traits,
    })),
  };
}

/**
 * Converte ExtendedQuestion para QuestionBankEntry (para salvar no banco)
 */
export function extendedToQuestionBank(
  extendedQuestion: ExtendedQuestion
): Omit<QuestionBankEntry, 'id' | 'created_at' | 'last_updated_at'> {
  // Extract DISC type from options
  const discTypes = extendedQuestion.options.map(opt => opt.type);
  const dominantType = discTypes[0]; // First option's type as primary
  
  // Extract value types
  const valueTypes = extendedQuestion.options
    .map(opt => opt.valueType)
    .filter((v): v is ValueType => v !== undefined);
  
  return {
    question_text: extendedQuestion.text,
    options: extendedQuestion.options,
    disc_type: dominantType,
    value_types: Array.from(new Set(valueTypes)),
    psychological_traits: extractPsychTraitsCoverage(extendedQuestion.options),
    context_tags: [],
    profession_tags: [],
    seniority_tags: [],
    objective_tags: [],
    industry_tags: [],
    difficulty_level: 'medium',
    quality_score: 70,
    clarity_score: 70,
    discrimination_power: 0.5,
    usage_count: 0,
    completion_rate: 100,
    user_feedback_score: 3.0,
    last_used_at: null,
    status: 'active',
    source: 'ai-generated',
    created_by: null,
    embedding_vector: null,
  };
}

/**
 * Extrai cobertura de traits psicológicos das opções
 */
function extractPsychTraitsCoverage(options: ExtendedQuestionOption[]): PsychologicalTraitsCoverage {
  const coverage: PsychologicalTraitsCoverage = {
    energy: [],
    perception: [],
    decision: [],
    organization: [],
  };
  
  options.forEach(opt => {
    if (opt.psychTraits) {
      if (opt.psychTraits.energy && !coverage.energy.includes(opt.psychTraits.energy)) {
        coverage.energy.push(opt.psychTraits.energy);
      }
      if (opt.psychTraits.perception && !coverage.perception.includes(opt.psychTraits.perception)) {
        coverage.perception.push(opt.psychTraits.perception);
      }
      if (opt.psychTraits.decision && !coverage.decision.includes(opt.psychTraits.decision)) {
        coverage.decision.push(opt.psychTraits.decision);
      }
      if (opt.psychTraits.organization && !coverage.organization.includes(opt.psychTraits.organization)) {
        coverage.organization.push(opt.psychTraits.organization);
      }
    }
  });
  
  return coverage;
}

/**
 * Converte array de QuestionBankEntry para ExtendedQuestion[]
 */
export function questionBankArrayToExtended(bankQuestions: QuestionBankEntry[]): ExtendedQuestion[] {
  return bankQuestions.map(questionBankToExtended);
}
