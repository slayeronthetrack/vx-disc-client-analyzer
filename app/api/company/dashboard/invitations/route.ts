/**
 * Company Dashboard Invitations API
 * GET /api/company/dashboard/invitations - List invitations
 * POST /api/company/dashboard/invitations - Create invitation(s)
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import {
  getCompanyInvitations,
  createInvitation,
  createBulkInvitations,
} from '@/lib/services/invitationService';
import type { InvitationFilters, CreateInvitationInput, BulkInvitationInput } from '@/types/invitation';
import { z } from 'zod';

// Validation schemas
const CreateInvitationSchema = z.object({
  employee_name: z.string().min(1, 'Name is required'),
  employee_email: z.string().email('Invalid email'),
  employee_position: z.string().optional(),
  employee_department: z.string().optional(),
  expires_in_days: z.number().min(1).max(365).optional(),
});

const BulkInvitationSchema = z.object({
  invitations: z.array(CreateInvitationSchema).min(1, 'At least one invitation required'),
  send_immediately: z.boolean().optional(),
});

export async function GET(request: NextRequest) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { profile, supabase } = authCheck;
    const { company_id } = profile;

    // Parse query parameters
    const { searchParams } = new URL(request.url);
    
    const filters: InvitationFilters = {
      status: (searchParams.get('status') as any) || 'all',
      search: searchParams.get('search') || undefined,
      department: searchParams.get('department') || undefined,
      sortBy: (searchParams.get('sortBy') as any) || 'created_at',
      sortOrder: (searchParams.get('sortOrder') as 'asc' | 'desc') || 'desc',
      page: parseInt(searchParams.get('page') || '1', 10),
      limit: parseInt(searchParams.get('limit') || '20', 10),
    };

    // Validate page and limit
    if (filters.page < 1) filters.page = 1;
    if (filters.limit < 1 || filters.limit > 100) filters.limit = 20;

    // Fetch invitations
    const result = await getCompanyInvitations(company_id!, filters, supabase);

    return NextResponse.json(result);
  } catch (error) {
    console.error('[API /company/dashboard/invitations GET] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch invitations' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { user, profile, supabase } = authCheck;
    const { company_id } = profile;

    // Parse request body
    const body = await request.json();

    // Check if bulk or single invitation
    const isBulk = Array.isArray(body.invitations);

    if (isBulk) {
      // Validate bulk invitation
      const validation = BulkInvitationSchema.safeParse(body);
      if (!validation.success) {
        const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }

      // Create bulk invitations
      const invitations = await createBulkInvitations(
        company_id!,
        validation.data as BulkInvitationInput,
        user.id,
        supabase
      );

      return NextResponse.json({
        success: true,
        invitations,
        count: invitations.length,
        message: `${invitations.length} invitation(s) created successfully`,
      });
    } else {
      // Validate single invitation
      const validation = CreateInvitationSchema.safeParse(body);
      if (!validation.success) {
        const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
        return NextResponse.json(
          { error: 'Validation failed', details: errors },
          { status: 400 }
        );
      }

      // Create single invitation
      const invitation = await createInvitation(
        company_id!,
        validation.data as CreateInvitationInput,
        user.id,
        supabase
      );

      return NextResponse.json({
        success: true,
        invitation,
        message: 'Invitation created successfully',
      });
    }
  } catch (error) {
    console.error('[API /company/dashboard/invitations POST] Error:', error);
    return NextResponse.json(
      { error: 'Failed to create invitation(s)' },
      { status: 500 }
    );
  }
}
