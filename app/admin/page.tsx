/**
 * Admin Dashboard Page
 * Página administrativa completa com Supabase
 */

'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { 
  Users, ClipboardList, TrendingUp, Calendar, ArrowLeft, Eye, 
  Search, Filter, Download, BarChart3, PieChart, RefreshCw, X 
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { adminService, type AdminUser, type AdminStats, type TestDetail } from '@/lib/services/adminService';

const profileNames = {
  D: 'Dominância',
  I: 'Influência',
  S: 'Estabilidade',
  C: 'Conformidade',
};

const profileColors = {
  D: 'red',
  I: 'yellow',
  S: 'green',
  C: 'blue',
};

export default function AdminPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<AdminUser[]>([]);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterProfile, setFilterProfile] = useState<'ALL' | 'D' | 'I' | 'S' | 'C'>('ALL');
  const [filterStatus, setFilterStatus] = useState<'ALL' | 'COMPLETED' | 'PENDING'>('ALL');
  const [selectedUser, setSelectedUser] = useState<TestDetail | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  useEffect(() => {
    if (user) {
      loadData();
    }
  }, [user]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [usersData, statsData] = await Promise.all([
        adminService.getAllUsers(),
        adminService.getStats(),
      ]);
      setUsers(usersData);
      setFilteredUsers(usersData);
      setStats(statsData);
    } catch (error) {
      console.error('Error loading admin data:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let filtered = [...users];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(u =>
        u.full_name.toLowerCase().includes(term) ||
        u.email.toLowerCase().includes(term) ||
        u.company?.toLowerCase().includes(term) ||
        u.job_title?.toLowerCase().includes(term)
      );
    }

    if (filterProfile !== 'ALL') {
      filtered = filtered.filter(u => u.dominant_profile === filterProfile);
    }

    if (filterStatus === 'COMPLETED') {
      filtered = filtered.filter(u => u.has_completed_test);
    } else if (filterStatus === 'PENDING') {
      filtered = filtered.filter(u => !u.has_completed_test);
    }

    setFilteredUsers(filtered);
  }, [searchTerm, filterProfile, filterStatus, users]);

  const handleViewDetails = async (userId: string) => {
    const detail = await adminService.getTestDetail(userId);
    if (detail) {
      setSelectedUser(detail);
      setShowDetailModal(true);
    }
  };

  const handleExportCSV = async () => {
    try {
      const csv = await adminService.exportToCSV();
      const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `vx-disc-usuarios-${new Date().toISOString().split('T')[0]}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error('Error exporting CSV:', error);
      alert('Erro ao exportar dados');
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <ArrowLeft size={20} />
              Voltar para Home
            </Link>
            <div className="flex gap-3">
              <button
                onClick={loadData}
                className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 border border-gray-700 text-white rounded-lg hover:bg-gray-700 transition-colors"
              >
                <RefreshCw size={16} />
                Atualizar
              </button>
              <button
                onClick={handleExportCSV}
                className="inline-flex items-center gap-2 px-4 py-2 bg-green-500/10 border border-green-500/30 text-green-500 rounded-lg hover:bg-green-500/20 transition-colors"
              >
                <Download size={16} />
                Exportar CSV
              </button>
            </div>
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Dashboard Administrativo
          </h1>
          <p className="text-gray-400">
            Visão geral completa de usuários e testes DISC
          </p>
        </div>

        {/* Stats Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <Users className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total de Usuários</p>
                  <p className="text-3xl font-bold text-white">{stats.totalUsers}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <ClipboardList className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Testes Concluídos</p>
                  <p className="text-3xl font-bold text-white">{stats.completedTests}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <TrendingUp className="text-yellow-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Testes Pendentes</p>
                  <p className="text-3xl font-bold text-white">{stats.pendingTests}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Calendar className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Cadastros (7 dias)</p>
                  <p className="text-3xl font-bold text-white">{stats.recentSignups}</p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Charts Row */}
        {stats && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Profile Distribution */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <PieChart className="text-orange-500" size={24} />
                <h3 className="text-xl font-bold text-white">Distribuição de Perfis</h3>
              </div>
              <div className="space-y-4">
                {(Object.keys(stats.profileDistribution) as Array<'D' | 'I' | 'S' | 'C'>).map((key) => {
                  const count = stats.profileDistribution[key];
                  const percentage = stats.completedTests > 0 
                    ? Math.round((count / stats.completedTests) * 100) 
                    : 0;
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {profileNames[key]} ({key})
                        </span>
                        <span className="text-gray-400">
                          {count} ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${profileColors[key]}-500 transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Average Scores */}
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-3 mb-6">
                <BarChart3 className="text-orange-500" size={24} />
                <h3 className="text-xl font-bold text-white">Scores Médios</h3>
              </div>
              <div className="space-y-4">
                {(Object.keys(stats.averageScore) as Array<'D' | 'I' | 'S' | 'C'>).map((key) => {
                  const score = stats.averageScore[key];
                  const maxScore = 20;
                  const percentage = (score / maxScore) * 100;
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-white font-medium">
                          {profileNames[key]} ({key})
                        </span>
                        <span className="text-gray-400">
                          {score} pontos
                        </span>
                      </div>
                      <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className={`h-full bg-${profileColors[key]}-500 transition-all duration-500`}
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Filters */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Buscar por nome, email, empresa..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-orange-500"
              />
            </div>

            {/* Filter by Profile */}
            <select
              value={filterProfile}
              onChange={(e) => setFilterProfile(e.target.value as any)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Todos os Perfis</option>
              <option value="D">Dominância (D)</option>
              <option value="I">Influência (I)</option>
              <option value="S">Estabilidade (S)</option>
              <option value="C">Conformidade (C)</option>
            </select>

            {/* Filter by Status */}
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value as any)}
              className="px-4 py-3 bg-gray-900 border border-gray-700 rounded-lg text-white focus:outline-none focus:border-orange-500"
            >
              <option value="ALL">Todos os Status</option>
              <option value="COMPLETED">Concluídos</option>
              <option value="PENDING">Pendentes</option>
            </select>
          </div>

          <div className="mt-4 text-sm text-gray-400">
            Mostrando {filteredUsers.length} de {users.length} usuários
          </div>
        </div>

        {/* Users Table */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl overflow-hidden">
          <div className="p-6 border-b border-gray-700">
            <h2 className="text-2xl font-bold text-white">
              Usuários Cadastrados
            </h2>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-900/50">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Nome</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">E-mail</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Cargo</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Empresa</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Perfil DISC</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Data</th>
                  <th className="px-6 py-4 text-left text-sm font-semibold text-gray-400">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-700">
                {filteredUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-900/30 transition-colors">
                    <td className="px-6 py-4 text-white font-medium">{user.full_name}</td>
                    <td className="px-6 py-4 text-gray-400">{user.email}</td>
                    <td className="px-6 py-4 text-gray-400">{user.job_title || '-'}</td>
                    <td className="px-6 py-4 text-gray-400">{user.company || '-'}</td>
                    <td className="px-6 py-4">
                      {user.has_completed_test ? (
                        <span className="px-3 py-1 bg-green-500/10 border border-green-500/30 text-green-500 rounded-full text-sm font-medium">
                          Concluído
                        </span>
                      ) : (
                        <span className="px-3 py-1 bg-yellow-500/10 border border-yellow-500/30 text-yellow-500 rounded-full text-sm font-medium">
                          Pendente
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      {user.dominant_profile ? (
                        <span className="text-orange-500 font-bold">
                          {profileNames[user.dominant_profile]}
                        </span>
                      ) : (
                        <span className="text-gray-500">-</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString('pt-BR')}
                    </td>
                    <td className="px-6 py-4">
                      {user.has_completed_test && (
                        <button
                          onClick={() => handleViewDetails(user.id)}
                          className="inline-flex items-center gap-2 px-3 py-1 bg-blue-500/10 border border-blue-500/30 text-blue-500 rounded-lg hover:bg-blue-500/20 transition-colors text-sm"
                        >
                          <Eye size={16} />
                          Ver Detalhes
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Detail Modal */}
        {showDetailModal && selectedUser && (
          <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
            <div className="bg-gray-800 border border-gray-700 rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
              <div className="p-6 border-b border-gray-700 flex items-center justify-between">
                <h3 className="text-2xl font-bold text-white">
                  Detalhes do Teste - {selectedUser.user_name}
                </h3>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="text-gray-400 hover:text-white transition-colors"
                >
                  <X size={24} />
                </button>
              </div>

              <div className="p-6 space-y-6">
                {/* User Info */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">Informações do Usuário</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-gray-400 text-sm">Nome</p>
                      <p className="text-white font-medium">{selectedUser.user_name}</p>
                    </div>
                    <div>
                      <p className="text-gray-400 text-sm">Email</p>
                      <p className="text-white font-medium">{selectedUser.user_email}</p>
                    </div>
                  </div>
                </div>

                {/* Scores */}
                <div>
                  <h4 className="text-lg font-bold text-white mb-3">Scores DISC</h4>
                  <div className="space-y-3">
                    {(Object.keys(selectedUser.scores) as Array<'D' | 'I' | 'S' | 'C'>).map((key) => {
                      const score = selectedUser.scores[key];
                      const maxScore = 20;
                      const percentage = (score / maxScore) * 100;
                      
                      return (
                        <div key={key}>
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-white font-medium">
                              {profileNames[key]} ({key})
                            </span>
                            <span className="text-gray-400">
                              {score} pontos
                            </span>
                          </div>
                          <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                            <div
                              className={`h-full bg-${profileColors[key]}-500 transition-all duration-500`}
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* AI Analysis */}
                {selectedUser.ai_analysis && (
                  <div>
                    <h4 className="text-lg font-bold text-white mb-3">Análise IA</h4>
                    <div className="bg-gray-900/50 rounded-xl p-4">
                      <p className="text-gray-300 whitespace-pre-wrap text-sm">
                        {selectedUser.ai_analysis}
                      </p>
                    </div>
                  </div>
                )}

                {/* Date */}
                <div>
                  <p className="text-gray-400 text-sm">
                    Teste realizado em {new Date(selectedUser.created_at).toLocaleDateString('pt-BR', {
                      day: '2-digit',
                      month: 'long',
                      year: 'numeric',
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
