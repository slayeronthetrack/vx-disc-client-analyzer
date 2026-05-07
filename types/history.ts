/**
 * History Types
 * Tipos para histórico de testes
 */

import type { DISCType } from './database';

export interface TestHistoryItem {
  id: string;
  created_at: string;
  question_count: number;
  dominant_profile: DISCType;
  dominant_values?: string[];
  psychological_profile?: {
    code: string;
    energy: string;
    perception: string;
    decision: string;
    organization: string;
  };
  test_objective?: string;
}

export interface TestHistorySummary {
  id: string;
  created_at: string;
  question_count: number;
  dominant_profile: DISCType;
  dominant_value: string | null;
  psychological_code: string | null;
  test_objective: string | null;
}

export type HistoryFilter = 'all' | 'last7days' | 'last30days' | 'byProfile' | 'byObjective';

export interface HistoryFilterOptions {
  filter: HistoryFilter;
  profileFilter?: DISCType;
  objectiveFilter?: string;
}
