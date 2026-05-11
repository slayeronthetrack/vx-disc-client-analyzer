/**
 * Test API Route
 * GET /api/tests/[id] - Get test by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTestById } from '@/lib/services/companyTestService';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

/**
 * GET /api/tests/[id]
 * Get test by ID (admin only)
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

    // Get test with authenticated Supabase client
    const test = await getTestById(id, authCheck.supabase);

    if (!test) {
      return NextResponse.json(
        { error: 'Test not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(test);
  } catch (error) {
    console.error('Error fetching test:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch test' },
      { status: 500 }
    );
  }
}
