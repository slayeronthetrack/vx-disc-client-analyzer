/**
 * Question Generator Agent
 * Agente responsável por gerar perguntas DISC dinâmicas com Valores e Tipos Psicológicos
 */

import { BaseAgent } from './BaseAgent';
import type { AgentConfig, VXAgentContext } from './types';
import type { ExtendedQuestionOption, ValueType } from '@/types/integrated-profile';

type DISCType = 'D' | 'I' | 'S' | 'C';

interface QuestionGeneratorInput {
  questionCount: number; // 10-100
  userContext?: {
    job_title?: string;
    company?: string;
    test_objective?: string;
    seniority?: string;
    industry?: string;
  };
  excludeQuestions?: string[]; // Question texts to avoid duplicating
  requiredDISCDistribution?: {
    D?: number;
    I?: number;
    S?: number;
    C?: number;
  };
}

interface ExtendedDISCQuestion {
  id: number;
  text: string;
  options: ExtendedQuestionOption[];
}

interface QuestionGeneratorOutput {
  questions: ExtendedDISCQuestion[];
  source: 'ai' | 'fallback';
  metadata: {
    questionCount: number;
    generatedAt: Date;
    hasIntegratedProfile: boolean;
  };
}

export class QuestionGeneratorAgent extends BaseAgent<QuestionGeneratorInput, QuestionGeneratorOutput> {
  constructor(apiKey: string) {
    const config: AgentConfig = {
      name: 'QuestionGeneratorAgent',
      role: 'question-generator',
      description: 'Gera perguntas DISC dinâmicas com 4 alternativas (D, I, S, C)',
      apiKey,
      model: 'gpt-4o-mini',
      temperature: 0.7,
      maxTokens: 4000,
      systemPrompt: `Você é um especialista em avaliação comportamental integrada: DISC + Teoria dos Valores + Tipos Psicológicos.

OBJETIVO:
Gerar perguntas comportamentais que avaliem simultaneamente:
1. DISC: Comportamento observável (D, I, S, C)
2. Valores: Motivadores internos (6 tipos)
3. Tipos Psicológicos: Estilo de pensamento e decisão (4 eixos)

METODOLOGIA DISC:
- D (Dominância): Desafios, decisões, controle, resultados, pressão
- I (Influência): Comunicação, persuasão, relacionamentos, motivação, equipe
- S (Estabilidade): Consistência, apoio, mudanças, harmonia, ritmo
- C (Conformidade): Análise, qualidade, processos, detalhes, precisão

TEORIA DOS VALORES (6 tipos):
- theoretical: Busca conhecimento, lógica, aprendizado
- economic: Busca resultado, eficiência, retorno
- aesthetic: Busca harmonia, beleza, equilíbrio
- social: Busca ajudar pessoas, impacto humano
- political: Busca influência, liderança, poder de decisão
- spiritual: Busca significado, coerência, propósito

TIPOS PSICOLÓGICOS (4 eixos):
- energy: introvert (recarrega sozinho) ou extrovert (recarrega com pessoas)
- perception: sensory (foco no concreto) ou intuitive (foco em padrões/futuro)
- decision: rational (lógica/análise) ou emotional (valores/empatia)
- organization: structured (planejamento) ou flexible (adaptação)

ESTRUTURA OBRIGATÓRIA DE CADA PERGUNTA:

Cada pergunta deve ter EXATAMENTE 4 alternativas:
- Uma para cada DISC (D, I, S, C)
- Cada alternativa deve ter valueType
- Cada alternativa deve ter psychTraits (energy, perception, decision, organization)

MAPEAMENTO TÍPICO (use como guia):

Alternativa D (Dominância):
- valueType: "political" ou "economic"
- psychTraits: { energy: "extrovert", perception: "intuitive", decision: "rational", organization: "structured" }

Alternativa I (Influência):
- valueType: "social" ou "aesthetic"
- psychTraits: { energy: "extrovert", perception: "intuitive", decision: "emotional", organization: "flexible" }

Alternativa S (Estabilidade):
- valueType: "social" ou "aesthetic"
- psychTraits: { energy: "introvert", perception: "sensory", decision: "emotional", organization: "structured" }

Alternativa C (Conformidade):
- valueType: "theoretical" ou "spiritual"
- psychTraits: { energy: "introvert", perception: "sensory", decision: "rational", organization: "structured" }

IMPORTANTE: Varie os valores e traços! Nem toda alternativa D precisa ser "political". Use o contexto da pergunta.

CONTEXTO PROFISSIONAL:
- Vendas e negociação
- Liderança e gestão
- Comunicação
- Tomada de decisão
- Resolução de conflitos
- Gestão de projetos

FORMATO DE SAÍDA (JSON):
{
  "questions": [
    {
      "id": 1,
      "text": "Quando enfrento um desafio importante, eu prefiro:",
      "options": [
        {
          "text": "Assumir o controle e tomar a decisão rapidamente",
          "type": "D",
          "valueType": "political",
          "psychTraits": {
            "energy": "extrovert",
            "perception": "intuitive",
            "decision": "rational",
            "organization": "structured"
          }
        },
        {
          "text": "Conversar com outras pessoas e buscar apoio",
          "type": "I",
          "valueType": "social",
          "psychTraits": {
            "energy": "extrovert",
            "perception": "intuitive",
            "decision": "emotional",
            "organization": "flexible"
          }
        },
        {
          "text": "Analisar calmamente antes de agir",
          "type": "S",
          "valueType": "aesthetic",
          "psychTraits": {
            "energy": "introvert",
            "perception": "sensory",
            "decision": "emotional",
            "organization": "structured"
          }
        },
        {
          "text": "Pesquisar dados e informações detalhadas",
          "type": "C",
          "valueType": "theoretical",
          "psychTraits": {
            "energy": "introvert",
            "perception": "sensory",
            "decision": "rational",
            "organization": "structured"
          }
        }
      ]
    }
  ]
}

REGRAS CRÍTICAS:
1. Cada pergunta tem 4 alternativas (D, I, S, C)
2. Cada alternativa DEVE ter: text, type, valueType, psychTraits
3. psychTraits DEVE ter os 4 campos: energy, perception, decision, organization
4. Valores válidos: theoretical, economic, aesthetic, social, political, spiritual
5. Evite perguntas clínicas ou terapêuticas
6. Foco em contexto profissional e comercial
7. Linguagem natural e acessível

IMPORTANTE:
Você está criando uma ferramenta de diagnóstico comportamental profissional integrado. As perguntas devem avaliar comportamento, motivação e estilo de decisão simultaneamente.`,
    };

    super(config);
  }

