/**
 * Company Service
 * Business logic for company management
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import type { 
  Company, 
  CreateCompanyInput, 
  UpdateCompanyInput, 
  CompanyStats,
  CompanyDISCAverages,
  CompanyFilters,
  CompanyListResponse
} from '@/types/company';

/**
 * Create a new company
 */
export async function createCompany(data: CreateCompanyInput, supabase: SupabaseClient): Promise<Company> {

  // Validate and format slug
  const slug = formatSlug(data.slug || data.name);

  // Check if slug already exists
  const { data: existing } = await supabase
    .from('companies')
    .select('id')
    .eq('slug', slug)
    .single();

  if (existing) {
    throw new Error('This slug is already in use');
  }

  // Create company
  const { data: company, error } = await supabase
    .from('companies')
    .insert({
      ...data,
      slug,
      primary_color: data.primary_color || '#F97316',
      font_family: data.font_family || 'Inter',
      max_tests: data.max_tests ?? 100,
      active: data.active ?? true,
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to create company: ${error.message}`);
  }

  return company;
}

/**
 * Get all companies with optional filters
 */
export async function getCompanies(filters?: CompanyFilters, supabase?: SupabaseClient): Promise<CompanyListResponse> {
  if (!supabase) {
    throw new Error('Supabase client is required');
  }

  // Build query
  let query = supabase
    .from('company_stats')
    .select('*', { count: 'exact' });

  // Apply filters
  if (filters?.search) {
    query = query.or(`company_name.ilike.%${filters.search}%,slug.ilike.%${filters.search}%`);
  }

  if (filters?.active !== undefined) {
    query = query.eq('active', filters.active);
  }

  if (filters?.nearLimit) {
    query = query.gte('usage_percentage', 90);
  }

  if (filters?.atLimit) {
    query = query.gte('usage_percentage', 100);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  
  // Note: company_stats view doesn't have created_at, need to join with companies
  if (sortBy === 'created_at') {
    // For created_at, we need to query companies table instead
    const companiesQuery = supabase
      .from('companies')
      .select('*', { count: 'exact' })
      .order(sortBy, { ascending: sortOrder === 'asc' });

    if (filters?.active !== undefined) {
      companiesQuery.eq('active', filters.active);
    }

    const page = filters?.page || 1;
    const limit = filters?.limit || 20;
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    companiesQuery.range(from, to);

    const { data: companies, error: companiesError, count } = await companiesQuery;

    if (companiesError) {
      throw new Error(`Failed to fetch companies: ${companiesError.message}`);
    }

    // Get stats for these companies
    const companyIds = companies?.map(c => c.id) || [];
    const { data: stats } = await supabase
      .from('company_stats')
      .select('*')
      .in('company_id', companyIds);

    return {
      companies: companies || [],
      stats: stats || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    };
  }

  // For other sorting, use company_stats view
  query = query.order(sortBy === 'name' ? 'company_name' : sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: stats, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch companies: ${error.message}`);
  }

  // Get full company data
  const companyIds = stats?.map(s => s.company_id) || [];
  const { data: companies } = await supabase
    .from('companies')
    .select('*')
    .in('id', companyIds);

  return {
    companies: companies || [],
    stats: stats || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get company by ID
 */
export async function getCompanyById(id: string, supabase: SupabaseClient): Promise<Company | null> {

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch company: ${error.message}`);
  }

  return data;
}

/**
 * Get company by slug (public access)
 */
export async function getCompanyBySlug(slug: string, supabase: SupabaseClient): Promise<Company | null> {

  const { data, error } = await supabase
    .from('companies')
    .select('*')
    .eq('slug', slug)
    .eq('active', true)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch company: ${error.message}`);
  }

  return data;
}

/**
 * Update company
 */
export async function updateCompany(id: string, data: UpdateCompanyInput, supabase: SupabaseClient): Promise<Company> {

  // If slug is being updated, validate it
  if (data.slug) {
    const formattedSlug = formatSlug(data.slug);
    
    // Check if slug already exists (excluding current company)
    const { data: existing } = await supabase
      .from('companies')
      .select('id')
      .eq('slug', formattedSlug)
      .neq('id', id)
      .single();

    if (existing) {
      throw new Error('This slug is already in use');
    }

    data.slug = formattedSlug;
  }

  const { data: company, error } = await supabase
    .from('companies')
    .update(data)
    .eq('id', id)
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to update company: ${error.message}`);
  }

  return company;
}

/**
 * Delete company
 */
export async function deleteCompany(id: string, supabase: SupabaseClient): Promise<void> {

  const { error } = await supabase
    .from('companies')
    .delete()
    .eq('id', id);

  if (error) {
    throw new Error(`Failed to delete company: ${error.message}`);
  }
}

/**
 * Get company statistics
 */
export async function getCompanyStats(id: string, supabase: SupabaseClient): Promise<CompanyStats | null> {

  const { data, error } = await supabase
    .from('company_stats')
    .select('*')
    .eq('company_id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch company stats: ${error.message}`);
  }

  return data;
}

/**
 * Get company DISC averages
 */
export async function getCompanyDISCAverages(id: string, supabase: SupabaseClient): Promise<CompanyDISCAverages> {

  const { data, error } = await supabase
    .rpc('get_company_disc_averages', { p_company_id: id });

  if (error) {
    throw new Error(`Failed to fetch DISC averages: ${error.message}`);
  }

  // RPC returns array, get first element
  return data?.[0] || { avg_d: 0, avg_i: 0, avg_s: 0, avg_c: 0 };
}

/**
 * Check if company can perform more tests
 */
export async function checkTestLimit(id: string, supabase: SupabaseClient): Promise<boolean> {

  const { data, error } = await supabase
    .rpc('check_test_limit', { p_company_id: id });

  if (error) {
    throw new Error(`Failed to check test limit: ${error.message}`);
  }

  return data || false;
}

/**
 * Get company test count
 */
export async function getCompanyTestCount(id: string, supabase: SupabaseClient): Promise<number> {

  const { data, error } = await supabase
    .rpc('get_company_test_count', { p_company_id: id });

  if (error) {
    throw new Error(`Failed to get test count: ${error.message}`);
  }

  return data || 0;
}

/**
 * Format slug: lowercase, replace spaces with hyphens, remove special chars
 */
function formatSlug(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/[^a-z0-9-]/g, '') // Remove special characters
    .replace(/^-+|-+$/g, '') // Remove leading/trailing hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .slice(0, 50); // Max 50 characters
}
