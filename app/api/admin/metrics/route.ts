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

    // Get DISC distribution
    const { data: discTests } = await supabase
      .from('company_tests')
      .select('disc_result')
      .eq('status', 'COMPLETED')
      .not('disc_result', 'is', null);

    const discCounts = { D: 0, I: 0, S: 0, C: 0 };
    discTests?.forEach((test: any) => {
      const dominant = test.disc_result?.dominant;
      if (dominant && dominant in discCounts) {
        discCounts[dominant as keyof typeof discCounts]++;
      }
    });

    const disc_distribution = [
      { name: 'Dominância', value: discCounts.D, color: '#ef4444' },
      { name: 'Influência', value: discCounts.I, color: '#f59e0b' },
      { name: 'Estabilidade', value: discCounts.S, color: '#10b981' },
      { name: 'Conformidade', value: discCounts.C, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    // Get monthly growth (last 6 months)
    const monthlyGrowth = [];
    for (let i = 5; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const monthStart = new Date(date.getFullYear(), date.getMonth(), 1);
      const monthEnd = new Date(date.getFullYear(), date.getMonth() + 1, 0, 23, 59, 59);

      const { count } = await supabase
        .from('company_tests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', monthStart.toISOString())
        .lte('created_at', monthEnd.toISOString());

      const monthName = monthStart.toLocaleDateString('pt-BR', { month: 'short' });
      monthlyGrowth.push({
        month: monthName.charAt(0).toUpperCase() + monthName.slice(1),
        tests: count || 0,
      });
    }

    return NextResponse.json({
      total_companies: totalCompanies || 0,
      active_companies: activeCompanies || 0,
      total_tests: totalTests || 0,
      tests_this_month: testsThisMonth || 0,
      completion_rate: completionRate,
      companies_near_limit: companiesNearLimit,
      disc_distribution,
      monthly_growth: monthlyGrowth,
    });
  } catch (error) {
    console.error('Error fetching admin metrics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch metrics' },
      { status: 500 }
    );
  }
}
