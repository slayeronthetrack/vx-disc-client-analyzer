/**
 * Company Dashboard Export API
 * POST /api/company/dashboard/export
 * 
 * Exports company test data in CSV or PDF format
 * Supports filtering to export only specific data subsets
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';
import { generateCSVExport, generatePDFExport, generateExportFilename } from '@/lib/services/exportService';
import { getCompanyById } from '@/lib/services/companyService';
import type { CompanyTestFilters } from '@/types/company-test';
import { z } from 'zod';

const ExportRequestSchema = z.object({
  format: z.enum(['csv', 'pdf']),
  filters: z.object({
    search: z.string().optional(),
    dominant_profile: z.enum(['D', 'I', 'S', 'C', 'all']).optional(),
    department: z.string().optional(),
    status: z.enum(['COMPLETED', 'IN_PROGRESS']).optional(),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { profile, supabase } = authCheck;
    const { company_id } = profile;

    // Parse and validate request body
    const body = await request.json();
    const validation = ExportRequestSchema.safeParse(body);
    
    if (!validation.success) {
      const errors = validation.error.issues.map(err => `${err.path.join('.')}: ${err.message}`);
      return NextResponse.json(
        { error: 'Validation failed', details: errors },
        { status: 400 }
      );
    }

    const { format, filters } = validation.data;

    // Get company info for filename
    const company = await getCompanyById(company_id!, supabase);
    if (!company) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Generate filename
    const filename = generateExportFilename(company.slug, format);

    // Generate export based on format
    if (format === 'csv') {
      const csvContent = await generateCSVExport(company_id!, filters, supabase);
      
      return new NextResponse(csvContent, {
        status: 200,
        headers: {
          'Content-Type': 'text/csv; charset=utf-8',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    } else {
      // PDF export
      const pdfBuffer = await generatePDFExport(company_id!, filters, supabase);
      
      return new NextResponse(pdfBuffer, {
        status: 200,
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${filename}"`,
          'Cache-Control': 'no-cache',
        },
      });
    }
  } catch (error) {
    console.error('[API /company/dashboard/export] Error:', error);
    return NextResponse.json(
      { error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}
