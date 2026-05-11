/**
 * Company Tests API Route
 * GET /api/companies/[id]/tests - Get all tests for a company
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyTests } from '@/lib/services/companyTestService';
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

    // Parse query parameters for filters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      dominant_profile: searchParams.get('dominant_profile') as 'D' | 'I' | 'S' | 'C' | 'all' || 'all',
      department: searchParams.get('department') || undefined,
      status: searchParams.get('status') as 'COMPLETED' | 'IN_PROGRESS' | undefined,
      sortBy: searchParams.get('sortBy') as 'created_at' | 'name' | 'position' || 'created_at',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '50'),
    };

    // Get tests with authenticated Supabase client
    const result = await getCompanyTests(id, filters, authCheck.supabase);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching company tests:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company tests' },
      { status: 500 }
    );
  }
}
