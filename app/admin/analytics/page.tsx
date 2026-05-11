/**
 * Analytics Page
 * Advanced analytics with filters and comparisons
 */

'use client';

import { useEffect, useState } from 'react';
import { 
  Calendar,
  TrendingUp,
  Users,
  Clock,
  BarChart3,
  PieChart as PieChartIcon,
  Filter,
  Download
} from 'lucide-react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  Area,
  AreaChart
} from 'recharts';

interface AnalyticsData {
  period_stats: {
    total_tests: number;
    total_companies: number;
    avg_completion_time: number;
    completion_rate: number;
  };
  disc_trends: Array<{
    date: string;
    D: number;
    I: number;
    S: number;
    C: number;
  }>;
  company_comparison: Array<{
    company_name: string;
    total_tests: number;
    avg_time: number;
    completion_rate: number;
  }>;
  profile_distribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
  daily_activity: Array<{
    date: string;
    tests: number;
  }>;
}

type PeriodFilter = '7d' | '30d' | '90d' | '1y' | 'all';

const PERIOD_LABELS: Record<PeriodFilter, string> = {
  '7d': 'Últimos 7 dias',
  '30d': 'Últimos 30 dias',
  '90d': 'Últimos 90 dias',
  '1y': 'Último ano',
  'all': 'Todo período'
};

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState<PeriodFilter>('30d');

  useEffect(() => {
    loadAnalytics();
  }, [period]);

  const loadAnalytics = async () => {
    try {
      setLoading(true);
      const { apiGet } = await import('@/lib/utils/apiClient');
      
      const response = await apiGet(`/api/admin/analytics?period=${period}`);
      if (response.ok) {
        const analyticsData = await response.json();
        setData(analyticsData);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  const exportData = () => {
    if (!data) return;
    
    const csvContent = [
      ['Métrica', 'Valor'],
      ['Total de Testes', data.period_stats.total_tests],
      ['Total de Empresas', data.period_stats.total_companies],
      ['Tempo Médio (min)', data.period_stats.avg_completion_time],
      ['Taxa de Conclusão (%)', data.period_stats.completion_rate],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `analytics-${period}-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando analytics...</p>
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
              Analytics Avançado
            </h1>
            <p className="text-gray-400">
              Análises detalhadas e comparações de desempenho
            </p>
          </div>
          <button
            onClick={exportData}
            className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition-colors border border-gray-700"
          >
            <Download size={20} />
            Exportar Dados
          </button>
        </div>

        {/* Period Filter */}
        <div className="flex items-center gap-3 bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-4">
          <Filter className="text-gray-400" size={20} />
          <span className="text-gray-400 font-medium">Período:</span>
          <div className="flex gap-2">
            {(Object.keys(PERIOD_LABELS) as PeriodFilter[]).map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  period === p
                    ? 'bg-orange-500 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                {PERIOD_LABELS[p]}
              </button>
            ))}
          </div>
        </div>
      </div>

      {data && (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <BarChart3 className="text-blue-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total de Testes</p>
                  <p className="text-3xl font-bold text-white">{data.period_stats.total_tests}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Users className="text-green-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Empresas Ativas</p>
                  <p className="text-3xl font-bold text-white">{data.period_stats.total_companies}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Clock className="text-purple-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Tempo Médio</p>
                  <p className="text-3xl font-bold text-white">{data.period_stats.avg_completion_time}min</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-lg bg-orange-500/10 flex items-center justify-center">
                  <TrendingUp className="text-orange-500" size={24} />
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Taxa de Conclusão</p>
                  <p className="text-3xl font-bold text-white">{data.period_stats.completion_rate}%</p>
                </div>
              </div>
            </div>
          </div>

          {/* Charts Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            {/* Daily Activity */}
            {data.daily_activity && data.daily_activity.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Atividade Diária</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={data.daily_activity}>
                    <defs>
                      <linearGradient id="colorTests" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#f97316" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#f97316" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                    <XAxis 
                      dataKey="date" 
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
                    <Area 
                      type="monotone" 
                      dataKey="tests" 
                      stroke="#f97316" 
                      strokeWidth={2}
                      fillOpacity={1}
                      fill="url(#colorTests)"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            )}

            {/* DISC Distribution */}
            {data.profile_distribution && data.profile_distribution.length > 0 && (
              <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
                <h2 className="text-2xl font-bold text-white mb-6">Distribuição de Perfis</h2>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={data.profile_distribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {data.profile_distribution.map((entry, index) => (
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
          </div>

          {/* DISC Trends Over Time */}
          {data.disc_trends && data.disc_trends.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6">Tendências de Perfis DISC</h2>
              <ResponsiveContainer width="100%" height={350}>
                <LineChart data={data.disc_trends}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="date" 
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
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Line type="monotone" dataKey="D" stroke="#ef4444" strokeWidth={2} name="Dominância" />
                  <Line type="monotone" dataKey="I" stroke="#f59e0b" strokeWidth={2} name="Influência" />
                  <Line type="monotone" dataKey="S" stroke="#10b981" strokeWidth={2} name="Estabilidade" />
                  <Line type="monotone" dataKey="C" stroke="#3b82f6" strokeWidth={2} name="Conformidade" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          )}

          {/* Company Comparison */}
          {data.company_comparison && data.company_comparison.length > 0 && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-xl p-6">
              <h2 className="text-2xl font-bold text-white mb-6">Comparação entre Empresas</h2>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={data.company_comparison}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                  <XAxis 
                    dataKey="company_name" 
                    stroke="#9ca3af"
                    style={{ fontSize: '12px' }}
                    angle={-45}
                    textAnchor="end"
                    height={100}
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
                  <Legend wrapperStyle={{ color: '#9ca3af' }} />
                  <Bar dataKey="total_tests" fill="#f97316" name="Total de Testes" />
                  <Bar dataKey="completion_rate" fill="#10b981" name="Taxa de Conclusão (%)" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </>
      )}
    </div>
  );
}
