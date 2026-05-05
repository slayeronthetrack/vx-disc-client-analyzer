/**
 * Admin Service - VX DISC
 * Serviço para funcionalidades administrativas
 */

import { supabase } from '@/lib/supabase/client';

export interface AdminUser {
  id: string;
  full_name: string;
  email: string;
  job_title?: string;
  company?: string;
  test_objective?: string;
  created_at: string;
  has_completed_test: boolean;
  dominant_profile?: 'D' | 'I' | 'S' | 'C';
  test_completed_at?: string;
  scores?: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

export interface AdminStats {
  totalUsers: number;
  completedTests: number;
  pendingTests: number;
  profileDistribution: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  recentSignups: number;
  testsThisWeek: number;
  testsThisMonth: number;
  averageScore: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
}

export interface TestDetail {
  id: string;
  user_id: string;
  user_name: string;
  user_email: string;
  dominant_profile: 'D' | 'I' | 'S' | 'C';
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  ai_analysis: string;
  created_at: string;
  answers: any[];
}

class AdminService {
  /**
   * Busca todos os usuários com informações de teste
   */
  async getAllUsers(): Promise<AdminUser[]> {
    try {
      // Buscar perfis
      const { data: profiles, error: profilesError } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (profilesError) throw profilesError;

      // Buscar testes para cada usuário
      const usersWithTests = await Promise.all(
        (profiles || []).map(async (profile) => {
          const { data: tests } = await supabase
            .from('disc_tests')
            .select('*')
            .eq('user_id', profile.user_id)
            .order('created_at', { ascending: false })
            .limit(1);

          const latestTest = tests?.[0];

          return {
            id: profile.user_id,
            full_name: profile.full_name,
            email: profile.email,
            job_title: profile.job_title,
            company: profile.company,
            test_objective: profile.test_objective,
            created_at: profile.created_at,
            has_completed_test: !!latestTest,
            dominant_profile: latestTest?.dominant_profile,
            test_completed_at: latestTest?.created_at,
            scores: latestTest?.scores,
          };
        })
      );

      return usersWithTests;
    } catch (error) {
      console.error('Error fetching users:', error);
      return [];
    }
  }

  /**
   * Busca estatísticas gerais
   */
  async getStats(): Promise<AdminStats> {
    try {
      const users = await this.getAllUsers();

      const totalUsers = users.length;
      const completedTests = users.filter(u => u.has_completed_test).length;
      const pendingTests = totalUsers - completedTests;

      // Distribuição de perfis
      const profileDistribution = { D: 0, I: 0, S: 0, C: 0 };
      users.forEach(user => {
        if (user.dominant_profile) {
          profileDistribution[user.dominant_profile]++;
        }
      });

      // Cadastros recentes (últimos 7 dias)
      const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      const recentSignups = users.filter(
        u => new Date(u.created_at) > sevenDaysAgo
      ).length;

      // Testes desta semana
      const testsThisWeek = users.filter(
        u => u.test_completed_at && new Date(u.test_completed_at) > sevenDaysAgo
      ).length;

      // Testes deste mês
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
      const testsThisMonth = users.filter(
        u => u.test_completed_at && new Date(u.test_completed_at) > thirtyDaysAgo
      ).length;

      // Média de scores
      const usersWithScores = users.filter(u => u.scores);
      const averageScore = { D: 0, I: 0, S: 0, C: 0 };
      
      if (usersWithScores.length > 0) {
        usersWithScores.forEach(user => {
          if (user.scores) {
            averageScore.D += user.scores.D;
            averageScore.I += user.scores.I;
            averageScore.S += user.scores.S;
            averageScore.C += user.scores.C;
          }
        });

        averageScore.D = Math.round(averageScore.D / usersWithScores.length);
        averageScore.I = Math.round(averageScore.I / usersWithScores.length);
        averageScore.S = Math.round(averageScore.S / usersWithScores.length);
        averageScore.C = Math.round(averageScore.C / usersWithScores.length);
      }

      return {
        totalUsers,
        completedTests,
        pendingTests,
        profileDistribution,
        recentSignups,
        testsThisWeek,
        testsThisMonth,
        averageScore,
      };
    } catch (error) {
      console.error('Error fetching stats:', error);
      return {
        totalUsers: 0,
        completedTests: 0,
        pendingTests: 0,
        profileDistribution: { D: 0, I: 0, S: 0, C: 0 },
        recentSignups: 0,
        testsThisWeek: 0,
        testsThisMonth: 0,
        averageScore: { D: 0, I: 0, S: 0, C: 0 },
      };
    }
  }

  /**
   * Busca detalhes de um teste específico
   */
  async getTestDetail(userId: string): Promise<TestDetail | null> {
    try {
      // Buscar perfil do usuário
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (!profile) return null;

      // Buscar último teste
      const { data: test } = await supabase
        .from('disc_tests')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!test) return null;

      return {
        id: test.id,
        user_id: userId,
        user_name: profile.full_name,
        user_email: profile.email,
        dominant_profile: test.dominant_profile,
        scores: test.scores,
        ai_analysis: test.ai_analysis || '',
        created_at: test.created_at,
        answers: test.answers || [],
      };
    } catch (error) {
      console.error('Error fetching test detail:', error);
      return null;
    }
  }

  /**
   * Filtra usuários por perfil dominante
   */
  async getUsersByProfile(profile: 'D' | 'I' | 'S' | 'C'): Promise<AdminUser[]> {
    const users = await this.getAllUsers();
    return users.filter(u => u.dominant_profile === profile);
  }

  /**
   * Busca usuários por termo de busca
   */
  async searchUsers(searchTerm: string): Promise<AdminUser[]> {
    const users = await this.getAllUsers();
    const term = searchTerm.toLowerCase();
    
    return users.filter(u =>
      u.full_name.toLowerCase().includes(term) ||
      u.email.toLowerCase().includes(term) ||
      u.company?.toLowerCase().includes(term) ||
      u.job_title?.toLowerCase().includes(term)
    );
  }

  /**
   * Exporta dados para CSV
   */
  async exportToCSV(): Promise<string> {
    const users = await this.getAllUsers();

    const headers = [
      'Nome',
      'Email',
      'Cargo',
      'Empresa',
      'Status',
      'Perfil DISC',
      'Score D',
      'Score I',
      'Score S',
      'Score C',
      'Data Cadastro',
      'Data Teste',
    ];

    const rows = users.map(u => [
      u.full_name,
      u.email,
      u.job_title || '',
      u.company || '',
      u.has_completed_test ? 'Concluído' : 'Pendente',
      u.dominant_profile || '',
      u.scores?.D || '',
      u.scores?.I || '',
      u.scores?.S || '',
      u.scores?.C || '',
      new Date(u.created_at).toLocaleDateString('pt-BR'),
      u.test_completed_at ? new Date(u.test_completed_at).toLocaleDateString('pt-BR') : '',
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
    ].join('\n');

    return csv;
  }

  /**
   * Verifica se usuário é admin
   */
  async isAdmin(userId: string): Promise<boolean> {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('is_admin')
        .eq('user_id', userId)
        .single();

      return profile?.is_admin || false;
    } catch (error) {
      return false;
    }
  }
}

export const adminService = new AdminService();
