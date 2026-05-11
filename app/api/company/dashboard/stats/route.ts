/**
 * Company Dashboard Statistics API
 * GET /api/company/dashboard/stats
 * 
 * Returns aggregated statistics for the authenticated company admin's company
 * Includes: total tests, unique employees, average scores, completion rate, etc.
 */

import { NextResponse } from 'next/server';
import { checkCompanyAdminAccess } from '@/lib/utils/companyAdminAuth';

export async function GET() {
  try {
    // Check company admin access
    const authCheck = await checkCompanyAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { profile, supabase } = authCheck;
    const { company_id } = profile;

    // Import service function dynamically to avoid circular dependencies
    const { getCompanyDashboardStats } = await import('@/lib/services/companyDashboardService');

    // Fetch dashboard statistics (RLS automatically filters by company_id)
    const stats = await getCompanyDashboardStats(company_id!, supabase);

    return NextResponse.json(stats);
  } catch (error) {
    console.error('[API /company/dashboard/stats] Error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch dashboard statistics' },
      { status: 500 }
    );
  }
}
