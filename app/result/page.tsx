/**
 * Result Page - VX DISC Test
 * Página de resultado do teste DISC
 * Integrado com Supabase
 */

'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Home, RotateCcw, Download, User, Sparkles, MessageCircle } from 'lucide-react';
import { useAuth } from '@/lib/hooks/useAuth';
import { discTestService } from '@/lib/services/discTestService';
import { generateDISCReport, downloadPDF } from '@/lib/services/pdfService';
import { aiAnalysisService } from '@/lib/services/aiAnalysisService';
import DISCPieChart from '@/components/ui/DISCPieChart';
import FloatingChatWidget from '@/components/FloatingChatWidget';
import type { ValueProfile, PsychologicalProfile } from '@/types/integrated-profile';
import { VALUE_NAMES, VALUE_DESCRIPTIONS, PSYCHOLOGICAL_NAMES, PSYCHOLOGICAL_DESCRIPTIONS } from '@/types/integrated-profile';

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
  const [error, setError] = useState<string | null>(null);
  const [generatingPDF, setGeneratingPDF] = useState(false);
  const [generatingAnalysis, setGeneratingAnalysis] = useState(false);
  const [personalizedAnalysis, setPersonalizedAnalysis] = useState<string | null>(null);
  const [showChat, setShowChat] = useState(false);
  // Novos estados para perfil integrado
  const [valueProfile, setValueProfile] = useState<ValueProfile | null>(null);
  const [psychologicalProfile, setPsychologicalProfile] = useState<PsychologicalProfile | null>(null);

  useEffect(() => {
    console.log('[Result] useEffect triggered', { authLoading, user: !!user });
    
    // Timeout de segurança para evitar loading infinito
    const timeout = setTimeout(() => {
      if (loading) {
        console.error('[Result] Timeout ao carregar resultado');
        setError('Tempo esgotado ao carregar resultado');
        setLoading(false);
      }
    }, 10000); // 10 segundos

    // Redirecionar se não estiver logado
    if (!authLoading && !user) {
      console.log('[Result] No user, redirecting to login');
      clearTimeout(timeout);
      router.push('/login');
      return;
    }

    // Carregar resultado do Supabase
    if (!authLoading && user) {
      console.log('[Result] User authenticated, loading result');
      loadResult().finally(() => {
        console.log('[Result] Load result finished');
        clearTimeout(timeout);
      });
    }

    return () => {
      console.log('[Result] Cleanup timeout');
      clearTimeout(timeout);
    };
  }, [user, authLoading]);

  const loadResult = async () => {
    if (!user) {
      console.log('[Result] No user, skipping load');
      return;
    }

    try {
      console.log('[Result] Loading test for user:', user.id);
      setLoading(true);
      setError(null);
      
      const latestTest = await discTestService.getLatestTest(user.id);
      console.log('[Result] Latest test:', latestTest ? 'Found' : 'Not found');

      if (!latestTest) {
        console.log('[Result] No test found, redirecting to /test');
        setError('Nenhum teste encontrado');
        setTimeout(() => router.push('/test'), 2000);
        return;
      }

      console.log('[Result] Setting result state');
      setResult({
        scores: latestTest.scores as DISCScores,
        completedAt: latestTest.created_at,
        aiAnalysis: latestTest.integrated_analysis || latestTest.ai_analysis || null,
      });

      setDominantProfile(latestTest.dominant_profile as 'D' | 'I' | 'S' | 'C');
      
      // Carregar perfil de valores se disponível
      if (latestTest.value_scores) {
        setValueProfile({
          dominant: latestTest.dominant_values?.[0] as any,
          secondary: latestTest.dominant_values?.slice(1) as any[] || [],
          scores: latestTest.value_scores as any,
          percentages: latestTest.value_percentages as any,
        });
        console.log('[Result] Value profile loaded');
      }
      
      // Carregar perfil psicológico se disponível
      if (latestTest.psychological_profile) {
        setPsychologicalProfile(latestTest.psychological_profile as any);
        console.log('[Result] Psychological profile loaded');
      }
      
      // Carregar nome do usuário para personalização
      if (profile?.full_name) {
        setPersonalizedAnalysis(prev => prev); // Trigger re-render with user name
      }
      
      console.log('[Result] Result loaded successfully');
    } catch (error: any) {
      console.error('[Result] Error loading result:', error);
      setError(error.message || 'Erro ao carregar resultado');
    } finally {
      console.log('[Result] Setting loading to false');
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
        aiAnalysis: personalizedAnalysis || result.aiAnalysis || 'Análise não disponível',
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

  const handleGeneratePersonalizedAnalysis = async () => {
    if (!result || !profile) return;

    try {
      setGeneratingAnalysis(true);

      const analysis = await aiAnalysisService.generatePersonalizedAnalysis({
        scores: result.scores,
        dominantProfile,
        userProfile: {
          full_name: profile.full_name,
          job_title: profile.job_title || undefined,
          company: profile.company || undefined,
          test_objective: profile.test_objective || undefined,
        },
      });

      setPersonalizedAnalysis(analysis);
    } catch (error) {
      console.error('Error generating personalized analysis:', error);
      alert('Erro ao gerar análise personalizada. Tente novamente.');
    } finally {
      setGeneratingAnalysis(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400 mb-2">
            {authLoading ? 'Verificando autenticação...' : 'Carregando resultado...'}
          </p>
          <p className="text-gray-600 text-sm">
            Se demorar muito, você será redirecionado automaticamente
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="bg-red-500/10 border border-red-500/30 rounded-2xl p-8 mb-6">
            <p className="text-red-500 text-lg mb-4">{error}</p>
            <p className="text-gray-400 text-sm">
              Não foi possível carregar seu resultado. Tente fazer o teste novamente.
            </p>
          </div>
          <div className="flex gap-4">
            <Link
              href="/test"
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
            >
              Fazer Teste
            </Link>
            <Link
              href="/"
              className="flex-1 inline-flex items-center justify-center gap-3 px-6 py-4 bg-gray-800 border border-gray-700 text-white font-medium rounded-xl hover:bg-gray-700 transition-all duration-200"
            >
              Voltar para Home
            </Link>
          </div>
        </div>
      </div>
    );
  }

  if (!result) {
    return null;
  }

  const profileInfo = discProfiles[dominantProfile];

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

          {/* Header do Resultado - Badge do Perfil */}
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 rounded-full mb-4">
              <span className="text-gray-900 font-bold text-lg">
                Seu Perfil: {profileInfo.name} ({dominantProfile})
              </span>
            </div>
            <p className="text-gray-400 text-sm max-w-2xl mx-auto">
              Análise completa baseada em {Object.values(result.scores).reduce((a, b) => a + b, 0)} respostas
            </p>
          </div>

          {/* User Info */}
          {profile && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-6 mb-8">
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center flex-shrink-0">
                  <User size={32} className="text-gray-900" />
                </div>
                <div className="flex-1">
                  <h3 className="text-xl font-bold text-white">{profile.full_name}</h3>
                  <p className="text-gray-400">{profile.email}</p>
                  {profile.job_title && profile.company && (
                    <p className="text-gray-500 text-sm mt-1">
                      {profile.job_title} • {profile.company}
                    </p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Scores Visuais - Barras */}
          <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6">
              Distribuição DISC
            </h3>

            <div className="space-y-6">
              {(Object.keys(result.scores) as Array<keyof DISCScores>).map((key) => {
                const score = result.scores[key];
                const total = Object.values(result.scores).reduce((a, b) => a + b, 0);
                const percentage = (score / total) * 100;
                const profile = discProfiles[key];
                const isDominant = dominantProfile === key;

                // Cores fixas para cada perfil
                const colors = {
                  D: { bg: '#ef4444', text: 'text-red-500' },
                  I: { bg: '#eab308', text: 'text-yellow-500' },
                  S: { bg: '#22c55e', text: 'text-green-500' },
                  C: { bg: '#3b82f6', text: 'text-blue-500' },
                };

                return (
                  <div key={key}>
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: colors[key].bg }}
                        />
                        <span className="text-white font-semibold">
                          {profile.name} ({key})
                        </span>
                        {isDominant && (
                          <span className="text-orange-500 text-sm">★ Dominante</span>
                        )}
                      </div>
                      <span className="text-orange-500 font-bold">
                        {score} pts ({percentage.toFixed(0)}%)
                      </span>
                    </div>
                    <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                      <div
                        className="h-full transition-all duration-1000 ease-out"
                        style={{ 
                          width: `${percentage}%`,
                          backgroundColor: colors[key].bg
                        }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Dominant Profile - Card Destacado */}
          <div className="bg-gradient-to-br from-orange-500/20 to-yellow-500/20 border-2 border-orange-500/50 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-yellow-500 flex items-center justify-center">
                <span className="text-gray-900 font-bold text-2xl">{dominantProfile}</span>
              </div>
              <div>
                <h2 className="text-2xl font-bold text-white">
                  Perfil {profileInfo.name}
                </h2>
                <p className="text-orange-300 text-sm">Seu perfil dominante</p>
              </div>
            </div>

            <p className="text-gray-200 text-lg leading-relaxed max-w-3xl">
              {profileInfo.description}
            </p>

            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
              {profileInfo.characteristics.slice(0, 4).map((char, index) => (
                <div key={index} className="flex items-start gap-3 bg-gray-900/50 rounded-xl p-4">
                  <span className="text-orange-500 mt-1 flex-shrink-0">✓</span>
                  <span className="text-gray-300 text-sm">{char}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Seus Motivadores - Teoria dos Valores */}
          {valueProfile && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Seus Motivadores Internos
              </h3>

              <div className="space-y-6">
                {Object.entries(valueProfile.scores).map(([key, score]) => {
                  const valueKey = key as keyof typeof valueProfile.scores;
                  const percentage = valueProfile.percentages[valueKey];
                  const isDominant = key === valueProfile.dominant;
                  
                  return (
                    <div key={key}>
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <div className="w-3 h-3 rounded-full bg-orange-500" />
                          <span className="text-white font-semibold">
                            {VALUE_NAMES[valueKey]}
                          </span>
                          {isDominant && (
                            <span className="text-orange-500 text-sm">★ Dominante</span>
                          )}
                        </div>
                        <span className="text-orange-500 font-bold">
                          {score} pts ({percentage}%)
                        </span>
                      </div>
                      <div className="h-3 bg-gray-900 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-orange-500 transition-all duration-1000 ease-out"
                          style={{ width: `${percentage}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Seu Estilo Psicológico */}
          {psychologicalProfile && (
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
              <h3 className="text-2xl font-bold text-white mb-6">
                Seu Estilo de Pensamento e Decisão
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Energia</p>
                  <p className="text-xl font-bold text-white mb-2">
                    {PSYCHOLOGICAL_NAMES.energy[psychologicalProfile.energy]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {PSYCHOLOGICAL_DESCRIPTIONS.energy[psychologicalProfile.energy]}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Percepção</p>
                  <p className="text-xl font-bold text-white mb-2">
                    {PSYCHOLOGICAL_NAMES.perception[psychologicalProfile.perception]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {PSYCHOLOGICAL_DESCRIPTIONS.perception[psychologicalProfile.perception]}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Decisão</p>
                  <p className="text-xl font-bold text-white mb-2">
                    {PSYCHOLOGICAL_NAMES.decision[psychologicalProfile.decision]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {PSYCHOLOGICAL_DESCRIPTIONS.decision[psychologicalProfile.decision]}
                  </p>
                </div>
                
                <div className="bg-gray-900/50 rounded-xl p-6">
                  <p className="text-gray-400 text-sm mb-2">Organização</p>
                  <p className="text-xl font-bold text-white mb-2">
                    {PSYCHOLOGICAL_NAMES.organization[psychologicalProfile.organization]}
                  </p>
                  <p className="text-gray-400 text-sm">
                    {PSYCHOLOGICAL_DESCRIPTIONS.organization[psychologicalProfile.organization]}
                  </p>
                </div>
              </div>
              
              <div className="text-center bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-xl p-6">
                <p className="text-gray-400 text-sm mb-2">Código Psicológico</p>
                <p className="text-3xl font-bold text-purple-400">
                  {psychologicalProfile.code}
                </p>
                <p className="text-gray-500 text-sm mt-2">
                  Baseado em {Object.values(result.scores).reduce((a, b) => a + b, 0)} respostas
                </p>
              </div>
            </div>
          )}

          {/* AI Analysis - Melhorada */}
          {(result.aiAnalysis || personalizedAnalysis) && (
            <div className="space-y-6 mb-8">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center">
                  <Sparkles className="text-white" size={24} />
                </div>
                <div>
                  <h3 className="text-2xl font-bold text-white">
                    Marina Alves — Analista Comportamental
                  </h3>
                  <p className="text-gray-400 text-sm">
                    VX Comercial • Diagnóstico completo do seu perfil DISC
                  </p>
                </div>
              </div>

              {/* Análise formatada em cards */}
              <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8">
                <div 
                  className="prose prose-invert max-w-none"
                  style={{
                    fontSize: '15px',
                    lineHeight: '1.7',
                  }}
                >
                  {(personalizedAnalysis || result.aiAnalysis || '')
                    .split('\n\n')
                    .map((paragraph, index) => {
                      // Detectar se é título
                      if (paragraph.startsWith('**') && paragraph.endsWith('**')) {
                        const title = paragraph.replace(/\*\*/g, '');
                        return (
                          <h4 key={index} className="text-xl font-semibold text-white mt-8 mb-4 first:mt-0">
                            {title}
                          </h4>
                        );
                      }
                      
                      // Detectar se é lista
                      if (paragraph.startsWith('- ')) {
                        const items = paragraph.split('\n').filter(line => line.startsWith('- '));
                        return (
                          <ul key={index} className="space-y-3 mb-6">
                            {items.map((item, i) => (
                              <li key={i} className="flex items-start gap-3 text-gray-300">
                                <span className="text-orange-500 mt-1 flex-shrink-0">•</span>
                                <span>{item.substring(2)}</span>
                              </li>
                            ))}
                          </ul>
                        );
                      }
                      
                      // Parágrafo normal
                      return (
                        <p key={index} className="text-gray-300 mb-4 leading-relaxed">
                          {paragraph}
                        </p>
                      );
                    })}
                </div>
              </div>
              
              {!personalizedAnalysis && (
                <div className="text-center">
                  <button
                    onClick={handleGeneratePersonalizedAnalysis}
                    disabled={generatingAnalysis}
                    className="inline-flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {generatingAnalysis ? (
                      <>
                        <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                        <div className="text-left">
                          <div>Marina está analisando seu perfil...</div>
                          <div className="text-sm font-normal opacity-75">Isso pode levar 15-30 segundos</div>
                        </div>
                      </>
                    ) : (
                      <>
                        <Sparkles size={24} />
                        Gerar Análise Completa com Marina
                      </>
                    )}
                  </button>
                  <p className="text-gray-500 text-sm mt-3 max-w-2xl mx-auto">
                    Marina Alves, analista comportamental da VX, vai interpretar seu perfil DISC 
                    e fornecer insights estratégicos personalizados
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Botão para gerar análise se não houver nenhuma */}
          {!result.aiAnalysis && !personalizedAnalysis && (
            <div className="bg-gradient-to-br from-purple-500/10 to-blue-500/10 border-2 border-purple-500/30 rounded-2xl p-12 mb-8 text-center">
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center mx-auto mb-6">
                <Sparkles className="text-white" size={40} />
              </div>
              <h3 className="text-3xl font-bold text-white mb-2">
                Marina Alves — Analista Comportamental
              </h3>
              <p className="text-purple-300 text-sm mb-4">VX Comercial</p>
              <p className="text-gray-300 text-lg mb-6 max-w-2xl mx-auto leading-relaxed">
                Receba uma análise profunda e personalizada do seu perfil DISC. Marina vai interpretar 
                seu comportamento, identificar padrões e fornecer recomendações estratégicas baseadas 
                no seu cargo e objetivos.
              </p>
              <button
                onClick={handleGeneratePersonalizedAnalysis}
                disabled={generatingAnalysis}
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold text-xl rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {generatingAnalysis ? (
                  <>
                    <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-white"></div>
                    <div className="text-left">
                      <div>Marina está analisando seu perfil...</div>
                      <div className="text-sm font-normal opacity-75">Gerando diagnóstico personalizado</div>
                    </div>
                  </>
                ) : (
                  <>
                    <Sparkles size={28} />
                    Gerar Análise com Marina
                  </>
                )}
              </button>
            </div>
          )}

          {/* DISC Scores - Gráfico de Pizza */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              Distribuição dos Pilares DISC
            </h3>

            <DISCPieChart scores={result.scores} dominantProfile={dominantProfile} />
          </div>

          {/* Chat com Agente IA - Card Destacado */}
          <div className="bg-gradient-to-br from-green-500/10 to-emerald-500/10 border-2 border-green-500/30 rounded-2xl p-8 mb-8">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-16 h-16 rounded-full bg-gradient-to-br from-green-500 to-emerald-500 flex items-center justify-center">
                <MessageCircle className="text-white" size={32} />
              </div>
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-white mb-1">
                  Lucas Ferreira — Consultor Comercial
                </h3>
                <p className="text-gray-300">
                  VX Comercial • Converse sobre vendas, comunicação e liderança
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-green-400 font-semibold mb-2">💬 Perguntas Sugeridas:</p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Como posso melhorar minhas vendas?</li>
                  <li>• Quais são meus pontos fracos?</li>
                  <li>• Como liderar melhor minha equipe?</li>
                </ul>
              </div>
              <div className="bg-gray-900/50 rounded-xl p-4">
                <p className="text-green-400 font-semibold mb-2">✨ Lucas Conhece:</p>
                <ul className="space-y-2 text-gray-300 text-sm">
                  <li>• Seu perfil DISC completo</li>
                  <li>• Seus pontos fortes e fracos</li>
                  <li>• Seu cargo e objetivos</li>
                </ul>
              </div>
            </div>

            <button
              onClick={() => setShowChat(true)}
              className="w-full flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-green-500 to-emerald-500 text-white font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-green-500/50 transition-all duration-300"
            >
              <MessageCircle size={24} />
              Conversar com Lucas
            </button>
          </div>

          {/* Action Buttons - Melhorados */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
            <Link
              href="/"
              className="flex items-center justify-center gap-3 px-6 py-4 bg-white/5 backdrop-blur-lg border border-white/10 text-white font-semibold rounded-xl hover:bg-white/10 transition-all duration-200"
            >
              <Home size={20} />
              Voltar para Home
            </Link>

            <button
              onClick={handleDownloadPDF}
              disabled={generatingPDF}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl hover:shadow-lg hover:shadow-purple-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {generatingPDF ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                  Gerando PDF...
                </>
              ) : (
                <>
                  <Download size={20} />
                  Baixar Relatório PDF
                </>
              )}
            </button>

            <button
              onClick={handleRetakeTest}
              className="flex items-center justify-center gap-3 px-6 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
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

      {/* Chat Widget */}
      {showChat && (
        <FloatingChatWidget 
          initialOpen={true} 
          onClose={() => setShowChat(false)} 
        />
      )}
    </div>
  );
}
