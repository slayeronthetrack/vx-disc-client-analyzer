/**
 * Submit Test API Route
 * POST /api/tests/submit - Submit completed test
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitTest } from '@/lib/services/companyTestService';
import { validateData, submitTestSchema } from '@/lib/utils/validation';

/**
 * POST /api/tests/submit
 * Submit completed test and calculate results
 */
export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateData(submitTestSchema, body);

    // Submit test
    const test = await submitTest(validatedData);

    return NextResponse.json(test, { status: 201 });
  } catch (error) {
    console.error('Error submitting test:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }

      if (error.message.includes('test limit') || error.message.includes('unavailable')) {
        return NextResponse.json(
          { error: error.message },
          { status: 403 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to submit test' },
      { status: 500 }
    );
  }
}
