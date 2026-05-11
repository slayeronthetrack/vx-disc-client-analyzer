/**
 * Company Stats API Route
 * GET /api/companies/[id]/stats - Get company statistics
 */

import { NextRequest, NextResponse } from 'next/server';
import { getCompanyStats, getCompanyDISCAverages } from '@/lib/services/companyService';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

/**
 * GET /api/companies/[id]/stats
 * Get company statistics
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

    // Get stats
    const stats = await getCompanyStats(id);

    if (!stats) {
      return NextResponse.json(
        { error: 'Company not found' },
        { status: 404 }
      );
    }

    // Get DISC averages
    const averages = await getCompanyDISCAverages(id);

    return NextResponse.json({
      ...stats,
      disc_averages: averages,
    });
  } catch (error) {
    console.error('Error fetching company stats:', error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch company stats' },
      { status: 500 }
    );
  }
}
