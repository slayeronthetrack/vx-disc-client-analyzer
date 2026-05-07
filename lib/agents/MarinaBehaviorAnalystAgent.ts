/**
 * Marina Behavior Analyst Agent
 * Marina Alves - Analista Comportamental da VX Comercial
 */

import { BaseAgent } from './BaseAgent';
import type { AgentConfig, VXAgentContext } from './types';
import type { ValueProfile, PsychologicalProfile } from '@/types/integrated-profile';

interface MarinaInput {
  scores: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  percentages: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  dominantProfile: 'D' | 'I' | 'S' | 'C';
  questionCount: number;
  // Novos campos opcionais
  valueProfile?: ValueProfile;
  psychologicalProfile?: PsychologicalProfile;
}

interface MarinaOutput {
  analysis: string;
  strengths: string[];
  attentionPoints: string[];
  recommendations: string[];
  metadata: {
    analystName: string;
    analystRole: string;
    generatedAt: Date;
  };
}

export class MarinaBehaviorAnalystAgent extends BaseAgent<MarinaInput, MarinaOutput> {
  constructor(apiKey: string) {
    const config: AgentConfig = {
      name: 'Marina Alves',
      role: 'behavior-analyst',
      description: 'Analista Comportamental da VX Comercial - Especialista em diagnóstico DISC',
      apiKey,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 2000,
      systemPrompt: `Você é Marina Alves, Analista Comportamental da VX Comercial, com 8 anos de experiência em diagnóstico comportamental integrado aplicado a vendas e liderança.

IDENTIDADE PROFISSIONAL:
Você trabalha diretamente com empresários e profissionais de vendas, ajudando-os a entender seus padrões comportamentais para melhorar performance comercial, comunicação com clientes e gestão de equipes. Sua especialidade é traduzir resultados de análise comportamental integrada (DISC + Valores + Tipos Psicológicos) em insights práticos e acionáveis.

METODOLOGIA DE ANÁLISE INTEGRADA:

1. DISC - Comportamento Observável
Como a pessoa age e se comporta no dia a dia profissional.

2. TEORIA DOS VALORES - Motivadores Internos
O que realmente motiva a pessoa:
- Teórico: conhecimento, lógica, aprendizado
- Econômico: resultado, eficiência, retorno
- Estético: harmonia, beleza, equilíbrio
- Social: ajudar pessoas, impacto humano
- Político: influência, liderança, poder de decisão
- Espiritual: significado, coerência, propósito

3. TIPOS PSICOLÓGICOS - Estilo de Pensamento e Decisão
Como a pessoa pensa, percebe e decide:
- Energia: Introvertido (recarrega sozinho) ou Extrovertido (recarrega com pessoas)
- Percepção: Sensorial (foco no concreto) ou Intuitivo (foco em padrões/futuro)
- Decisão: Racional (lógica/análise) ou Emocional (valores/empatia)
- Organização: Estruturado (planejamento) ou Flexível (adaptação)

COMO VOCÊ ANALISA:
Você não entrega relatórios genéricos. Cada análise é consultiva, conectando:
- Como a pessoa age (DISC)
- O que a motiva (Valores)
- Como ela pensa e decide (Tipos Psicológicos)
- Desafios reais de mercado

Você identifica onde o comportamento natural é uma vantagem competitiva e onde pode estar limitando resultados.

ESTRUTURA DA SUA ANÁLISE:

1. DIAGNÓSTICO COMPORTAMENTAL INTEGRADO (3-4 parágrafos)
Comece explicando o perfil dominante DISC de forma clara e direta. Se houver dados de Valores e Tipos Psicológicos, integre-os na análise mostrando:
- Como o comportamento (DISC) se manifesta
- O que motiva esse comportamento (Valores)
- Como a pessoa pensa e decide (Tipos Psicológicos)
- Como tudo isso se conecta no contexto profissional

Seja específica sobre o que isso significa na prática de vendas, negociação, liderança e comunicação.

2. PONTOS FORTES (3-4 itens)
Liste as vantagens competitivas naturais. Cada ponto forte deve ser prático e conectado a resultados reais: vendas, relacionamento com clientes, fechamento de negócios, gestão de equipe. Se houver dados de Valores e Tipos Psicológicos, use-os para enriquecer os pontos fortes.

3. PONTOS DE ATENÇÃO (3-4 itens)
Identifique onde o comportamento natural pode gerar fricção, perda de oportunidades ou conflitos. Seja direta sobre os riscos, mas sempre de forma construtiva. Mostre o impacto real desses pontos no trabalho.

4. RECOMENDAÇÕES PRÁTICAS (3-4 ações)
Sugira ações específicas e aplicáveis imediatamente. Cada recomendação deve ser clara, mensurável e focada em melhorar performance comercial ou liderança. Use os dados de Valores e Tipos Psicológicos para personalizar as recomendações.

TOM E LINGUAGEM:
- Escreva como uma consultora experiente conversando com um cliente
- Use linguagem profissional, mas acessível e direta
- Evite jargões acadêmicos ou psicológicos complexos
- Não use markdown (sem asteriscos, hashtags ou símbolos)
- Não use emojis ou linguagem informal
- Seja assertiva, mas respeitosa
- Foque em comportamento aplicado ao trabalho, não em teoria abstrata

O QUE VOCÊ NUNCA FAZ:
- Não menciona que é uma IA ou sistema automatizado
- Não entrega análises genéricas que servem para qualquer pessoa
- Não usa frases feitas ou clichês motivacionais
- Não faz diagnósticos clínicos ou terapêuticos
- Não julga o perfil como bom ou ruim
- Não usa formatação markdown no texto
- Não usa termos como "diagnóstico psicológico", "doença", "transtorno", "terapia"

IMPORTANTE:
Você está analisando profissionais reais que querem melhorar resultados comerciais. Sua análise precisa ser útil, específica e aplicável no dia seguinte ao trabalho. Apresente sempre como análise comportamental profissional, não como diagnóstico clínico.`,
    };

    super(config);
  }

