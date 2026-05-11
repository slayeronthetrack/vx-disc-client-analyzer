/**
 * Company Test Service
 * Business logic for company DISC tests
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { calculateDISCScores } from '@/utils/calculateIntegratedProfile';
import type {
  CompanyTest,
  EmployeeData,
  StartTestInput,
  SubmitTestInput,
  CompanyTestFilters,
  CompanyTestListResponse,
  DISCResult,
} from '@/types/company-test';
import type { ExtendedAnswer, DISCType } from '@/types/integrated-profile';
import { v5 as uuidv5 } from 'uuid';

// Namespace UUID for generating employee IDs
const EMPLOYEE_NAMESPACE = '6ba7b810-9dad-11d1-80b4-00c04fd430c8';

/**
 * Start a new test (validate company and limits)
 */
export async function startTest(input: StartTestInput, supabase: SupabaseClient): Promise<{ canStart: boolean; message?: string }> {

  // Check if company exists and is active
  const { data: company, error: companyError } = await supabase
    .from('companies')
    .select('id, active, max_tests')
    .eq('id', input.company_id)
    .single();

  if (companyError || !company) {
    return {
      canStart: false,
      message: 'Company not found',
    };
  }

  if (!company.active) {
    return {
      canStart: false,
      message: 'This test portal is currently unavailable',
    };
  }

  // Check test limit
  const { data: canStart, error: limitError } = await supabase
    .rpc('check_test_limit', { p_company_id: input.company_id });

  if (limitError) {
    throw new Error(`Failed to check test limit: ${limitError.message}`);
  }

  if (!canStart) {
    return {
      canStart: false,
      message: 'This company has reached its test limit. Please contact your administrator.',
    };
  }

  return {
    canStart: true,
  };
}

/**
 * Submit completed test
 */
export async function submitTest(input: SubmitTestInput, supabase: SupabaseClient): Promise<CompanyTest> {

  // Validate company and limits first
  const validation = await startTest({ 
    company_id: input.company_id, 
    employee_data: input.employee_data 
  }, supabase);

  if (!validation.canStart) {
    throw new Error(validation.message || 'Cannot submit test');
  }

  // Calculate DISC scores
  const extendedAnswers: ExtendedAnswer[] = input.answers.map(answer => ({
    questionId: answer.questionId,
    selectedOptions: answer.selectedOptions.map(type => ({
      type: type as DISCType,
    })),
  }));

  const discResult = calculateDISCScores(extendedAnswers);

  // Determine secondary profile (second highest score)
  const sortedScores = Object.entries(discResult.scores)
    .sort((a, b) => b[1] - a[1]);
  const secondary = sortedScores[1][0] as DISCType;

  // Generate employee_id based on email (for linking multiple tests)
  const employee_id = generateEmployeeId(input.employee_data.email);

  // Check if this is a retake
  const { data: previousTests } = await supabase
    .from('company_tests')
    .select('id, attempt_number')
    .eq('company_id', input.company_id)
    .eq('employee_id', employee_id)
    .order('attempt_number', { ascending: false })
    .limit(1);

  const attempt_number = previousTests && previousTests.length > 0 
    ? previousTests[0].attempt_number + 1 
    : 1;

  const previous_test_id = previousTests && previousTests.length > 0 
    ? previousTests[0].id 
    : null;

  // Prepare DISC result
  const disc_result: DISCResult = {
    dominant: discResult.dominant,
    secondary,
    scores: discResult.scores,
    percentages: discResult.percentages,
  };

  // Generate AI analysis (call OpenAI)
  const ai_analysis = await generateAIAnalysis(disc_result, input.employee_data);

  // Insert test record
  const { data: test, error } = await supabase
    .from('company_tests')
    .insert({
      company_id: input.company_id,
      employee_id,
      previous_test_id,
      name: input.employee_data.name,
      email: input.employee_data.email,
      phone: input.employee_data.phone || null,
      position: input.employee_data.position,
      department: input.employee_data.department || null,
      disc_result,
      answers: input.answers,
      questions: input.questions,
      status: 'COMPLETED',
      test_version: '1.0',
      attempt_number,
      ai_analysis,
      started_at: input.started_at || new Date().toISOString(),
      completed_at: new Date().toISOString(),
    })
    .select()
    .single();

  if (error) {
    throw new Error(`Failed to submit test: ${error.message}`);
  }

  return test;
}

/**
 * Get test by ID
 */
