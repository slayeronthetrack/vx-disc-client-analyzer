/**
 * Learning System - Sistema de Aprendizado Contínuo
 * Aprende com cada teste e melhora automaticamente
 */

import { supabase } from '../supabase/client';
import { questionBankService } from './questionBankService';
import { performanceTracker } from './performanceTracker';
import type { QuestionBankEntry } from '@/types/question-bank';

interface TestFeedback {
  testId: string;
  userId: string;
  questions: Array<{
    id: string;
    text: string;
    options: any[];
    responseTime: number;
    wasChanged: boolean;
    finalAnswer: string[];
  }>;
  userContext: {
    jobTitle: string;
    company?: string;
    testObjective: string;
    industry?: string;
    seniority?: string;
  };
  completionRate: number;
  totalTime: number;
  dominantProfile: string;
}

interface ProfilePattern {
  jobTitle: string;
  normalizedTitle: string;
  category: string;
  frequency: number;
  lastSeen: Date;
  relatedTitles: string[];
}

interface ObjectivePattern {
  objective: string;
  normalizedObjective: string;
  category: string;
  frequency: number;
  lastSeen: Date;
  relatedObjectives: string[];
}

export class LearningSystem {
  /**
   * Processa feedback de um teste concluído
   * Aprende com as respostas e melhora o sistema
   */
  async processFeedback(feedback: TestFeedback): Promise<void> {
    console.log('[LearningSystem] Processing feedback:', {
      testId: feedback.testId,
      userId: feedback.userId,
      questionCount: feedback.questions.length,
      completionRate: feedback.completionRate,
    });

    try {
      // 1. Salvar perguntas bem-sucedidas no banco
      await this.saveSuccessfulQuestions(feedback);

      // 2. Atualizar métricas de performance
      await this.updatePerformanceMetrics(feedback);

      // 3. Descobrir novos perfis profissionais
      await this.discoverNewProfiles(feedback.userContext);

      // 4. Descobrir novos objetivos
      await this.discoverNewObjectives(feedback.userContext);

      // 5. Atualizar embeddings (assíncrono)
      this.updateEmbeddings(feedback).catch(err => 
        console.error('[LearningSystem] Error updating embeddings:', err)
      );

      console.log('[LearningSystem] Feedback processed successfully');
    } catch (error) {
      console.error('[LearningSystem] Error processing feedback:', error);
      // Não lançar erro - aprendizado é opcional
    }
  }

  /**
   * Salva perguntas bem-sucedidas no banco inteligente
   */
  private async saveSuccessfulQuestions(feedback: TestFeedback): Promise<void> {
    const successfulQuestions = feedback.questions.filter(q => {
      // Critérios de sucesso:
      // 1. Respondida rapidamente (< 30s)
      // 2. Não foi alterada (confiança na resposta)
      // 3. Faz parte de teste com alta taxa de conclusão
      return (
        q.responseTime < 30000 &&
        !q.wasChanged &&
        feedback.completionRate > 0.8
      );
    });

    console.log('[LearningSystem] Saving successful questions:', {
      total: feedback.questions.length,
      successful: successfulQuestions.length,
    });

    for (const question of successfulQuestions) {
      try {
        // Verificar se pergunta já existe
        const existing = await this.questionExists(question.text);
        
        if (existing) {
          // Atualizar métricas da pergunta existente
          await this.updateQuestionMetrics(existing.id, {
            usageCount: existing.usage_count + 1,
            avgResponseTime: question.responseTime,
            completionRate: feedback.completionRate,
          });
        } else {
          // Salvar nova pergunta
          const questionEntry: Partial<QuestionBankEntry> = {
            question_text: question.text,
            options: question.options,
            disc_type: this.inferDISCType(question.finalAnswer),
            context_tags: this.extractContextTags(feedback.userContext),
            profession_tags: [this.mapToProfessionTag(feedback.userContext.jobTitle)],
            objective_tags: [this.mapToObjectiveTag(feedback.userContext.testObjective)],
            difficulty_level: this.calculateDifficulty(question.responseTime),
            quality_score: this.calculateQualityScore(question, feedback),
            clarity_score: this.calculateClarityScore(question),
            usage_count: 1,
            completion_rate: feedback.completionRate * 100,
            user_feedback_score: 3.0, // Neutro inicialmente
            status: 'active',
            source: 'manual',
            created_at: new Date(),
            last_used_at: new Date(),
            last_updated_at: new Date(),
          };

          await questionBankService.saveQuestion(questionEntry as QuestionBankEntry);
          console.log('[LearningSystem] New question saved:', question.text.substring(0, 50));
        }
      } catch (error) {
        console.error('[LearningSystem] Error saving question:', error);
        // Continuar com próxima pergunta
      }
    }
  }

