/**
 * API: Generate Questions
 * Busca perguntas do banco inteligente PRIMEIRO, gera com IA apenas se necessário
 * OTIMIZADO PARA PERFORMANCE
 */

import { NextResponse } from 'next/server';
import { getAgentRegistry } from '@/lib/agents';
import { questionBankService } from '@/lib/services/questionBankService';
import { questionValidator } from '@/lib/services/questionValidator';
import { performanceTracker } from '@/lib/services/performanceTracker';
import { questionBankArrayToExtended } from '@/types/question-bank';
import { questions as fallbackQuestions } from '@/data/questions';

export async function POST(request: Request) {
  const loadStartTime = Date.now();
  const timings: Record<string, number> = {};
  
  try {
    const { userId, userName, userEmail, jobTitle, company, testObjective, questionCount = 20 } = await request.json();

    console.log('[generate-questions] 🚀 Load test start:', {
      userId,
      questionCount,
      timestamp: new Date().toISOString(),
    });

    // Validações
    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    if (questionCount < 10 || questionCount > 100) {
      return NextResponse.json(
        { error: 'questionCount deve estar entre 10 e 100' },
        { status: 400 }
      );
    }

    // 🎯 FASE 1: BUSCAR NO BANCO INTELIGENTE PRIMEIRO (OTIMIZADO)
    const bankQueryStart = Date.now();
    
    const searchResult = await questionBankService.selectQuestions({
      question_count: questionCount,
      user_context: {
        user_id: userId,
        job_title: jobTitle,
        company,
        test_objective: testObjective,
      },
      min_quality_score: 60,
    });

    timings.bank_query_ms = Date.now() - bankQueryStart;

    console.log('[generate-questions] 📊 Bank query completed:', {
      found: searchResult.found_count,
      needed: questionCount,
      time_ms: timings.bank_query_ms,
      source: searchResult.source,
    });

    // Se encontrou perguntas suficientes no banco, retornar IMEDIATAMENTE
    if (searchResult.found_count >= questionCount) {
      const normalizationStart = Date.now();
      
      const extendedQuestions = questionBankArrayToExtended(searchResult.questions);
      
      const formattedQuestions = extendedQuestions.map((q) => ({
        id: q.id,
        question: q.text,
        options: q.options.map((opt) => ({
          text: opt.text,
          type: opt.type,
          valueType: opt.valueType,
          psychTraits: opt.psychTraits,
        })),
      }));

      timings.question_normalization_ms = Date.now() - normalizationStart;
      timings.total_load_ms = Date.now() - loadStartTime;
      timings.ai_called = 0;
      timings.ai_generation_ms = 0;

      console.log('[generate-questions] ✅ Returning questions from bank:', {
        questions_loaded: formattedQuestions.length,
        questions_from_bank: searchResult.found_count,
        questions_from_ai: 0,
        timings,
      });

      // 📊 Track usage ASYNCHRONOUSLY (não bloqueia resposta)
      const questionIds = searchResult.questions.map(q => q.id);
      performanceTracker.recordBatchUsage(questionIds, userId, {
        test_objective: testObjective,
        job_title: jobTitle,
        company,
      }).catch(err => console.error('[PerformanceTracker] Error recording usage:', err));

      return NextResponse.json({
        questions: formattedQuestions,
        source: 'bank',
        metadata: {
          questionCount: formattedQuestions.length,
          generatedAt: new Date(),
          hasIntegratedProfile: true,
          timings,
        },
      });
    }

    // 🤖 FASE 2: GERAR PERGUNTAS FALTANTES COM IA (apenas se necessário)
    const remainingCount = questionCount - searchResult.found_count;
    console.log(`[generate-questions] ⚠️ Insufficient questions in bank, generating ${remainingCount} with AI...`);

    timings.ai_called = 1;
    const aiGenerationStart = Date.now();

    try {
      const registry = getAgentRegistry();
      const questionGenerator = registry.getAgent('question-generator');

      // Passar perguntas já selecionadas para evitar duplicação
      const excludeQuestions = searchResult.questions.map(q => q.question_text);

      const response = await questionGenerator.execute(
        {
          questionCount: remainingCount,
          userContext: {
            job_title: jobTitle,
            company,
            test_objective: testObjective,
          },
          excludeQuestions,
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

      timings.ai_generation_ms = Date.now() - aiGenerationStart;

      console.log('[generate-questions] 🤖 AI generation completed:', {
        success: response.success,
        usedFallback: response.usedFallback,
        time_ms: timings.ai_generation_ms,
        questionCount: response.data?.questions?.length || 0,
      });

      if (response.success && response.data?.questions) {
        const normalizationStart = Date.now();
        
        // 🔍 FASE 3: VALIDAR E SALVAR PERGUNTAS GERADAS (ASSÍNCRONO)
        const generatedQuestions = response.data.questions;
        
        // Salvar perguntas ASYNCHRONOUSLY (não bloqueia resposta)
        saveGeneratedQuestionsAsync(generatedQuestions, userId).catch(err => 
          console.error('[generate-questions] Error saving questions:', err)
        );

        // Combine bank questions + generated questions
        const extendedBankQuestions = questionBankArrayToExtended(searchResult.questions);
        const allQuestions = [...extendedBankQuestions, ...generatedQuestions];

        const formattedQuestions = allQuestions.map((q: any) => ({
          id: q.id,
          question: q.text,
          options: q.options.map((opt: any) => ({
            text: opt.text,
            type: opt.type,
            valueType: opt.valueType,
            psychTraits: opt.psychTraits,
          })),
        }));

        timings.question_normalization_ms = Date.now() - normalizationStart;
        timings.total_load_ms = Date.now() - loadStartTime;

        console.log('[generate-questions] ✅ Returning mixed questions:', {
          questions_loaded: formattedQuestions.length,
          questions_from_bank: searchResult.found_count,
          questions_from_ai: generatedQuestions.length,
          timings,
        });

        // 📊 Track usage ASYNCHRONOUSLY (não bloqueia resposta)
        if (searchResult.questions.length > 0) {
          const questionIds = searchResult.questions.map(q => q.id);
          performanceTracker.recordBatchUsage(questionIds, userId, {
            test_objective: testObjective,
            job_title: jobTitle,
            company,
          }).catch(err => console.error('[PerformanceTracker] Error recording usage:', err));
        }

        return NextResponse.json({
          questions: formattedQuestions,
          source: 'mixed',
          metadata: {
            questionCount: formattedQuestions.length,
            fromBank: searchResult.found_count,
            generated: generatedQuestions.length,
            generatedAt: new Date(),
            hasIntegratedProfile: true,
            timings,
          },
        });
      }
    } catch (error) {
      timings.ai_generation_ms = Date.now() - aiGenerationStart;
      console.error('[generate-questions] ❌ AI generation error, using fallback:', error);
    }

    // Fallback: usar perguntas fixas
    console.log('[generate-questions] ⚠️ Using fallback questions');
    
    const fallbackStart = Date.now();
    
    // Se pediu mais de 20, criar variações
    let questions = [...fallbackQuestions];
    
    if (questionCount > 20) {
      const prefixes = [
        'Em uma situação desafiadora',
        'Durante um projeto importante',
        'Em uma reunião de equipe',
        'Ao lidar com um conflito',
        'Quando precisa tomar uma decisão',
        'Em um momento de pressão',
      ];

      while (questions.length < questionCount) {
        const baseQuestion = fallbackQuestions[questions.length % fallbackQuestions.length];
        const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];
        
        questions.push({
          ...baseQuestion,
          id: questions.length + 1,
          text: `${prefix}, ${baseQuestion.text.toLowerCase()}`,
        });
      }
    }

    const formattedQuestions = questions.slice(0, questionCount).map((q) => ({
      id: q.id,
      question: q.text,
      options: q.options.map((opt) => ({
        text: opt.text,
        type: opt.discType,
        // Sem valueType nem psychTraits no fallback
      })),
    }));

    timings.question_normalization_ms = Date.now() - fallbackStart;
    timings.total_load_ms = Date.now() - loadStartTime;

    console.log('[generate-questions] ✅ Returning fallback questions:', {
      questions_loaded: formattedQuestions.length,
      questions_from_bank: 0,
      questions_from_ai: 0,
      timings,
    });

    return NextResponse.json({
      questions: formattedQuestions,
      source: 'fallback',
      metadata: {
        questionCount: formattedQuestions.length,
        generatedAt: new Date(),
        hasIntegratedProfile: false,
        timings,
      },
    });
  } catch (error) {
    timings.total_load_ms = Date.now() - loadStartTime;
    
    console.error('[generate-questions] ❌ Error:', {
      error,
      timings,
    });
    
    return NextResponse.json(
      { error: 'Erro ao gerar perguntas' },
      { status: 500 }
    );
  }
}

/**
 * Save generated questions asynchronously (não bloqueia resposta)
 */
async function saveGeneratedQuestionsAsync(generatedQuestions: any[], userId: string) {
  const saveStart = Date.now();
  let savedCount = 0;
  let skippedCount = 0;

  console.log('[saveGeneratedQuestionsAsync] 💾 Starting background save:', {
    total: generatedQuestions.length,
  });

  for (const q of generatedQuestions) {
    try {
      // Convert to QuestionBankEntry format for validation
      const questionEntry = {
        question_text: q.text,
        options: q.options,
        disc_type: q.options[0].type,
        value_types: q.options.map((opt: any) => opt.valueType).filter(Boolean),
        psychological_traits: {
          energy: [],
          perception: [],
          decision: [],
          organization: [],
        },
        context_tags: [],
        profession_tags: [],
        seniority_tags: [],
        objective_tags: [],
        industry_tags: [],
        difficulty_level: 'medium' as const,
        quality_score: 70,
        clarity_score: 70,
        discrimination_power: 0.5,
        usage_count: 0,
        completion_rate: 100,
        user_feedback_score: 3.0,
        created_at: new Date(),
        last_used_at: null,
        last_updated_at: new Date(),
        status: 'active' as const,
        source: 'ai-generated' as const,
        created_by: null,
        embedding_vector: null,
        id: '',
      };

      // Validate question (rápido)
      const validation = await questionValidator.validate(questionEntry);

      if (validation.valid && validation.question) {
        // Save to bank (pode ser lento, mas é assíncrono)
        await questionBankService.saveQuestion(validation.question);
        savedCount++;
      } else {
        console.warn('[saveGeneratedQuestionsAsync] Question failed validation:', validation.errors);
        skippedCount++;
      }
    } catch (saveError) {
      console.error('[saveGeneratedQuestionsAsync] Error saving question:', saveError);
      skippedCount++;
    }
  }

  const saveTime = Date.now() - saveStart;
  console.log('[saveGeneratedQuestionsAsync] ✅ Background save completed:', {
    total: generatedQuestions.length,
    saved: savedCount,
    skipped: skippedCount,
    time_ms: saveTime,
  });
}
