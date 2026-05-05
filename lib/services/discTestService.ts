/**
 * DISC Test Service
 * Serviço para testes DISC
 */

import { supabase } from '../supabase/client';
import type { DISCTest, Question, Answer, DISCScores, DISCType } from '@/types/database';

export const discTestService = {
  /**
   * Salvar teste completo
   */
  async saveTest(test: Omit<DISCTest, 'id' | 'created_at'>): Promise<DISCTest> {
    const { data, error } = await supabase
      .from('disc_tests')
      .insert(test)
      .select()
      .single();

    if (error) throw error;
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