  protected async executeAgent(
    input: MarinaInput,
    context: VXAgentContext
  ): Promise<MarinaOutput> {
    const profileNames = {
      D: 'Dominância',
      I: 'Influência',
      S: 'Estabilidade',
      C: 'Conformidade',
    };

    const valueNames = {
      theoretical: 'Teórico',
      economic: 'Econômico',
      aesthetic: 'Estético',
      social: 'Social',
      political: 'Político',
      spiritual: 'Espiritual/Propósito',
    };

    const psychNames = {
      energy: { introvert: 'Introvertido', extrovert: 'Extrovertido' },
      perception: { sensory: 'Sensorial', intuitive: 'Intuitivo' },
      decision: { rational: 'Racional', emotional: 'Emocional' },
      organization: { structured: 'Estruturado', flexible: 'Flexível' },
    };

    let userMessage = `Analise o seguinte resultado comportamental:

PERFIL DISC:
Perfil Dominante: ${profileNames[input.dominantProfile]} (${input.dominantProfile})

Scores:
- Dominância (D): ${input.scores.D} pontos (${input.percentages.D}%)
- Influência (I): ${input.scores.I} pontos (${input.percentages.I}%)
- Estabilidade (S): ${input.scores.S} pontos (${input.percentages.S}%)
- Conformidade (C): ${input.scores.C} pontos (${input.percentages.C}%)`;

    // Adicionar Valores se disponível
    if (input.valueProfile) {
      userMessage += `

TEORIA DOS VALORES (Motivadores):
Valor Dominante: ${valueNames[input.valueProfile.dominant]} (${input.valueProfile.percentages[input.valueProfile.dominant]}%)

Distribuição:
- Teórico: ${input.valueProfile.scores.theoretical} pontos (${input.valueProfile.percentages.theoretical}%)
- Econômico: ${input.valueProfile.scores.economic} pontos (${input.valueProfile.percentages.economic}%)
- Estético: ${input.valueProfile.scores.aesthetic} pontos (${input.valueProfile.percentages.aesthetic}%)
- Social: ${input.valueProfile.scores.social} pontos (${input.valueProfile.percentages.social}%)
- Político: ${input.valueProfile.scores.political} pontos (${input.valueProfile.percentages.political}%)
- Espiritual: ${input.valueProfile.scores.spiritual} pontos (${input.valueProfile.percentages.spiritual}%)

Valores Secundários: ${input.valueProfile.secondary.map(v => valueNames[v]).join(', ')}`;
    }

    // Adicionar Tipos Psicológicos se disponível
    if (input.psychologicalProfile) {
      userMessage += `

TIPOS PSICOLÓGICOS (Estilo de Pensamento e Decisão):
Código: ${input.psychologicalProfile.code}

Perfil:
- Energia: ${psychNames.energy[input.psychologicalProfile.energy]}
- Percepção: ${psychNames.perception[input.psychologicalProfile.perception]}
- Decisão: ${psychNames.decision[input.psychologicalProfile.decision]}
- Organização: ${psychNames.organization[input.psychologicalProfile.organization]}`;
    }

    userMessage += `

Total de perguntas respondidas: ${input.questionCount}

Contexto do usuário:
- Nome: ${context.userName}
- Cargo: ${context.jobTitle || 'Não informado'}
- Empresa: ${context.company || 'Não informada'}
- Objetivo: ${context.testObjective || 'Autoconhecimento'}

// TODO: Futura integração com Question Bank
// Quando disponível, adicionar metadata das perguntas:
// - Tags de profissão das perguntas usadas
// - Tags de senioridade das perguntas usadas
// - Tags de objetivo das perguntas usadas
// - Tags de indústria das perguntas usadas
// 
// Isso permitirá análises ainda mais contextualizadas, como:
// "As perguntas focaram em cenários de vendas B2B, então vou enfatizar..."
// "Detectei perguntas sobre liderança sênior, então vou abordar..."

Gere uma análise comportamental completa, profissional e acionável${input.valueProfile || input.psychologicalProfile ? ', integrando DISC, Valores e Tipos Psicológicos' : ''}.

Retorne no formato JSON:
{
  "analysis": "Análise completa em texto corrido (3-4 parágrafos)",
  "strengths": ["Ponto forte 1", "Ponto forte 2", "Ponto forte 3"],
  "attentionPoints": ["Ponto de atenção 1", "Ponto de atenção 2", "Ponto de atenção 3"],
  "recommendations": ["Recomendação 1", "Recomendação 2", "Recomendação 3"]
}`;

    const response = await this.callOpenAI(
      [
        { role: 'system', content: this.config.systemPrompt },
        { role: 'user', content: userMessage },
      ],
      {
        responseFormat: { type: 'json_object' },
      }
    );

    const parsed = JSON.parse(response);

    return {
      analysis: parsed.analysis,
      strengths: parsed.strengths,
      attentionPoints: parsed.attentionPoints,
      recommendations: parsed.recommendations,
      metadata: {
        analystName: 'Marina Alves',
        analystRole: 'Analista Comportamental',
        generatedAt: new Date(),
      },
    };
  }

