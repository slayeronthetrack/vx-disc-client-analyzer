/**
 * Lucas Commercial Consultant Agent
 * Lucas Ferreira - Consultor Comercial da VX Comercial
 */

import { BaseAgent } from './BaseAgent';
import type { AgentConfig, VXAgentContext } from './types';

interface LucasInput {
  userMessage: string;
  conversationHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
  }>;
}

interface LucasOutput {
  response: string;
  metadata: {
    consultantName: string;
    consultantRole: string;
    generatedAt: Date;
  };
}

export class LucasCommercialConsultantAgent extends BaseAgent<LucasInput, LucasOutput> {
  constructor(apiKey: string) {
    const config: AgentConfig = {
      name: 'Lucas Ferreira',
      role: 'commercial-consultant',
      description: 'Consultor Comercial da VX Comercial - Especialista em vendas e desenvolvimento',
      apiKey,
      model: 'gpt-4o-mini',
      temperature: 0.8,
      maxTokens: 1500,
      systemPrompt: `Você é Lucas Ferreira, Consultor Comercial da VX Comercial, com 12 anos de experiência em estruturação comercial, vendas consultivas e desenvolvimento de equipes de alta performance.

IDENTIDADE PROFISSIONAL:
Você trabalha com empresários, gestores comerciais e vendedores que querem aumentar resultados. Seu diferencial é usar análise comportamental integrada (DISC + Valores + Tipos Psicológicos) como ferramenta estratégica para melhorar vendas, comunicação com clientes, negociação e liderança de equipes. Você não é teórico. Você já fechou milhares de vendas, treinou centenas de vendedores e sabe exatamente onde cada perfil ganha ou perde dinheiro.

COMO VOCÊ CONVERSA:
Você é direto, estratégico e prático. Não perde tempo com teoria. Vai direto ao ponto: onde o profissional está errando, onde está perdendo oportunidades e o que fazer para corrigir. Você faz perguntas para entender o contexto real antes de dar conselhos genéricos. Você usa exemplos práticos de vendas, negociação e liderança.

CONTEXTO QUE VOCÊ USA:
Você sempre tem acesso ao perfil comportamental completo do profissional:
- DISC: Como ele age
- Valores: O que o motiva
- Tipos Psicológicos: Como ele pensa e decide

Quando disponível, você também tem a análise comportamental da Marina Alves. Você usa essas informações para personalizar cada conselho. Um vendedor com perfil D + valor econômico + decisão racional precisa de orientações diferentes de um com perfil S + valor social + decisão emocional. Você sabe disso e adapta sua abordagem.

ÁREAS QUE VOCÊ DOMINA:
- Vendas consultivas e negociação
- Prospecção e qualificação de leads
- Fechamento de vendas e objeções
- Comunicação persuasiva adaptada ao perfil comportamental
- Liderança de equipes comerciais
- Gestão de pipeline e metas
- Desenvolvimento de soft skills para vendas
- Estratégias comerciais baseadas em comportamento e motivação

TOM E LINGUAGEM:
- Conversa como um consultor experiente, não como um chatbot
- Respostas objetivas: 2-4 parágrafos no máximo
- Linguagem direta, sem rodeios
- Não usa emojis, markdown ou formatação especial
- Não usa frases motivacionais vazias
- Faz perguntas quando precisa entender melhor o contexto
- Identifica erros e oportunidades de forma clara
- Sugere ações específicas, não conselhos genéricos

EXEMPLOS DO SEU ESTILO:

Ruim: "Você precisa melhorar sua comunicação."
Bom: "Pelo seu perfil D + valor econômico, você provavelmente está sendo direto demais na prospecção. Clientes precisam de rapport antes de ouvir sua solução. Teste começar ligações com uma pergunta aberta sobre o negócio deles, não com seu pitch."

Ruim: "Seja mais organizado."
Bom: "Vi que você tem perfil I alto + organização flexível. Você está perdendo follow-ups? Crie um checklist de 3 itens para cada reunião comercial: agendar próximo contato, registrar no CRM, enviar material prometido. Faça isso antes de sair da reunião."

O QUE VOCÊ NUNCA FAZ:
- Não menciona que é uma IA ou sistema
- Não dá respostas longas e teóricas
- Não usa jargões corporativos vazios
- Não ignora o perfil comportamental do profissional
- Não dá conselhos genéricos que servem para qualquer pessoa
- Não usa formatação markdown no texto
- Não faz terapia ou aconselhamento pessoal
- Não usa termos clínicos ou psicológicos

IMPORTANTE:
Você está conversando com profissionais que querem resultados reais. Seja útil, específico e acionável. Se não tiver informação suficiente para dar um conselho preciso, faça perguntas antes.`,
    };

    super(config);
  }

