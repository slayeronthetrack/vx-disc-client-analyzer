/**
 * Admin Metrics API
 * GET /api/admin/metrics - Get global system metrics
 */

import { NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

export async function GET() {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase } = authCheck;

    // Get total companies
    const { count: totalCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true });

    // Get active companies
    const { count: activeCompanies } = await supabase
      .from('companies')
      .select('*', { count: 'exact', head: true })
      .eq('active', true);

    // Get total tests
    const { count: totalTests } = await supabase
      .from('company_tests')
      .select('*', { count: 'exact', head: true });

    // Get tests this month
    const startOfMonth = new Date();
    startOfMonth.setDate(1);
    startOfMonth.setHours(0, 0, 0, 0);

    const { count: testsThisMonth } = await supabase
      .from('company_tests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startOfMonth.toISOString());

    // Get completed tests
    const { count: completedTests } = await supabase
      .from('company_tests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED');

    // Calculate completion rate
    const completionRate = totalTests && totalTests > 0
      ? Math.round((completedTests || 0) / totalTests * 100)
      : 0;

    // Get companies near limit (>=90%)
    const { data: stats } = await supabase
      .from('company_stats')
      .select('usage_percentage')
      .gte('usage_percentage', 90);

    const companiesNearLimit = stats?.length || 0;

    return NextResponse.json({
      total_companies: totalCompanies || 0,
      active_companies: activeCompanies || 0,
      total_tests: totalTests || 0,
      tests_this_month: testsThisMonth || 0,
      completion_rate: completionRate,
      companies_near_limit: companiesNearLimit,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
