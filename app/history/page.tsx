/**
 * Test History Page
 * Página de histórico de testes DISC
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { History, ArrowLeft, Filter, FileText, Download } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { discTestService } from '@/lib/services/discTestService';
import { generateDISCReport, downloadPDF } from '@/lib/services/pdfService';
import TestHistoryCard from '@/components/ui/TestHistoryCard';
import type { DISCType, DISCTest } from '@/types/database';
import type { TestHistorySummary } from '@/types/history';

type FilterType = 'all' | 'last7days' | 'last30days' | 'byProfile';

export default function HistoryPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [tests, setTests] = useState<TestHistorySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState<FilterType>('all');
  const [profileFilter, setProfileFilter] = useState<DISCType | ''>('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user) {
      loadTests();
    }
  }, [user, authLoading, filter, profileFilter]);

  const loadTests = async () => {
    if (!user) return;

    try {
      setLoading(true);
      setError(null);

      let data: TestHistorySummary[];

      switch (filter) {
        case 'last7days':
          data = await discTestService.getUserTestsByDateRange(user.id, 7);
          break;
        case 'last30days':
          data = await discTestService.getUserTestsByDateRange(user.id, 30);
          break;
        case 'byProfile':
          if (profileFilter) {
            data = await discTestService.getUserTestsByProfile(user.id, profileFilter);
          } else {
            data = await discTestService.getUserTestsSummary(user.id);
          }
          break;
        default:
          data = await discTestService.getUserTestsSummary(user.id);
      }

      setTests(data);
    } catch (err: any) {
      console.error('Error loading tests:', err);
      setError('Erro ao carregar histórico de testes');
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

      // Buscar dados completos do teste
      const test = await discTestService.getTestById(testId, user!.id);
      
      if (!test) {
        alert('Teste não encontrado');
        return;
      }

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
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setDownloadingId(null);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando histórico...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-6xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/dashboard"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Voltar para Dashboard
            </Link>
            
            <div className="flex items-center gap-4 mb-4">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <History className="text-gray-900" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-white">
                  Histórico de Testes
                </h1>
                <p className="text-gray-400">
                  Acompanhe sua evolução comportamental ao longo do tempo
                </p>
              </div>
            </div>
          </div>

          {/* Filtros */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <Filter className="text-orange-500" size={20} />
              <h3 className="text-white font-semibold">Filtros</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Filtro por Data */}
              <button
                onClick={() => {
                  setFilter('all');
                  setProfileFilter('');
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  filter === 'all'
                    ? 'bg-orange-500 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Todos
              </button>

              <button
                onClick={() => {
                  setFilter('last7days');
                  setProfileFilter('');
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  filter === 'last7days'
                    ? 'bg-orange-500 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Últimos 7 dias
              </button>

              <button
                onClick={() => {
                  setFilter('last30days');
                  setProfileFilter('');
                }}
                className={`px-4 py-3 rounded-lg font-medium transition-all ${
                  filter === 'last30days'
                    ? 'bg-orange-500 text-gray-900'
                    : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                }`}
              >
                Últimos 30 dias
              </button>

              {/* Filtro por Perfil */}
              <select
                value={profileFilter}
                onChange={(e) => {
                  setFilter('byProfile');
                  setProfileFilter(e.target.value as DISCType | '');
                }}
                className="px-4 py-3 bg-gray-800 text-gray-400 rounded-lg font-medium hover:bg-gray-700 transition-all focus:outline-none focus:ring-2 focus:ring-orange-500"
              >
                <option value="">Por Perfil</option>
                <option value="D">Dominância (D)</option>
                <option value="I">Influência (I)</option>
                <option value="S">Estabilidade (S)</option>
                <option value="C">Conformidade (C)</option>
              </select>
            </div>
          </div>

          {/* Lista de Testes */}
          {error && (
            <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-8">
              <p className="text-red-500">{error}</p>
            </div>
          )}

          {tests.length === 0 ? (
            // Estado Vazio
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-12 text-center">
              <div className="w-20 h-20 rounded-full bg-gray-800 flex items-center justify-center mx-auto mb-6">
                <FileText className="text-gray-600" size={40} />
              </div>
              <h3 className="text-2xl font-bold text-white mb-2">
                Nenhum teste encontrado
              </h3>
              <p className="text-gray-400 mb-6 max-w-md mx-auto">
                {filter === 'all'
                  ? 'Você ainda não realizou nenhum teste. Comece agora e descubra seu perfil comportamental!'
                  : 'Nenhum teste encontrado com os filtros selecionados. Tente ajustar os filtros.'}
              </p>
              <Link
                href="/test"
                className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
              >
                <FileText size={24} />
                Fazer Novo Teste
              </Link>
            </div>
          ) : (
            <>
              {/* Contador */}
              <div className="mb-6">
                <p className="text-gray-400">
                  {tests.length} {tests.length === 1 ? 'teste encontrado' : 'testes encontrados'}
                </p>
              </div>

              {/* Grid de Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {tests.map((test) => (
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
            </>
          )}
        </div>
      </div>
    </div>
  );
}
