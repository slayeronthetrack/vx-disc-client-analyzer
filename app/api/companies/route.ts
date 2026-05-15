/**
 * Companies API Routes
 * GET /api/companies - List all companies
 * POST /api/companies - Create a new company
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCompany, deleteCompany, getCompanies } from '@/lib/services/companyService';
import { validateData, createCompanyWithAdminSchema, companyFiltersSchema } from '@/lib/utils/validation';
import { checkAdminAccess, checkSuperAdminAccess } from '@/lib/utils/apiAuth';
import { createAdminClient } from '@/lib/supabase/admin';
import type { Company } from '@/types/company';

/**
 * GET /api/companies
 * List all companies with optional filters
 */
export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Parse query parameters
    const searchParams = request.nextUrl.searchParams;
    const filters = {
      search: searchParams.get('search') || undefined,
      active: searchParams.get('active') === 'true' ? true : searchParams.get('active') === 'false' ? false : undefined,
      nearLimit: searchParams.get('nearLimit') === 'true',
      atLimit: searchParams.get('atLimit') === 'true',
      sortBy: searchParams.get('sortBy') as 'name' | 'created_at' | 'total_tests' || 'created_at',
      sortOrder: searchParams.get('sortOrder') as 'asc' | 'desc' || 'desc',
      page: parseInt(searchParams.get('page') || '1'),
      limit: parseInt(searchParams.get('limit') || '20'),
    };

    // Validate filters
    const validatedFilters = validateData(companyFiltersSchema, filters);

    // Get companies with authenticated Supabase client
    const result = await getCompanies(validatedFilters, authCheck.supabase);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  let createdCompany: Company | null = null;
  let createdAuthUserId: string | null = null;

  try {
    // Only super admins can create global companies and company admin accounts.
    const authCheck = await checkSuperAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const body = await request.json();
    const validatedData = validateData(createCompanyWithAdminSchema, body);
    const { admin_access: adminAccess, ...companyData } = validatedData;

    const adminClient = createAdminClient();

    createdCompany = await createCompany(companyData, authCheck.supabase);

    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email: adminAccess.admin_email,
      password: adminAccess.admin_password,
      email_confirm: true,
      user_metadata: {
        full_name: adminAccess.admin_full_name,
        role: 'company_admin',
        company_id: createdCompany.id,
      },
    });

    if (authError || !authData.user) {
      throw new Error(`Failed to create company admin user: ${authError?.message || 'Auth user was not returned'}`);
    }

    createdAuthUserId = authData.user.id;

    const { error: profileError } = await adminClient
      .from('profiles')
      .insert({
        user_id: authData.user.id,
        email: adminAccess.admin_email,
        full_name: adminAccess.admin_full_name,
        role: 'company_admin',
        company_id: createdCompany.id,
        profile_completed: true,
      });

    if (profileError) {
      throw new Error(`Failed to create company admin profile: ${profileError.message}`);
    }

    return NextResponse.json({
      company: createdCompany,
      access: {
        admin_full_name: adminAccess.admin_full_name,
        admin_email: adminAccess.admin_email,
        temporary_password: adminAccess.admin_password,
        login_url: '/login',
      },
    }, { status: 201 });
  } catch (error) {
    if (createdAuthUserId) {
      const adminClient = createAdminClient();
      const { error: deleteUserError } = await adminClient.auth.admin.deleteUser(createdAuthUserId);
      if (deleteUserError) {
        console.error('Rollback failed while deleting auth user:', deleteUserError.message);
      }
    }

    if (createdCompany) {
      try {
        const rollbackClient = createAdminClient();
        await deleteCompany(createdCompany.id, rollbackClient);
      } catch (rollbackError) {
        console.error('Rollback failed while deleting company:', rollbackError instanceof Error ? rollbackError.message : rollbackError);
      }
    }

    console.error('Error creating company:', error instanceof Error ? error.message : error);

    if (error instanceof Error) {
      if (error.message.includes('slug is already in use')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 }
        );
      }

      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 }
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create company' },
      { status: 500 }
    );
  }
}
