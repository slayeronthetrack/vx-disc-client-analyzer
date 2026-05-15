/**
 * Company Dashboard Profile API
 * PATCH /api/company/dashboard/profile
 * 
 * Allows company admins to update their company profile
 * Restricted fields (name, slug, max_tests, active) cannot be updated by company_admin
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { updateCompany } from '@/lib/services/companyService';
import { z } from 'zod';

// Define allowed fields for company_admin updates
const CompanyProfileUpdateSchema = z.object({
  contact_email: z.string().email('Invalid email format').optional(),
  contact_phone: z.string().optional(),
  address: z.string().optional(),
});

// Restricted fields that company_admin cannot update
const RESTRICTED_FIELDS = ['name', 'slug', 'max_tests', 'active', 'logo_url', 'primary_color', 'font_family'];

/**
 * GET /api/company/dashboard/profile
 * Fetch company profile info (name, slug, etc.)
 */
export async function GET() {
  try {
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase, profile } = authCheck;

    const { data: company, error } = await supabase
      .from('companies')
      .select('id, name, slug, logo_url, primary_color')
      .eq('id', profile.company_id)
      .single();

    if (error || !company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ company });
  } catch (error) {
    console.error('[API /company/dashboard/profile] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch company profile' },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { profile, supabase } = authCheck;
    const { company_id } = profile;

    // Parse request body
    const body = await request.json();

    // Check for restricted fields
    const restrictedFieldsPresent = RESTRICTED_FIELDS.filter(field => field in body);
    if (restrictedFieldsPresent.length > 0) {
      return NextResponse.json(
        { 
          error: 'Forbidden: Cannot update restricted fields',
          restricted_fields: restrictedFieldsPresent,
          message: 'You do not have permission to update these fields. Please contact a super admin.'
        },
        { status: 403 }
      );
    }

    // Validate allowed fields
    const validation = CompanyProfileUpdateSchema.safeParse(body);
    if (!validation.success) {
      const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    // Update company (RLS ensures only own company can be updated)
    const updatedCompany = await updateCompany(company_id!, validation.data, supabase);

    return NextResponse.json({
      success: true,
      company: updatedCompany,
      message: 'Company profile updated successfully'
    });
  } catch (error) {
    console.error('[API /company/dashboard/profile] Error:', error);
    
    // Handle specific error messages
    if (error instanceof Error) {
      if (error.message.includes('slug is already in use')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }
    }

    return NextResponse.json(
      { error: 'Failed to update company profile' },
      { status: 500 }
    );
  }
}
