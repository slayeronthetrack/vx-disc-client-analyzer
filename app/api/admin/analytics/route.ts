/**
 * Admin Analytics API
 * GET /api/admin/analytics - Get advanced analytics data
 */

import { NextRequest, NextResponse } from 'next/server';
import { checkAdminAccess } from '@/lib/utils/apiAuth';

export async function GET(request: NextRequest) {
  try {
    // Check admin access
    const authCheck = await checkAdminAccess();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase } = authCheck;
    const { searchParams } = new URL(request.url);
    const period = searchParams.get('period') || '30d';

    // Calculate date range based on period
    const now = new Date();
    let startDate = new Date();
    
    switch (period) {
      case '7d':
        startDate.setDate(now.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(now.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(now.getDate() - 90);
        break;
      case '1y':
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      case 'all':
        startDate = new Date('2020-01-01'); // Far back date
        break;
      default:
        startDate.setDate(now.getDate() - 30);
    }

    // Get period stats
    const { count: totalTests } = await supabase
      .from('company_tests')
      .select('*', { count: 'exact', head: true })
      .gte('created_at', startDate.toISOString());

    const { count: completedTests } = await supabase
      .from('company_tests')
      .select('*', { count: 'exact', head: true })
      .eq('status', 'COMPLETED')
      .gte('created_at', startDate.toISOString());

    const { data: companiesData } = await supabase
      .from('company_tests')
      .select('company_id')
      .gte('created_at', startDate.toISOString());

    const uniqueCompanies = new Set(companiesData?.map(t => t.company_id) || []).size;

    // Calculate average completion time (mock for now - would need actual timing data)
    const avgCompletionTime = 12; // minutes

    const completionRate = totalTests && totalTests > 0
      ? Math.round((completedTests || 0) / totalTests * 100)
      : 0;

    // Get DISC distribution
    const { data: discTests } = await supabase
      .from('company_tests')
      .select('disc_result')
      .eq('status', 'COMPLETED')
      .not('disc_result', 'is', null)
      .gte('created_at', startDate.toISOString());

    const discCounts = { D: 0, I: 0, S: 0, C: 0 };
    discTests?.forEach((test: any) => {
      const dominant = test.disc_result?.dominant;
      if (dominant && dominant in discCounts) {
        discCounts[dominant as keyof typeof discCounts]++;
      }
    });

    const profile_distribution = [
      { name: 'Dominância', value: discCounts.D, color: '#ef4444' },
      { name: 'Influência', value: discCounts.I, color: '#f59e0b' },
      { name: 'Estabilidade', value: discCounts.S, color: '#10b981' },
      { name: 'Conformidade', value: discCounts.C, color: '#3b82f6' },
    ].filter(item => item.value > 0);

    // Get daily activity
    const daysToShow = period === '7d' ? 7 : period === '30d' ? 30 : period === '90d' ? 30 : 12;
    const daily_activity = [];
    
    for (let i = daysToShow - 1; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const dayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
      const dayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate(), 23, 59, 59);

      const { count } = await supabase
        .from('company_tests')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', dayStart.toISOString())
        .lte('created_at', dayEnd.toISOString());

      const dateLabel = period === '90d' || period === '1y'
        ? dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
        : dayStart.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      daily_activity.push({
        date: dateLabel,
        tests: count || 0,
      });
    }

    // Get DISC trends over time
    const trendsPoints = period === '7d' ? 7 : period === '30d' ? 10 : 12;
    const disc_trends = [];

    for (let i = trendsPoints - 1; i >= 0; i--) {
      const date = new Date();
      const daysBack = Math.floor((i / trendsPoints) * (period === '7d' ? 7 : period === '30d' ? 30 : 90));
      date.setDate(date.getDate() - daysBack);
      
      const periodStart = new Date(date);
      periodStart.setDate(periodStart.getDate() - Math.floor((period === '7d' ? 7 : period === '30d' ? 30 : 90) / trendsPoints));

      const { data: periodTests } = await supabase
        .from('company_tests')
        .select('disc_result')
        .eq('status', 'COMPLETED')
        .not('disc_result', 'is', null)
        .gte('created_at', periodStart.toISOString())
        .lte('created_at', date.toISOString());

      const counts = { D: 0, I: 0, S: 0, C: 0 };
      periodTests?.forEach((test: any) => {
        const dominant = test.disc_result?.dominant;
        if (dominant && dominant in counts) {
          counts[dominant as keyof typeof counts]++;
        }
      });

      const dateLabel = date.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' });
      disc_trends.push({
        date: dateLabel,
        ...counts,
      });
    }

    // Get company comparison (top 10)
    const { data: companies } = await supabase
      .from('companies')
      .select(`
        id,
        name,
        company_tests (
          id,
          status,
          created_at
        )
      `)
      .limit(10);

    const company_comparison = companies?.map((company: any) => {
      const tests = company.company_tests || [];
      const testsInPeriod = tests.filter((t: any) => 
        new Date(t.created_at) >= startDate
      );
      const completedInPeriod = testsInPeriod.filter((t: any) => t.status === 'COMPLETED');
      
      return {
        company_name: company.name.length > 15 
          ? company.name.substring(0, 15) + '...' 
          : company.name,
        total_tests: testsInPeriod.length,
        avg_time: 12, // Mock data
        completion_rate: testsInPeriod.length > 0
          ? Math.round((completedInPeriod.length / testsInPeriod.length) * 100)
          : 0,
      };
    })
    .filter((c: any) => c.total_tests > 0)
    .sort((a: any, b: any) => b.total_tests - a.total_tests)
    .slice(0, 10) || [];

    return NextResponse.json({
      period_stats: {
        total_tests: totalTests || 0,
        total_companies: uniqueCompanies,
        avg_completion_time: avgCompletionTime,
        completion_rate: completionRate,
      },
      disc_trends: disc_trends.reverse(),
      company_comparison,
      profile_distribution,
      daily_activity,
    });
  } catch (error) {
    console.error('Error fetching analytics:', error);
    return NextResponse.json(
      { error: 'Failed to fetch analytics' },
      { status: 500 }
    );
  }
}
