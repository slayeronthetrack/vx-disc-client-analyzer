/**
 * Company Dashboard Single Invitation API
 * DELETE /api/company/dashboard/invitations/[id] - Delete invitation
 * PATCH /api/company/dashboard/invitations/[id] - Update invitation
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { deleteInvitation } from '@/lib/services/invitationService';

export async function DELETE(
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

    // Delete invitation (RLS ensures it belongs to the company)
    await deleteInvitation(invitationId, supabase);

    return NextResponse.json({
      success: true,
      message: 'Invitation deleted successfully',
    });
  } catch (error) {
    console.error('[API /company/dashboard/invitations/[id] DELETE] Error:', error);
    return NextResponse.json(
      { error: 'Failed to delete invitation' },
      { status: 500 }
    );
  }
}
