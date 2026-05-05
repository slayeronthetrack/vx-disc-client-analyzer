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

  const progress = ((currentQuestion + 1) / questions.length) * 100;
  const isLastQuestion = currentQuestion === questions.length - 1;
  
  // Verificar quantas respostas foram selecionadas para a pergunta atual
  const currentAnswerData = answers.find(a => a.questionId === questions[currentQuestion].id);
  const selectedCount = currentAnswerData?.discTypes.length || 0;
  const hasMinimumAnswers = selectedCount >= 2;
  const hasMaximumAnswers = selectedCount >= 2;

  const handleAnswer = (discType: DISCType) => {
    const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id);
    
    if (currentAnswer) {
      // Se já existe resposta para esta pergunta
      const isAlreadySelected = currentAnswer.discTypes.includes(discType);
      
      if (isAlreadySelected) {
        // Remover seleção
        const newDiscTypes = currentAnswer.discTypes.filter(t => t !== discType);
        if (newDiscTypes.length === 0) {
          // Se não sobrou nenhuma, remover a resposta
          setAnswers(answers.filter(a => a.questionId !== questions[currentQuestion].id));
        } else {
          // Atualizar com as respostas restantes
          setAnswers(answers.map(a => 
            a.questionId === questions[currentQuestion].id 
              ? { ...a, discTypes: newDiscTypes }
              : a
          ));
        }
      } else {
        // Adicionar nova seleção (máximo 2)
        if (currentAnswer.discTypes.length < 2) {
          setAnswers(answers.map(a => 
            a.questionId === questions[currentQuestion].id 
              ? { ...a, discTypes: [...a.discTypes, discType] }
              : a
          ));
        }
      }
    } else {
      // Primeira seleção para esta pergunta
      setAnswers([...answers, {
        questionId: questions[currentQuestion].id,
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
        // Calcular resultado (cada resposta conta)
        const scores = { D: 0, I: 0, S: 0, C: 0 };
        answers.forEach(answer => {
          answer.discTypes.forEach(discType => {
            scores[discType]++;
          });
        });

        // Determinar perfil dominante
        const dominant = (Object.keys(scores) as Array<keyof typeof scores>).reduce((a, b) =>
          scores[a] > scores[b] ? a : b
        );

        // Chamar API de IA para análise
        let aiAnalysis = '';
        try {
          const aiResponse = await fetch('/api/ai/calculate-result', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              answers: answers.map(a => ({
                questionId: a.questionId,
                discTypes: a.discTypes,
              })),
              scores,
              dominantProfile: dominant,
              userProfile: profile,
            }),
          });

          if (aiResponse.ok) {
            const aiData = await aiResponse.json();
            aiAnalysis = aiData.analysis || '';
          }
        } catch (aiError) {
          console.error('Error getting AI analysis:', aiError);
          // Continuar sem análise IA
        }

        // Salvar no Supabase
        await discTestService.saveTest(user.id, {
          questions: questions.map(q => ({ id: q.id, text: q.text })),
          answers: answers.map(a => ({
            questionId: a.questionId,
            discTypes: a.discTypes,
          })),
          result: {
            dominantProfile: dominant,
            scores,
            aiAnalysis,
          },
          scores,
          dominant_profile: dominant,
          ai_analysis: aiAnalysis,
        });

        // Redirecionar para resultado
        router.push('/result');
      } catch (err: any) {
        console.error('Error saving test:', err);
        setError(err.message || 'Erro ao salvar teste. Tente novamente.');
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

  const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id);

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
                Pergunta {currentQuestion + 1} de {questions.length}
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
              {questions[currentQuestion].text}
            </h2>
            <p className="text-gray-400 text-sm mb-6">
              Selecione exatamente 2 opções que mais se aplicam a você
            </p>

            <div className="space-y-3">
              {questions[currentQuestion].options.map((option, index) => {
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
                selectedCount === 2 ? 'text-green-500' : selectedCount > 0 ? 'text-yellow-500' : 'text-gray-500'
              }`}>
                {selectedCount}/2 opções selecionadas
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
              Selecione 2 opções para continuar
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
