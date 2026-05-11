/**
 * Company Dashboard Page
 * Main dashboard for company admins showing statistics and employee list
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { OverviewCards } from '@/components/company/OverviewCards';
import { DISCDistributionChart } from '@/components/company/DISCDistributionChart';
import { FilterComponent } from '@/components/company/FilterComponent';
import { EmployeeTable } from '@/components/company/EmployeeTable';
import { ExportButton } from '@/components/company/ExportButton';
import { invalidateCompanyDashboardCache } from '@/lib/services/companyDashboardService';
import type { CompanyTest } from '@/types/company-test';

interface DashboardStats {
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
  discDistribution: {
    D: { count: number; percentage: number };
    I: { count: number; percentage: number };
    S: { count: number; percentage: number };
    C: { count: number; percentage: number };
  };
}

interface TestsResponse {
  tests: CompanyTest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export default function CompanyDashboardPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [statsLoading, setStatsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Employee list state
  const [tests, setTests] = useState<CompanyTest[]>([]);
  const [testsLoading, setTestsLoading] = useState(true);
  const [testsTotal, setTestsTotal] = useState(0);
  const [testsPage, setTestsPage] = useState(1);
  const [testsLimit] = useState(20);
  const [testsTotalPages, setTestsTotalPages] = useState(0);
  const [departments, setDepartments] = useState<string[]>([]);

  // Filter state
  const [filters, setFilters] = useState({
    search: '',
    dominant_profile: 'all',
    department: 'all',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard');
    }
    
    // Redirect non-company_admin users
    if (!loading && user && profile?.role !== 'company_admin') {
      router.push('/dashboard');
    }
  }, [user, loading, profile, router]);

  // Fetch dashboard stats on mount
  useEffect(() => {
    fetchStats();
  }, [fetchStats]);

  // Fetch employee tests
  const fetchTests = useCallback(async () => {
    if (!user || profile?.role !== 'company_admin') return;

    try {
      setTestsLoading(true);

      // Build query params
      const params = new URLSearchParams({
        page: testsPage.toString(),
        limit: testsLimit.toString(),
        sortBy,
        sortOrder,
      });

      if (filters.search) params.append('search', filters.search);
      if (filters.dominant_profile !== 'all') params.append('dominant_profile', filters.dominant_profile);
      if (filters.department !== 'all') params.append('department', filters.department);

      const response = await fetch(`/api/company/dashboard/tests?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch employee tests');
      }

      const data: TestsResponse = await response.json();
      setTests(data.tests);
      setTestsTotal(data.total);
      setTestsTotalPages(data.totalPages);

      // Extract unique departments
      const uniqueDepts = Array.from(
        new Set(data.tests.map(t => t.department).filter(Boolean))
      ) as string[];
      setDepartments(uniqueDepts);
    } catch (err) {
      console.error('Error fetching tests:', err);
    } finally {
      setTestsLoading(false);
    }
  }, [user, profile, testsPage, testsLimit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchTests();
  }, [fetchTests]);

  // Real-time updates with Supabase
  useEffect(() => {
    if (!user || profile?.role !== 'company_admin' || !profile.company_id) return;

    // Import Supabase client
    const setupRealtimeSubscription = async () => {
      const { createClient } = await import('@/lib/supabase/client');
      const supabase = createClient();

      // Subscribe to INSERT events on company_tests table
      const channel = supabase
        .channel('company_tests_changes')
        .on(
          'postgres_changes',
          {
            event: 'INSERT',
            schema: 'public',
            table: 'company_tests',
            filter: `company_id=eq.${profile.company_id}`,
          },
          (payload) => {
            console.log('New test completed:', payload);
            
            // Invalidate cache
            if (profile.company_id) {
              invalidateCompanyDashboardCache(profile.company_id);
            }
            
            // Show notification
            const notification = document.createElement('div');
            notification.className = 'fixed top-4 right-4 bg-green-500/10 border border-green-500/30 rounded-lg p-4 shadow-lg z-50 animate-slide-in';
            notification.innerHTML = `
              <div class="flex items-center gap-3">
                <div class="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                <p class="text-green-500 font-medium">Novo teste concluído!</p>
              </div>
            `;
            document.body.appendChild(notification);
            
            // Remove notification after 5 seconds
            setTimeout(() => {
              notification.remove();
            }, 5000);

            // Refresh stats and tests
            fetchStats();
            fetchTests();
          }
        )
        .subscribe();

      return () => {
        supabase.removeChannel(channel);
      };
    };

    const cleanup = setupRealtimeSubscription();

    return () => {
      cleanup.then(fn => fn?.());
    };
  }, [user, profile, fetchTests]);

  // Polling fallback (every 30 seconds when page is visible)
  useEffect(() => {
    if (!user || profile?.role !== 'company_admin') return;

    let intervalId: NodeJS.Timeout;

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        // Start polling when page becomes visible
        intervalId = setInterval(() => {
          fetchStats();
          fetchTests();
        }, 30000); // 30 seconds
      } else {
        // Stop polling when page is hidden
        if (intervalId) {
          clearInterval(intervalId);
        }
      }
    };

    // Initial setup
    if (document.visibilityState === 'visible') {
      intervalId = setInterval(() => {
        fetchStats();
        fetchTests();
      }, 30000);
    }

    document.addEventListener('visibilitychange', handleVisibilityChange);

    return () => {
      if (intervalId) {
        clearInterval(intervalId);
      }
      document.removeEventListener('visibilitychange', handleVisibilityChange);
    };
  }, [user, profile, fetchStats, fetchTests]);

  const fetchStats = useCallback(async () => {
    if (!user || profile?.role !== 'company_admin') return;

    try {
      setStatsLoading(true);
      setError(null);

      const response = await fetch('/api/company/dashboard/stats');
      
      if (!response.ok) {
        throw new Error('Failed to fetch dashboard stats');
      }

      const data = await response.json();
      setStats(data);
    } catch (err) {
      console.error('Error fetching stats:', err);
      setError(err instanceof Error ? err.message : 'Failed to load dashboard data');
    } finally {
      setStatsLoading(false);
    }
  }, [user, profile]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setTestsPage(1); // Reset to first page when filters change
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setTestsPage(page);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  if (!mounted || loading) {
    return <Loading />;
  }

  if (!user || profile?.role !== 'company_admin') {
    return null;
  }

  return (
    <div className="p-6 lg:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">
            Dashboard da Empresa
          </h1>
          <p className="text-gray-400">
            Visão geral dos testes DISC dos seus funcionários
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Overview Cards */}
        <div className="mb-8">
          <OverviewCards stats={stats} loading={statsLoading} />
        </div>

        {/* DISC Distribution Chart */}
        <div className="mb-8">
          <DISCDistributionChart 
            distribution={stats?.discDistribution || null} 
            loading={statsLoading} 
          />
        </div>

        {/* Employee List Placeholder */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-white">Lista de Funcionários</h3>
            <ExportButton filters={filters} />
          </div>
          
          {/* Filters */}
          <FilterComponent 
            onFilterChange={handleFilterChange}
            departments={departments}
          />

          {/* Employee Table */}
          <EmployeeTable
            tests={tests}
            total={testsTotal}
            page={testsPage}
            limit={testsLimit}
            totalPages={testsTotalPages}
            onPageChange={handlePageChange}
            onSortChange={handleSortChange}
            loading={testsLoading}
          />
        </div>
      </div>
    </div>
  );
}
