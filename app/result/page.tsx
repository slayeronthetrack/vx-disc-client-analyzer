/**
 * Result Page - VX DISC Test
 * Página de resultado do teste DISC
 * Integrado com Supabase
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, RotateCcw, Download, User } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { discTestService } from '@/lib/services/discTestService';
import { generateDISCReport, downloadPDF } from '@/lib/services/pdfService';

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface TestResult {
  scores: DISCScores;
  completedAt: string;
  aiAnalysis?: string | null;
}

const discProfiles = {
  D: {
    name: 'Dominância',
    color: 'red',
    description: 'Você é orientado para resultados, direto e gosta de desafios. Tende a ser assertivo e focado em alcançar objetivos.',
    characteristics: [
      'Decisivo e orientado para resultados',
      'Gosta de desafios e competição',
      'Comunicação direta e objetiva',
      'Assume riscos calculados',
      'Foco em eficiência e produtividade',
    ],
  },
  I: {
    name: 'Influência',
    color: 'yellow',
    description: 'Você é entusiasta, sociável e gosta de interagir com pessoas. Tende a ser otimista e persuasivo.',
    characteristics: [
      'Comunicativo e expressivo',
      'Entusiasta e otimista',
      'Gosta de trabalhar em equipe',
      'Persuasivo e inspirador',
      'Foco em relacionamentos',
    ],
  },
  S: {
    name: 'Estabilidade',
    color: 'green',
    description: 'Você é paciente, leal e busca harmonia. Tende a ser consistente e confiável.',
    characteristics: [
      'Paciente e calmo',
      'Leal e confiável',
      'Busca harmonia e estabilidade',
      'Bom ouvinte',
      'Trabalha bem em equipe',
    ],
  },
  C: {
    name: 'Conformidade',
    color: 'blue',
    description: 'Você é analítico, preciso e focado em qualidade. Tende a ser sistemático e detalhista.',
    characteristics: [
      'Analítico e preciso',
      'Focado em qualidade',
      'Sistemático e organizado',
      'Atenção aos detalhes',
      'Baseado em fatos e dados',
    ],
  },
};

export default function ResultPage() {
  const router = useRouter();
  const { user, profile, loading: authLoading } = useAuth();
  const [result, setResult] = useState<TestResult | null>(null);
  const [dominantProfile, setDominantProfile] = useState<'D' | 'I' | 'S' | 'C'>('D');
  const [loading, setLoading] = useState(true);
  const [generatingPDF, setGeneratingPDF] = useState(false);

  useEffect(() => {
    // Redirecionar se não estiver logado
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    // Carregar resultado do Supabase
    if (user) {
      loadResult();
    }
  }, [user, authLoading, router]);

  const loadResult = async () => {
    if (!user) return;

    try {
      setLoading(true);
      const latestTest = await discTestService.getLatestTest(user.id);

      if (!latestTest) {
        router.push('/test');
        return;
      }

      setResult({
        scores: latestTest.scores as DISCScores,
        completedAt: latestTest.created_at,
        aiAnalysis: latestTest.ai_analysis || null,
      });

      setDominantProfile(latestTest.dominant_profile as 'D' | 'I' | 'S' | 'C');
    } catch (error) {
      console.error('Error loading result:', error);
      router.push('/test');
    } finally {
      setLoading(false);
    }
  };

  const handleRetakeTest = () => {
    router.push('/test');
  };

  const handleDownloadPDF = async () => {
    if (!result || !profile) return;

    try {
      setGeneratingPDF(true);

      const pdfData = {
        userProfile: {
          full_name: profile.full_name,
          email: profile.email,
          job_title: profile.job_title || undefined,
          company: profile.company || undefined,
        },
        dominantProfile,
        scores: result.scores,
        aiAnalysis: result.aiAnalysis || 'Análise não disponível',
        completedAt: result.completedAt,
      };

      const blob = await generateDISCReport(pdfData);
      const filename = `VX-DISC-${profile.full_name.replace(/\s+/g, '-')}-${new Date().toISOString().split('T')[0]}.pdf`;
      downloadPDF(blob, filename);
    } catch (error) {
      console.error('Error generating PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGeneratingPDF(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando resultado...</p>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const profileInfo = discProfiles[dominantProfile];
  const maxScore = Math.max(...Object.values(result.scores));

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 mb-6">
              <span className="text-gray-900 font-bold text-3xl">VX</span>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">
              Seu Resultado DISC
            </h1>
            <p className="text-gray-400">
              Análise completa do seu perfil comportamental
            </p>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                  <User size={32} className="text-gray-900" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                  <p className="text-gray-400">{profile.email}</p>
                  {profile.job_title && profile.company && (
                    <p className="text-gray-500 text-sm">
                      {profile.job_title} • {profile.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Dominant Profile */}
          <div className={`bg-${profileInfo.color}-500/10 border-2 border-${profileInfo.color}-500/30 rounded-2xl p-8 mb-8`}>
            <div className="text-center mb-6">
              <h2 className="text-3xl font-bold text-white mb-2">
                Perfil Predominante: {profileInfo.name}
              </h2>
              <p className="text-gray-300 text-lg">
                {profileInfo.description}
              </p>
            </div>

            <div className="bg-gray-900/50 rounded-xl p-6">
              <h3 className="text-white font-bold mb-4">Características Principais:</h3>
              <ul className="space-y-2">
                {profileInfo.characteristics.map((char, index) => (
                  <li key={index} className="flex items-start gap-3 text-gray-300">
                    <span className="text-orange-500 mt-1">✓</span>
                    <span>{char}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* AI Analysis */}
          {result.aiAnalysis && (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border border-purple-500/30 rounded-2xl p-8 mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <span className="text-white text-xl">🤖</span>
                </div>
                <h3 className="text-2xl font-bold text-white">
                  Análise Personalizada com IA
                </h3>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-6">
                <p className="text-gray-300 leading-relaxed whitespace-pre-wrap">
                  {result.aiAnalysis}
                </p>
              </div>
            </div>
          )}

          {/* DISC Scores */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Distribuição dos Pilares DISC
            </h3>

            <div className="space-y-6">
              {(Object.keys(result.scores) as Array<keyof DISCScores>).map((key) => {
                const score = result.scores[key];
                const percentage = (score / maxScore) * 100;
                const profile = discProfiles[key];

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-white font-medium">
                        {profile.name} ({key})
                      </span>
                      <span className="text-orange-500 font-bold">
                        {score} pontos
                      </span>
                    </div>
                    <div className="h-4 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-${profile.color}-500 transition-all duration-1000 ease-out`}
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row gap-4">
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 border border-gray-700 text-white font-medium rounded-xl hover:bg-gray-700 transition-all duration-200"
            >
              <Home size={20} />
              Voltar para Home
            </Link>

            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Baixar PDF
                </>
              )}
            </button>

            <button
              onClick={handleRetakeTest}
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
            >
              <RotateCcw size={20} />
              Refazer Teste
            </button>
          </div>

          {/* Completion Date */}
          <p className="text-center text-gray-500 text-sm mt-6">
            Teste concluído em {new Date(result.completedAt).toLocaleDateString('pt-BR', {
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
  );
}
