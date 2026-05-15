/**
 * Company Types
 * Types for the Company Management System
 */

export interface Company {
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
}

export interface CreateCompanyInput {
  name: string;
  slug: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string | null;
  font_family?: string;
  custom_welcome_message?: string | null;
  background_image_url?: string | null;
  email_template?: string | null;
  contact_person: string;
  contact_email: string;
  max_tests?: number;
  active?: boolean;
}

export interface CompanyAccessInput {
  admin_full_name: string;
  admin_email: string;
  admin_password: string;
}

export interface CreateCompanyWithAdminInput extends CreateCompanyInput {
  admin_access: CompanyAccessInput;
}

export interface CreateCompanyWithAdminResponse {
  company: Company;
  access: {
    admin_full_name: string;
    admin_email: string;
    temporary_password: string;
    login_url: string;
  };
}

export interface UpdateCompanyInput {
  name?: string;
  slug?: string;
  logo_url?: string | null;
  primary_color?: string;
  secondary_color?: string | null;
  font_family?: string;
  custom_welcome_message?: string | null;
  background_image_url?: string | null;
  email_template?: string | null;
  contact_person?: string;
  contact_email?: string;
  max_tests?: number;
  active?: boolean;
}

export interface CompanyStats {
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
}

export interface CompanyDISCAverages {
  avg_d: number;
  avg_i: number;
  avg_s: number;
  avg_c: number;
}

export interface CompanyFilters {
  search?: string;
  active?: boolean;
  nearLimit?: boolean; // >= 90%
  atLimit?: boolean; // >= 100%
  sortBy?: 'name' | 'created_at' | 'total_tests';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface CompanyListResponse {
  companies: Company[];
  stats: CompanyStats[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}
