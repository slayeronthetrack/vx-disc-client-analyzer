/**
 * Admin Activity API
 * GET /api/admin/activity - Get recent system activity
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

    const searchParams = request.nextUrl.searchParams;
    const limit = parseInt(searchParams.get('limit') || '10');

    const activities: any[] = [];

    // Get recent companies created
    const { data: recentCompanies } = await supabase
      .from('companies')
      .select('id, name, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (recentCompanies) {
      recentCompanies.forEach(company => {
        activities.push({
          id: `company-${company.id}`,
          type: 'company_created',
          company_name: company.name,
          description: 'Nova empresa cadastrada',
          timestamp: company.created_at,
        });
      });
    }

    // Get recent tests completed
    const { data: recentTests } = await supabase
      .from('company_tests')
      .select(`
        id,
        name,
        completed_at,
        companies (name)
      `)
      .eq('status', 'COMPLETED')
      .order('completed_at', { ascending: false })
      .limit(limit);

    if (recentTests) {
      recentTests.forEach(test => {
        const companyName = Array.isArray(test.companies) 
          ? test.companies[0]?.name 
          : (test.companies as any)?.name;
        
        activities.push({
          id: `test-${test.id}`,
          type: 'test_completed',
          company_name: companyName || 'Empresa desconhecida',
          description: `Teste completado por ${test.name}`,
          timestamp: test.completed_at,
        });
      });
    }

    // Get companies at limit
    const { data: companiesAtLimit } = await supabase
      .from('company_stats')
      .select('company_name, company_id')
      .gte('usage_percentage', 100)
      .limit(limit);

    if (companiesAtLimit) {
      companiesAtLimit.forEach(company => {
        activities.push({
          id: `limit-${company.company_id}`,
          type: 'limit_reached',
          company_name: company.company_name,
          description: 'Limite de testes atingido',
          timestamp: new Date().toISOString(), // Approximate
        });
      });
    }

    // Sort by timestamp and limit
    activities.sort((a, b) => 
      new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );

    return NextResponse.json({
      activities: activities.slice(0, limit),
    });
  } catch (error) {
    console.error('Error fetching activity:', error);
    return NextResponse.json(
      { error: 'Failed to fetch activity' },
      { status: 500 }
    );
  }
}