  protected validateInput(input: MarinaInput): void {
    if (!input.scores || !input.percentages || !input.dominantProfile) {
      throw new Error('Scores, percentages and dominant profile are required');
    }

    if (!['D', 'I', 'S', 'C'].includes(input.dominantProfile)) {
      throw new Error('Invalid dominant profile');
    }

    if (input.questionCount < 10 || input.questionCount > 100) {
      throw new Error('Question count must be between 10 and 100');
    }
  }

  protected validateResponse(response: MarinaOutput): void {
    if (!response.analysis || typeof response.analysis !== 'string') {
      throw new Error('Analysis text is required');
    }

    if (!Array.isArray(response.strengths) || response.strengths.length === 0) {
      throw new Error('Strengths array is required');
    }

    if (!Array.isArray(response.attentionPoints) || response.attentionPoints.length === 0) {
      throw new Error('Attention points array is required');
    }

    if (!Array.isArray(response.recommendations) || response.recommendations.length === 0) {
      throw new Error('Recommendations array is required');
    }
  }

  protected async fallback(
    input: MarinaInput,
    context: VXAgentContext,
    error: any
  ): Promise<MarinaOutput> {
    console.warn(`[${this.name}] Using fallback due to error:`, error?.message);

    const profileDescriptions = {
      D: {
        name: 'Dominância',
        strengths: [
          'Toma decisões rápidas e assertivas',
          'Foca em resultados e metas',
          'Assume controle em situações desafiadoras',
        ],
        attentionPoints: [
          'Pode ser percebido como muito direto ou impaciente',
          'Tendência a priorizar resultados sobre relacionamentos',
          'Pode ter dificuldade em delegar',
        ],
        recommendations: [
          'Pratique escuta ativa antes de decidir',
          'Desenvolva empatia com a equipe',
          'Equilibre foco em resultados com desenvolvimento de pessoas',
        ],
      },
      I: {
        name: 'Influência',
        strengths: [
          'Excelente comunicador e persuasivo',
          'Cria relacionamentos facilmente',
          'Mantém o ambiente positivo e motivado',
        ],
        attentionPoints: [
          'Pode ter dificuldade com detalhes e prazos',
          'Tendência a evitar conflitos necessários',
          'Pode prometer mais do que consegue entregar',
        ],
        recommendations: [
          'Desenvolva organização e gestão de tempo',
          'Aprenda a ter conversas difíceis quando necessário',
          'Estabeleça compromissos realistas',
        ],
      },
      S: {
        name: 'Estabilidade',
        strengths: [
          'Confiável e consistente',
          'Excelente ouvinte e mediador',
          'Cria ambiente de cooperação',
        ],
        attentionPoints: [
          'Pode ter dificuldade com mudanças rápidas',
          'Tendência a evitar confrontos',
          'Pode ter dificuldade em dizer não',
        ],
        recommendations: [
          'Pratique adaptabilidade a mudanças',
          'Desenvolva assertividade',
          'Estabeleça limites claros',
        ],
      },
      C: {
        name: 'Conformidade',
        strengths: [
          'Atento a detalhes e qualidade',
          'Analítico e preciso',
          'Segue procedimentos e padrões',
        ],
        attentionPoints: [
          'Pode ser perfeccionista em excesso',
          'Tendência a análise paralisia',
          'Pode ter dificuldade com ambiguidade',
        ],
        recommendations: [
          'Pratique tomar decisões com informação suficiente (não perfeita)',
          'Desenvolva flexibilidade',
          'Equilibre qualidade com velocidade',
        ],
      },
    };

    const profile = profileDescriptions[input.dominantProfile];

    return {
      analysis: `Seu perfil dominante é ${profile.name}, representando ${input.percentages[input.dominantProfile]}% do seu comportamento. Isso indica que você tende a demonstrar características como ${profile.strengths[0].toLowerCase()} e ${profile.strengths[1].toLowerCase()}. Com ${input.questionCount} perguntas respondidas, identificamos padrões consistentes que podem ser desenvolvidos para maximizar seu potencial profissional.`,
      strengths: profile.strengths,
      attentionPoints: profile.attentionPoints,
      recommendations: profile.recommendations,
      metadata: {
        analystName: 'Marina Alves',
        analystRole: 'Analista Comportamental',
        generatedAt: new Date(),
      },
    };
  }
}
