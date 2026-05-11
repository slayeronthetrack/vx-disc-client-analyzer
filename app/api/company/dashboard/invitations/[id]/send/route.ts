/**
 * Send/Resend Invitation API
 * POST /api/company/dashboard/invitations/[id]/send
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { sendInvitations, resendInvitation } from '@/lib/services/invitationService';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase } = authCheck;
    const invitationId = params.id;

    // Parse body to check if it's a resend
    const body = await request.json().catch(() => ({}));
    const isResend = body.resend === true;

    if (isResend) {
      // Resend (reminder)
      await resendInvitation(invitationId, supabase);
      return NextResponse.json({
        success: true,
        message: 'Reminder sent successfully',
      });
    } else {
      // First send
      await sendInvitations([invitationId], supabase);
      return NextResponse.json({
        success: true,
        message: 'Invitation sent successfully',
      });
    }
  } catch (error) {
    console.error('[API /company/dashboard/invitations/[id]/send] Error:', error);
    return NextResponse.json(
      { error: 'Failed to send invitation' },
      { status: 500 }
    );
  }
}
