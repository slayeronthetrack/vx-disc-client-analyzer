'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import {
  ClipboardList,
  ArrowRight,
  History,
  Sparkles,
  User,
  Eye,
  TrendingUp,
  Target,
  BarChart3,
} from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { discTestService } from '@/lib/services/discTestService';
import { generateDISCReport, downloadPDF } from '@/lib/services/pdfService';
import TestHistoryCard from '@/components/ui/TestHistoryCard';
import type { TestHistorySummary } from '@/types/history';

const TEST_OPTIONS = [
  {
    count: 20,
    label: 'Rápido',
    time: '~5 min',
    desc: 'Perguntas padrão',
    icon: '⚡',
    color: 'from-green-500/20 to-emerald-500/20 border-green-500/30',
    badge: 'bg-green-500/20 text-green-400',
  },
  {
    count: 40,
    label: 'Médio',
    time: '~10 min',
    desc: 'Análise mais detalhada',
    icon: '📊',
    color: 'from-blue-500/20 to-cyan-500/20 border-blue-500/30',
    badge: 'bg-blue-500/20 text-blue-400',
  },
  {
    count: 60,
    label: 'Completo',
    time: '~15 min',
    desc: 'Análise profunda com Valores',
    icon: '🎯',
    color: 'from-purple-500/20 to-violet-500/20 border-purple-500/30',
    badge: 'bg-purple-500/20 text-purple-400',
  },
  {
    count: 80,
    label: 'Máximo',
    time: '~20 min',
    desc: 'Análise completa com Valores e Tipos Psicológicos',
    icon: '💎',
    color: 'from-orange-500/20 to-yellow-500/20 border-orange-500/30',
    badge: 'bg-orange-500/20 text-orange-400',
  },
];

