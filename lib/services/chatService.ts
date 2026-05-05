/**
 * Chat Service - VX DISC
 * Serviço de chat IA com contexto do perfil DISC
 */

import { supabase } from '@/lib/supabase/client';

export interface ChatMessage {
  id?: string;
  user_id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  created_at?: string;
  disc_context?: {
    dominant_profile: 'D' | 'I' | 'S' | 'C';
    scores: {
      D: number;
      I: number;
      S: number;
      C: number;
    };
  };
}

const profileContexts = {
  D: {
    name: 'Dominância',
    traits: 'direto, orientado para resultados, assertivo, gosta de desafios',
    communication: 'Prefere comunicação objetiva e direta. Valoriza eficiência.',
    suggestions: [
      'Como posso ser mais eficiente no trabalho?',
      'Dicas para liderar equipes de forma assertiva',
      'Como melhorar minha tomada de decisão?',
      'Estratégias para alcançar metas rapidamente',
    ],
  },
  I: {
    name: 'Influência',
    traits: 'sociável, entusiasta, comunicativo, persuasivo',
    communication: 'Prefere comunicação calorosa e pessoal. Valoriza relacionamentos.',
    suggestions: [
      'Como melhorar minhas habilidades de networking?',
      'Dicas para inspirar e motivar pessoas',
      'Como ser mais organizado mantendo meu entusiasmo?',
      'Estratégias para construir relacionamentos profissionais',
    ],
  },
  S: {
    name: 'Estabilidade',
    traits: 'paciente, leal, confiável, busca harmonia',
    communication: 'Prefere comunicação calma e respeitosa. Valoriza estabilidade.',
    suggestions: [
      'Como lidar melhor com mudanças?',
      'Dicas para ser mais assertivo sem perder a harmonia',
      'Como sair da zona de conforto gradualmente?',
      'Estratégias para expressar desacordos de forma saudável',
    ],
  },
  C: {
    name: 'Conformidade',
    traits: 'analítico, preciso, detalhista, focado em qualidade',
    communication: 'Prefere comunicação precisa e baseada em fatos. Valoriza qualidade.',
    suggestions: [
      'Como tomar decisões com informações incompletas?',
      'Dicas para ser mais flexível',
      'Como aceitar "bom o suficiente"?',
      'Estratégias para melhorar habilidades interpessoais',
    ],
  },
};

