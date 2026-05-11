/**
 * Companies API Routes
 * GET /api/companies - List all companies
 * POST /api/companies - Create a new company
 */

import { NextRequest, NextResponse } from 'next/server';
import { createCompany, getCompanies } from '@/lib/services/companyService';
import { validateData, createCompanySchema, companyFiltersSchema } from '@/lib/utils/validation';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

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

    // Get companies
    const result = await getCompanies(validatedFilters);

    return NextResponse.json(result);
  } catch (error) {
    console.error('Error fetching companies:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch companies' },
      { status: 500 }
    );
  }
}

/**
 * POST /api/companies
 * Create a new company
 */
export async function POST(request: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateData(createCompanySchema, body);

    // Create company
    const company = await createCompany(validatedData);

    return NextResponse.json(company, { status: 201 });
  } catch (error) {
    console.error('Error creating company:', error);
    
    // Handle specific errors
    if (error instanceof Error) {
      if (error.message.includes('slug is already in use')) {
        return NextResponse.json(
          { error: error.message },
          { status: 409 } // Conflict
        );
      }
      
      if (error.message.includes('Validation failed')) {
        return NextResponse.json(
          { error: error.message },
          { status: 400 } // Bad Request
        );
      }
    }

    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create company' },
      { status: 500 }
    );
  }
}
