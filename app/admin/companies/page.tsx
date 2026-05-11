/**
 * Companies List Page
 * List all companies with search, filters, and pagination
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Plus, 
  Search, 
  Filter,
  Building2,
  Users,
  AlertCircle,
  CheckCircle,
  XCircle,
  Eye,
  Edit,
  Trash2
} from 'lucide-react';
import type { Company, CompanyStats, CompanyListResponse } from '@/types/company';

export default function CompaniesListPage() {
  const [data, setData] = useState<CompanyListResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterActive, setFilterActive] = useState<'all' | 'active' | 'inactive'>('all');
  const [filterLimit, setFilterLimit] = useState<'all' | 'near' | 'at'>('all');
  const [sortBy, setSortBy] = useState<'name' | 'created_at' | 'total_tests'>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [page, setPage] = useState(1);

  useEffect(() => {
    loadCompanies();
  }, [searchTerm, filterActive, filterLimit, sortBy, sortOrder, page]);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      const params = new URLSearchParams({
        page: page.toString(),
        limit: '20',
        sortBy,
        sortOrder,
      });

      if (searchTerm) params.append('search', searchTerm);
      if (filterActive !== 'all') params.append('active', filterActive === 'active' ? 'true' : 'false');
      if (filterLimit === 'near') params.append('nearLimit', 'true');
      if (filterLimit === 'at') params.append('atLimit', 'true');

      const response = await apiGet(`/api/companies?${params}`);
      if (response.ok) {
        const companiesData = await response.json();
        setData(companiesData);
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, name: string) => {
    if (!confirm(`Tem certeza que deseja deletar a empresa "${name}"? Esta ação não pode ser desfeita.`)) {
      return;
    }

    try {
      const { apiDelete } = await import('@/lib/utils/apiClient');
      const response = await apiDelete(`/api/companies/${id}`);

      if (response.ok) {
        alert('Empresa deletada com sucesso!');
        loadCompanies();
      } else {
        const error = await response.json();
        alert(`Erro ao deletar empresa: ${error.error}`);
      }
    } catch (error) {
      console.error('Error deleting company:', error);
      alert('Erro ao deletar empresa');
    }
  };

  const getCompanyStats = (companyId: string): CompanyStats | undefined => {
    return data?.stats.find(s => s.company_id === companyId);
  };

  if (loading && !data) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando empresas...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Empresas
            </h1>
            <p className="text-gray-400">
              Gerencie todas as empresas cadastradas no sistema
            </p>
          </div>
          <Link
            href="/admin/companies/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <Plus size={20} />
            Nova Empresa
          </Link>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
            <input
              type="text"
              placeholder="Buscar por nome, slug ou contato..."
              value={searchTerm}
              onChange={(e) => {
                setSearchTerm(e.target.value);
                setPage(1);
              }}
              className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
            />
          </div>

          {/* Filter by Active */}
          <select
            value={filterActive}
            onChange={(e) => {
              setFilterActive(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todos os Status</option>
            <option value="active">Apenas Ativas</option>
            <option value="inactive">Apenas Inativas</option>
          </select>

          {/* Filter by Limit */}
          <select
            value={filterLimit}
            onChange={(e) => {
              setFilterLimit(e.target.value as any);
              setPage(1);
            }}
            className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
          >
            <option value="all">Todos os Limites</option>
            <option value="near">Próximo ao Limite (≥90%)</option>
            <option value="at">No Limite (≥100%)</option>
          </select>
        </div>

        {/* Sort */}
        <div className="flex items-center gap-4 mt-4">
          <span className="text-gray-400 text-sm">Ordenar por:</span>
          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="created_at">Data de Criação</option>
            <option value="name">Nome</option>
            <option value="total_tests">Total de Testes</option>
          </select>
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as any)}
            className="px-3 py-2 bg-gray-900 border border-gray-700 rounded-lg text-white text-sm focus:outline-none focus:border-orange-500"
          >
            <option value="desc">Decrescente</option>
            <option value="asc">Crescente</option>
          </select>
        </div>

        {data && (
          <div className="mt-4 text-sm text-gray-400">
            Mostrando {data.companies.length} de {data.total} empresas
          </div>
        )}
      </div>

      {/* Companies Grid */}
      {data && data.companies.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-12 text-center">
          <Building2 className="mx-auto text-gray-600 mb-4" size={48} />
          <h3 className="text-xl font-bold text-white mb-2">Nenhuma empresa encontrada</h3>
          <p className="text-gray-400 mb-6">
            {searchTerm || filterActive !== 'all' || filterLimit !== 'all'
              ? 'Tente ajustar os filtros de busca'
              : 'Comece criando sua primeira empresa'}
          </p>
          <Link
            href="/admin/companies/new"
            className="inline-flex items-center gap-2 px-6 py-3 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors font-semibold"
          >
            <Plus size={20} />
            Criar Primeira Empresa
          </Link>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
            {data?.companies.map((company) => {
              const stats = getCompanyStats(company.id);
              const usagePercentage = stats?.usage_percentage || 0;
              const isNearLimit = usagePercentage >= 90;
              const isAtLimit = usagePercentage >= 100;

              return (
                <div
                  key={company.id}
                  className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 hover:border-orange-500 transition-colors"
                >
                  {/* Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      {company.logo_url ? (
                        <img
                          src={company.logo_url}
                          alt={company.name}
                          className="w-12 h-12 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                          <Building2 className="text-orange-500" size={24} />
                        </div>
                      )}
                      <div>
                        <h3 className="text-white font-bold text-lg">{company.name}</h3>
                        <p className="text-gray-400 text-sm">/{company.slug}</p>
                      </div>
                    </div>
                    {company.active ? (
                      <CheckCircle className="text-green-500" size={20} />
                    ) : (
                      <XCircle className="text-red-500" size={20} />
                    )}
                  </div>

                  {/* Stats */}
                  {stats && (
                    <div className="space-y-3 mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-gray-400 text-sm">Testes Realizados</span>
                        <span className="text-white font-bold">
                          {stats.total_tests} / {company.max_tests === 0 ? '∞' : company.max_tests}
                        </span>
                      </div>
                      
                      {/* Usage Bar */}
                      <div>
                        <div className="h-2 bg-gray-900 rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all duration-500 ${
                              isAtLimit ? 'bg-red-500' : isNearLimit ? 'bg-yellow-500' : 'bg-green-500'
                            }`}
                            style={{ width: `${Math.min(usagePercentage, 100)}%` }}
                          />
                        </div>
                        <div className="flex items-center justify-between mt-1">
                          <span className="text-xs text-gray-500">Uso do limite</span>
                          <span className={`text-xs font-medium ${
                            isAtLimit ? 'text-red-500' : isNearLimit ? 'text-yellow-500' : 'text-green-500'
                          }`}>
                            {usagePercentage.toFixed(0)}%
                          </span>
                        </div>
                      </div>

                      {stats.predominant_profile && (
                        <div className="flex items-center justify-between">
                          <span className="text-gray-400 text-sm">Perfil Predominante</span>
                          <span className="text-orange-500 font-bold">{stats.predominant_profile}</span>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Warning */}
                  {isAtLimit && (
                    <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/30 rounded-lg mb-4">
                      <AlertCircle className="text-red-500 flex-shrink-0" size={16} />
                      <span className="text-red-500 text-sm">Limite atingido</span>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    <Link
                      href={`/admin/companies/${company.id}`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors text-sm font-medium"
                    >
                      <Eye size={16} />
                      Ver
                    </Link>
                    <Link
                      href={`/admin/companies/${company.id}/edit`}
                      className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2 bg-orange-500/10 border border-orange-500/30 text-orange-500 rounded-lg hover:bg-orange-500/20 transition-colors text-sm font-medium"
                    >
                      <Edit size={16} />
                      Editar
                    </Link>
                    <button
                      onClick={() => handleDelete(company.id, company.name)}
                      className="px-4 py-2 bg-red-500/10 border border-red-500/30 text-red-500 rounded-lg hover:bg-red-500/20 transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Pagination */}
          {data && data.totalPages > 1 && (
            <div className="flex items-center justify-center gap-2 mt-8">
              <button
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page === 1}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Anterior
              </button>
              <span className="text-gray-400">
                Página {page} de {data.totalPages}
              </span>
              <button
                onClick={() => setPage(p => Math.min(data.totalPages, p + 1))}
                disabled={page === data.totalPages}
                className="px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Próxima
              </button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
