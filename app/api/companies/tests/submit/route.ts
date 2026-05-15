/**
 * API Route - Submit Company Test
 * POST /api/companies/tests/submit
 * Public route for submitting DISC tests via invitation token
 */

import { NextRequest, NextResponse } from 'next/server';
import { submitTest } from '@/lib/services/companyTestService';
import { getInvitationByToken } from '@/lib/services/invitationService';
import { createAdminClient } from '@/lib/supabase/admin';
import type { SubmitTestInput } from '@/types/company-test';
import type { Answer } from '@/types/database';

interface RequestBody {
  company_slug?: string;
  employee_data: {
    name: string;
    email: string;
    phone?: string;
    position: string;
    department?: string;
  };
  answers: Answer[];
  questions: Array<{
    id: number;
    text: string;
  }>;
  invitation_id?: string | null;
  invitation_token?: string | null;
}

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

export async function POST(request: NextRequest) {
  try {
    const body: RequestBody = await request.json();

    if (!body.invitation_token?.trim()) {
      return NextResponse.json(
        { error: 'Invitation token is required' },
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

    const supabase = createAdminClient();
    const invitation = await getInvitationByToken(body.invitation_token.trim(), supabase);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    if (invitation.status === 'completed' || invitation.status === 'expired' || invitation.test_id) {
      return NextResponse.json(
        { error: 'Invitation is no longer available' },
        { status: 409 }
      );
    }

    const invitationStatusBeforeSubmit = invitation.status;

    if (body.company_slug) {
      const { data: company, error: companyError } = await supabase
        .from('companies')
        .select('slug')
        .eq('id', invitation.company_id)
        .single();

      if (companyError || !company) {
        return NextResponse.json(
          { error: 'Company not found' },
          { status: 404 }
        );
      }

      if (company.slug !== body.company_slug) {
        return NextResponse.json(
          { error: 'Invitation does not belong to the submitted company' },
          { status: 403 }
        );
      }
    }

    if (body.invitation_id && body.invitation_id !== invitation.id) {
      return NextResponse.json(
        { error: 'Invitation ID does not match token' },
        { status: 403 }
      );
    }

    if (normalizeEmail(body.employee_data.email) !== normalizeEmail(invitation.employee_email)) {
      return NextResponse.json(
        { error: 'Employee email does not match invitation' },
        { status: 403 }
      );
    }

    const { data: claimedInvitation, error: claimError } = await supabase
      .from('test_invitations')
      .update({ status: 'completed' })
      .eq('id', invitation.id)
      .eq('company_id', invitation.company_id)
      .is('test_id', null)
      .neq('status', 'completed')
      .neq('status', 'expired')
      .select('id')
      .single();

    if (claimError || !claimedInvitation) {
      return NextResponse.json(
        { error: 'Invitation is no longer available' },
        { status: 409 }
      );
    }

    const submitInput: SubmitTestInput = {
      company_id: invitation.company_id,
      employee_data: {
        name: invitation.employee_name,
        email: normalizeEmail(invitation.employee_email),
        phone: body.employee_data.phone,
        position: invitation.employee_position || body.employee_data.position,
        department: invitation.employee_department || body.employee_data.department,
      },
      answers: body.answers,
      questions: body.questions,
      invitation_id: invitation.id,
    };

    let result;
    try {
      result = await submitTest(submitInput, supabase);
    } catch (error) {
      await supabase
        .from('test_invitations')
        .update({
          status: invitationStatusBeforeSubmit,
          completed_at: null,
        })
        .eq('id', invitation.id)
        .eq('company_id', invitation.company_id)
        .is('test_id', null);

      throw error;
    }

    const { error: invitationUpdateError } = await supabase
      .from('test_invitations')
      .update({
        status: 'completed',
        completed_at: new Date().toISOString(),
        test_id: result.id,
      })
      .eq('id', invitation.id)
      .eq('company_id', invitation.company_id)
      .is('test_id', null)
      .select('id')
      .single();

    if (invitationUpdateError) {
      throw new Error(`Failed to update invitation status: ${invitationUpdateError.message}`);
    }

    return NextResponse.json({
      success: true,
      test: {
        id: result.id,
        dominantProfile: result.disc_result.dominant,
      },
      message: 'Test submitted successfully',
    });
  } catch (error) {
    console.error('[API] Error submitting test:', error);

    const message = error instanceof Error ? error.message : 'Failed to submit test';

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
