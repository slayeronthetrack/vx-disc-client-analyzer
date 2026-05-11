/**
 * Company API Routes (by ID)
 * GET /api/companies/[id] - Get company by ID
 * PATCH /api/companies/[id] - Update company
 * DELETE /api/companies/[id] - Delete company
 */

import { NextRequest, NextResponse } from 'next/server';
import { 
  getCompanyById, 
  updateCompany, 
  deleteCompany 
} from '@/lib/services/companyService';
import { validateData, updateCompanySchema } from '@/lib/utils/validation';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

/**
 * GET /api/companies/[id]
 * Get company by ID
 */
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Get company
    const company = await getCompanyById(id);

    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error fetching company:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company' },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/companies/[id]
 * Update company
 */
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Parse and validate request body
    const body = await request.json();
    const validatedData = validateData(updateCompanySchema, body);

    // Update company
    const company = await updateCompany(id, validatedData);

    return NextResponse.json(company);
  } catch (error) {
    console.error('Error updating company:', error);
    
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
      { error: error instanceof Error ? error.message : 'Failed to update company' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/companies/[id]
 * Delete company
 */
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;

    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    // Delete company
    await deleteCompany(id);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error deleting company:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to delete company' },
      { status: 500 }
    );
  }
}