  /**
   * Atualiza métricas de performance das perguntas
   */
  private async updatePerformanceMetrics(feedback: TestFeedback): Promise<void> {
    for (const question of feedback.questions) {
      try {
        // Skip temporary IDs (like "q-1", "q-2") - only track real UUIDs
        const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(question.id);
        if (!isUUID) {
          // Silently skip - these are temporary IDs from generated questions
          continue;
        }
        
        // Record usage with context
        await performanceTracker.recordUsage(
          question.id,
          feedback.userId,
          {
            test_objective: feedback.userContext.testObjective,
            job_title: feedback.userContext.jobTitle,
            company: feedback.userContext.company,
          }
        );
        
        // Record completion with response time
        await performanceTracker.recordCompletion(
          question.id,
          feedback.userId,
          question.finalAnswer[0] || 'unknown',
          question.responseTime
        );
      } catch (error) {
        console.error('[LearningSystem] Error updating metrics:', error);
      }
    }
  }

  /**
   * Descobre novos perfis profissionais automaticamente
   */
  private async discoverNewProfiles(userContext: TestFeedback['userContext']): Promise<void> {
    const { jobTitle } = userContext;
    if (!jobTitle) return;

    const normalized = this.normalizeJobTitle(jobTitle);
    const category = this.categorizeJobTitle(jobTitle);

    try {
      // Buscar perfil existente
      const { data: existing } = await supabase
        .from('discovered_profiles')
        .select('*')
        .eq('normalized_title', normalized)
        .single();

      if (existing) {
        // Atualizar frequência
        await supabase
          .from('discovered_profiles')
          .update({
            frequency: existing.frequency + 1,
            last_seen: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Criar novo perfil
        await supabase
          .from('discovered_profiles')
          .insert({
            job_title: jobTitle,
            normalized_title: normalized,
            category,
            frequency: 1,
            last_seen: new Date().toISOString(),
            related_titles: [jobTitle],
          });

        console.log('[LearningSystem] New profile discovered:', {
          jobTitle,
          normalized,
          category,
        });
      }
    } catch (error) {
      // Tabela pode não existir ainda - criar silenciosamente
      console.warn('[LearningSystem] Could not save profile (table may not exist):', error);
    }
  }

  /**
   * Descobre novos objetivos automaticamente
   */
  private async discoverNewObjectives(userContext: TestFeedback['userContext']): Promise<void> {
    const { testObjective } = userContext;
    if (!testObjective) return;

    const normalized = this.normalizeObjective(testObjective);
    const category = this.categorizeObjective(testObjective);

    try {
      // Buscar objetivo existente
      const { data: existing } = await supabase
        .from('discovered_objectives')
        .select('*')
        .eq('normalized_objective', normalized)
        .single();

      if (existing) {
        // Atualizar frequência
        await supabase
          .from('discovered_objectives')
          .update({
            frequency: existing.frequency + 1,
            last_seen: new Date().toISOString(),
          })
          .eq('id', existing.id);
      } else {
        // Criar novo objetivo
        await supabase
          .from('discovered_objectives')
          .insert({
            objective: testObjective,
            normalized_objective: normalized,
            category,
            frequency: 1,
            last_seen: new Date().toISOString(),
            related_objectives: [testObjective],
          });

        console.log('[LearningSystem] New objective discovered:', {
          testObjective,
          normalized,
          category,
        });
      }
    } catch (error) {
      // Tabela pode não existir ainda - criar silenciosamente
      console.warn('[LearningSystem] Could not save objective (table may not exist):', error);
    }
  }

  /**
   * Atualiza embeddings para busca semântica (assíncrono)
   */
  private async updateEmbeddings(feedback: TestFeedback): Promise<void> {
    // TODO: Implementar geração de embeddings com OpenAI
    // Por enquanto, apenas log
    console.log('[LearningSystem] Embeddings update scheduled');
  }

  // ============================================
  // HELPER METHODS
  // ============================================

  private async questionExists(text: string): Promise<QuestionBankEntry | null> {
    try {
      const { data } = await supabase
        .from('question_bank')
        .select('*')
        .eq('question_text', text)
        .single();
      
      return data;
    } catch {
      return null;
    }
  }

  private async updateQuestionMetrics(
    questionId: string,
    metrics: {
      usageCount: number;
      avgResponseTime: number;
      completionRate: number;
    }
  ): Promise<void> {
    await supabase
      .from('question_bank')
      .update({
        usage_count: metrics.usageCount,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', questionId);
  }

  private inferDISCType(finalAnswer: string[]): 'D' | 'I' | 'S' | 'C' {
    // Inferir tipo DISC dominante das respostas
    const counts = { D: 0, I: 0, S: 0, C: 0 };
    finalAnswer.forEach(answer => {
      if (answer in counts) counts[answer as keyof typeof counts]++;
    });
    
    const dominant = Object.entries(counts).sort((a, b) => b[1] - a[1])[0][0];
    return dominant as 'D' | 'I' | 'S' | 'C';
  }

  private extractContextTags(userContext: TestFeedback['userContext']): string[] {
    const tags: string[] = [];
    
    if (userContext.industry) tags.push(userContext.industry.toLowerCase());
    if (userContext.seniority) tags.push(userContext.seniority.toLowerCase());
    
    return tags;
  }

  private normalizeJobTitle(jobTitle: string): string {
    return jobTitle
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  private categorizeJobTitle(jobTitle: string): string {
    const title = jobTitle.toLowerCase();
    
    if (title.includes('vendas') || title.includes('comercial')) return 'vendas';
    if (title.includes('gerente') || title.includes('gestor') || title.includes('diretor')) return 'lideranca';
    if (title.includes('desenvolvedor') || title.includes('programador') || title.includes('tech')) return 'tecnologia';
    if (title.includes('marketing') || title.includes('comunicação')) return 'marketing';
    if (title.includes('rh') || title.includes('recursos humanos')) return 'rh';
    if (title.includes('financeiro') || title.includes('contábil')) return 'financeiro';
    if (title.includes('operações') || title.includes('logística')) return 'operacoes';
    if (title.includes('atendimento') || title.includes('suporte')) return 'atendimento';
    
    return 'outros';
  }

  private mapToProfessionTag(jobTitle: string): 'sales' | 'engineering' | 'management' | 'operations' | 'creative' | 'support' | 'finance' | 'hr' {
    const title = jobTitle.toLowerCase();
    
    if (title.includes('vendas') || title.includes('comercial')) return 'sales';
    if (title.includes('desenvolvedor') || title.includes('programador') || title.includes('tech') || title.includes('engenheiro')) return 'engineering';
    if (title.includes('gerente') || title.includes('gestor') || title.includes('diretor') || title.includes('coordenador')) return 'management';
    if (title.includes('operações') || title.includes('logística') || title.includes('produção')) return 'operations';
    if (title.includes('marketing') || title.includes('design') || title.includes('criativo')) return 'creative';
    if (title.includes('atendimento') || title.includes('suporte') || title.includes('customer')) return 'support';
    if (title.includes('financeiro') || title.includes('contábil') || title.includes('contador')) return 'finance';
    if (title.includes('rh') || title.includes('recursos humanos') || title.includes('people')) return 'hr';
    
    return 'management'; // Default
  }

  private mapToObjectiveTag(objective: string): 'self-knowledge' | 'team-building' | 'hiring' | 'development' {
    const obj = objective.toLowerCase();
    
    if (obj.includes('autoconhecimento') || obj.includes('conhecer')) return 'self-knowledge';
    if (obj.includes('equipe') || obj.includes('time') || obj.includes('colaboração')) return 'team-building';
    if (obj.includes('contratação') || obj.includes('recrutamento') || obj.includes('seleção')) return 'hiring';
    if (obj.includes('desenvolvimento') || obj.includes('crescimento') || obj.includes('carreira')) return 'development';
    
    return 'self-knowledge'; // Default
  }

  private normalizeObjective(objective: string): string {
    return objective
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9\s]/g, '')
      .replace(/\s+/g, '-');
  }

  private categorizeObjective(objective: string): string {
    const obj = objective.toLowerCase();
    
    if (obj.includes('autoconhecimento') || obj.includes('conhecer')) return 'autoconhecimento';
    if (obj.includes('desenvolvimento') || obj.includes('crescimento')) return 'desenvolvimento';
    if (obj.includes('liderança') || obj.includes('líder')) return 'lideranca';
    if (obj.includes('comunicação') || obj.includes('comunicar')) return 'comunicacao';
    if (obj.includes('carreira') || obj.includes('transição')) return 'carreira';
    if (obj.includes('vendas') || obj.includes('performance')) return 'performance';
    if (obj.includes('equipe') || obj.includes('time')) return 'equipe';
    
    return 'outros';
  }

  private calculateDifficulty(responseTime: number): 'easy' | 'medium' | 'hard' {
    if (responseTime < 10000) return 'easy';
    if (responseTime < 20000) return 'medium';
    return 'hard';
  }

  private calculateQualityScore(
    question: TestFeedback['questions'][0],
    feedback: TestFeedback
  ): number {
    let score = 50; // Base score
    
    // Bônus por resposta rápida
    if (question.responseTime < 15000) score += 20;
    
    // Bônus por não ter sido alterada
    if (!question.wasChanged) score += 20;
    
    // Bônus por alta taxa de conclusão do teste
    score += feedback.completionRate * 10;
    
    return Math.min(100, Math.max(0, score));
  }

  private calculateClarityScore(question: TestFeedback['questions'][0]): number {
    // Score baseado em tempo de resposta
    // Perguntas claras são respondidas mais rapidamente
    const avgTime = 15000; // 15 segundos
    const ratio = avgTime / question.responseTime;
    
    return Math.min(100, Math.max(0, ratio * 70));
  }
}

export const learningSystem = new LearningSystem();
