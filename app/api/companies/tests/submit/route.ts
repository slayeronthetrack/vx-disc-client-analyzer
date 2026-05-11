/**
 * API Route - Submit Company Test
 * POST /api/companies/tests/submit
 * Public route for submitting DISC tests via company slug
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { submitTest } from '@/lib/services/companyTestService';
import type { SubmitTestInput } from '@/types/company-test';
import type { Answer, DISCType } from '@/types/database';

interface RequestBody {
  company_id: string;
  employee_data: {
    name: string;
    email: string;
    phone?: string;
    position: string;
  };
  answers: Answer[];
  questions: Array<{
    id: number;
    text: string;
  }>;
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    // Validate required fields
    if (!body.company_id) {
      return NextResponse.json(
        { error: 'Company ID is required' },
        { status: 400 }
      );
    }

    if (!body.employee_data?.name || !body.employee_data?.email || !body.employee_data?.position) {
      return NextResponse.json(
        { error: 'Employee data (name, email, position) is required' },
        { status: 400 }
      );
    }

    if (!body.answers || body.answers.length === 0) {
      return NextResponse.json(
        { error: 'Answers are required' },
        { status: 400 }
      );
    }

    // Use service role client to bypass RLS (safe because this is server-side only)
    // This allows public test submission without authentication
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    );

    // Prepare input for submitTest
    const submitInput: SubmitTestInput = {
      company_id: body.company_id,
      employee_data: {
        name: body.employee_data.name,
        email: body.employee_data.email,
        phone: body.employee_data.phone,
        position: body.employee_data.position,
      },
      answers: body.answers,
      questions: body.questions,
    };

    // Submit test with Supabase client
    const result = await submitTest(submitInput, supabase);

    return NextResponse.json({
      success: true,
      testId: result.id,
      dominantProfile: result.disc_result.dominant,
      message: 'Test submitted successfully',
    });
  } catch (error) {
    console.error('[API] Error submitting test:', error);

    const message = error instanceof Error ? error.message : 'Failed to submit test';

    // Check if it's a limit error
    if (message.includes('reached its test limit')) {
      return NextResponse.json(
        { error: message },
        { status: 429 }
      );
    }

    return NextResponse.json(
      { error: message },
      { status: 500 }
    );
  }
}
