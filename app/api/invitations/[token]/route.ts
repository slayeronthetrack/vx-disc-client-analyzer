/**
 * Public Invitation API
 * GET /api/invitations/[token] - Get invitation details by token
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInvitationByToken, updateInvitationStatus } from '@/lib/services/invitationService';

export async function GET(
  request: NextRequest,
  { params }: { params: { token: string } }
) {
  try {
    const supabase = createClient();
    const token = params.token;

    // Get invitation by token (public access)
    const invitation = await getInvitationByToken(token, supabase);

    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    // Update status to 'opened' if it's the first time
    if (invitation.status === 'sent' || invitation.status === 'pending') {
      await updateInvitationStatus(invitation.id, 'opened', supabase);
      invitation.status = 'opened';
    }

    // Get company info
    const { data: company } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url, primary_color')
      .eq('id', invitation.company_id)
      .single();

    return NextResponse.json({
      invitation: {
        id: invitation.id,
        employee_name: invitation.employee_name,
        employee_email: invitation.employee_email,
        employee_position: invitation.employee_position,
        employee_department: invitation.employee_department,
        expires_at: invitation.expires_at,
        status: invitation.status,
      },
      company: company || null,
    });
  } catch (error) {
    console.error('[API /invitations/[token]] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitation' },
      { status: 500 }
    );
  }
}
