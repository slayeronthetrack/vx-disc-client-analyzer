/**
 * API: Chat IA Melhorado
 * Chat com contexto do perfil DISC e histórico persistente
 * Integrado com Lucas (Agente IA)
 */

import { NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/server';
import { getAgentRegistry } from '@/lib/agents';

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

async function authorizeChatRequest(clientUserId?: string | null) {
  const supabase = await createClient();
  const { data: { user }, error } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Unauthorized - Authentication required' },
        { status: 401 }
      ),
    };
  }

  if (clientUserId && clientUserId !== user.id) {
    return {
      authorized: false as const,
      response: NextResponse.json(
        { error: 'Forbidden - userId does not match authenticated user' },
        { status: 403 }
      ),
    };
  }

  return {
    authorized: true as const,
    supabase,
    userId: user.id,
  };
}

async function getHistory(supabase: SupabaseClient, userId: string, limit: number = 50): Promise<ChatMessage[]> {
  try {
    const { data, error } = await supabase
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

async function saveMessage(supabase: SupabaseClient, message: ChatMessage): Promise<void> {
  try {
    const { error } = await supabase
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

async function getDISCContext(supabase: SupabaseClient, userId: string): Promise<ChatMessage['disc_context']> {
  try {
    const { data: test } = await supabase
      .from('disc_tests')
      .select('dominant_profile, scores, value_scores, dominant_values, value_percentages, psychological_profile, integrated_analysis, ai_analysis')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })
      .limit(1)
      .single();

    if (!test) return undefined;

    return {
      dominant_profile: test.dominant_profile as 'D' | 'I' | 'S' | 'C',
      scores: test.scores as any,
    };
  } catch (error) {
    console.error('Error fetching DISC context:', error);
    return undefined;
  }
}

async function generateAIResponse(
  supabase: SupabaseClient,
  userMessage: string,
  discContext: ChatMessage['disc_context'] | null,
  history: ChatMessage[],
  userName: string,
  userId: string,
  jobTitle?: string,
  company?: string
): Promise<string> {
  try {
    // 🤖 USAR LUCAS (AGENTE IA)
    const registry = getAgentRegistry();
    const lucas = registry.getAgent('commercial-consultant');

    // Preparar histórico da conversa
    const conversationHistory = history
      .filter(msg => msg.role === 'user' || msg.role === 'assistant')
      .slice(-6) // Últimas 6 mensagens
      .map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

    // Buscar análise da Marina e perfil integrado se disponível
    let marinaAnalysis: string | undefined;
    let valueProfile: any;
    let psychologicalProfile: any;
    
    if (discContext) {
      try {
        const { data: test } = await supabase
          .from('disc_tests')
          .select('integrated_analysis, ai_analysis, value_scores, dominant_values, value_percentages, psychological_profile')
          .eq('user_id', userId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single();

        // Priorizar integrated_analysis sobre ai_analysis
        marinaAnalysis = test?.integrated_analysis || test?.ai_analysis || undefined;
        
        // Carregar perfil de valores se disponível
        if (test?.value_scores) {
          valueProfile = {
            dominant: test.dominant_values?.[0],
            secondary: test.dominant_values?.slice(1) || [],
            scores: test.value_scores,
            percentages: test.value_percentages,
          };
        }
        
        // Carregar perfil psicológico se disponível
        psychologicalProfile = test?.psychological_profile || undefined;
      } catch (error) {
        console.warn('Could not fetch integrated profile:', error);
      }
    }

    // Executar Lucas com perfil integrado
    const lucasResponse = await lucas.execute(
      {
        userMessage,
        conversationHistory,
      },
      {
        userId,
        userName,
        jobTitle,
        company,
        dominantProfile: discContext?.dominant_profile,
        scores: discContext?.scores,
        valueProfile,
        psychologicalProfile,
        marinaAnalysis,
      }
    );

    console.log('[Lucas]', {
      success: lucasResponse.success,
      usedFallback: lucasResponse.usedFallback,
      executionTime: `${lucasResponse.executionTime}ms`,
      hasValues: !!valueProfile,
      hasPsychological: !!psychologicalProfile,
    });

    return lucasResponse.data?.response || 'Desculpe, não consegui processar sua mensagem. Tente novamente.';
  } catch (error) {
    console.error('Error calling Lucas agent:', error);
    throw error;
  }
}

function generateFallbackResponse(
  userMessage: string,
  discContext: ChatMessage['disc_context'] | null
): string {
  const message = userMessage.toLowerCase();

  if (discContext) {
    const profile = profileContexts[discContext.dominant_profile];
    const profileName = profile.name;
    const profileLetter = discContext.dominant_profile;

    // Vendas e performance
    if (message.includes('venda') || message.includes('vender') || message.includes('cliente')) {
      const salesAdvice = {
        D: `Como perfil ${profileName} (${profileLetter}), você tem uma vantagem natural em vendas: sua assertividade e foco em resultados. Para melhorar ainda mais:\n\n✅ Use sua capacidade de decisão rápida para fechar negócios com agilidade\n✅ Seja direto sobre benefícios e ROI - clientes respeitam sua objetividade\n✅ Cuidado: pratique mais escuta ativa antes de propor soluções\n⚠️ Evite pressionar demais - nem todos decidem no seu ritmo\n\n💡 Dica estratégica: Combine sua assertividade com perguntas abertas para entender melhor as dores do cliente antes de apresentar a solução.`,
        I: `Como perfil ${profileName} (${profileLetter}), você é um vendedor nato! Seu entusiasmo e habilidade de conexão são seus maiores ativos. Para vender mais:\n\n✅ Use seu carisma para criar rapport rapidamente\n✅ Conte histórias e casos de sucesso - você faz isso naturalmente\n✅ Aproveite seu networking para gerar indicações\n⚠️ Atenção: não esqueça de fazer follow-up e fechar o negócio\n⚠️ Organize melhor seu pipeline de vendas\n\n💡 Dica estratégica: Equilibre seu entusiasmo com disciplina no processo comercial. Use um CRM para não perder oportunidades.`,
        S: `Como perfil ${profileName} (${profileLetter}), você constrói relacionamentos sólidos e duradouros com clientes. Para aumentar suas vendas:\n\n✅ Use sua empatia para entender profundamente as necessidades do cliente\n✅ Clientes confiam em você - isso gera vendas recorrentes\n✅ Seja o consultor confiável, não apenas o vendedor\n⚠️ Pratique ser mais assertivo no fechamento\n⚠️ Não tenha medo de fazer propostas ousadas\n\n💡 Dica estratégica: Sua lealdade gera indicações. Peça referências ativamente - seus clientes satisfeitos vão te ajudar.`,
        C: `Como perfil ${profileName} (${profileLetter}), você vende com base em dados e qualidade. Isso é poderoso em vendas consultivas. Para melhorar:\n\n✅ Use sua capacidade analítica para criar propostas detalhadas e precisas\n✅ Clientes técnicos valorizam sua abordagem baseada em fatos\n✅ Prepare-se profundamente antes de reuniões comerciais\n⚠️ Cuidado: nem sempre você terá todas as informações - aprenda a decidir com 80% dos dados\n⚠️ Pratique ser mais flexível nas negociações\n\n💡 Dica estratégica: Combine sua precisão com agilidade. Clientes valorizam qualidade, mas também velocidade de resposta.`,
      };
      return salesAdvice[profileLetter];
    }

    // Pontos fortes
    if (message.includes('pontos fortes') || message.includes('qualidades') || message.includes('forte')) {
      const strengths = {
        D: `Seus principais pontos fortes como perfil ${profileName} (${profileLetter}):\n\n💪 **Liderança Natural**: Você assume o controle em situações desafiadoras\n💪 **Decisão Rápida**: Não perde tempo - age com confiança\n💪 **Foco em Resultados**: Orientado para metas e entregas\n💪 **Assertividade**: Comunica suas ideias com clareza e firmeza\n💪 **Resiliência**: Não desiste facilmente diante de obstáculos\n\n🎯 **Como usar isso a seu favor**: Assuma projetos desafiadores, lidere iniciativas estratégicas e seja o "motor" da equipe. Seu perfil é ideal para cargos de liderança e vendas de alto impacto.`,
        I: `Seus principais pontos fortes como perfil ${profileName} (${profileLetter}):\n\n💪 **Comunicação Excepcional**: Você se conecta facilmente com pessoas\n💪 **Entusiasmo Contagiante**: Inspira e motiva equipes naturalmente\n💪 **Networking Poderoso**: Constrói relacionamentos com facilidade\n💪 **Criatividade**: Traz ideias inovadoras e soluções criativas\n💪 **Otimismo**: Mantém o moral alto mesmo em situações difíceis\n\n🎯 **Como usar isso a seu favor**: Seja o "rosto" da empresa, lidere iniciativas de vendas e marketing, e use seu networking para abrir portas. Você é perfeito para funções que exigem persuasão e relacionamento.`,
        S: `Seus principais pontos fortes como perfil ${profileName} (${profileLetter}):\n\n💪 **Confiabilidade**: As pessoas sabem que podem contar com você\n💪 **Empatia Profunda**: Entende e se importa genuinamente com os outros\n💪 **Trabalho em Equipe**: Colabora de forma harmoniosa\n💪 **Paciência**: Mantém a calma em situações de pressão\n💪 **Lealdade**: Comprometido com pessoas e projetos a longo prazo\n\n🎯 **Como usar isso a seu favor**: Seja o "pilar" da equipe, construa relacionamentos duradouros com clientes e colegas, e use sua estabilidade para criar ambientes de trabalho saudáveis. Você é essencial em funções de atendimento e gestão de contas.`,
        C: `Seus principais pontos fortes como perfil ${profileName} (${profileLetter}):\n\n💪 **Precisão Analítica**: Você identifica detalhes que outros ignoram\n💪 **Qualidade Impecável**: Entrega trabalho de alto padrão\n💪 **Pensamento Crítico**: Analisa situações de forma lógica e estruturada\n💪 **Organização**: Processos bem definidos e documentados\n💪 **Expertise Técnica**: Domina profundamente sua área de atuação\n\n🎯 **Como usar isso a seu favor**: Seja o "especialista" da equipe, lidere projetos que exigem precisão e qualidade, e use sua capacidade analítica para tomar decisões estratégicas baseadas em dados. Você é perfeito para funções técnicas e consultivas.`,
      };
      return strengths[profileLetter];
    }

    // Desenvolvimento e melhorias
    if (message.includes('melhorar') || message.includes('desenvolver') || message.includes('crescer') || message.includes('desenvolvimento')) {
      const development = {
        D: `Áreas de desenvolvimento para seu perfil ${profileName} (${profileLetter}):\n\n🎯 **Escuta Ativa**: Pratique ouvir mais antes de decidir. Pergunte "O que você acha?" antes de dar sua opinião.\n\n🎯 **Paciência**: Nem todos trabalham no seu ritmo. Dê tempo para as pessoas processarem informações.\n\n🎯 **Empatia**: Considere o impacto emocional de suas decisões. Pergunte "Como isso afeta a equipe?"\n\n🎯 **Delegação com Confiança**: Você tende a fazer tudo sozinho. Confie mais na equipe.\n\n💡 **Exercício prático**: Antes de tomar uma decisão importante, consulte 2-3 pessoas da equipe. Isso não é fraqueza - é liderança estratégica.`,
        I: `Áreas de desenvolvimento para seu perfil ${profileName} (${profileLetter}):\n\n🎯 **Organização e Foco**: Use ferramentas como Trello ou Notion para não perder tarefas importantes.\n\n🎯 **Follow-up Disciplinado**: Crie lembretes automáticos para não esquecer compromissos.\n\n🎯 **Gestão de Conflitos**: Nem tudo pode ser resolvido com otimismo. Aprenda a ter conversas difíceis.\n\n🎯 **Profundidade vs Amplitude**: Você adora começar coisas novas. Pratique finalizar projetos antes de iniciar outros.\n\n💡 **Exercício prático**: Escolha 3 prioridades por semana e foque apenas nelas. Diga "não" para novas ideias até concluir as atuais.`,
        S: `Áreas de desenvolvimento para seu perfil ${profileName} (${profileLetter}):\n\n🎯 **Assertividade**: Pratique expressar suas opiniões, mesmo que contrariem o grupo. Sua voz importa.\n\n🎯 **Adaptabilidade a Mudanças**: Mudanças são oportunidades. Comece com pequenas mudanças para treinar.\n\n🎯 **Sair da Zona de Conforto**: Aceite projetos desafiadores. Você é mais capaz do que imagina.\n\n🎯 **Expressar Desacordos**: Discordar não é conflito - é contribuição. Pratique dizer "Vejo de forma diferente".\n\n💡 **Exercício prático**: Uma vez por semana, proponha uma ideia nova ou questione um processo. Isso vai fortalecer sua assertividade.`,
        C: `Áreas de desenvolvimento para seu perfil ${profileName} (${profileLetter}):\n\n🎯 **Decisão com Informação Incompleta**: Nem sempre você terá 100% dos dados. Aprenda a decidir com 80%.\n\n🎯 **Flexibilidade**: "Bom o suficiente" às vezes é melhor que "perfeito". Pratique entregar mais rápido.\n\n🎯 **Habilidades Interpessoais**: Nem tudo é lógica. Pratique conversas informais e conexões emocionais.\n\n🎯 **Aceitar Feedback Subjetivo**: Nem todo feedback vem com dados. Aprenda a valorizar opiniões qualitativas.\n\n💡 **Exercício prático**: Defina um prazo para decisões. Se não tiver todas as informações até lá, decida mesmo assim. Isso vai treinar sua agilidade.`,
      };
      return development[profileLetter];
    }

    // Comunicação
    if (message.includes('comunicar') || message.includes('comunicação') || message.includes('cuidado')) {
      const communication = {
        D: `Cuidados na comunicação para seu perfil ${profileName} (${profileLetter}):\n\n⚠️ **Você pode parecer agressivo**: Sua assertividade pode intimidar. Suavize o tom em situações sensíveis.\n\n⚠️ **Falta de contexto**: Você vai direto ao ponto, mas nem todos entendem o "porquê". Explique o contexto.\n\n⚠️ **Interrompe os outros**: Você pensa rápido e quer agir. Pratique deixar as pessoas terminarem de falar.\n\n✅ **Como melhorar**: Comece reuniões perguntando "Como vocês estão?" antes de ir direto ao assunto. Isso cria conexão.\n\n💡 **Dica de ouro**: Quando der feedback, use a fórmula: "Eu valorizo X em você. Para melhorar ainda mais, sugiro Y." Isso equilibra sua assertividade com empatia.`,
        I: `Cuidados na comunicação para seu perfil ${profileName} (${profileLetter}):\n\n⚠️ **Você pode falar demais**: Seu entusiasmo é ótimo, mas pratique ser mais conciso em reuniões formais.\n\n⚠️ **Falta de foco**: Você adora contar histórias, mas às vezes perde o ponto principal. Vá direto ao assunto quando necessário.\n\n⚠️ **Promessas exageradas**: Seu otimismo pode fazer você prometer mais do que consegue entregar. Seja realista.\n\n✅ **Como melhorar**: Antes de reuniões importantes, anote os 3 pontos principais que precisa comunicar. Isso te mantém focado.\n\n💡 **Dica de ouro**: Use sua habilidade de storytelling, mas termine sempre com um call-to-action claro: "Então, o próximo passo é X."`,
        S: `Cuidados na comunicação para seu perfil ${profileName} (${profileLetter}):\n\n⚠️ **Você evita conflitos**: Sua busca por harmonia pode fazer você concordar quando deveria discordar.\n\n⚠️ **Falta de assertividade**: Você tende a dizer "talvez" quando deveria dizer "sim" ou "não".\n\n⚠️ **Não expressa desconforto**: Você guarda frustrações para não criar conflito. Isso pode explodir depois.\n\n✅ **Como melhorar**: Pratique expressar opiniões contrárias de forma respeitosa: "Entendo seu ponto, mas vejo de forma diferente porque..."\n\n💡 **Dica de ouro**: Discordar não é falta de respeito - é contribuição. Sua perspectiva é valiosa, mesmo quando diferente da maioria.`,
        C: `Cuidados na comunicação para seu perfil ${profileName} (${profileLetter}):\n\n⚠️ **Excesso de detalhes**: Você adora precisão, mas nem todos precisam de todos os dados. Adapte o nível de detalhe ao público.\n\n⚠️ **Tom muito formal**: Sua comunicação pode parecer fria. Adicione elementos pessoais para criar conexão.\n\n⚠️ **Crítica excessiva**: Você identifica erros facilmente, mas isso pode desmotivar. Balance críticas com reconhecimento.\n\n✅ **Como melhorar**: Use a regra 80/20: dê 80% dos dados para 20% das pessoas (técnicos). Para os outros, seja mais resumido.\n\n💡 **Dica de ouro**: Antes de apontar um erro, reconheça algo positivo: "Gostei da sua abordagem em X. Para melhorar Y, sugiro Z."`,
      };
      return communication[profileLetter];
    }

    // Perfil DISC
    if (message.includes('meu perfil') || message.includes('minha personalidade') || message.includes('explique')) {
      return `Seu perfil DISC predominante é **${profileName} (${profileLetter})**.\n\n🎯 **O que isso significa:**\nVocê tende a ser ${profile.traits}.\n\n💬 **Sua comunicação:**\n${profile.communication}\n\n📊 **Seus scores:**\n• Dominância (D): ${discContext.scores.D}%\n• Influência (I): ${discContext.scores.I}%\n• Estabilidade (S): ${discContext.scores.S}%\n• Conformidade (C): ${discContext.scores.C}%\n\n💡 **Como usar isso:**\nConhecer seu perfil te ajuda a entender seus pontos fortes naturais e áreas de desenvolvimento. Pergunte-me sobre vendas, comunicação ou desenvolvimento profissional para dicas personalizadas!`;
    }

    // Resposta padrão com contexto
    return `Como especialista em perfis DISC, vejo que você tem perfil **${profileName} (${profileLetter})**. Isso significa que você é ${profile.traits}.\n\nPosso te ajudar com:\n• Estratégias de vendas personalizadas\n• Desenvolvimento de pontos fortes\n• Melhoria na comunicação\n• Crescimento profissional\n\nO que você gostaria de explorar?`;
  }

  // Sem contexto DISC
  if (message.includes('disc') || message.includes('teste')) {
    return 'O teste DISC avalia quatro dimensões comportamentais: Dominância (D), Influência (I), Estabilidade (S) e Conformidade (C). Cada pessoa tem uma combinação única desses traços. Faça o teste para receber orientações personalizadas!';
  }

  if (message.includes('carreira') || message.includes('profissional') || message.includes('venda')) {
    return 'Para te dar orientações personalizadas sobre carreira, vendas e desenvolvimento profissional, preciso conhecer seu perfil DISC. Faça o teste primeiro para receber insights estratégicos baseados no seu comportamento natural!';
  }

  return 'Olá! Sou o Assistente VX, especialista em perfis DISC. Para te dar orientações personalizadas, faça o teste DISC primeiro. Depois, posso te ajudar com estratégias de vendas, comunicação e desenvolvimento profissional baseadas no seu perfil único!';
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
    const authCheck = await authorizeChatRequest();
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { message, userId: clientUserId } = await request.json();
    if (clientUserId && clientUserId !== authCheck.userId) {
      return NextResponse.json(
        { error: 'Forbidden - userId does not match authenticated user' },
        { status: 403 }
      );
    }

    if (!message) {
      return NextResponse.json(
        { error: 'Mensagem é obrigatória' },
        { status: 400 }
      );
    }

    const { supabase, userId } = authCheck;

    // Buscar perfil do usuário autenticado
    const { data: profile } = await supabase
      .from('profiles')
      .select('full_name, job_title, company')
      .eq('user_id', userId)
      .single();

    const userName = profile?.full_name || 'Cliente';
    const jobTitle = profile?.job_title;
    const company = profile?.company;

    // Buscar histórico
    const history = await getHistory(supabase, userId, 10);

    // Buscar contexto DISC
    const discContext = await getDISCContext(supabase, userId);

    // Salvar mensagem do usuário
    await saveMessage(supabase, {
      user_id: userId,
      role: 'user',
      content: message,
      disc_context: discContext,
    });

    // Gerar resposta com Lucas (Agente IA)
    let response: string;
    try {
      response = await generateAIResponse(supabase, message, discContext, history, userName, userId, jobTitle, company);
    } catch (error) {
      console.error('Lucas agent error, using fallback:', error);
      response = generateFallbackResponse(message, discContext);
    }

    // Salvar resposta da IA
    await saveMessage(supabase, {
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
      agent: {
        name: 'Lucas Ferreira',
        role: 'Consultor Comercial',
        company: 'VX Comercial',
      },
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
      agent: {
        name: 'Lucas Ferreira',
        role: 'Consultor Comercial',
        company: 'VX Comercial',
      },
    });
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const authCheck = await authorizeChatRequest(searchParams.get('userId'));
    if (!authCheck.authorized) {
      return authCheck.response;
    }

    const { supabase, userId } = authCheck;

    // Buscar histórico
    const history = await getHistory(supabase, userId);

    // Buscar contexto DISC
    const discContext = await getDISCContext(supabase, userId);

    // Gerar sugestões
    const suggestions = getSuggestions(discContext);

    return NextResponse.json({
      history,
      discContext,
      suggestions,
      agent: {
        name: 'Lucas Ferreira',
        role: 'Consultor Comercial',
        company: 'VX Comercial',
      },
    });
  } catch (error) {
    console.error('Error fetching chat data:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar dados do chat' },
      { status: 500 }
    );
  }
}
