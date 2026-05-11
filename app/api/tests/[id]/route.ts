/**
 * Test API Route (by ID)
 * GET /api/tests/[id] - Get test result by ID
 */

import { NextRequest, NextResponse } from 'next/server';
import { getTestById } from '@/lib/services/companyTestService';

/**
 * GET /api/tests/[id]
 * Get test result by ID (public access for viewing results)
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Get test
    const test = await getTestById(id);

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
