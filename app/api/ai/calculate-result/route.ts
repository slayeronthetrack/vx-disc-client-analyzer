/**
 * API: Calculate Result
 * Calcula resultado DISC + Valores + Tipos Psicológicos e gera análise com Marina (Agente IA)
 */

import { NextResponse } from 'next/server';
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';
import { discTestService } from '@/lib/services/discTestService';
import { learningSystem } from '@/lib/services/learningSystem';
import { getAgentRegistry } from '@/lib/agents';
import { calculateIntegratedProfile } from '@/utils/calculateIntegratedProfile';
import type { DISCType } from '@/types/database';
import type { ExtendedAnswer } from '@/types/integrated-profile';

/**
 * Processa feedback do teste para o sistema de aprendizado (assíncrono)
 */
async function processTestFeedback(feedback: {
  testId: string;
  userId: string;
  questions: any[];
  answers: any[];
  userContext: {
    jobTitle: string;
    company?: string;
    testObjective: string;
  };
  completionRate: number;
  totalTime: number;
  dominantProfile: string;
}) {
  try {
    console.log('[Learning] Processing test feedback...');
    
    // Transformar respostas em formato de feedback
    const questionFeedback = feedback.answers.map((answer, index) => ({
      id: `q-${index + 1}`,
      text: feedback.questions[index]?.question || '',
      options: feedback.questions[index]?.options || [],
      responseTime: 15000, // TODO: Capturar tempo real
      wasChanged: false, // TODO: Rastrear mudanças
      finalAnswer: answer.selectedOptions.map((opt: any) => opt.type),
    }));

    await learningSystem.processFeedback({
      testId: feedback.testId,
      userId: feedback.userId,
      questions: questionFeedback,
      userContext: feedback.userContext,
      completionRate: feedback.completionRate,
      totalTime: feedback.totalTime,
      dominantProfile: feedback.dominantProfile,
    });

    console.log('[Learning] Feedback processed successfully');
  } catch (error) {
    console.error('[Learning] Error processing feedback:', error);
    // Não lançar erro - aprendizado é opcional
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { userId, userName, userEmail, jobTitle, company, testObjective, questions, answers } = body;

    console.log('[calculate-result] Request received:', {
      userId,
      userName,
      answersCount: answers?.length,
      questionsCount: questions?.length,
    });

    // Validações
    if (!userId || !answers || !Array.isArray(answers)) {
      console.error('[calculate-result] Invalid data:', { userId, hasAnswers: !!answers, isArray: Array.isArray(answers) });
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Ler Authorization header
    const authHeader = request.headers.get('authorization');
    const token = authHeader?.replace('Bearer ', '');
    
    console.log('[calculate-result] Auth header:', {
      hasAuthHeader: !!authHeader,
      hasToken: !!token,
      tokenPreview: token?.substring(0, 20) + '...',
    });

    // Log cookies recebidos (fallback)
    const cookieHeader = request.headers.get('cookie');
    console.log('[calculate-result] Cookies received:', {
      hasCookies: !!cookieHeader,
      cookieCount: cookieHeader?.split(';').length || 0,
    });

    // Criar cliente Supabase AUTENTICADO com JWT
    console.log('[calculate-result] Creating authenticated Supabase client...');
    const cookieStore = await cookies();
    
    // Criar client com JWT no header global
    const supabaseWithAuth = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore
            }
          },
        },
        global: {
          headers: token ? {
            Authorization: `Bearer ${token}`,
          } : {},
        },
      }
    );
    
    console.log('[calculate-result] Checking authentication...');
    
    let user = null;
    let authError = null;

    // Tentar autenticar com token do Authorization header primeiro
    if (token) {
      console.log('[calculate-result] Attempting auth with Authorization token...');
      const { data, error } = await supabaseWithAuth.auth.getUser(token);
      user = data.user;
      authError = error;
      
      console.log('[calculate-result] Auth with token result:', {
        hasUser: !!user,
        userId: user?.id,
        error: error?.message,
      });
    }
    
    // Fallback: tentar autenticar via cookies
    if (!user) {
      console.log('[calculate-result] Attempting auth with cookies (fallback)...');
      const { data, error } = await supabaseWithAuth.auth.getUser();
      user = data.user;
      authError = error;
      
      console.log('[calculate-result] Auth with cookies result:', {
        hasUser: !!user,
        userId: user?.id,
        error: error?.message,
      });
    }
    
    // Log final do auth check
    console.log('[calculate-result] Auth check result:', {
      hasUser: !!user,
      userId: user?.id,
      userEmail: user?.email,
      requestUserId: userId,
      userIdMatch: user?.id === userId,
      authError: authError?.message,
      authMethod: token ? 'Authorization header' : 'Cookies',
    });
    
    if (authError || !user) {
      console.error('[calculate-result] Authentication failed:', {
        error: authError?.message,
        code: authError?.status,
        name: authError?.name,
        hasUser: !!user,
        hasToken: !!token,
        hasCookies: !!cookieHeader,
        reason: !user ? 'No user found' : 'Auth error',
      });
      return NextResponse.json(
        { 
          error: 'Usuário não autenticado', 
          message: 'Sua sessão expirou ou não foi encontrada. Por favor, faça login novamente.',
          code: 'AUTH_SESSION_MISSING',
          debug: {
            hasToken: !!token,
            hasCookies: !!cookieHeader,
            authError: authError?.message,
          }
        },
        { status: 401 }
      );
    }

    // Verificar se o userId corresponde ao usuário autenticado
    if (user.id !== userId) {
      console.error('[calculate-result] User ID mismatch:', {
        authUserId: user.id,
        requestUserId: userId,
      });
      return NextResponse.json(
        { error: 'Usuário não autorizado', details: 'ID do usuário não corresponde' },
        { status: 403 }
      );
    }

    console.log('[calculate-result] User authenticated:', {
      userId: user.id,
      email: user.email,
    });

    // Converter respostas para formato estendido
    const extendedAnswers: ExtendedAnswer[] = answers.map((answer: any) => ({
      questionId: answer.questionId,
      selectedOptions: answer.selectedOptions.map((opt: any) => ({
        type: opt.type,
        valueType: opt.valueType,
        psychTraits: opt.psychTraits,
      })),
    }));

    console.log('[calculate-result] Extended answers:', {
      count: extendedAnswers.length,
      sample: extendedAnswers[0],
    });

    // Calcular perfil integrado (DISC + Valores + Tipos Psicológicos)
    let integratedProfile;
    try {
      integratedProfile = calculateIntegratedProfile(extendedAnswers);
      console.log('[calculate-result] Integrated profile calculated:', {
        hasDisc: !!integratedProfile.disc,
        hasValues: !!integratedProfile.values,
        hasPsychological: !!integratedProfile.psychological,
        dominant: integratedProfile.disc.dominant,
      });
    } catch (profileError: any) {
      console.error('[calculate-result] Error calculating profile:', {
        message: profileError?.message,
        stack: profileError?.stack,
        extendedAnswersCount: extendedAnswers.length,
      });
      throw new Error(`Erro ao calcular perfil: ${profileError?.message}`);
    }

    // Extrair scores DISC para compatibilidade
    const scores = integratedProfile.disc.scores;
    const percentages = integratedProfile.disc.percentages;
    const dominantProfile = integratedProfile.disc.dominant;

    // 🤖 USAR MARINA (AGENTE IA) - Com perfil integrado
    const registry = getAgentRegistry();
    const marina = registry.getAgent('behavior-analyst');

    let marinaResponse;
    try {
      marinaResponse = await marina.execute(
        {
          scores,
          percentages,
          dominantProfile,
          questionCount: answers.length,
          // Novos campos opcionais
          valueProfile: integratedProfile.values,
          psychologicalProfile: integratedProfile.psychological,
        },
        {
          userId,
          userName: userName || 'Usuário',
          userEmail,
          jobTitle,
          company,
          testObjective,
        }
      );
      
      console.log('[calculate-result] Marina executed:', {
        success: marinaResponse.success,
        usedFallback: marinaResponse.usedFallback,
      });
    } catch (marinaError: any) {
      console.error('[calculate-result] Error executing Marina:', {
        message: marinaError?.message,
        stack: marinaError?.stack,
      });
      // Usar fallback se Marina falhar
      marinaResponse = {
        success: false,
        usedFallback: true,
        executionTime: 0,
        data: { analysis: 'Análise não disponível no momento.' },
      };
    }

    // Usar análise da Marina ou fallback
    const analysis = marinaResponse.success 
      ? marinaResponse.data?.analysis 
      : 'Análise não disponível no momento.';

    console.log('[Marina]', {
      success: marinaResponse.success,
      usedFallback: marinaResponse.usedFallback,
      executionTime: `${marinaResponse.executionTime}ms`,
      hasValues: !!integratedProfile.values,
      hasPsychological: !!integratedProfile.psychological,
    });

    console.log('[calculate-result] Preparing to save test:', {
      userId,
      answersCount: answers.length,
      questionsCount: questions.length,
      hasAnalysis: !!analysis,
    });

    // Testar contexto RLS antes do INSERT principal
    console.log('[calculate-result] Testing RLS context...');
    const { error: rlsTestError } = await supabaseWithAuth
      .from('disc_tests')
      .select('id')
      .limit(1);
    
    console.log('[calculate-result] RLS context test:', {
      ok: !rlsTestError,
      error: rlsTestError?.message,
      code: rlsTestError?.code,
    });

    // Salvar no banco de dados com perfil integrado
    try {
      const testPayload = {
        user_id: userId,
        questions,
        answers,
        result: {
          scores,
          percentages,
          dominantProfile,
          analysis,
        },
        ai_analysis: analysis,
        dominant_profile: dominantProfile,
        scores,
        question_count: answers.length,
        question_source: 'legacy' as const,
        // Novos campos do perfil integrado
        value_scores: integratedProfile.values?.scores,
        dominant_values: integratedProfile.values 
          ? [integratedProfile.values.dominant, ...integratedProfile.values.secondary] 
          : undefined,
        value_percentages: integratedProfile.values?.percentages,
        psychological_scores: integratedProfile.psychological?.scores,
        psychological_profile: integratedProfile.psychological,
        integrated_analysis: analysis,
      };

      console.log('[calculate-result] Test payload:', {
        user_id: testPayload.user_id,
        authUserId: user.id,
        userIdMatch: testPayload.user_id === user.id,
        hasToken: !!token,
        questionCount: testPayload.question_count,
      });

      await discTestService.saveTest(testPayload, supabaseWithAuth); // ← Passar o client autenticado com JWT
      
      console.log('[calculate-result] Test saved successfully');

      // 🎓 LEARNING SYSTEM: Processar feedback do teste (assíncrono)
      // Não bloqueia a resposta ao usuário
      processTestFeedback({
        testId: testPayload.user_id, // Usar user_id como identificador temporário
        userId,
        questions,
        answers,
        userContext: {
          jobTitle: jobTitle || '',
          company,
          testObjective: testObjective || '',
        },
        completionRate: 1.0, // Teste foi concluído
        totalTime: 0, // TODO: Calcular tempo total
        dominantProfile,
      }).catch(err => {
        console.error('[calculate-result] Error processing feedback (non-blocking):', err);
      });
    } catch (saveError: any) {
      console.error('[calculate-result] Error saving test:', {
        message: saveError?.message,
        code: saveError?.code,
        details: saveError?.details,
        hint: saveError?.hint,
        stack: saveError?.stack,
      });
      throw new Error(`Erro ao salvar teste: ${saveError?.message || 'Erro desconhecido'}`);
    }

    return NextResponse.json({
      success: true,
      result: {
        scores,
        percentages,
        dominantProfile,
        analysis,
      },
    });
  } catch (error: any) {
    console.error('[calculate-result] Error:', {
      message: error?.message,
      code: error?.code,
      details: error?.details,
      hint: error?.hint,
      stack: error?.stack,
    });
    
    return NextResponse.json(
      { 
        error: 'Erro ao calcular resultado',
        details: error?.message || 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
