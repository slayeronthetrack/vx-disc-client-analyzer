/**
 * Company Dashboard Employee Detail API
 * GET /api/company/dashboard/tests/[id]
 * 
 * Returns full test details for a specific employee test
 * RLS automatically ensures the test belongs to the authenticated company admin's company
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { getTestById } from '@/lib/services/companyTestService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase } = authCheck;
    const { id: testId } = await params;

    // Validate test ID format (UUID)
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
    if (!uuidRegex.test(testId)) {
      return NextResponse.json(
        { error: 'Invalid test ID format' },
        { status: 400 }
      );
    }

    // Fetch test by ID (RLS automatically filters by company_id)
    const test = await getTestById(testId, supabase);

    // If test not found or belongs to different company (filtered by RLS), return 404
    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('[API /company/dashboard/tests/[id]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch test details' },
      { status: 500 }
    );
  }
}
