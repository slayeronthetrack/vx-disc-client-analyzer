/**
 * Company Test Types
 * Types for DISC tests taken through company portals
 */

import { DISCType, DISCScores, DISCPercentages, Answer } from './database';

export type TestStatus = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';

export interface CompanyTest {
  id: string;
  company_id: string;
  employee_id: string | null;
  invitation_id: string | null;
  previous_test_id: string | null;
  name: string;
  email: string;
  phone: string | null;
  position: string;
  department: string | null;
  disc_result: DISCResult;
  answers: Answer[];
  questions: any | null;
  status: TestStatus;
  test_version: string;
  attempt_number: number;
  ai_analysis: string | null;
  started_at: string | null;
  completed_at: string;
  created_at: string;
}

export interface DISCResult {
  dominant: DISCType;
  secondary: DISCType;
  scores: DISCScores;
  percentages: DISCPercentages;
}

export interface EmployeeData {
  name: string;
  email: string;
  phone?: string;
  position: string;
  department?: string;
}

export interface StartTestInput {
  company_id: string;
  employee_data: EmployeeData;
}

export interface SubmitTestInput {
  company_id: string;
  employee_data: EmployeeData;
  answers: Answer[];
  questions: any[];
  started_at?: string;
}

export interface CompanyTestFilters {
  search?: string; // Search by name, email, position
  dominant_profile?: DISCType | 'all';
  department?: string;
  status?: TestStatus;
  sortBy?: 'created_at' | 'name' | 'email';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CompanyTestListResponse {
  tests: CompanyTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface TestResultDisplay {
  id: string;
  employee_name: string;
  email: string;
  position: string;
  department: string | null;
  dominant_profile: DISCType;
  secondary_profile: DISCType;
  scores: DISCScores;
  percentages: DISCPercentages;
  ai_analysis: string;
  test_date: string;
  company_branding: {
    logo_url: string | null;
    primary_color: string;
    company_name: string;
  };
}
