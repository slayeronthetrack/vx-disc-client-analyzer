/**
 * Company Dashboard Tests API
 * GET /api/company/dashboard/tests
 * 
 * Returns paginated, filtered list of employee tests for the authenticated company admin's company
 * Supports filtering by: search, dominant_profile, department, status
 * Supports sorting and pagination
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { getCompanyTests } from '@/lib/services/companyTestService';
import type { CompanyTestFilters } from '@/types/company-test';

export async function GET(request: NextRequest) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { profile, supabase } = authCheck;
    const { company_id } = profile;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const filters: CompanyTestFilters = {
      search: searchParams.get('search') || undefined,
      dominant_profile: (searchParams.get('dominant_profile') as 'D' | 'I' | 'S' | 'C' | 'all') || undefined,
      department: searchParams.get('department') || undefined,
      status: (searchParams.get('status') as 'COMPLETED' | 'IN_PROGRESS') || undefined,
      sortBy: (searchParams.get('sortBy') as 'created_at' | 'name' | 'position') || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    // Validate page and limit
    if (filters.page && filters.page < 1) filters.page = 1;
    if (filters.limit && (filters.limit < 1 || filters.limit > 100)) filters.limit = 20;

    // Fetch tests with filters (RLS automatically filters by company_id)
    const result = await getCompanyTests(company_id!, filters, supabase);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /company/dashboard/tests] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch employee tests' },
      { status: 500 }
    );
  }
}