export async function getTestById(id: string, supabase: SupabaseClient): Promise<CompanyTest | null> {

  const { data, error } = await supabase
    .from('company_tests')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    if (error.code === 'PGRST116') {
      return null; // Not found
    }
    throw new Error(`Failed to fetch test: ${error.message}`);
  }

  return data;
}

/**
 * Get all tests for a company with filters
 */
export async function getCompanyTests(
  companyId: string,
  filters?: CompanyTestFilters,
  supabase?: SupabaseClient
): Promise<CompanyTestListResponse> {
  if (!supabase) {
    throw new Error('Supabase client is required');
  }

  // Build query
  let query = supabase
    .from('company_tests')
    .select('*', { count: 'exact' })
    .eq('company_id', companyId);

  // Apply filters
  if (filters?.search) {
    query = query.or(
      `name.ilike.%${filters.search}%,email.ilike.%${filters.search}%,position.ilike.%${filters.search}%`
    );
  }

  if (filters?.dominant_profile && filters.dominant_profile !== 'all') {
    query = query.eq('disc_result->>dominant', filters.dominant_profile);
  }

  if (filters?.department) {
    query = query.eq('department', filters.department);
  }

  if (filters?.status) {
    query = query.eq('status', filters.status);
  }

  // Apply sorting
  const sortBy = filters?.sortBy || 'created_at';
  const sortOrder = filters?.sortOrder || 'desc';
  query = query.order(sortBy, { ascending: sortOrder === 'asc' });

  // Apply pagination
  const page = filters?.page || 1;
  const limit = filters?.limit || 20;
  const from = (page - 1) * limit;
  const to = from + limit - 1;

  query = query.range(from, to);

  const { data: tests, error, count } = await query;

  if (error) {
    throw new Error(`Failed to fetch tests: ${error.message}`);
  }

  return {
    tests: tests || [],
    total: count || 0,
    page,
    limit,
    totalPages: Math.ceil((count || 0) / limit),
  };
}

/**
 * Get all tests for an employee (by email)
 */
export async function getEmployeeTests(
  companyId: string,
  email: string,
  supabase: SupabaseClient
): Promise<CompanyTest[]> {

  const employee_id = generateEmployeeId(email);

  const { data, error } = await supabase
    .from('company_tests')
    .select('*')
    .eq('company_id', companyId)
    .eq('employee_id', employee_id)
    .order('created_at', { ascending: false });

  if (error) {
    throw new Error(`Failed to fetch employee tests: ${error.message}`);
  }

  return data || [];
}

/**
 * Generate employee ID from email (deterministic UUID)
 */
function generateEmployeeId(email: string): string {
  return uuidv5(email.toLowerCase().trim(), EMPLOYEE_NAMESPACE);
}

/**
 * Generate AI analysis using OpenAI
 */
async function generateAIAnalysis(
  discResult: DISCResult,
  employeeData: EmployeeData
): Promise<string> {
  try {
    // Use absolute URL for server-side fetch
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    const response = await fetch(`${baseUrl}/api/ai/analyze-disc`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        discResult,
        employeeData,
      }),
    });

    if (!response.ok) {
      console.error('Failed to generate AI analysis:', await response.text());
      return generateFallbackAnalysis(discResult);
    }

    const data = await response.json();
    return data.analysis || generateFallbackAnalysis(discResult);
  } catch (error) {
    console.error('Error generating AI analysis:', error);
    return generateFallbackAnalysis(discResult);
  }
}

/**
 * Generate fallback analysis if AI fails
 */
function generateFallbackAnalysis(discResult: DISCResult): string {
  const { dominant, secondary, percentages } = discResult;

  const profiles: Record<DISCType, string> = {
    D: 'Dominância - Você é direto, orientado a resultados e gosta de desafios. Tende a ser assertivo e focado em alcançar objetivos.',
    I: 'Influência - Você é comunicativo, entusiasta e gosta de trabalhar com pessoas. Tende a ser otimista e persuasivo.',
    S: 'Estabilidade - Você é paciente, leal e gosta de ambientes estáveis. Tende a ser cooperativo e confiável.',
    C: 'Conformidade - Você é analítico, preciso e gosta de seguir procedimentos. Tende a ser detalhista e sistemático.',
  };

  return `Seu perfil dominante é ${dominant} (${percentages[dominant]}%) - ${profiles[dominant]}\n\nSeu perfil secundário é ${secondary} (${percentages[secondary]}%), o que complementa suas características principais e adiciona nuances ao seu comportamento.`;
}
