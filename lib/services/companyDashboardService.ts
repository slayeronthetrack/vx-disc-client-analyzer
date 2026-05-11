/**
 * Company Dashboard Service
 * Business logic for company admin dashboard statistics and data
 */

import type { SupabaseClient } from '@supabase/supabase-js';
import { cache, CacheKeys, CacheTTL } from '@/lib/utils/cache';

export interface CompanyDashboardStats {
  totalTests: number;
  uniqueEmployees: number;
  averageScores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  completionRate: number;
  testsThisMonth: number;
  discDistribution: Array<{
    profile: 'D' | 'I' | 'S' | 'C';
    count: number;
    percentage: number;
  }>;
}

/**
 * Get comprehensive dashboard statistics for a company
 * 
 * Calculates:
 * - Total tests completed
 * - Unique employees tested (distinct employee_id)
 * - Average DISC scores across all tests
 * - Completion rate (completed vs total)
 * - Tests completed this month
 * - DISC profile distribution
 * 
 * @param companyId - Company UUID
 * @param supabase - Authenticated Supabase client (RLS enforced)
 * @returns CompanyDashboardStats object
 */
export async function getCompanyDashboardStats(
  companyId: string,
  supabase: SupabaseClient
): Promise<CompanyDashboardStats> {
  // Check cache first
  const cacheKey = CacheKeys.companyStats(companyId);
  const cachedStats = cache.get<CompanyDashboardStats>(cacheKey);

  if (cachedStats) {
    console.log('[getCompanyDashboardStats] Cache hit for company:', companyId);
    return cachedStats;
  }

  console.log('[getCompanyDashboardStats] Cache miss, fetching from database');

  // Fetch all completed tests for the company (RLS automatically filters by company_id)
  const { data: tests, error } = await supabase
    .from('company_tests')
    .select('id, employee_id, disc_result, status, created_at')
    .eq('company_id', companyId)
    .eq('status', 'COMPLETED');

  if (error) {
    console.error('[getCompanyDashboardStats] Error fetching tests:', error);
    throw new Error(`Failed to fetch company tests: ${error.message}`);
  }

  const completedTests = tests || [];
  const totalTests = completedTests.length;

  // Calculate unique employees (distinct employee_id)
  const uniqueEmployeeIds = new Set(
    completedTests
      .map(t => t.employee_id)
      .filter((id): id is string => id !== null)
  );
  const uniqueEmployees = uniqueEmployeeIds.size;

  // Calculate average DISC scores
  let sumD = 0, sumI = 0, sumS = 0, sumC = 0;
  const discCounts = { D: 0, I: 0, S: 0, C: 0 };

  completedTests.forEach(test => {
    if (test.disc_result && test.disc_result.scores) {
      sumD += test.disc_result.scores.D || 0;
      sumI += test.disc_result.scores.I || 0;
      sumS += test.disc_result.scores.S || 0;
      sumC += test.disc_result.scores.C || 0;

      // Count dominant profiles for distribution
      const dominant = test.disc_result.dominant;
      if (dominant && dominant in discCounts) {
        discCounts[dominant as keyof typeof discCounts]++;
      }
    }
  });

  const averageScores = totalTests > 0
    ? {
        D: Math.round((sumD / totalTests) * 100) / 100,
        I: Math.round((sumI / totalTests) * 100) / 100,
        S: Math.round((sumS / totalTests) * 100) / 100,
        C: Math.round((sumC / totalTests) * 100) / 100,
      }
    : { D: 0, I: 0, S: 0, C: 0 };

  // Calculate DISC distribution percentages
  const discDistribution = Object.entries(discCounts).map(([profile, count]) => ({
    profile: profile as 'D' | 'I' | 'S' | 'C',
    count,
    percentage: totalTests > 0 ? Math.round((count / totalTests) * 100 * 10) / 10 : 0,
  }));

  // Calculate tests this month
  const now = new Date();
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
  const testsThisMonth = completedTests.filter(test => 
    new Date(test.created_at) >= startOfMonth
  ).length;

  // Calculate completion rate (for now, assume all fetched tests are completed)
  // In future, this could compare completed vs invited/started tests
  const completionRate = 100; // All fetched tests are completed

  const stats: CompanyDashboardStats = {
    totalTests,
    uniqueEmployees,
    averageScores,
    completionRate,
    testsThisMonth,
    discDistribution,
  };

  // Cache the results for 5 minutes
  cache.set(cacheKey, stats, CacheTTL.STATS);

  return stats;
}

/**
 * Invalidate company dashboard cache
 * Call this when new tests are completed
 */
export function invalidateCompanyDashboardCache(companyId: string): void {
  cache.invalidatePattern(CacheKeys.companyPattern(companyId));
  console.log('[invalidateCompanyDashboardCache] Cache invalidated for company:', companyId);
}