export default function DashboardPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<TestHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }
    if (user) {
      loadTests();
    }
  }, [user, authLoading, router]);

  const loadTests = async () => {
    if (!user) return;
    try {
      setLoading(true);
      const data = await discTestService.getUserTestsSummary(user.id);
      setTests(data.slice(0, 6));
    } catch (err) {
      console.error('Error loading tests:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewResult = (testId: string) => {
    router.push(`/result?id=${testId}`);
  };

  const handleDownloadPDF = async (testId: string) => {
    if (!profile) return;
    try {
      setDownloadingId(testId);
      const test = await discTestService.getTestById(testId, user!.id);
      if (!test) return;
      const pdfData = {
        userProfile: {
          full_name: profile.full_name,
          email: profile.email,
          job_title: profile.job_title || undefined,
          company: profile.company || undefined,
        },
        dominantProfile: test.dominant_profile,
        scores: test.scores,
        aiAnalysis: test.integrated_analysis || test.ai_analysis || 'Análise não disponível',
        completedAt: test.created_at,
      };
      const blob = await generateDISCReport(pdfData);
      const date = new Date(test.created_at).toISOString().split('T')[0];
      const filename = `VX-DISC-${profile.full_name.replace(/\s+/g, '-')}-${date}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  if (!user) return null;

  const latestTest = tests[0];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <div className="container mx-auto px-4 py-12">
        <div className="max-w-6xl mx-auto">
          {/* ── HEADER: Boas-vindas ─────────────────────────────── */}
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 mb-12">
            <div className="flex items-center gap-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                <User className="text-gray-900" size={32} />
              </div>
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">
                  Olá, {profile?.full_name?.split(' ')[0] || 'usuário'}
                </h1>
                <p className="text-gray-400 mt-1">
                  {tests.length > 0
                    ? `${tests.length} ${tests.length === 1 ? 'teste realizado' : 'testes realizados'}`
                    : 'Pronto para descobrir seu perfil comportamental?'}
                </p>
              </div>
            </div>
            <Link
              href="/history"
              className="inline-flex items-center gap-2 px-5 py-3 bg-white/5 backdrop-blur border border-white/10 text-white font-medium rounded-xl hover:bg-white/10 transition-all"
            >
              <History size={18} />
              Histórico Completo
            </Link>
          </div>

          {/* ── ÚLTIMO RESULTADO (destaque) ────────────────────── */}
          {latestTest && (
            <div className="bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border border-orange-500/30 rounded-2xl p-6 mb-12">
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-4">
                  <div className="w-14 h-14 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                    <Sparkles className="text-gray-900" size={24} />
                  </div>
                  <div>
                    <p className="text-gray-400 text-sm">Último teste</p>
                    <p className="text-white font-bold text-lg">
                      Perfil {latestTest.dominant_profile} • {latestTest.question_count} perguntas
                    </p>
                    <p className="text-gray-500 text-sm">
                      {new Date(latestTest.created_at).toLocaleDateString('pt-BR', {
                        day: '2-digit', month: 'long', year: 'numeric',
                      })}
                    </p>
                  </div>
                </div>
                <Link
                  href={`/result?id=${latestTest.id}`}
                  className="inline-flex items-center gap-2 px-5 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all flex-shrink-0"
                >
                  <Eye size={18} />
                  Ver Resultado
                </Link>
              </div>
            </div>
          )}

          {/* ── NOVO TESTE ─────────────────────────────────────── */}
          <div className="mb-12">
            <div className="flex items-center gap-3 mb-6">
              <div className="w-10 h-10 rounded-lg bg-orange-500/10 flex items-center justify-center">
                <ClipboardList className="text-orange-500" size={20} />
              </div>
              <h2 className="text-2xl font-bold text-white">Novo Teste</h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {TEST_OPTIONS.map((opt) => (
                <Link
                  key={opt.count}
                  href={`/test?questions=${opt.count}`}
                  className={`group relative bg-gradient-to-br ${opt.color} border rounded-xl p-6 hover:scale-[1.03] transition-all duration-200`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-2xl">{opt.icon}</span>
                    <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${opt.badge}`}>
                      {opt.time}
                    </span>
                  </div>
                  <h3 className="text-white font-bold text-lg mb-1">{opt.count} perguntas</h3>
                  <p className="text-gray-400 text-sm mb-4">{opt.label}</p>
                  <p className="text-gray-500 text-xs leading-relaxed">{opt.desc}</p>
                  <div className="absolute bottom-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity">
                    <ArrowRight className="text-orange-500" size={20} />
                  </div>
                </Link>
              ))}
            </div>
          </div>

          {/* ── HISTÓRICO RECENTE ──────────────────────────────── */}
          <div>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <BarChart3 className="text-purple-500" size={20} />
                </div>
                <h2 className="text-2xl font-bold text-white">Histórico Recente</h2>
              </div>
              {tests.length > 0 && (
                <Link
                  href="/history"
                  className="text-orange-500 hover:text-orange-400 text-sm font-medium transition-colors"
                >
                  Ver todos →
                </Link>
              )}
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-orange-500 mx-auto mb-4" />
                <p className="text-gray-400">Carregando histórico...</p>
              </div>
            ) : tests.length === 0 ? (
              <div className="bg-white/5 backdrop-blur border border-white/10 rounded-2xl p-12 text-center">
                <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
                  <ClipboardList className="text-gray-600" size={40} />
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">
                  Nenhum teste encontrado
                </h3>
                <p className="text-gray-400 mb-6 max-w-md mx-auto">
                  Você ainda não realizou nenhum teste. Escolha uma das opções acima e descubra seu perfil comportamental!
                </p>
                <Link
                  href="/test"
                  className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
                >
                  <ClipboardList size={24} />
                  Fazer Primeiro Teste
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tests.slice(0, 4).map((test) => (
                  <TestHistoryCard
                    key={test.id}
                    id={test.id}
                    createdAt={test.created_at}
                    questionCount={test.question_count}
                    dominantProfile={test.dominant_profile}
                    dominantValue={test.dominant_value}
                    psychologicalCode={test.psychological_code}
                    testObjective={test.test_objective}
                    onViewResult={handleViewResult}
                    onDownloadPDF={handleDownloadPDF}
                    isDownloading={downloadingId === test.id}
                  />
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