  protected async executeAgent(
    input: QuestionGeneratorInput,
    context: VXAgentContext
  ): Promise<QuestionGeneratorOutput> {
    // Build context-aware message
    const jobTitle = context.jobTitle || input.userContext?.job_title || 'Profissional';
    const company = context.company || input.userContext?.company || 'Empresa';
    const testObjective = context.testObjective || input.userContext?.test_objective || 'Autoconhecimento';
    
    let contextInfo = `Contexto do usuário:
- Nome: ${context.userName}
- Cargo: ${jobTitle}
- Empresa: ${company}
- Objetivo do teste: ${testObjective}`;

    if (input.userContext?.seniority) {
      contextInfo += `\n- Senioridade: ${input.userContext.seniority}`;
    }
    if (input.userContext?.industry) {
      contextInfo += `\n- Indústria: ${input.userContext.industry}`;
    }

    // Personalização inteligente baseada no cargo
    let cargoInstructions = this.getCargoSpecificInstructions(jobTitle);
    
    // Personalização inteligente baseada no objetivo
    let objetivoInstructions = this.getObjetivoSpecificInstructions(testObjective);

    let additionalInstructions = '';

    // Add exclude instructions if provided
    if (input.excludeQuestions && input.excludeQuestions.length > 0) {
      additionalInstructions += `\n\nIMPORTANTE: Evite gerar perguntas similares a estas já selecionadas:
${input.excludeQuestions.slice(0, 5).map((q, i) => `${i + 1}. ${q}`).join('\n')}`;
    }

    // Add DISC distribution requirements if provided
    if (input.requiredDISCDistribution) {
      const dist = input.requiredDISCDistribution;
      additionalInstructions += `\n\nDistribuição DISC requerida:`;
      if (dist.D) additionalInstructions += `\n- ${dist.D} perguntas tipo D (Dominância)`;
      if (dist.I) additionalInstructions += `\n- ${dist.I} perguntas tipo I (Influência)`;
      if (dist.S) additionalInstructions += `\n- ${dist.S} perguntas tipo S (Estabilidade)`;
      if (dist.C) additionalInstructions += `\n- ${dist.C} perguntas tipo C (Conformidade)`;
    }

    const userMessage = `Gere ${input.questionCount} perguntas DISC únicas e diversas.

${contextInfo}

${cargoInstructions}

${objetivoInstructions}${additionalInstructions}

Retorne APENAS o JSON com as perguntas, sem texto adicional.`;

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
      questions: parsed.questions.map((q: any, index: number) => ({
        id: index + 1,
        text: q.text,
        options: q.options,
      })),
      source: 'ai',
      metadata: {
        questionCount: input.questionCount,
        generatedAt: new Date(),
        hasIntegratedProfile: true,
      },
    };
  }

  /**
   * Gera instruções específicas baseadas no cargo do usuário
   */
  private getCargoSpecificInstructions(jobTitle: string): string {
    const cargo = jobTitle.toLowerCase();
    
    // Vendas e Comercial
    if (cargo.includes('vendas') || cargo.includes('comercial') || cargo.includes('vendedor')) {
      return `PERSONALIZAÇÃO PARA VENDAS:
- Foque em situações de negociação, objeções, fechamento
- Inclua cenários de prospecção, relacionamento com cliente, metas
- Perguntas sobre persuasão, resiliência, competitividade
- Contextos: reunião com cliente, proposta comercial, follow-up
Exemplo: "Durante uma negociação difícil com um cliente, você prefere..."`;
    }
    
    // Gestão e Liderança
    if (cargo.includes('gerente') || cargo.includes('gestor') || cargo.includes('líder') || 
        cargo.includes('coordenador') || cargo.includes('supervisor') || cargo.includes('diretor')) {
      return `PERSONALIZAÇÃO PARA LIDERANÇA:
- Foque em situações de gestão de equipe, delegação, feedback
- Inclua cenários de tomada de decisão estratégica, conflitos de equipe
- Perguntas sobre desenvolvimento de pessoas, visão, planejamento
- Contextos: reunião de equipe, avaliação de desempenho, crise
Exemplo: "Ao liderar sua equipe em um projeto desafiador, você tende a..."`;
    }
    
    // Atendimento e Suporte
    if (cargo.includes('atendimento') || cargo.includes('suporte') || cargo.includes('customer') || 
        cargo.includes('sac') || cargo.includes('relacionamento')) {
      return `PERSONALIZAÇÃO PARA ATENDIMENTO:
- Foque em situações de resolução de problemas, empatia, paciência
- Inclua cenários de clientes insatisfeitos, reclamações, dúvidas
- Perguntas sobre comunicação, escuta ativa, gestão de expectativas
- Contextos: chamado urgente, cliente irritado, solicitação complexa
Exemplo: "Ao atender um cliente insatisfeito, sua primeira reação é..."`;
    }
    
    // Tecnologia e TI
    if (cargo.includes('desenvolvedor') || cargo.includes('programador') || cargo.includes('analista') ||
        cargo.includes('engenheiro') || cargo.includes('tech') || cargo.includes('ti')) {
      return `PERSONALIZAÇÃO PARA TECNOLOGIA:
- Foque em situações de resolução de problemas técnicos, debugging, arquitetura
- Inclua cenários de trabalho em equipe ágil, code review, prazos
- Perguntas sobre análise lógica, inovação, qualidade de código
- Contextos: bug crítico, refatoração, nova feature, reunião técnica
Exemplo: "Ao enfrentar um bug complexo em produção, você prefere..."`;
    }
    
    // Marketing e Comunicação
    if (cargo.includes('marketing') || cargo.includes('comunicação') || cargo.includes('social media') ||
        cargo.includes('conteúdo') || cargo.includes('designer')) {
      return `PERSONALIZAÇÃO PARA MARKETING:
- Foque em situações de criatividade, campanhas, análise de resultados
- Inclua cenários de brainstorming, apresentação de ideias, métricas
- Perguntas sobre inovação, persuasão, storytelling
- Contextos: lançamento de campanha, crise de imagem, análise de ROI
Exemplo: "Ao criar uma nova campanha de marketing, você começa por..."`;
    }
    
    // RH e Pessoas
    if (cargo.includes('rh') || cargo.includes('recursos humanos') || cargo.includes('recrutamento') ||
        cargo.includes('people') || cargo.includes('talent')) {
      return `PERSONALIZAÇÃO PARA RH:
- Foque em situações de recrutamento, desenvolvimento, cultura
- Inclua cenários de entrevistas, feedback, conflitos interpessoais
- Perguntas sobre empatia, análise de pessoas, comunicação
- Contextos: processo seletivo, avaliação de desempenho, clima organizacional
Exemplo: "Durante uma entrevista de emprego, você prioriza avaliar..."`;
    }
    
    // Financeiro e Contábil
    if (cargo.includes('financeiro') || cargo.includes('contábil') || cargo.includes('contador') ||
        cargo.includes('analista financeiro') || cargo.includes('controller')) {
      return `PERSONALIZAÇÃO PARA FINANCEIRO:
- Foque em situações de análise de dados, relatórios, compliance
- Inclua cenários de fechamento, auditoria, planejamento orçamentário
- Perguntas sobre precisão, análise crítica, gestão de riscos
- Contextos: fechamento mensal, auditoria, análise de investimento
Exemplo: "Ao analisar um relatório financeiro com inconsistências, você..."`;
    }
    
    // Operações e Logística
    if (cargo.includes('operações') || cargo.includes('logística') || cargo.includes('supply') ||
        cargo.includes('produção') || cargo.includes('qualidade')) {
      return `PERSONALIZAÇÃO PARA OPERAÇÕES:
- Foque em situações de processos, eficiência, resolução de problemas
- Inclua cenários de prazos, qualidade, otimização
- Perguntas sobre organização, análise de processos, melhoria contínua
- Contextos: atraso na entrega, problema de qualidade, otimização de processo
Exemplo: "Ao identificar um gargalo no processo operacional, você..."`;
    }
    
    // Genérico (se não identificar cargo específico)
    return `PERSONALIZAÇÃO PROFISSIONAL:
- Foque em situações do dia a dia corporativo
- Inclua cenários de trabalho em equipe, comunicação, decisões
- Perguntas sobre comportamento profissional, relacionamento, produtividade
- Contextos: reuniões, projetos, prazos, desafios
Exemplo: "Em uma situação profissional desafiadora, você prefere..."`;
  }

  /**
   * Gera instruções específicas baseadas no objetivo do teste
   */
  private getObjetivoSpecificInstructions(testObjective: string): string {
    const objetivo = testObjective.toLowerCase();
    
    // Autoconhecimento
    if (objetivo.includes('autoconhecimento') || objetivo.includes('auto conhecimento') || 
        objetivo.includes('conhecer') || objetivo.includes('descobrir')) {
      return `FOCO NO OBJETIVO - AUTOCONHECIMENTO:
- Perguntas introspectivas sobre preferências pessoais
- Situações que revelam valores e motivações internas
- Cenários de escolha entre diferentes abordagens
- Ênfase em "como você é" vs "como você age"
Exemplo: "O que mais te motiva no dia a dia é..."`;
    }
    
    // Desenvolvimento e Crescimento
    if (objetivo.includes('desenvolvimento') || objetivo.includes('crescimento') || 
        objetivo.includes('evolução') || objetivo.includes('melhorar')) {
      return `FOCO NO OBJETIVO - DESENVOLVIMENTO:
- Perguntas sobre pontos fortes e áreas de melhoria
- Situações de aprendizado e feedback
- Cenários de desafios e superação
- Ênfase em potencial de crescimento
Exemplo: "Para desenvolver suas habilidades, você prefere..."`;
    }
    
    // Liderança
    if (objetivo.includes('liderança') || objetivo.includes('líder') || 
        objetivo.includes('gestão') || objetivo.includes('gerenciar')) {
      return `FOCO NO OBJETIVO - LIDERANÇA:
- Perguntas sobre estilo de liderança e gestão de pessoas
- Situações de tomada de decisão e delegação
- Cenários de motivação de equipe e resolução de conflitos
- Ênfase em influência e impacto
Exemplo: "Ao liderar uma equipe, você prioriza..."`;
    }
    
    // Comunicação
    if (objetivo.includes('comunicação') || objetivo.includes('comunicar') || 
        objetivo.includes('relacionamento') || objetivo.includes('interação')) {
      return `FOCO NO OBJETIVO - COMUNICAÇÃO:
- Perguntas sobre estilo de comunicação e expressão
- Situações de diálogo, negociação, apresentação
- Cenários de feedback e escuta ativa
- Ênfase em clareza e empatia
Exemplo: "Ao comunicar uma ideia importante, você..."`;
    }
    
    // Carreira e Transição
    if (objetivo.includes('carreira') || objetivo.includes('transição') || 
        objetivo.includes('recolocação') || objetivo.includes('mudança')) {
      return `FOCO NO OBJETIVO - CARREIRA:
- Perguntas sobre valores profissionais e aspirações
- Situações de escolha de carreira e oportunidades
- Cenários de adaptação e novos desafios
- Ênfase em fit cultural e alinhamento
Exemplo: "Ao avaliar uma oportunidade de carreira, você considera principalmente..."`;
    }
    
    // Vendas e Performance
    if (objetivo.includes('vendas') || objetivo.includes('performance') || 
        objetivo.includes('resultado') || objetivo.includes('meta')) {
      return `FOCO NO OBJETIVO - PERFORMANCE EM VENDAS:
- Perguntas sobre motivação, competitividade, resiliência
- Situações de negociação, objeções, fechamento
- Cenários de pressão por resultados e metas
- Ênfase em drive e orientação para resultados
Exemplo: "Diante de uma meta desafiadora, você..."`;
    }
    
    // Trabalho em Equipe
    if (objetivo.includes('equipe') || objetivo.includes('time') || 
        objetivo.includes('colaboração') || objetivo.includes('grupo')) {
      return `FOCO NO OBJETIVO - TRABALHO EM EQUIPE:
- Perguntas sobre colaboração e dinâmica de grupo
- Situações de trabalho conjunto e sinergia
- Cenários de conflitos e alinhamento
- Ênfase em complementaridade e cooperação
Exemplo: "Ao trabalhar em equipe, você prefere..."`;
    }
    
    // Genérico
    return `FOCO NO OBJETIVO - PROFISSIONAL:
- Perguntas equilibradas sobre comportamento e motivação
- Situações variadas do contexto profissional
- Cenários realistas e aplicáveis
- Ênfase em autoconhecimento aplicado
Exemplo: "No seu dia a dia profissional, você tende a..."`;
  }

  protected validateInput(input: QuestionGeneratorInput): void {
    if (!input.questionCount || input.questionCount < 10 || input.questionCount > 100) {
      throw new Error('Question count must be between 10 and 100');
    }
  }

  protected validateResponse(response: QuestionGeneratorOutput): void {
    if (!response.questions || !Array.isArray(response.questions)) {
      throw new Error('Invalid response: questions array is required');
    }

    if (response.questions.length === 0) {
      throw new Error('Invalid response: no questions generated');
    }

    const validValueTypes: ValueType[] = ['theoretical', 'economic', 'aesthetic', 'social', 'political', 'spiritual'];
    const validEnergyTypes = ['introvert', 'extrovert'];
    const validPerceptionTypes = ['sensory', 'intuitive'];
    const validDecisionTypes = ['rational', 'emotional'];
    const validOrganizationTypes = ['structured', 'flexible'];

    // Validar estrutura de cada pergunta
    response.questions.forEach((q, index) => {
      if (!q.text || typeof q.text !== 'string') {
        throw new Error(`Question ${index + 1}: text is required`);
      }

      if (!q.options || !Array.isArray(q.options) || q.options.length !== 4) {
        throw new Error(`Question ${index + 1}: must have exactly 4 options`);
      }

      const types = q.options.map(o => o.type);
      const uniqueTypes = new Set(types);
      const requiredTypes: DISCType[] = ['D', 'I', 'S', 'C'];
      
      if (uniqueTypes.size !== 4 || !requiredTypes.every(t => uniqueTypes.has(t))) {
        throw new Error(`Question ${index + 1}: must have one option for each DISC type`);
      }

      // Validar valueType e psychTraits (se presentes)
      q.options.forEach((opt, optIndex) => {
        if (opt.valueType && !validValueTypes.includes(opt.valueType)) {
          throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: invalid valueType "${opt.valueType}"`);
        }

        if (opt.psychTraits) {
          if (opt.psychTraits.energy && !validEnergyTypes.includes(opt.psychTraits.energy)) {
            throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: invalid energy type`);
          }
          if (opt.psychTraits.perception && !validPerceptionTypes.includes(opt.psychTraits.perception)) {
            throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: invalid perception type`);
          }
          if (opt.psychTraits.decision && !validDecisionTypes.includes(opt.psychTraits.decision)) {
            throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: invalid decision type`);
          }
          if (opt.psychTraits.organization && !validOrganizationTypes.includes(opt.psychTraits.organization)) {
            throw new Error(`Question ${index + 1}, Option ${optIndex + 1}: invalid organization type`);
          }
        }
      });
    });
  }

  protected async fallback(
    input: QuestionGeneratorInput,
    context: VXAgentContext,
    error: any
  ): Promise<QuestionGeneratorOutput> {
    console.warn(`[${this.name}] Using fallback due to error:`, error?.message);

    // Importar perguntas base do sistema
    const { questions: baseQuestions } = await import('@/data/questions');

    // Se pediu menos ou igual a 20, retornar subset
    if (input.questionCount <= 20) {
      return {
        questions: baseQuestions.slice(0, input.questionCount).map((q, index) => ({
          id: index + 1,
          text: q.text,
          options: q.options.map(opt => ({
            text: opt.text,
            type: opt.discType,
            // Sem valueType nem psychTraits - compatibilidade
          })),
        })),
        source: 'fallback',
        metadata: {
          questionCount: input.questionCount,
          generatedAt: new Date(),
          hasIntegratedProfile: false,
        },
      };
    }

    // Se pediu mais de 20, criar variações
    const questions: ExtendedDISCQuestion[] = [];
    const prefixes = [
      'Em uma situação desafiadora',
      'Durante um projeto importante',
      'Em uma reunião de equipe',
      'Ao lidar com um conflito',
      'Quando precisa tomar uma decisão',
      'Em um momento de pressão',
    ];

    let questionId = 1;

    // Adicionar todas as perguntas base
    baseQuestions.forEach(q => {
      questions.push({
        id: questionId++,
        text: q.text,
        options: q.options.map(opt => ({
          text: opt.text,
          type: opt.discType,
        })),
      });
    });

    // Criar variações até atingir a quantidade desejada
    while (questions.length < input.questionCount) {
      const baseQuestion = baseQuestions[questions.length % baseQuestions.length];
      const prefix = prefixes[Math.floor(Math.random() * prefixes.length)];

      questions.push({
        id: questionId++,
        text: `${prefix}, ${baseQuestion.text.toLowerCase()}`,
        options: baseQuestion.options.map(opt => ({
          text: opt.text,
          type: opt.discType,
        })),
      });
    }

    return {
      questions: questions.slice(0, input.questionCount),
      source: 'fallback',
      metadata: {
        questionCount: input.questionCount,
        generatedAt: new Date(),
        hasIntegratedProfile: false,
      },
    };
  }
}
