/**
 * Admin Dashboard Page
 * Company Management System - Main Dashboard
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { 
  Building2, 
  Users, 
  ClipboardList, 
  TrendingUp, 
  AlertCircle,
  Plus,
  ArrowRight,
  Activity,
  Trophy,
  Medal,
  Award
} from 'lucide-react';
import { 
  PieChart, 
  Pie, 
  Cell, 
  ResponsiveContainer, 
  Legend, 
  Tooltip,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  BarChart,
  Bar
} from 'recharts';

interface GlobalMetrics {
  total_companies: number;
  active_companies: number;
  total_tests: number;
  tests_this_month: number;
  completion_rate: number;
  companies_near_limit: number;
  disc_distribution?: Array<{ name: string; value: number; color: string }>;
  monthly_growth?: Array<{ month: string; tests: number }>;
}

interface TopCompany {
  id: string;
  name: string;
  slug: string;
  total_tests: number;
  last_test_date: string | null;
}

interface RecentActivity {
  id: string;
  type: 'company_created' | 'test_completed' | 'limit_reached';
  company_name: string;
  description: string;
  timestamp: string;
}

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Get ranking badge for top 3 companies
  const getRankingBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-400', bg: 'bg-yellow-400/10' };
    if (index === 1) return { icon: Medal, color: 'text-gray-300', bg: 'bg-gray-300/10' };
    if (index === 2) return { icon: Award, color: 'text-orange-400', bg: 'bg-orange-400/10' };
    return null;
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');

      // Fetch global metrics
      const metricsResponse = await apiGet('/api/admin/metrics');
      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json();
        setMetrics(metricsData);
      }

      // Fetch top companies
      const companiesResponse = await apiGet('/api/companies?sortBy=total_tests&sortOrder=desc&limit=10');
      if (companiesResponse.ok) {
        const companiesData = await companiesResponse.json();
        setTopCompanies(companiesData.companies || []);
      }

      // Fetch recent activity
      const activityResponse = await apiGet('/api/admin/activity?limit=10');
      if (activityResponse.ok) {
        const activityData = await activityResponse.json();
        setRecentActivity(activityData.activities || []);
      }
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando dashboard...</p>
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
              Dashboard
            </h1>
            <p className="text-gray-400">
              Visão geral do sistema de gestão de empresas
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

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6 mb-8">
          {/* Total Companies */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                <Building2 className="text-blue-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Empresas</p>
                <p className="text-3xl font-bold text-white">{metrics.total_companies}</p>
              </div>
            </div>
          </div>

          {/* Active Companies */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                <Activity className="text-green-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Empresas Ativas</p>
                <p className="text-3xl font-bold text-white">{metrics.active_companies}</p>
              </div>
            </div>
          </div>

          {/* Total Tests */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                <ClipboardList className="text-purple-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Total de Testes</p>
                <p className="text-3xl font-bold text-white">{metrics.total_tests}</p>
              </div>
            </div>
          </div>

          {/* Tests This Month */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <TrendingUp className="text-orange-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Testes Este Mês</p>
                <p className="text-3xl font-bold text-white">{metrics.tests_this_month}</p>
              </div>
            </div>
          </div>

          {/* Completion Rate */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-cyan-500/10 flex items-center justify-center">
                <Users className="text-cyan-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Taxa de Conclusão</p>
                <p className="text-3xl font-bold text-white">{metrics.completion_rate}%</p>
              </div>
            </div>
          </div>

          {/* Companies Near Limit */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                <AlertCircle className="text-yellow-500" size={24} />
              </div>
              <div>
                <p className="text-gray-400 text-sm">Próximo ao Limite</p>
                <p className="text-3xl font-bold text-white">{metrics.companies_near_limit}</p>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* DISC Distribution Chart */}
        {metrics?.disc_distribution && metrics.disc_distribution.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Distribuição DISC</h2>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={metrics.disc_distribution}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                  outerRadius={100}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {metrics.disc_distribution.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Legend 
                  wrapperStyle={{ color: '#9ca3af' }}
                  iconType="circle"
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Monthly Growth Chart */}
        {metrics?.monthly_growth && metrics.monthly_growth.length > 0 && (
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
            <h2 className="text-2xl font-bold text-white mb-6">Crescimento Mensal</h2>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={metrics.monthly_growth}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis 
                  dataKey="month" 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis 
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: '#1f2937', 
                    border: '1px solid #374151',
                    borderRadius: '8px',
                    color: '#fff'
                  }}
                />
                <Line 
                  type="monotone" 
                  dataKey="tests" 
                  stroke="#f97316" 
                  strokeWidth={3}
                  dot={{ fill: '#f97316', r: 5 }}
                  activeDot={{ r: 7 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        {/* Top 10 Companies */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Top 10 Empresas</h2>
            <Link
              href="/admin/companies"
              className="text-orange-500 hover:text-orange-400 transition-colors text-sm font-medium"
            >
              Ver todas →
            </Link>
          </div>

          <div className="space-y-3">
            {topCompanies.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma empresa cadastrada ainda
              </p>
            ) : (
              topCompanies.map((company, index) => {
                const rankBadge = getRankingBadge(index);
                const RankIcon = rankBadge?.icon;
                
                return (
                  <Link
                    key={company.id}
                    href={`/admin/companies/${company.id}`}
                    className="flex items-center justify-between p-4 bg-gray-900/50 rounded-lg hover:bg-gray-900/70 transition-all hover:scale-[1.02] group"
                  >
                    <div className="flex items-center gap-4">
                      {rankBadge && RankIcon ? (
                        <div className={`w-10 h-10 rounded-full ${rankBadge.bg} flex items-center justify-center`}>
                          <RankIcon className={rankBadge.color} size={20} />
                        </div>
                      ) : (
                        <div className="w-10 h-10 rounded-full bg-orange-500/10 flex items-center justify-center text-orange-500 font-bold">
                          {index + 1}
                        </div>
                      )}
                      <div>
                        <p className="text-white font-medium group-hover:text-orange-500 transition-colors">
                          {company.name}
                        </p>
                        <p className="text-gray-400 text-sm">/{company.slug}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-white font-bold text-lg">{company.total_tests}</p>
                      <p className="text-gray-400 text-sm">testes</p>
                    </div>
                  </Link>
                );
              })
            )}
          </div>
        </div>

        {/* Recent Activity */}
        <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-bold text-white">Atividade Recente</h2>
          </div>

          <div className="space-y-4">
            {recentActivity.length === 0 ? (
              <p className="text-gray-500 text-center py-8">
                Nenhuma atividade recente
              </p>
            ) : (
              recentActivity.map((activity) => (
                <div
                  key={activity.id}
                  className="flex items-start gap-4 p-4 bg-gray-900/50 rounded-lg"
                >
                  <div className={`
                    w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0
                    ${activity.type === 'company_created' ? 'bg-blue-500/10' : ''}
                    ${activity.type === 'test_completed' ? 'bg-green-500/10' : ''}
                    ${activity.type === 'limit_reached' ? 'bg-yellow-500/10' : ''}
                  `}>
                    {activity.type === 'company_created' && <Building2 className="text-blue-500" size={20} />}
                    {activity.type === 'test_completed' && <ClipboardList className="text-green-500" size={20} />}
                    {activity.type === 'limit_reached' && <AlertCircle className="text-yellow-500" size={20} />}
                  </div>
                  <div className="flex-1">
                    <p className="text-white font-medium">{activity.company_name}</p>
                    <p className="text-gray-400 text-sm">{activity.description}</p>
                    <p className="text-gray-500 text-xs mt-1">
                      {new Date(activity.timestamp).toLocaleString('pt-BR')}
                    </p>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <Link
          href="/admin/companies"
          className="flex items-center justify-between p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-orange-500 transition-colors group"
        >
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Gerenciar Empresas</h3>
            <p className="text-gray-400 text-sm">Ver todas as empresas cadastradas</p>
          </div>
          <ArrowRight className="text-gray-400 group-hover:text-orange-500 transition-colors" size={24} />
        </Link>

        <Link
          href="/admin/analytics"
          className="flex items-center justify-between p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-orange-500 transition-colors group"
        >
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Analytics</h3>
            <p className="text-gray-400 text-sm">Ver métricas detalhadas</p>
          </div>
          <ArrowRight className="text-gray-400 group-hover:text-orange-500 transition-colors" size={24} />
        </Link>

        <Link
          href="/admin/settings"
          className="flex items-center justify-between p-6 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl hover:border-orange-500 transition-colors group"
        >
          <div>
            <h3 className="text-white font-bold text-lg mb-1">Configurações</h3>
            <p className="text-gray-400 text-sm">Ajustar preferências do sistema</p>
          </div>
          <ArrowRight className="text-gray-400 group-hover:text-orange-500 transition-colors" size={24} />
        </Link>
      </div>
    </div>
  );
}
