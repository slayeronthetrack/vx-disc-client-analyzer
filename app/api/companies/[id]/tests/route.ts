/**
 * Company Tests API Route
 * GET /api/companies/[id]/tests - Get all tests for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyTests } from '@/lib/services/companyTestService';
import { validateData, companyTestFiltersSchema } from '@/lib/utils/validation';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

/**
 * GET /api/companies/[id]/tests
 * Get all tests for a company with optional filters
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      dominant_profile: searchParams.get('dominant_profile') as 'D' | 'I' | 'S' | 'C' | 'all' || undefined,
      department: searchParams.get('department') || undefined,
      status: searchParams.get('status') as 'PENDING' | 'IN_PROGRESS' | 'COMPLETED' | 'EXPIRED' | 'ABANDONED' || undefined,
      sortBy: searchParams.get('sortBy') as 'created_at' | 'name' | 'email' || 'created_at',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Validate filters
    const validatedFilters = validateData(companyTestFiltersSchema, filters);

    // Get tests
    const result = await getCompanyTests(id, validatedFilters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching company tests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company tests' },
      { status: 500 }
    );
  }
}
