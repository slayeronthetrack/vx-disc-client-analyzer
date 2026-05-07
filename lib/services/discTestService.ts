/**
 * DISC Test Service
 * Serviço para testes DISC
 */

import { supabase } from '../supabase/client';
import type { SupabaseClient } from '@supabase/supabase-js';
import type { DISCTest, Question, Answer, DISCScores, DISCType } from '@/types/database';

export const discTestService = {
  /**
   * Salvar teste completo
   * Compatível com tabelas antigas e novas (com/sem campos de perfil integrado)
   * @param test - Dados do teste
   * @param client - Cliente Supabase (opcional, usa client padrão se não fornecido)
   */
  async saveTest(
    test: Omit<DISCTest, 'id' | 'created_at'>,
    client?: SupabaseClient
  ): Promise<DISCTest> {
    const supabaseClient = client || supabase;
    
    // Campos obrigatórios que sempre existem
    const basePayload: any = {
      user_id: test.user_id,
      questions: test.questions,
      answers: test.answers,
      result: test.result,
      ai_analysis: test.ai_analysis,
      dominant_profile: test.dominant_profile,
      scores: test.scores,
    };

    console.log('[discTestService] Attempting to save test:', {
      userId: test.user_id,
      hasClient: !!client,
      clientType: client ? 'server' : 'browser',
    });

    // Tentar inserir com campos novos primeiro
    let { data, error } = await supabaseClient
      .from('disc_tests')
      .insert({
        ...basePayload,
        question_count: test.question_count,
        question_source: test.question_source,
        generated_questions: test.generated_questions,
        value_scores: test.value_scores,
        dominant_values: test.dominant_values,
        value_percentages: test.value_percentages,
        psychological_scores: test.psychological_scores,
        psychological_profile: test.psychological_profile,
        integrated_analysis: test.integrated_analysis,
      })
      .select()
      .single();

    // Se falhar por coluna inexistente, tentar apenas com campos base
    if (error && (error.code === '42703' || error.message?.includes('column'))) {
      console.warn('[discTestService] Tabela sem campos novos, usando apenas campos base');
      
      const fallbackResult = await supabaseClient
        .from('disc_tests')
        .insert(basePayload)
        .select()
        .single();

      data = fallbackResult.data;
      error = fallbackResult.error;
    }

    if (error) {
      console.error('[discTestService] Error saving test:', {
        message: error.message,
        code: error.code,
        details: error.details,
        hint: error.hint,
        userId: test.user_id,
      });
      throw error;
    }

    console.log('[discTestService] Test saved successfully:', {
      testId: data.id,
      userId: data.user_id,
    });

    return data;
  },

  /**
   * Buscar último teste do usuário
   */
  async getLatestTest(userId: string): Promise<DISCTest | null> {
    const { data, error } = await supabase
      .from('disc_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Buscar todos os testes do usuário
   */
  async getUserTests(userId: string): Promise<DISCTest[]> {
    const { data, error } = await supabase
      .from('disc_tests')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  },

  /**
   * Buscar resumo de testes do usuário (para histórico)
   * Retorna apenas campos necessários para listagem
   */
  async getUserTestsSummary(userId: string) {
    const { data, error } = await supabase
      .from('disc_tests')
      .select('id, created_at, question_count, dominant_profile, dominant_values, psychological_profile, user_context')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(test => ({
      id: test.id,
      created_at: test.created_at,
      question_count: test.question_count || 20,
      dominant_profile: test.dominant_profile,
      dominant_value: test.dominant_values?.[0] || null,
      psychological_code: test.psychological_profile?.code || null,
      test_objective: (test.user_context as any)?.test_objective || null,
    }));
  },

  /**
   * Buscar teste específico por ID
   * Verifica se o teste pertence ao usuário (segurança)
   */
  async getTestById(testId: string, userId: string): Promise<DISCTest | null> {
    const { data, error } = await supabase
      .from('disc_tests')
      .select('*')
      .eq('id', testId)
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') return null; // Not found
      throw error;
    }

    return data;
  },

  /**
   * Filtrar testes por data
   */
  async getUserTestsByDateRange(userId: string, days: number) {
    const dateFrom = new Date();
    dateFrom.setDate(dateFrom.getDate() - days);

    const { data, error } = await supabase
      .from('disc_tests')
      .select('id, created_at, question_count, dominant_profile, dominant_values, psychological_profile, user_context')
      .eq('user_id', userId)
      .gte('created_at', dateFrom.toISOString())
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(test => ({
      id: test.id,
      created_at: test.created_at,
      question_count: test.question_count || 20,
      dominant_profile: test.dominant_profile,
      dominant_value: test.dominant_values?.[0] || null,
      psychological_code: test.psychological_profile?.code || null,
      test_objective: (test.user_context as any)?.test_objective || null,
    }));
  },

  /**
   * Filtrar testes por perfil dominante
   */
  async getUserTestsByProfile(userId: string, profile: DISCType) {
    const { data, error } = await supabase
      .from('disc_tests')
      .select('id, created_at, question_count, dominant_profile, dominant_values, psychological_profile, user_context')
      .eq('user_id', userId)
      .eq('dominant_profile', profile)
      .order('created_at', { ascending: false });

    if (error) throw error;
    
    return (data || []).map(test => ({
      id: test.id,
      created_at: test.created_at,
      question_count: test.question_count || 20,
      dominant_profile: test.dominant_profile,
      dominant_value: test.dominant_values?.[0] || null,
      psychological_code: test.psychological_profile?.code || null,
      test_objective: (test.user_context as any)?.test_objective || null,
    }));
  },

  /**
   * Verificar se usuário tem teste concluído
   */
  async hasCompletedTest(userId: string): Promise<boolean> {
    const test = await this.getLatestTest(userId);
    return !!test;
  },

  /**
   * Calcular pontuação DISC
   */
  calculateScores(answers: Answer[]): DISCScores {
    const scores: DISCScores = { D: 0, I: 0, S: 0, C: 0 };

    answers.forEach((answer) => {
      answer.selectedOptions.forEach((option) => {
        scores[option]++;
      });
    });

    return scores;
  },

  /**
   * Calcular percentuais
   */
  calculatePercentages(scores: DISCScores) {
    const total = scores.D + scores.I + scores.S + scores.C;
    
    return {
      D: Math.round((scores.D / total) * 100),
      I: Math.round((scores.I / total) * 100),
      S: Math.round((scores.S / total) * 100),
      C: Math.round((scores.C / total) * 100),
    };
  },

  /**
   * Determinar perfil dominante
   */
  getDominantProfile(scores: DISCScores): DISCType {
    const entries = Object.entries(scores) as [DISCType, number][];
    const sorted = entries.sort((a, b) => b[1] - a[1]);
    return sorted[0][0];
  },
};
