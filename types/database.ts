/**
 * Database Types
 * Types para o banco de dados Supabase
 */

export type UserRole = 'user' | 'admin' | 'super_admin' | 'company_admin';
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

// Company Management System Types
export type UserRoleType = 'user' | 'admin' | 'super_admin' | 'company_admin' | 'manager' | 'viewer';
export type TestStatusType = 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED';

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: Profile;
        Insert: Omit<Profile, 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Profile, 'id' | 'user_id'>>;
      };
      companies: {
        Row: {
          id: string;
          name: string;
          slug: string;
          logo_url: string | null;
          primary_color: string;
          secondary_color: string | null;
          font_family: string;
          custom_welcome_message: string | null;
          background_image_url: string | null;
          email_template: string | null;
          contact_person: string;
          contact_email: string;
          max_tests: number;
          active: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<Database['public']['Tables']['companies']['Row'], 'id' | 'created_at' | 'updated_at'>;
        Update: Partial<Omit<Database['public']['Tables']['companies']['Row'], 'id'>>;
      };
      company_tests: {
        Row: {
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
          disc_result: any; // JSONB
          answers: any; // JSONB
          questions: any | null; // JSONB
          status: TestStatusType;
          test_version: string;
          attempt_number: number;
          ai_analysis: string | null;
          started_at: string | null;
          completed_at: string;
          created_at: string;
        };
        Insert: Omit<Database['public']['Tables']['company_tests']['Row'], 'id' | 'created_at'>;
        Update: never; // Tests are immutable
      };
    };
    Views: {
      company_stats: {
        Row: {
          company_id: string;
          company_name: string;
          slug: string;
          active: boolean;
          max_tests: number;
          total_tests: number;
          completed_tests: number;
          abandoned_tests: number;
          dominant_d_count: number;
          dominant_i_count: number;
          dominant_s_count: number;
          dominant_c_count: number;
          predominant_profile: 'D' | 'I' | 'S' | 'C' | null;
          first_test_date: string | null;
          last_test_date: string | null;
          usage_percentage: number;
        };
      };
    };
    Functions: {
      check_test_limit: {
        Args: { p_company_id: string };
        Returns: boolean;
      };
      get_company_disc_averages: {
        Args: { p_company_id: string };
        Returns: {
          avg_d: number;
          avg_i: number;
          avg_s: number;
          avg_c: number;
        }[];
      };
      get_company_test_count: {
        Args: { p_company_id: string };
        Returns: number;
      };
      check_user_permission: {
        Args: { p_required_role: UserRoleType; p_company_id?: string };
        Returns: boolean;
      };
    };
  };
}
