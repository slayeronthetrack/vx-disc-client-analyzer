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
  Award,
  Search,
  Bell,
  Sparkles,
  MoreHorizontal,
  CheckCircle2,
  Clock3,
  ShieldCheck,
  UserPlus,
  CreditCard,
  Building,
  Eye,
  BarChart3
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
  CartesianGrid
} from 'recharts';
import { Button } from '@/components/ui/Button';

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

const cardClass = 'rounded-[28px] border border-white/[0.08] bg-white/[0.035] shadow-[0_24px_80px_rgba(0,0,0,0.32)] backdrop-blur-2xl';

export default function AdminDashboardPage() {
  const [metrics, setMetrics] = useState<GlobalMetrics | null>(null);
  const [topCompanies, setTopCompanies] = useState<TopCompany[]>([]);
  const [recentActivity, setRecentActivity] = useState<RecentActivity[]>([]);
  const [loading, setLoading] = useState(true);

  // Get ranking badge for top 3 companies
  const getRankingBadge = (index: number) => {
    if (index === 0) return { icon: Trophy, color: 'text-yellow-300', bg: 'bg-yellow-300/10', border: 'border-yellow-300/20' };
    if (index === 1) return { icon: Medal, color: 'text-slate-200', bg: 'bg-slate-200/10', border: 'border-slate-200/20' };
    if (index === 2) return { icon: Award, color: 'text-vx-orange', bg: 'bg-vx-orange/10', border: 'border-vx-orange/20' };
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

  const metricCards = [
    {
      label: 'Total de Empresas',
      value: metrics?.total_companies ?? 0,
      icon: Building2,
      accent: 'from-blue-400/25 to-cyan-300/5',
      iconClass: 'text-blue-300',
      helper: '+ visão global'
    },
    {
      label: 'Empresas Ativas',
      value: metrics?.active_companies ?? 0,
      icon: Activity,
      accent: 'from-emerald-400/25 to-lime-300/5',
      iconClass: 'text-emerald-300',
      helper: 'operando agora'
    },
    {
      label: 'Total de Testes',
      value: metrics?.total_tests ?? 0,
      icon: ClipboardList,
      accent: 'from-violet-400/25 to-fuchsia-300/5',
      iconClass: 'text-violet-300',
      helper: 'base acumulada'
    },
    {
      label: 'Testes Este Mês',
      value: metrics?.tests_this_month ?? 0,
      icon: TrendingUp,
      accent: 'from-vx-orange/30 to-yellow-300/5',
      iconClass: 'text-vx-orange',
      helper: 'movimento recente'
    },
    {
      label: 'Taxa de Conclusão',
      value: `${metrics?.completion_rate ?? 0}%`,
      icon: Users,
      accent: 'from-cyan-300/25 to-sky-400/5',
      iconClass: 'text-cyan-300',
      helper: 'engajamento'
    },
    {
      label: 'Próximo ao Limite',
      value: metrics?.companies_near_limit ?? 0,
      icon: AlertCircle,
      accent: 'from-yellow-300/25 to-orange-400/5',
      iconClass: 'text-yellow-300',
      helper: 'atenção operacional'
    },
  ];

  const fallbackActivities = [
    { label: 'Nova empresa cadastrada', icon: Building, color: 'text-blue-300', bg: 'bg-blue-300/10' },
    { label: 'Novo teste concluído', icon: CheckCircle2, color: 'text-emerald-300', bg: 'bg-emerald-300/10' },
    { label: 'Novo admin criado', icon: UserPlus, color: 'text-vx-orange', bg: 'bg-vx-orange/10' },
    { label: 'Plano atualizado', icon: CreditCard, color: 'text-violet-300', bg: 'bg-violet-300/10' },
    { label: 'Empresa inativada', icon: AlertCircle, color: 'text-rose-300', bg: 'bg-rose-300/10' },
  ];

  if (loading) {
    return (
      <div className="flex min-h-[calc(100vh-76px)] items-center justify-center px-4">
        <div className={`${cardClass} w-full max-w-sm p-8 text-center`}>
          <div className="mx-auto mb-5 h-14 w-14 rounded-full border-2 border-vx-orange/20 border-t-vx-orange animate-spin" />
          <p className="text-lg font-semibold text-white">Carregando dashboard</p>
          <p className="mt-2 text-sm text-[#94A3B8]">Sincronizando métricas da plataforma VX DISC...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-[1600px] space-y-8 px-4 py-6 sm:px-6 lg:px-8">
      {/* Header */}
      <section className={`${cardClass} relative overflow-hidden p-6 sm:p-8`}>
        <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_20%,rgba(247,151,30,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.08),transparent_42%)]" />
        <div className="relative flex flex-col gap-6 xl:flex-row xl:items-center xl:justify-between">
          <div className="max-w-3xl">
            <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-vx-orange/20 bg-vx-orange/10 px-3 py-1.5 text-xs font-medium uppercase tracking-[0.22em] text-vx-orange">
              <Sparkles size={14} />
              Painel Administrativo
            </div>
            <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-5xl">
              Bem-vindo de volta, Super Admin!
            </h1>
            <p className="mt-4 max-w-2xl text-base leading-7 text-[#94A3B8]">
              Aqui está um panorama geral da plataforma VX DISC com métricas, empresas, testes e atividades recentes em tempo real.
            </p>
          </div>

          <div className="flex w-full flex-col gap-3 xl:w-auto xl:min-w-[520px]">
            <div className="flex flex-col gap-3 sm:flex-row">
              <div className="flex min-h-[48px] flex-1 items-center gap-3 rounded-2xl border border-white/[0.08] bg-[#0B0F14]/60 px-4 text-sm text-[#94A3B8] shadow-inner shadow-black/20">
                <Search size={18} />
                <span>Buscar empresas, responsáveis ou relatórios...</span>
              </div>
              <button
                type="button"
                aria-label="Notificações"
                className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0B0F14]/60 text-[#94A3B8] transition hover:border-vx-orange/30 hover:text-white"
              >
                <Bell size={18} />
              </button>
              <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-vx-orange to-yellow-300 text-sm font-bold text-[#0B0F14] shadow-glow">
                VX
              </div>
            </div>
            <Button href="/admin/companies/new" size="lg" className="w-full justify-center xl:w-auto xl:self-end">
              <Plus size={20} />
              Nova Empresa
            </Button>
          </div>
        </div>
      </section>

      {/* Metrics Cards */}
      <section className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-6">
        {metricCards.map((metric) => {
          const Icon = metric.icon;
          return (
            <div
              key={metric.label}
              className={`${cardClass} group relative overflow-hidden p-5 transition duration-300 hover:-translate-y-1 hover:border-vx-orange/25 hover:bg-white/[0.055]`}
            >
              <div className={`absolute inset-x-0 top-0 h-24 bg-gradient-to-b ${metric.accent} opacity-80`} />
              <div className="relative">
                <div className="mb-6 flex items-center justify-between">
                  <div className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-white/[0.08] bg-[#0B0F14]/60">
                    <Icon className={metric.iconClass} size={22} />
                  </div>
                  <span className="rounded-full border border-white/[0.08] bg-white/[0.04] px-2.5 py-1 text-xs font-medium text-[#94A3B8]">
                    {metric.helper}
                  </span>
                </div>
                <p className="text-sm text-[#94A3B8]">{metric.label}</p>
                <p className="mt-2 text-3xl font-semibold tracking-tight text-white">{metric.value}</p>
              </div>
            </div>
          );
        })}
      </section>

      <section className="grid grid-cols-1 gap-6 xl:grid-cols-[1.3fr_0.7fr]">
        <div className="space-y-6">
          {/* Monthly Growth Chart */}
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-vx-orange">Performance</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Testes dos últimos meses</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">Evolução de volume de testes concluídos na plataforma.</p>
              </div>
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-300/20 bg-emerald-300/10 px-3 py-1.5 text-xs font-medium text-emerald-200">
                <TrendingUp size={14} />
                Atualizado
              </span>
            </div>
            {metrics?.monthly_growth && metrics.monthly_growth.length > 0 ? (
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={metrics.monthly_growth} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.07)" vertical={false} />
                  <XAxis
                    dataKey="month"
                    stroke="#94A3B8"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '12px' }}
                  />
                  <YAxis
                    stroke="#94A3B8"
                    tickLine={false}
                    axisLine={false}
                    style={{ fontSize: '12px' }}
                  />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F14',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '16px',
                      color: '#F9FAFB',
                      boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
                    }}
                    labelStyle={{ color: '#F7971E' }}
                  />
                  <Line
                    type="monotone"
                    dataKey="tests"
                    stroke="#F7971E"
                    strokeWidth={4}
                    dot={{ fill: '#0B0F14', stroke: '#F7971E', strokeWidth: 2, r: 5 }}
                    activeDot={{ r: 8, fill: '#F7971E', stroke: '#F9FAFB' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[320px] items-center justify-center rounded-3xl border border-dashed border-white/[0.10] bg-white/[0.02] text-center">
                <div>
                  <Clock3 className="mx-auto mb-3 text-[#94A3B8]" size={28} />
                  <p className="font-medium text-white">Sem dados de crescimento ainda</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">Os gráficos aparecerão quando houver testes registrados.</p>
                </div>
              </div>
            )}
          </div>

          {/* Companies Table */}
          <div className={`${cardClass} overflow-hidden`}>
            <div className="flex flex-col gap-4 border-b border-white/[0.08] p-5 sm:flex-row sm:items-center sm:justify-between sm:p-6">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-vx-orange">Empresas</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Empresas recentes em destaque</h2>
                <p className="mt-1 text-sm text-[#94A3B8]">Ranking operacional por volume de testes.</p>
              </div>
              <Link
                href="/admin/companies"
                className="inline-flex items-center gap-2 rounded-2xl border border-white/[0.08] bg-white/[0.04] px-4 py-2.5 text-sm font-medium text-white transition hover:border-vx-orange/30 hover:text-vx-orange"
              >
                Ver todas
                <ArrowRight size={16} />
              </Link>
            </div>

            <div className="overflow-x-auto">
              <div className="min-w-[720px]">
                <div className="grid grid-cols-[80px_1.7fr_1fr_1fr_120px] gap-4 border-b border-white/[0.08] px-6 py-3 text-xs font-medium uppercase tracking-[0.16em] text-[#94A3B8]">
                  <span>Rank</span>
                  <span>Empresa</span>
                  <span>Responsável</span>
                  <span>Plano</span>
                  <span className="text-right">Ações</span>
                </div>
                {topCompanies.length === 0 ? (
                  <div className="flex min-h-[220px] items-center justify-center px-6 py-10 text-center">
                    <div>
                      <Building2 className="mx-auto mb-3 text-[#94A3B8]" size={32} />
                      <p className="font-medium text-white">Nenhuma empresa cadastrada ainda</p>
                      <p className="mt-1 text-sm text-[#94A3B8]">Crie a primeira empresa para começar a acompanhar indicadores.</p>
                      <Button href="/admin/companies/new" size="sm" className="mt-4">
                        <Plus size={16} />
                        Nova Empresa
                      </Button>
                    </div>
                  </div>
                ) : (
                  topCompanies.map((company, index) => {
                    const rankBadge = getRankingBadge(index);
                    const RankIcon = rankBadge?.icon;

                    return (
                      <Link
                        key={company.id}
                        href={`/admin/companies/${company.id}`}
                        className="group grid grid-cols-[80px_1.7fr_1fr_1fr_120px] items-center gap-4 border-b border-white/[0.06] px-6 py-4 transition hover:bg-white/[0.04] last:border-b-0"
                      >
                        <div>
                          {rankBadge && RankIcon ? (
                            <div className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl border ${rankBadge.border} ${rankBadge.bg}`}>
                              <RankIcon className={rankBadge.color} size={18} />
                            </div>
                          ) : (
                            <div className="inline-flex h-10 w-10 items-center justify-center rounded-2xl border border-white/[0.08] bg-white/[0.04] text-sm font-semibold text-[#94A3B8]">
                              {index + 1}
                            </div>
                          )}
                        </div>
                        <div className="min-w-0">
                          <p className="truncate font-medium text-white transition group-hover:text-vx-orange">{company.name}</p>
                          <p className="mt-1 truncate text-sm text-[#94A3B8]">/{company.slug}</p>
                        </div>
                        <div>
                          <p className="text-sm font-medium text-white">Responsável</p>
                          <p className="text-xs text-[#94A3B8]">Não informado</p>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="rounded-full border border-vx-orange/20 bg-vx-orange/10 px-2.5 py-1 text-xs font-medium text-vx-orange">Professional</span>
                          <div className="text-right">
                            <p className="font-semibold text-white">{company.total_tests}</p>
                            <p className="text-xs text-[#94A3B8]">testes</p>
                          </div>
                        </div>
                        <div className="flex justify-end">
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-white/[0.08] bg-white/[0.04] px-3 py-1.5 text-xs font-medium text-[#94A3B8] transition group-hover:border-vx-orange/30 group-hover:text-vx-orange">
                            <Eye size={14} />
                            Ver
                          </span>
                        </div>
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="space-y-6">
          {/* DISC Distribution Chart */}
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-5">
              <p className="text-xs font-medium uppercase tracking-[0.22em] text-vx-orange">DISC Insights</p>
              <h2 className="mt-2 text-2xl font-semibold text-white">Distribuição DISC</h2>
              <p className="mt-1 text-sm text-[#94A3B8]">Mapa comportamental agregado dos testes.</p>
            </div>
            {metrics?.disc_distribution && metrics.disc_distribution.length > 0 ? (
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={metrics.disc_distribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={104}
                    innerRadius={58}
                    fill="#8884d8"
                    dataKey="value"
                    stroke="rgba(11,15,20,0.8)"
                    strokeWidth={4}
                  >
                    {metrics.disc_distribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: '#0B0F14',
                      border: '1px solid rgba(255,255,255,0.10)',
                      borderRadius: '16px',
                      color: '#F9FAFB',
                      boxShadow: '0 24px 80px rgba(0,0,0,0.35)'
                    }}
                  />
                  <Legend wrapperStyle={{ color: '#94A3B8', fontSize: '12px' }} iconType="circle" />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex h-[300px] items-center justify-center rounded-3xl border border-dashed border-white/[0.10] bg-white/[0.02] text-center">
                <div>
                  <ShieldCheck className="mx-auto mb-3 text-[#94A3B8]" size={28} />
                  <p className="font-medium text-white">Sem distribuição DISC</p>
                  <p className="mt-1 text-sm text-[#94A3B8]">A visualização será exibida após novos resultados.</p>
                </div>
              </div>
            )}
          </div>

          {/* Recent Activity */}
          <div className={`${cardClass} p-5 sm:p-6`}>
            <div className="mb-6 flex items-center justify-between">
              <div>
                <p className="text-xs font-medium uppercase tracking-[0.22em] text-vx-orange">Timeline</p>
                <h2 className="mt-2 text-2xl font-semibold text-white">Atividades recentes</h2>
              </div>
              <MoreHorizontal className="text-[#94A3B8]" size={22} />
            </div>

            <div className="space-y-4">
              {recentActivity.length === 0 ? (
                <div className="space-y-3">
                  {fallbackActivities.map((activity) => {
                    const Icon = activity.icon;
                    return (
                      <div key={activity.label} className="flex items-center gap-3 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-3 opacity-70">
                        <span className={`inline-flex h-10 w-10 items-center justify-center rounded-2xl ${activity.bg}`}>
                          <Icon className={activity.color} size={18} />
                        </span>
                        <div>
                          <p className="text-sm font-medium text-white">{activity.label}</p>
                          <p className="text-xs text-[#94A3B8]">Aguardando eventos reais</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                recentActivity.map((activity) => (
                  <div key={activity.id} className="relative flex gap-4 rounded-2xl border border-white/[0.06] bg-white/[0.025] p-4">
                    <div className="absolute bottom-[-16px] left-[35px] top-[56px] w-px bg-white/[0.08] last:hidden" />
                    <div className={`h-11 w-11 flex-shrink-0 rounded-2xl flex items-center justify-center border border-white/[0.06]
                      ${activity.type === 'company_created' ? 'bg-blue-300/10' : ''}
                      ${activity.type === 'test_completed' ? 'bg-emerald-300/10' : ''}
                      ${activity.type === 'limit_reached' ? 'bg-yellow-300/10' : ''}
                    `}>
                      {activity.type === 'company_created' && <Building2 className="text-blue-300" size={19} />}
                      {activity.type === 'test_completed' && <ClipboardList className="text-emerald-300" size={19} />}
                      {activity.type === 'limit_reached' && <AlertCircle className="text-yellow-300" size={19} />}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium text-white">{activity.company_name}</p>
                      <p className="mt-1 text-sm leading-6 text-[#94A3B8]">{activity.description}</p>
                      <p className="mt-2 text-xs text-[#64748B]">
                        {new Date(activity.timestamp).toLocaleString('pt-BR')}
                      </p>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Quick Actions */}
      <section className="grid grid-cols-1 gap-4 md:grid-cols-3">
        {[
          {
            title: 'Gerenciar Empresas',
            description: 'Ver todas as empresas cadastradas',
            href: '/admin/companies',
            icon: Building2,
          },
          {
            title: 'Analytics',
            description: 'Ver métricas detalhadas',
            href: '/admin/analytics',
            icon: BarChart3,
          },
          {
            title: 'Configurações',
            description: 'Ajustar preferências do sistema',
            href: '/admin/settings',
            icon: AlertCircle,
          },
        ].map((action) => {
          const Icon = action.icon;
          return (
            <Link
              key={action.href}
              href={action.href}
              className={`${cardClass} group flex items-center justify-between p-5 transition duration-300 hover:-translate-y-1 hover:border-vx-orange/25 hover:bg-white/[0.055]`}
            >
              <div className="flex items-center gap-4">
                <span className="inline-flex h-12 w-12 items-center justify-center rounded-2xl border border-vx-orange/20 bg-vx-orange/10 text-vx-orange">
                  <Icon size={20} />
                </span>
                <div>
                  <h3 className="font-semibold text-white">{action.title}</h3>
                  <p className="mt-1 text-sm text-[#94A3B8]">{action.description}</p>
                </div>
              </div>
              <ArrowRight className="text-[#94A3B8] transition group-hover:translate-x-1 group-hover:text-vx-orange" size={22} />
            </Link>
          );
        })}
      </section>
    </div>
  );
}
