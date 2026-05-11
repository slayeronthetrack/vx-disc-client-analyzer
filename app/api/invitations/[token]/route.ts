/**
 * Public Invitation API
 * GET /api/invitations/[token] - Get invitation details by token
 * PATCH /api/invitations/[token] - Update invitation status (for test flow)
 */

import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';
import { getInvitationByToken, updateInvitationStatus } from '@/lib/services/invitationService';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient();
    const { token } = await params;

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

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ token: string }> }
) {
  try {
    const supabase = await createClient();
    const { token } = await params;
    const body = await request.json();
    const { status, test_id } = body;

    // Validate status
    const validStatuses = ['pending', 'sent', 'opened', 'started', 'completed', 'expired'];
    if (!status || !validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status' },
        { status: 400 }
      );
    }

    // Get invitation
    const invitation = await getInvitationByToken(token, supabase);
    if (!invitation) {
      return NextResponse.json(
        { error: 'Invitation not found or expired' },
        { status: 404 }
      );
    }

    // Build update object
    const updateData: any = { status };

    // Add timestamp based on status
    if (status === 'started' && !invitation.started_at) {
      updateData.started_at = new Date().toISOString();
    } else if (status === 'completed' && !invitation.completed_at) {
      updateData.completed_at = new Date().toISOString();
    }

    // Add test_id if provided
    if (test_id) {
      updateData.test_id = test_id;
    }

    // Update invitation
    const { error } = await supabase
      .from('test_invitations')
      .update(updateData)
      .eq('id', invitation.id);

    if (error) {
      throw error;
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('[API /invitations/[token] PATCH] Error:', error);
    return NextResponse.json(
      { error: 'Failed to update invitation' },
      { status: 500 }
    );
  }
}
