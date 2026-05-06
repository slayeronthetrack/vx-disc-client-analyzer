/**
 * Test Page - VX DISC Test
 * Página do teste DISC com perguntas e barra de progresso
 * Integrado com Supabase
 */

'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowLeft, ArrowRight, CheckCircle } from 'lucide-react';
import { questions } from '@/data/questions';
import { useAuth } from '@/lib/hooks/useAuth';
import { discTestService } from '@/lib/services/discTestService';

type DISCType = 'D' | 'I' | 'S' | 'C';

interface Answer {
  questionId: number;
  discTypes: DISCType[]; // Agora aceita múltiplas respostas
}

export default function TestPage() {
  const router = useRouter();
  const { user, profile, hasProfile, loading: authLoading } = useAuth();
  const [showQuestionSelection, setShowQuestionSelection] = useState(true);
  const [questionCount, setQuestionCount] = useState(20);
  const [loadingQuestions, setLoadingQuestions] = useState(false);
  const [dynamicQuestions, setDynamicQuestions] = useState<any[]>([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Redirecionar se não estiver logado
  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
    }
  }, [user, authLoading, router]);

  // Redirecionar se perfil não estiver completo
  useEffect(() => {
    if (!authLoading && user && !hasProfile) {
      router.push('/profile');
    }
  }, [user, hasProfile, authLoading, router]);

  const activeQuestions = dynamicQuestions.length > 0 ? dynamicQuestions : questions;
  const totalQuestions = activeQuestions.length; // Fonte única de verdade
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestion === totalQuestions - 1;
  
  // Verificar quantas respostas foram selecionadas para a pergunta atual
  const currentAnswerData = answers.find(a => a.questionId === activeQuestions[currentQuestion].id);
  const selectedCount = currentAnswerData?.discTypes.length || 0;
  const hasMinimumAnswers = selectedCount >= 1; // Mínimo 1 seleção
  const hasMaximumAnswers = selectedCount >= 2; // Máximo 2 seleções

  const handleGenerateQuestions = async (count: number) => {
    if (!user || !profile) return;

    setLoadingQuestions(true);
    setError('');

    try {
      const response = await fetch('/api/ai/generate-questions', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user.id,
          userName: profile.full_name,
          userEmail: profile.email,
          jobTitle: profile.job_title,
          company: profile.company,
          testObjective: profile.test_objective,
          questionCount: count,
        }),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar perguntas');
      }

      const data = await response.json();
      
      console.log('[Test] Questions generated:', {
        count: data.questions.length,
        source: data.source,
        hasIntegratedProfile: data.metadata?.hasIntegratedProfile,
      });

      // Formatar perguntas para o formato esperado
      const formattedQuestions = data.questions.map((q: any) => ({
        id: q.id,
        text: q.question,
        options: q.options.map((opt: any) => ({
          text: opt.text,
          discType: opt.type,
          valueType: opt.valueType,
          psychTraits: opt.psychTraits,
        })),
      }));

      setDynamicQuestions(formattedQuestions);
      setShowQuestionSelection(false);
    } catch (err: any) {
      console.error('Error generating questions:', err);
      setError(err.message || 'Erro ao gerar perguntas. Tente novamente.');
    } finally {
      setLoadingQuestions(false);
    }
  };

  const handleStartTest = () => {
    if (questionCount === 20) {
      // Usar perguntas estáticas
      setDynamicQuestions([]);
      setShowQuestionSelection(false);
    } else {
      // Gerar perguntas dinâmicas
      handleGenerateQuestions(questionCount);
    }
  };

  const handleAnswer = (discType: DISCType) => {
    const currentAnswer = answers.find(a => a.questionId === activeQuestions[currentQuestion].id);
    
    if (currentAnswer) {
      // Se já existe resposta para esta pergunta
      const isAlreadySelected = currentAnswer.discTypes.includes(discType);
      
      if (isAlreadySelected) {
        // Remover seleção
        const newDiscTypes = currentAnswer.discTypes.filter(t => t !== discType);
        if (newDiscTypes.length === 0) {
          // Se não sobrou nenhuma, remover a resposta
          setAnswers(answers.filter(a => a.questionId !== activeQuestions[currentQuestion].id));
        } else {
          // Atualizar com as respostas restantes
          setAnswers(answers.map(a => 
            a.questionId === activeQuestions[currentQuestion].id 
              ? { ...a, discTypes: newDiscTypes }
              : a
          ));
        }
      } else {
        // Adicionar nova seleção (máximo 2)
        if (currentAnswer.discTypes.length < 2) {
          setAnswers(answers.map(a => 
            a.questionId === activeQuestions[currentQuestion].id 
              ? { ...a, discTypes: [...a.discTypes, discType] }
              : a
          ));
        }
      }
    } else {
      // Primeira seleção para esta pergunta
      setAnswers([...answers, {
        questionId: activeQuestions[currentQuestion].id,
        discTypes: [discType],
      }]);
    }
  };

  const handleNext = async () => {
    if (!hasMinimumAnswers || !user) return;

    if (isLastQuestion) {
      setSaving(true);
      setError('');

      try {
        // Preparar respostas no formato estendido
        const extendedAnswers = answers.map(a => {
          const question = activeQuestions.find(q => q.id === a.questionId);
          return {
            questionId: a.questionId,
            selectedOptions: a.discTypes.map(discType => {
              const option = question?.options.find((opt: any) => opt.discType === discType);
              return {
                type: discType,
                valueType: option?.valueType,
                psychTraits: option?.psychTraits,
              };
            }),
          };
        });

        // DEBUG: Verificar respostas
        console.log('[Test] Extended answers:', {
          totalAnswers: extendedAnswers.length,
          sample: extendedAnswers.slice(0, 3),
          discTypesDistribution: extendedAnswers.reduce((acc, a) => {
            a.selectedOptions.forEach(opt => {
              acc[opt.type] = (acc[opt.type] || 0) + 1;
            });
            return acc;
          }, {} as Record<string, number>),
        });

        // Obter sessão atual do Supabase
        console.log('[Test] Getting current session...');
        const { supabase } = await import('@/lib/supabase/client');
        const { data: { session }, error: sessionError } = await supabase.auth.getSession();
        
        console.log('[Test] Session before calculate-result:', {
          hasSession: !!session,
          hasAccessToken: !!session?.access_token,
          userId: session?.user?.id,
          userIdMatch: session?.user?.id === user.id,
        });

        // Validar sessão
        if (sessionError || !session?.access_token) {
          console.error('[Test] Session error:', sessionError);
          throw new Error('Sessão expirada. Por favor, faça login novamente.');
        }

        // Chamar API de IA para análise (já calcula perfil integrado)
        console.log('[Test] Calling calculate-result API with Authorization header...');
        
        const aiResponse = await fetch('/api/ai/calculate-result', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${session.access_token}`, // ← Envia token JWT
          },
          credentials: 'include', // ← Mantém cookies como fallback
          body: JSON.stringify({
            userId: user.id,
            userName: profile?.full_name,
            userEmail: profile?.email,
            jobTitle: profile?.job_title,
            company: profile?.company,
            testObjective: profile?.test_objective,
            questions: activeQuestions.map(q => ({
              id: q.id,
              question: q.text,
              options: q.options.map((opt: any) => ({
                text: opt.text,
                type: opt.discType,
                valueType: opt.valueType,
                psychTraits: opt.psychTraits,
              })),
            })),
            answers: extendedAnswers,
          }),
        });

        if (!aiResponse.ok) {
          const errorText = await aiResponse.text();
          let errorData: any = {};
          try {
            errorData = JSON.parse(errorText);
          } catch {
            errorData = { raw: errorText };
          }
          
          console.error('[Test] API error:', {
            status: aiResponse.status,
            statusText: aiResponse.statusText,
            url: aiResponse.url,
            headers: Object.fromEntries(aiResponse.headers.entries()),
            errorData,
            errorText,
          });
          
          // Mensagem de erro mais específica
          let errorMessage = 'Erro ao calcular resultado';
          if (aiResponse.status === 401) {
            errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
          } else if (aiResponse.status === 403) {
            errorMessage = 'Acesso negado. Verifique suas permissões.';
          } else if (errorData.details) {
            errorMessage = errorData.details;
          } else if (errorData.error) {
            errorMessage = errorData.error;
          } else if (errorText) {
            errorMessage = errorText;
          }
          
          throw new Error(errorMessage);
        }

        console.log('[Test] Result calculated successfully');

        // Redirecionar para resultado
        router.push('/result');
      } catch (err: any) {
        console.error('Error saving test:', {
          message: err?.message,
          code: err?.code,
          details: err?.details,
          hint: err?.hint,
          stack: err?.stack,
          fullError: err,
        });
        setError(err?.message || 'Erro ao salvar teste. Tente novamente.');
        setSaving(false);
      }
    } else {
      setCurrentQuestion(currentQuestion + 1);
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const currentAnswer = answers.find(a => a.questionId === activeQuestions[currentQuestion].id);

  // Tela de seleção de quantidade de perguntas
  if (showQuestionSelection && !authLoading && user && hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
        <div className="container mx-auto px-4">
          <div className="max-w-2xl mx-auto">
            {/* Header */}
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-gradient-to-br from-orange-500 to-yellow-500 mb-6">
                <span className="text-gray-900 font-bold text-3xl">VX</span>
              </div>
              <h1 className="text-4xl font-bold text-white mb-2">
                Teste DISC Personalizado
              </h1>
              <p className="text-gray-400">
                Escolha quantas perguntas você quer responder
              </p>
            </div>

            {/* Seleção de quantidade */}
            <div className="bg-white/5 backdrop-blur-lg border border-white/10 rounded-2xl p-8 mb-8">
              <h3 className="text-xl font-bold text-white mb-6">
                Quantas perguntas você quer responder?
              </h3>

              <div className="space-y-4 mb-8">
                {[
                  { count: 20, label: 'Rápido', time: '~5 min', desc: 'Perguntas padrão' },
                  { count: 40, label: 'Médio', time: '~10 min', desc: 'Análise mais detalhada' },
                  { count: 60, label: 'Completo', time: '~15 min', desc: 'Análise profunda' },
                  { count: 100, label: 'Máximo', time: '~25 min', desc: 'Análise completa com Valores e Tipos Psicológicos' },
                ].map((option) => (
                  <button
                    key={option.count}
                    onClick={() => setQuestionCount(option.count)}
                    className={`w-full text-left p-6 rounded-xl border-2 transition-all duration-200 ${
                      questionCount === option.count
                        ? 'border-orange-500 bg-orange-500/10'
                        : 'border-white/10 bg-white/5 hover:border-white/20'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <div className="flex items-center gap-3">
                        <span className="text-2xl font-bold text-white">{option.count}</span>
                        <span className="text-lg font-semibold text-white">{option.label}</span>
                      </div>
                      <span className="text-gray-400 text-sm">{option.time}</span>
                    </div>
                    <p className="text-gray-400 text-sm">{option.desc}</p>
                  </button>
                ))}
              </div>

              {error && (
                <div className="bg-red-500/10 border border-red-500/30 rounded-xl p-4 mb-6">
                  <p className="text-red-500 text-sm">{error}</p>
                </div>
              )}

              <button
                onClick={handleStartTest}
                disabled={loadingQuestions}
                className="w-full flex items-center justify-center gap-3 px-8 py-4 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold text-lg rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loadingQuestions ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-900"></div>
                    Gerando perguntas...
                  </>
                ) : (
                  <>
                    Iniciar Teste
                    <ArrowRight size={24} />
                  </>
                )}
              </button>
            </div>

            {/* Info */}
            <div className="bg-blue-500/10 border border-blue-500/30 rounded-xl p-6">
              <h4 className="text-white font-semibold mb-2">💡 Dica</h4>
              <p className="text-gray-300 text-sm">
                Quanto mais perguntas você responder, mais precisa será sua análise. 
                Testes com 60+ perguntas incluem análise de Valores e Tipos Psicológicos!
              </p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (authLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Mostrar mensagem se perfil não estiver completo
  if (!authLoading && user && !hasProfile) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full text-center">
          <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-8">
            <div className="text-yellow-500 text-6xl mb-4">⚠️</div>
            <h2 className="text-2xl font-bold text-white mb-4">
              Perfil Incompleto
            </h2>
            <p className="text-gray-400 mb-6">
              Você precisa completar seu perfil antes de fazer o teste DISC.
            </p>
            <Link
              href="/profile"
              className="inline-flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300"
            >
              Completar Perfil
              <ArrowRight size={20} />
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 py-12">
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto">
          {/* Header */}
          <div className="mb-8">
            <Link
              href="/"
              className="inline-flex items-center gap-2 text-gray-400 hover:text-orange-500 transition-colors mb-4"
            >
              <ArrowLeft size={20} />
              Voltar para Home
            </Link>
            <h1 className="text-4xl font-bold text-white mb-2">
              Teste DISC
            </h1>
            <p className="text-gray-400">
              Responda com sinceridade para obter um resultado preciso
            </p>
          </div>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-2">
              <span className="text-white font-medium">
                Pergunta {currentQuestion + 1} de {totalQuestions}
              </span>
              <span className="text-orange-500 font-bold">
                {Math.round(progress)}%
              </span>
            </div>
            <div className="h-3 bg-gray-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-orange-500 to-yellow-500 transition-all duration-500 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="mb-6 bg-red-500/10 border border-red-500/30 rounded-xl p-4">
              <p className="text-red-500 text-sm">{error}</p>
            </div>
          )}

          {/* Question Card */}
          <div className="bg-gray-800/50 backdrop-blur-sm border border-gray-700 rounded-2xl p-8 mb-8">
            <h2 className="text-2xl font-bold text-white mb-2">
              {activeQuestions[currentQuestion].text}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Selecione até 2 opções que mais combinam com você
            </p>

            <div className="space-y-3">
              {activeQuestions[currentQuestion].options.map((option: any, index: number) => {
                const isSelected = currentAnswer?.discTypes.includes(option.discType) || false;
                return (
                  <button
                    key={index}
                    onClick={() => handleAnswer(option.discType)}
                    disabled={!isSelected && hasMaximumAnswers}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? 'border-orange-500 bg-orange-500/10 text-white'
                        : hasMaximumAnswers
                        ? 'border-gray-700 bg-gray-900/30 text-gray-500 cursor-not-allowed'
                        : 'border-gray-700 bg-gray-900/50 text-gray-300 hover:border-gray-600 hover:bg-gray-900'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-6 h-6 rounded border-2 flex items-center justify-center ${
                        isSelected ? 'border-orange-500 bg-orange-500' : 'border-gray-600'
                      }`}>
                        {isSelected && <CheckCircle size={16} className="text-gray-900" />}
                      </div>
                      <span className="flex-1">{option.text}</span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Contador de respostas */}
            <div className="mt-4 text-center">
              <span className={`text-sm font-medium ${
                selectedCount === 0 ? 'text-gray-500' : 
                selectedCount === 1 ? 'text-yellow-500' : 
                'text-green-500'
              }`}>
                {selectedCount}/2 selecionadas
              </span>
            </div>
          </div>

          {/* Navigation Buttons */}
          <div className="flex gap-4">
            <button
              onClick={handlePrevious}
              disabled={currentQuestion === 0}
              className="flex items-center gap-2 px-6 py-3 bg-gray-800 border border-gray-700 text-white font-medium rounded-xl hover:bg-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ArrowLeft size={20} />
              Anterior
            </button>

            <button
              onClick={handleNext}
              disabled={!hasMinimumAnswers || saving}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-orange-500 to-yellow-500 text-gray-900 font-bold rounded-xl hover:shadow-lg hover:shadow-orange-500/50 transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none"
            >
              {saving ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
                  Salvando...
                </>
              ) : isLastQuestion ? (
                <>
                  Finalizar Teste
                  <ArrowRight size={20} />
                </>
              ) : (
                <>
                  Próxima
                  <ArrowRight size={20} />
                </>
              )}
            </button>
          </div>

          {/* Help Text */}
          {!hasMinimumAnswers && (
            <p className="text-center text-gray-500 text-sm mt-4">
              Selecione pelo menos 1 opção para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
