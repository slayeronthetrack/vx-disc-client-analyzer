/**
 * Invitations Management Page
 * Allows company admins to create and manage test invitations
 */

'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/lib/hooks/useAuth';
import { Loading } from '@/components/ui/Loading';
import { InvitationStats } from '@/components/invitations/InvitationStats';
import { InvitationFilters } from '@/components/invitations/InvitationFilters';
import { InvitationTable } from '@/components/invitations/InvitationTable';
import { CreateInvitationModal } from '@/components/invitations/CreateInvitationModal';
import { Plus } from 'lucide-react';
import type { TestInvitation, InvitationListResponse } from '@/types/invitation';

export default function InvitationsPage() {
  const router = useRouter();
  const { user, profile, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  // Data state
  const [invitations, setInvitations] = useState<TestInvitation[]>([]);
  const [stats, setStats] = useState<InvitationListResponse['stats'] | null>(null);
  const [invitationsLoading, setInvitationsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Pagination state
  const [page, setPage] = useState(1);
  const [limit] = useState(20);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(0);

  // Filter state
  const [filters, setFilters] = useState({
    status: 'all',
    search: '',
    department: 'all',
  });
  const [sortBy, setSortBy] = useState('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal state
  const [showCreateModal, setShowCreateModal] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login?redirect=/company/dashboard/invitations');
    }
    
    if (!loading && user && profile?.role !== 'company_admin') {
      router.push('/dashboard');
    }
  }, [user, loading, profile, router]);

  // Fetch invitations
  const fetchInvitations = useCallback(async () => {
    if (!user || profile?.role !== 'company_admin') return;

    try {
      setInvitationsLoading(true);
      setError(null);

      const params = new URLSearchParams({
        page: page.toString(),
        limit: limit.toString(),
        sortBy,
        sortOrder,
      });

      if (filters.status !== 'all') params.append('status', filters.status);
      if (filters.search) params.append('search', filters.search);
      if (filters.department !== 'all') params.append('department', filters.department);

      const response = await fetch(`/api/company/dashboard/invitations?${params}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch invitations');
      }

      const data: InvitationListResponse = await response.json();
      setInvitations(data.invitations);
      setStats(data.stats);
      setTotal(data.total);
      setTotalPages(data.totalPages);
    } catch (err) {
      console.error('Error fetching invitations:', err);
      setError(err instanceof Error ? err.message : 'Failed to load invitations');
    } finally {
      setInvitationsLoading(false);
    }
  }, [user, profile, page, limit, sortBy, sortOrder, filters]);

  useEffect(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleFilterChange = useCallback((newFilters: typeof filters) => {
    setFilters(newFilters);
    setPage(1);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
  }, []);

  const handleSortChange = useCallback((newSortBy: string, newSortOrder: 'asc' | 'desc') => {
    setSortBy(newSortBy);
    setSortOrder(newSortOrder);
  }, []);

  const handleInvitationCreated = useCallback(() => {
    setShowCreateModal(false);
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvitationDeleted = useCallback(() => {
    fetchInvitations();
  }, [fetchInvitations]);

  const handleInvitationSent = useCallback(() => {
    fetchInvitations();
  }, [fetchInvitations]);

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
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white mb-2">
              Convites para Testes
            </h1>
            <p className="text-gray-400">
              Gerencie convites enviados aos funcionários
            </p>
          </div>

          <button
            onClick={() => setShowCreateModal(true)}
            className="flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg font-medium transition-colors"
          >
            <Plus size={20} />
            Novo Convite
          </button>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-lg p-4">
            <p className="text-red-500">{error}</p>
          </div>
        )}

        {/* Stats */}
        {stats && (
          <div className="mb-6">
            <InvitationStats stats={stats} />
          </div>
        )}

        {/* Filters */}
        <div className="mb-6">
          <InvitationFilters
            onFilterChange={handleFilterChange}
            departments={[]} // TODO: Extract from invitations
          />
        </div>

        {/* Table */}
        <InvitationTable
          invitations={invitations}
          total={total}
          page={page}
          limit={limit}
          totalPages={totalPages}
          onPageChange={handlePageChange}
          onSortChange={handleSortChange}
          onInvitationDeleted={handleInvitationDeleted}
          onInvitationSent={handleInvitationSent}
          loading={invitationsLoading}
        />

        {/* Create Modal */}
        {showCreateModal && (
          <CreateInvitationModal
            onClose={() => setShowCreateModal(false)}
            onSuccess={handleInvitationCreated}
          />
        )}
      </div>
    </div>
  );
}
