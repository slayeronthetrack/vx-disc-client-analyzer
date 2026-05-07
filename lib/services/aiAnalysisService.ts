/**
 * AI Analysis Service
 * Serviço para gerar análises personalizadas com IA
 */

interface DISCScores {
  D: number;
  I: number;
  S: number;
  C: number;
}

interface UserProfile {
  full_name: string;
  job_title?: string;
  company?: string;
  test_objective?: string;
}

interface AnalysisRequest {
  scores: DISCScores;
  dominantProfile: 'D' | 'I' | 'S' | 'C';
  userProfile: UserProfile;
}

export const aiAnalysisService = {
  /**
   * Gerar análise personalizada com IA
   */
  async generatePersonalizedAnalysis(request: AnalysisRequest): Promise<string> {
    try {
      const response = await fetch('/api/ai/analyze-disc', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar análise');
      }

      const data = await response.json();
      return data.analysis;
    } catch (error) {
      console.error('Error generating analysis:', error);
      throw error;
    }
  },

  /**
   * Gerar recomendações de desenvolvimento
   */
  async generateDevelopmentPlan(request: AnalysisRequest): Promise<{
    strengths: string[];
    improvements: string[];
    actionPlan: string[];
  }> {
    try {
      const response = await fetch('/api/ai/development-plan', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      if (!response.ok) {
        throw new Error('Erro ao gerar plano de desenvolvimento');
      }

      const data = await response.json();
      return data;
    } catch (error) {
      console.error('Error generating development plan:', error);
      throw error;
    }
  },
};
