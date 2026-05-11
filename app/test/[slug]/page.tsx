'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowRight, ArrowLeft, LogOut } from 'lucide-react';
import { questions } from '@/data/questions';
import type { Company } from '@/types/company';

type DISCType = 'D' | 'I' | 'S' | 'C';

interface Answer {
  questionId: number;
  discTypes: DISCType[];
}

interface EmployeeData {
  name: string;
  email: string;
  phone?: string;
  position: string;
}

export default function PublicTestPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params.slug as string;

  // States
  const [company, setCompany] = useState<Company | null>(null);
  const [companyLoading, setCompanyLoading] = useState(true);
  const [companyError, setCompanyError] = useState('');

  // Test flow states
  const [step, setStep] = useState<'form' | 'test' | 'result'>('form');
  const [employeeData, setEmployeeData] = useState<EmployeeData>({
    name: '',
    email: '',
    phone: '',
    position: '',
  });
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});

  // Test states
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState<Answer[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState('');

  // Load company on mount
  useEffect(() => {
    const loadCompany = async () => {
      try {
        setCompanyLoading(true);
        const response = await fetch(`/api/companies/by-slug/${slug}`);

        if (!response.ok) {
          throw new Error('Empresa não encontrada ou inativa');
        }

        const data = await response.json();
        setCompany(data);
      } catch (err) {
        setCompanyError(err instanceof Error ? err.message : 'Erro ao carregar empresa');
      } finally {
        setCompanyLoading(false);
      }
    };

    loadCompany();
  }, [slug]);

  // Form validation
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};

    if (!employeeData.name.trim()) {
      errors.name = 'Nome é obrigatório';
    }

    if (!employeeData.email.trim()) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(employeeData.email)) {
      errors.email = 'Email inválido';
    }

    if (!employeeData.position.trim()) {
      errors.position = 'Cargo é obrigatório';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleStartTest = () => {
    if (validateForm()) {
      setStep('test');
      setCurrentQuestion(0);
      setAnswers([]);
    }
  };

  // Test logic
  const totalQuestions = questions.length;
  const progress = ((currentQuestion + 1) / totalQuestions) * 100;
  const isLastQuestion = currentQuestion === totalQuestions - 1;

  const currentAnswerData = answers.find(a => a.questionId === questions[currentQuestion].id);
  const selectedCount = currentAnswerData?.discTypes.length || 0;
  const hasMinimumAnswers = selectedCount >= 1;
  const hasMaximumAnswers = selectedCount >= 2;

  const handleAnswer = (discType: DISCType) => {
    const currentAnswer = answers.find(a => a.questionId === questions[currentQuestion].id);

    if (currentAnswer) {
      const isAlreadySelected = currentAnswer.discTypes.includes(discType);

      if (isAlreadySelected) {
        const newDiscTypes = currentAnswer.discTypes.filter(t => t !== discType);
        if (newDiscTypes.length === 0) {
          setAnswers(answers.filter(a => a.questionId !== questions[currentQuestion].id));
        } else {
          setAnswers(
            answers.map(a =>
              a.questionId === questions[currentQuestion].id
                ? { ...a, discTypes: newDiscTypes }
                : a
            )
          );
        }
      } else {
        if (currentAnswer.discTypes.length < 2) {
          setAnswers(
            answers.map(a =>
              a.questionId === questions[currentQuestion].id
                ? { ...a, discTypes: [...a.discTypes, discType] }
                : a
            )
          );
        }
      }
    } else {
      setAnswers([
        ...answers,
        {
          questionId: questions[currentQuestion].id,
          discTypes: [discType],
        },
      ]);
    }
  };

  const handleNext = () => {
    if (hasMinimumAnswers) {
      if (!isLastQuestion) {
        setCurrentQuestion(currentQuestion + 1);
      }
    }
  };

  const handlePrevious = () => {
    if (currentQuestion > 0) {
      setCurrentQuestion(currentQuestion - 1);
    }
  };

  const handleSubmitTest = async () => {
    if (!company || !hasMinimumAnswers) return;

    setSubmitting(true);
    setSubmitError('');

    try {
      const response = await fetch('/api/companies/tests/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          company_id: company.id,
          employee_data: employeeData,
          answers: answers.map(a => ({
            questionId: a.questionId,
            selectedOptions: a.discTypes,
          })),
          questions: questions.map(q => ({
            id: q.id,
            text: q.text,
          })),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao salvar teste');
      }

      const result = await response.json();
      setStep('result');
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : 'Erro ao salvar teste');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (companyLoading) {
    return (
      <div className="min-h-screen bg-vx-dark flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-vx-orange mx-auto mb-4"></div>
          <p className="text-gray-400">Carregando...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (companyError || !company) {
    return (
      <div className="min-h-screen bg-vx-dark flex items-center justify-center">
        <div className="text-center max-w-md">
          <h1 className="text-2xl font-bold text-white mb-4">Oops!</h1>
          <p className="text-gray-400 mb-6">{companyError || 'Empresa não encontrada.'}</p>
          <a
            href="/"
            className="inline-block px-6 py-2 bg-vx-orange text-white rounded-lg hover:bg-orange-600 transition"
          >
            Voltar para home
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-vx-dark">
      {/* Header with company branding */}
      <div
        className="bg-gradient-to-r from-gray-900 to-black border-b border-white/[0.08] py-6"
        style={{
          borderBottomColor: company.primary_color,
          borderBottomWidth: '3px',
        }}
      >
        <div className="container mx-auto max-w-4xl px-4 flex justify-between items-center">
          <div className="flex items-center gap-4">
            {company.logo_url && (
              <img
                src={company.logo_url}
                alt={company.name}
                className="h-10 object-contain"
              />
            )}
            <div>
              <h1 className="text-2xl font-bold text-white">{company.name}</h1>
              <p className="text-sm text-gray-400">Diagnóstico Comportamental DISC</p>
            </div>
          </div>
        </div>
      </div>

      {/* Main content */}
      <div className="container mx-auto max-w-2xl px-4 py-12">
        {step === 'form' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-white/[0.08]">
            <h2 className="text-2xl font-bold text-white mb-2">Bem-vindo!</h2>
            <p className="text-gray-400 mb-8">
              Preencha seus dados para iniciar o teste de diagnóstico comportamental DISC.
            </p>

            <form
              onSubmit={e => {
                e.preventDefault();
                handleStartTest();
              }}
              className="space-y-6"
            >
              {/* Name */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Nome Completo *
                </label>
                <input
                  type="text"
                  value={employeeData.name}
                  onChange={e =>
                    setEmployeeData({ ...employeeData, name: e.target.value })
                  }
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    formErrors.name
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/[0.08] focus:ring-vx-orange'
                  }`}
                  placeholder="João Silva"
                />
                {formErrors.name && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.name}</p>
                )}
              </div>

              {/* Email */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Email *
                </label>
                <input
                  type="email"
                  value={employeeData.email}
                  onChange={e =>
                    setEmployeeData({ ...employeeData, email: e.target.value })
                  }
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    formErrors.email
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/[0.08] focus:ring-vx-orange'
                  }`}
                  placeholder="joao@example.com"
                />
                {formErrors.email && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.email}</p>
                )}
              </div>

              {/* Phone */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Telefone (opcional)
                </label>
                <input
                  type="tel"
                  value={employeeData.phone || ''}
                  onChange={e =>
                    setEmployeeData({ ...employeeData, phone: e.target.value })
                  }
                  className="w-full bg-gray-800 border border-white/[0.08] rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-vx-orange"
                  placeholder="(11) 9999-9999"
                />
              </div>

              {/* Position */}
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Cargo *
                </label>
                <input
                  type="text"
                  value={employeeData.position}
                  onChange={e =>
                    setEmployeeData({ ...employeeData, position: e.target.value })
                  }
                  className={`w-full bg-gray-800 border rounded-lg px-4 py-3 text-white placeholder-gray-500 focus:outline-none focus:ring-2 ${
                    formErrors.position
                      ? 'border-red-500 focus:ring-red-500'
                      : 'border-white/[0.08] focus:ring-vx-orange'
                  }`}
                  placeholder="ex: Analista de Vendas"
                />
                {formErrors.position && (
                  <p className="text-red-400 text-sm mt-1">{formErrors.position}</p>
                )}
              </div>

              {/* Submit button */}
              <button
                type="submit"
                className="w-full py-3 bg-gradient-to-r from-vx-orange to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-vx-orange/50 transition-all duration-300 flex items-center justify-center gap-2"
              >
                Iniciar Teste
                <ArrowRight size={18} />
              </button>
            </form>
          </div>
        )}

        {step === 'test' && (
          <div className="space-y-8">
            {/* Progress bar */}
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-gray-400">
                  Pergunta {currentQuestion + 1} de {totalQuestions}
                </span>
                <span className="text-sm font-semibold text-vx-orange">{Math.round(progress)}%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-vx-orange to-orange-600 transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>

            {/* Question card */}
            <div className="bg-gray-900 rounded-2xl p-8 border border-white/[0.08]">
              <h3 className="text-xl font-semibold text-white mb-8">
                {questions[currentQuestion].text}
              </h3>

              {/* Options */}
              <div className="space-y-3">
                {questions[currentQuestion].options.map((option, idx) => {
                  const isSelected = currentAnswerData?.discTypes.includes(
                    option.discType as DISCType
                  );
                  const isDisabled = hasMaximumAnswers && !isSelected;

                  return (
                    <button
                      key={idx}
                      onClick={() => handleAnswer(option.discType as DISCType)}
                      disabled={isDisabled}
                      className={`w-full p-4 rounded-lg border-2 text-left transition-all ${
                        isSelected
                          ? `border-vx-orange bg-vx-orange/10`
                          : isDisabled
                          ? 'border-white/[0.08] bg-gray-800 text-gray-600 cursor-not-allowed opacity-50'
                          : 'border-white/[0.08] bg-gray-800 hover:border-vx-orange/50'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-5 h-5 rounded border-2 flex items-center justify-center transition-all ${
                            isSelected
                              ? 'bg-vx-orange border-vx-orange'
                              : 'border-white/[0.3]'
                          }`}
                        >
                          {isSelected && <div className="w-2 h-2 bg-white rounded-full" />}
                        </div>
                        <span className={isSelected ? 'text-white font-medium' : 'text-gray-300'}>
                          {option.text}
                        </span>
                      </div>
                    </button>
                  );
                })}
              </div>

              <p className="text-sm text-gray-400 mt-6">
                Selecione {hasMaximumAnswers ? 2 : '1 a 2'} opção{hasMaximumAnswers ? 's' : ''}
              </p>
            </div>

            {/* Navigation */}
            <div className="flex justify-between gap-4">
              <button
                onClick={handlePrevious}
                disabled={currentQuestion === 0}
                className="flex items-center gap-2 px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ArrowLeft size={18} />
                Anterior
              </button>

              {isLastQuestion ? (
                <button
                  onClick={handleSubmitTest}
                  disabled={!hasMinimumAnswers || submitting}
                  className="flex-1 py-3 bg-gradient-to-r from-vx-orange to-orange-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-vx-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {submitting ? 'Salvando...' : 'Finalizar Teste'}
                </button>
              ) : (
                <button
                  onClick={handleNext}
                  disabled={!hasMinimumAnswers}
                  className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-vx-orange to-orange-600 text-white rounded-lg hover:shadow-lg hover:shadow-vx-orange/50 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Próxima
                  <ArrowRight size={18} />
                </button>
              )}
            </div>

            {submitError && (
              <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-4 text-red-400 text-sm">
                {submitError}
              </div>
            )}
          </div>
        )}

        {step === 'result' && (
          <div className="bg-gray-900 rounded-2xl p-8 border border-white/[0.08] text-center">
            <div className="w-16 h-16 bg-gradient-to-r from-vx-orange to-orange-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg
                className="w-8 h-8 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M5 13l4 4L19 7"
                />
              </svg>
            </div>

            <h2 className="text-2xl font-bold text-white mb-2">Teste Concluído!</h2>
            <p className="text-gray-400 mb-8">
              Obrigado por responder o teste de diagnóstico comportamental DISC. Seus resultados
              foram registrados com sucesso.
            </p>

            <div className="bg-gray-800/50 rounded-lg p-6 mb-8 border border-white/[0.08]">
              <p className="text-gray-400 mb-2">Você pode fechar esta página agora.</p>
              <p className="text-sm text-gray-500">
                Os resultados estarão disponíveis no painel administrativo da {company.name}.
              </p>
            </div>

            <a
              href="/"
              className="inline-block px-6 py-3 bg-gray-800 text-white rounded-lg hover:bg-gray-700 transition"
            >
              Voltar para home
            </a>
          </div>
        )}
      </div>
    </div>
  );
}