class ChatService {
  /**
   * Busca histórico de mensagens do usuário
   */
  async getHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
    try {
      const { data, error } = await supabase
        .from('ai_chat_messages')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: true })
        .limit(limit);

      if (error) throw error;

      // Mapear 'message' para 'content' para manter compatibilidade
      return (data || []).map(msg => ({
        id: msg.id,
        user_id: msg.user_id,
        role: msg.role,
        content: msg.message,
        created_at: msg.created_at,
      }));
    } catch (error) {
      console.error('Error fetching chat history:', error);
      return [];
    }
  }

  /**
   * Salva mensagem no histórico
   */
  async saveMessage(message: ChatMessage): Promise<void> {
    try {
      console.log('[ChatService] Salvando mensagem:', {
        user_id: message.user_id,
        role: message.role,
        content_length: message.content.length,
      });

      const { data, error } = await supabase
        .from('ai_chat_messages')
        .insert({
          user_id: message.user_id,
          role: message.role,
          message: message.content,
        })
        .select();

      if (error) {
        console.error('[ChatService] Erro ao salvar no DB:', error);
        throw error;
      }

      console.log('[ChatService] Mensagem salva com sucesso:', data);
    } catch (error) {
      console.error('[ChatService] Erro ao salvar mensagem:', error);
      throw error;
    }
  }

  /**
   * Busca contexto DISC do usuário
   */
  async getDISCContext(userId: string): Promise<ChatMessage['disc_context'] | null> {
    try {
      // Buscar último teste
      const { data: test } = await supabase
        .from('disc_tests')
        .select('dominant_profile, scores')
        .eq('user_id', userId)
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (!test) return null;

      return {
        dominant_profile: test.dominant_profile as 'D' | 'I' | 'S' | 'C',
        scores: test.scores as any,
      };
    } catch (error) {
      console.error('Error fetching DISC context:', error);
      return null;
    }
  }

  /**
   * Gera resposta da IA com contexto DISC
   */
  async generateResponse(
    userMessage: string,
    userId: string,
    history: ChatMessage[] = []
  ): Promise<string> {
    try {
      // Buscar contexto DISC
      const discContext = await this.getDISCContext(userId);

      // Construir prompt com contexto
      let systemPrompt = 'Você é um assistente especializado em perfis DISC e desenvolvimento pessoal.';
      
      if (discContext) {
        const profile = profileContexts[discContext.dominant_profile];
        systemPrompt += `\n\nO usuário tem perfil DISC predominante ${profile.name} (${discContext.dominant_profile}).`;
        systemPrompt += `\nCaracterísticas: ${profile.traits}.`;
        systemPrompt += `\nEstilo de comunicação: ${profile.communication}`;
        systemPrompt += `\n\nAdapte suas respostas para este perfil, sendo ${
          discContext.dominant_profile === 'D' ? 'direto e objetivo' :
          discContext.dominant_profile === 'I' ? 'entusiasta e motivador' :
          discContext.dominant_profile === 'S' ? 'calmo e empático' :
          'preciso e detalhado'
        }.`;
      }

      // Tentar chamar API de IA (OpenAI, etc)
      // Por enquanto, usar fallback inteligente
      return this.generateFallbackResponse(userMessage, discContext);
    } catch (error) {
      console.error('Error generating response:', error);
      return this.generateFallbackResponse(userMessage, null);
    }
  }

  /**
   * Gera resposta fallback inteligente baseada no perfil
   */
  private generateFallbackResponse(
    userMessage: string,
    discContext: ChatMessage['disc_context'] | null
  ): string {
    const message = userMessage.toLowerCase();

    // Respostas específicas por perfil
    if (discContext) {
      const profile = profileContexts[discContext.dominant_profile];

      // Perguntas sobre o perfil
      if (message.includes('meu perfil') || message.includes('minha personalidade')) {
        return `Seu perfil DISC predominante é ${profile.name} (${discContext.dominant_profile}). Isso significa que você tende a ser ${profile.traits}. ${profile.communication}`;
      }

      // Perguntas sobre pontos fortes
      if (message.includes('pontos fortes') || message.includes('qualidades')) {
        const strengths = {
          D: 'Seus principais pontos fortes incluem: capacidade de tomar decisões rápidas, foco em resultados, assertividade e habilidade para liderar em situações desafiadoras.',
          I: 'Seus principais pontos fortes incluem: habilidades de comunicação, capacidade de inspirar outros, otimismo natural e talento para construir relacionamentos.',
          S: 'Seus principais pontos fortes incluem: paciência, lealdade, capacidade de trabalhar em equipe, confiabilidade e habilidade para criar harmonia.',
          C: 'Seus principais pontos fortes incluem: atenção aos detalhes, pensamento analítico, foco em qualidade e capacidade de trabalhar com precisão.',
        };
        return strengths[discContext.dominant_profile];
      }

      // Perguntas sobre desenvolvimento
      if (message.includes('melhorar') || message.includes('desenvolver') || message.includes('crescer')) {
        const development = {
          D: 'Para seu desenvolvimento, considere: praticar paciência, desenvolver escuta ativa, considerar o impacto emocional de suas decisões e delegar mais confiando na equipe.',
          I: 'Para seu desenvolvimento, considere: desenvolver habilidades de organização, praticar foco em tarefas específicas, aprender a lidar com conflitos de forma construtiva e estabelecer limites claros.',
          S: 'Para seu desenvolvimento, considere: praticar adaptabilidade a mudanças, desenvolver assertividade, aprender a expressar desacordos de forma saudável e sair da zona de conforto gradualmente.',
          C: 'Para seu desenvolvimento, considere: praticar tomada de decisões com informações incompletas, desenvolver flexibilidade, aprender a aceitar "bom o suficiente" e trabalhar habilidades interpessoais.',
        };
        return development[discContext.dominant_profile];
      }

      // Perguntas sobre comunicação
      if (message.includes('comunicar') || message.includes('comunicação')) {
        const communication = {
          D: 'Na comunicação, seja direto e objetivo. Vá direto ao ponto, foque em resultados e evite rodeios. Lembre-se de que nem todos têm seu ritmo rápido.',
          I: 'Na comunicação, use seu entusiasmo natural, mas também pratique a escuta ativa. Equilibre seu carisma com foco nos detalhes importantes.',
          S: 'Na comunicação, sua empatia é um grande trunfo. Continue sendo um bom ouvinte, mas também pratique expressar suas opiniões de forma mais assertiva.',
          C: 'Na comunicação, sua precisão é valiosa. Continue sendo detalhista, mas também pratique ser mais conciso quando necessário e considere o aspecto emocional.',
        };
        return communication[discContext.dominant_profile];
      }
    }

    // Respostas gerais sobre DISC
    if (message.includes('disc') || message.includes('teste')) {
      return 'O teste DISC avalia quatro dimensões comportamentais: Dominância (D), Influência (I), Estabilidade (S) e Conformidade (C). Cada pessoa tem uma combinação única desses traços. Como posso ajudar você a entender melhor seu perfil?';
    }

    // Respostas sobre desenvolvimento pessoal
    if (message.includes('carreira') || message.includes('profissional')) {
      return 'Para desenvolvimento de carreira, é importante conhecer seus pontos fortes e áreas de melhoria. Seu perfil DISC pode ajudar a identificar ambientes de trabalho e funções onde você naturalmente se destaca. Quer explorar isso mais a fundo?';
    }

    // Resposta padrão
    return 'Entendo sua pergunta. Como especialista em perfis DISC, posso ajudar você a entender melhor seu comportamento, pontos fortes, áreas de desenvolvimento e como se comunicar melhor. O que você gostaria de saber especificamente?';
  }

  /**
   * Gera sugestões de perguntas baseadas no perfil
   */
  getSuggestions(discContext: ChatMessage['disc_context'] | null): string[] {
    if (!discContext) {
      return [
        'O que é o teste DISC?',
        'Como posso melhorar minha comunicação?',
        'Dicas para desenvolvimento pessoal',
        'Como trabalhar melhor em equipe?',
      ];
    }

    return profileContexts[discContext.dominant_profile].suggestions;
  }

  /**
   * Limpa histórico do usuário
   */
  async clearHistory(userId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('ai_chat_messages')
        .delete()
        .eq('user_id', userId);

      if (error) throw error;
    } catch (error) {
      console.error('Error clearing history:', error);
    }
  }
}

export const chatService = new ChatService();