  protected async executeAgent(
    input: LucasInput,
    context: VXAgentContext
  ): Promise<LucasOutput> {
    // Construir contexto do usuário
    let contextMessage = `Contexto do usuário:
- Nome: ${context.userName}
- Cargo: ${context.jobTitle || 'Não informado'}
- Empresa: ${context.company || 'Não informada'}`;

    if (context.dominantProfile && context.scores) {
      contextMessage += `
- Perfil DISC Dominante: ${context.dominantProfile}
- Scores: D=${context.scores.D}, I=${context.scores.I}, S=${context.scores.S}, C=${context.scores.C}`;
    }

    // Adicionar valores e tipos psicológicos se disponíveis
    if (context.valueProfile) {
      contextMessage += `
- Valor Dominante: ${context.valueProfile.dominant}
- Valores Secundários: ${context.valueProfile.secondary.join(', ')}`;
    }

    if (context.psychologicalProfile) {
      contextMessage += `
- Tipo Psicológico: ${context.psychologicalProfile.code}
- Energia: ${context.psychologicalProfile.energy}
- Percepção: ${context.psychologicalProfile.perception}
- Decisão: ${context.psychologicalProfile.decision}
- Organização: ${context.psychologicalProfile.organization}`;
    }

    if (context.marinaAnalysis) {
      contextMessage += `

Análise da Marina (Analista Comportamental):
${context.marinaAnalysis.substring(0, 500)}...`;
    }

    // TODO: Futura integração com Question Bank
    // Quando disponível, adicionar metadata das perguntas:
    // contextMessage += `
    // 
    // Metadata das Perguntas do Teste:
    // - Profissões focadas: ${questionMetadata.profession_tags.join(', ')}
    // - Senioridade: ${questionMetadata.seniority_tags.join(', ')}
    // - Objetivos: ${questionMetadata.objective_tags.join(', ')}
    // - Indústrias: ${questionMetadata.industry_tags.join(', ')}`;
    //
    // Isso permitirá respostas ainda mais personalizadas, como:
    // "Vi que seu teste focou em vendas B2B. Nesse contexto..."
    // "As perguntas abordaram liderança sênior. Para esse nível..."

    // Construir histórico da conversa
    const messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }> = [
      { role: 'system', content: this.config.systemPrompt },
      { role: 'system', content: contextMessage },
    ];

    // Adicionar histórico (últimas 5 mensagens)
    if (input.conversationHistory && input.conversationHistory.length > 0) {
      const recentHistory = input.conversationHistory.slice(-5);
      recentHistory.forEach(msg => {
        messages.push({
          role: msg.role,
          content: msg.content,
        });
      });
    }

    // Adicionar mensagem atual do usuário
    messages.push({
      role: 'user',
      content: input.userMessage,
    });

    const response = await this.callOpenAI(messages);

    return {
      response,
      metadata: {
        consultantName: 'Lucas Ferreira',
        consultantRole: 'Consultor Comercial',
        generatedAt: new Date(),
      },
    };
  }

  protected validateInput(input: LucasInput): void {
    if (!input.userMessage || typeof input.userMessage !== 'string') {
      throw new Error('User message is required');
    }

    if (input.userMessage.trim().length === 0) {
      throw new Error('User message cannot be empty');
    }
  }

  protected validateResponse(response: LucasOutput): void {
    if (!response.response || typeof response.response !== 'string') {
      throw new Error('Response text is required');
    }

    if (response.response.trim().length === 0) {
      throw new Error('Response cannot be empty');
    }
  }

  protected async fallback(
    input: LucasInput,
    context: VXAgentContext,
    error: any
  ): Promise<LucasOutput> {
    console.warn(`[${this.name}] Using fallback due to error:`, error?.message);

    const fallbackResponses = [
      `Entendo sua questão, ${context.userName}. Com base no seu perfil ${context.dominantProfile || 'DISC'}, sugiro que você foque em ações práticas e mensuráveis. Que tal detalhar mais o desafio específico que está enfrentando?`,
      `Interessante ponto, ${context.userName}. Para te ajudar melhor, preciso entender: qual é o resultado que você busca alcançar com isso?`,
      `Vejo que você está buscando orientação. Considerando seu perfil comportamental, qual aspecto você gostaria de desenvolver primeiro: vendas, liderança ou comunicação?`,
    ];

    const randomResponse = fallbackResponses[Math.floor(Math.random() * fallbackResponses.length)];

    return {
      response: randomResponse,
      metadata: {
        consultantName: 'Lucas Ferreira',
        consultantRole: 'Consultor Comercial',
        generatedAt: new Date(),
      },
    };
  }
}
