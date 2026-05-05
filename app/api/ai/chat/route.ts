/**
 * API: Chat IA Melhorado
 * Chat com contexto do perfil DISC e histórico persistente
 */

import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Cliente com service role para bypass RLS
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

interface ChatMessage {
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

async function getHistory(userId: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabaseAdmin
      .from('ai_chat_messages')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: true })
      .limit(limit);

    if (error) throw error;

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

async function saveMessage(message: ChatMessage): Promise<void> {
  try {
    const { error } = await supabaseAdmin
      .from('ai_chat_messages')
      .insert({
        user_id: message.user_id,
        role: message.role,
        message: message.content,
      });

    if (error) {
      console.error('Error saving message to DB:', error);
      throw error;
    }
  } catch (error) {
    console.error('Error saving message:', error);
    throw error;
  }
}

async function getDISCContext(userId: string): Promise<ChatMessage['disc_context'] | null> {
  try {
    const { data: test } = await supabaseAdmin
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

function generateFallbackResponse(
  userMessage: string,
  discContext: ChatMessage['disc_context'] | null
): string {
  const message = userMessage.toLowerCase();

  if (discContext) {
    const profile = profileContexts[discContext.dominant_profile];

    if (message.includes('meu perfil') || message.includes('minha personalidade')) {
      return `Seu perfil DISC predominante é ${profile.name} (${discContext.dominant_profile}). Isso significa que você tende a ser ${profile.traits}. ${profile.communication}`;
    }

    if (message.includes('pontos fortes') || message.includes('qualidades')) {
      const strengths = {
        D: 'Seus principais pontos fortes incluem: capacidade de tomar decisões rápidas, foco em resultados, assertividade e habilidade para liderar em situações desafiadoras.',
        I: 'Seus principais pontos fortes incluem: habilidades de comunicação, capacidade de inspirar outros, otimismo natural e talento para construir relacionamentos.',
        S: 'Seus principais pontos fortes incluem: paciência, lealdade, capacidade de trabalhar em equipe, confiabilidade e habilidade para criar harmonia.',
        C: 'Seus principais pontos fortes incluem: atenção aos detalhes, pensamento analítico, foco em qualidade e capacidade de trabalhar com precisão.',
      };
      return strengths[discContext.dominant_profile];
    }

    if (message.includes('melhorar') || message.includes('desenvolver') || message.includes('crescer')) {
      const development = {
        D: 'Para seu desenvolvimento, considere: praticar paciência, desenvolver escuta ativa, considerar o impacto emocional de suas decisões e delegar mais confiando na equipe.',
        I: 'Para seu desenvolvimento, considere: desenvolver habilidades de organização, praticar foco em tarefas específicas, aprender a lidar com conflitos de forma construtiva e estabelecer limites claros.',
        S: 'Para seu desenvolvimento, considere: praticar adaptabilidade a mudanças, desenvolver assertividade, aprender a expressar desacordos de forma saudável e sair da zona de conforto gradualmente.',
        C: 'Para seu desenvolvimento, considere: praticar tomada de decisões com informações incompletas, desenvolver flexibilidade, aprender a aceitar "bom o suficiente" e trabalhar habilidades interpessoais.',
      };
      return development[discContext.dominant_profile];
    }

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

  if (message.includes('disc') || message.includes('teste')) {
    return 'O teste DISC avalia quatro dimensões comportamentais: Dominância (D), Influência (I), Estabilidade (S) e Conformidade (C). Cada pessoa tem uma combinação única desses traços. Como posso ajudar você a entender melhor seu perfil?';
  }

  if (message.includes('carreira') || message.includes('profissional')) {
    return 'Para desenvolvimento de carreira, é importante conhecer seus pontos fortes e áreas de melhoria. Seu perfil DISC pode ajudar a identificar ambientes de trabalho e funções onde você naturalmente se destaca. Quer explorar isso mais a fundo?';
  }

  return 'Entendo sua pergunta. Como especialista em perfis DISC, posso ajudar você a entender melhor seu comportamento, pontos fortes, áreas de desenvolvimento e como se comunicar melhor. O que você gostaria de saber especificamente?';
}

function getSuggestions(discContext: ChatMessage['disc_context'] | null): string[] {
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

export async function POST(request: Request) {
  try {
    const { message, userId } = await request.json();

    if (!message || !userId) {
      return NextResponse.json(
        { error: 'Mensagem e userId são obrigatórios' },
        { status: 400 }
      );
    }

    // Buscar histórico
    const history = await getHistory(userId, 10);

    // Buscar contexto DISC
    const discContext = await getDISCContext(userId);

    // Salvar mensagem do usuário
    await saveMessage({
      user_id: userId,
      role: 'user',
      content: message,
      disc_context: discContext,
    });

    // Gerar resposta
    const response = generateFallbackResponse(message, discContext);

    // Salvar resposta da IA
    await saveMessage({
      user_id: userId,
      role: 'assistant',
      content: response,
      disc_context: discContext,
    });

    // Gerar sugestões
    const suggestions = getSuggestions(discContext);

    return NextResponse.json({
      response,
      suggestions,
      discContext,
    });
  } catch (error) {
    console.error('Chat error:', error);
    
    return NextResponse.json({
      response: 'Desculpe, ocorreu um erro ao processar sua mensagem. Por favor, tente novamente.',
      suggestions: [
        'O que é o teste DISC?',
        'Como posso melhorar minha comunicação?',
        'Dicas para desenvolvimento pessoal',
      ],
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json(
        { error: 'userId é obrigatório' },
        { status: 400 }
      );
    }

    // Buscar histórico
    const history = await getHistory(userId);

    // Buscar contexto DISC
    const discContext = await getDISCContext(userId);

    // Gerar sugestões
    const suggestions = getSuggestions(discContext);

    return NextResponse.json({
      history,
      discContext,
      suggestions,
    });
  } catch (error) {
    console.error('Error fetching chat data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do chat' },
      { status: 500 }
    );
  }
}
