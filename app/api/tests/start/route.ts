/**
 * Start Test API Route
 * POST /api/tests/start - Validate company and start test
 */

import { NextRequest, NextResponse } from 'next/server';
import { startTest } from '@/lib/services/companyTestService';
import { validateData, startTestSchema } from '@/lib/utils/validation';

/**
 * POST /api/tests/start
 * Validate company and check if test can be started
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateData(startTestSchema, body);

    // Check if test can be started
    const result = await startTest(validatedData);

    if (!result.canStart) {
      return NextResponse.json(
        { error: result.message },
        { status: 403 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error starting test:', error);
    
    if (error instanceof Error && error.message.includes('Validation failed')) {
      return NextResponse.json(
        { error: error.message },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to start test' },
      { status: 500 }
    );
  }
}
