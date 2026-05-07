/**
 * VX Orchestrator Agent
 * Agente orquestrador que coordena os outros agentes
 */

import { BaseAgent } from './BaseAgent';
import type { AgentConfig, VXAgentContext, AgentRole } from './types';
import { AgentRegistry } from './AgentRegistry';

interface OrchestratorInput {
  intent: 'generate-questions' | 'analyze-disc' | 'chat' | 'auto';
  data: any;
}

interface OrchestratorOutput {
  result: any;
  agentsUsed: AgentRole[];
  executionFlow: string[];
}

export class VXOrchestratorAgent extends BaseAgent<OrchestratorInput, OrchestratorOutput> {
  private registry: AgentRegistry;

  constructor(apiKey: string, registry: AgentRegistry) {
    const config: AgentConfig = {
      name: 'VXOrchestratorAgent',
      role: 'orchestrator',
      description: 'Orquestrador central que coordena todos os agentes do sistema',
      apiKey,
      model: 'gpt-4o-mini',
      temperature: 0.3,
      maxTokens: 500,
      systemPrompt: `Você é o orquestrador inteligente do sistema VX DISC, responsável por coordenar múltiplos agentes especializados para entregar a melhor experiência ao usuário.

AGENTES DISPONÍVEIS:

1. QuestionGeneratorAgent (question-generator)
Função: Gera perguntas DISC dinâmicas (10-100 perguntas)
Quando usar: Quando o usuário solicitar geração de perguntas personalizadas
Input: { questionCount: number }

2. MarinaBehaviorAnalystAgent (behavior-analyst)
Função: Analisa resultados DISC e gera diagnóstico comportamental profissional
Quando usar: Após o usuário completar o teste DISC
Input: { scores, percentages, dominantProfile, questionCount }
Output: Análise completa + pontos fortes + atenção + recomendações

3. LucasCommercialConsultantAgent (commercial-consultant)
Função: Conversa sobre vendas, liderança, comunicação e desenvolvimento
Quando usar: Quando o usuário faz perguntas ou busca orientação
Input: { userMessage, conversationHistory }
Contexto importante: Lucas funciona melhor quando tem acesso à análise da Marina

REGRAS DE ORQUESTRAÇÃO:

1. FLUXO SIMPLES:
- Gerar perguntas → QuestionGeneratorAgent
- Analisar DISC → MarinaBehaviorAnalystAgent
- Chat/orientação → LucasCommercialConsultantAgent

2. FLUXO ENCADEADO (IMPORTANTE):
Quando o usuário inicia um chat E tem perfil DISC MAS não tem análise da Marina:
a) Primeiro chame MarinaBehaviorAnalystAgent para gerar análise
b) Adicione a análise ao contexto
c) Depois chame LucasCommercialConsultantAgent com contexto enriquecido

Isso garante que Lucas tenha informações profundas sobre o comportamento do usuário.

3. CONTEXTO COMPARTILHADO:
Sempre passe o máximo de contexto disponível entre agentes:
- userId, userName, jobTitle, company
- dominantProfile, scores, percentages
- marinaAnalysis (quando disponível)
- conversationHistory (para Lucas)

4. LOGS ESTRUTURADOS:
Registre cada decisão:
- Qual agente foi chamado
- Por que foi chamado
- Qual contexto foi passado
- Se houve fluxo encadeado

5. DETECÇÃO AUTOMÁTICA (modo 'auto'):
Quando intent='auto', analise o input e decida:
- Se tem questionCount → question-generator
- Se tem scores + dominantProfile → behavior-analyst
- Se tem userMessage → commercial-consultant (verificar se precisa Marina primeiro)

EXEMPLO DE FLUXO ENCADEADO:

Usuário: "Como melhorar minhas vendas?"
Contexto: { dominantProfile: 'D', scores: {...}, marinaAnalysis: undefined }

Decisão:
1. Detectar que Lucas precisa de contexto da Marina
2. Chamar Marina para gerar análise
3. Adicionar análise ao contexto
4. Chamar Lucas com contexto completo
5. Retornar resposta do Lucas

Resultado: Lucas responde com base em análise profunda do comportamento

PREPARAÇÃO PARA NOVOS AGENTES:

O sistema foi projetado para ser extensível. Quando novos agentes forem adicionados:
- Adicione o agente ao AgentRegistry
- Documente sua função aqui
- Defina regras de quando chamá-lo
- Atualize fluxos encadeados se necessário

IMPORTANTE:
Você é o cérebro do sistema. Suas decisões impactam diretamente a qualidade da experiência do usuário. Sempre priorize:
1. Contexto rico entre agentes
2. Fluxos encadeados quando necessário
3. Logs claros para debugging
4. Eficiência (não chamar agentes desnecessariamente)`,
    };

    super(config);
    this.registry = registry;
  }

  protected async executeAgent(
    input: OrchestratorInput,
    context: VXAgentContext
  ): Promise<OrchestratorOutput> {
    const agentsUsed: AgentRole[] = [];
    const executionFlow: string[] = [];

    switch (input.intent) {
      case 'generate-questions': {
        executionFlow.push('Generating questions with QuestionGeneratorAgent');
        const agent = this.registry.getAgent('question-generator');
        const response = await agent.execute(input.data, context);
        agentsUsed.push('question-generator');
        
        return {
          result: response.data,
          agentsUsed,
          executionFlow,
        };
      }

      case 'analyze-disc': {
        executionFlow.push('Analyzing DISC with MarinaBehaviorAnalystAgent');
        const agent = this.registry.getAgent('behavior-analyst');
        const response = await agent.execute(input.data, context);
        agentsUsed.push('behavior-analyst');
        
        return {
          result: response.data,
          agentsUsed,
          executionFlow,
        };
      }

      case 'chat': {
        // Verificar se precisa consultar Marina primeiro
        const needsMarinaContext = !context.marinaAnalysis && context.dominantProfile;
        
        if (needsMarinaContext && context.scores) {
          executionFlow.push('Fetching Marina analysis first');
          const marinaAgent = this.registry.getAgent('behavior-analyst');
          const marinaResponse = await marinaAgent.execute({
            scores: context.scores,
            percentages: context.percentages!,
            dominantProfile: context.dominantProfile!,
            questionCount: context.questionCount || 20,
          }, context);
          
          agentsUsed.push('behavior-analyst');
          
          // Atualizar contexto com análise da Marina
          context.marinaAnalysis = marinaResponse.data?.analysis;
          executionFlow.push('Marina analysis added to context');
        }

        executionFlow.push('Chatting with LucasCommercialConsultantAgent');
        const lucasAgent = this.registry.getAgent('commercial-consultant');
        const lucasResponse = await lucasAgent.execute(input.data, context);
        agentsUsed.push('commercial-consultant');
        
        return {
          result: lucasResponse.data,
          agentsUsed,
          executionFlow,
        };
      }

      case 'auto': {
        // Detectar intenção automaticamente
        executionFlow.push('Auto-detecting intent');
        const detectedIntent = await this.detectIntent(input.data, context);
        executionFlow.push(`Detected intent: ${detectedIntent}`);
        
        return this.executeAgent({ intent: detectedIntent, data: input.data }, context);
      }

      default:
        throw new Error(`Unknown intent: ${input.intent}`);
    }
  }

  private async detectIntent(
    data: any,
    context: VXAgentContext
  ): Promise<'generate-questions' | 'analyze-disc' | 'chat'> {
    // Lógica simples de detecção
    if (data.questionCount) {
      return 'generate-questions';
    }
    
    if (data.scores && data.dominantProfile) {
      return 'analyze-disc';
    }
    
    if (data.userMessage) {
      return 'chat';
    }
    
    return 'chat'; // Default
  }

  protected validateInput(input: OrchestratorInput): void {
    if (!input.intent) {
      throw new Error('Intent is required');
    }

    if (!['generate-questions', 'analyze-disc', 'chat', 'auto'].includes(input.intent)) {
      throw new Error('Invalid intent');
    }
  }

  protected validateResponse(response: OrchestratorOutput): void {
    if (!response.result) {
      throw new Error('Result is required');
    }

    if (!Array.isArray(response.agentsUsed)) {
      throw new Error('Agents used array is required');
    }

    if (!Array.isArray(response.executionFlow)) {
      throw new Error('Execution flow array is required');
    }
  }

  protected async fallback(
    input: OrchestratorInput,
    context: VXAgentContext,
    error: any
  ): Promise<OrchestratorOutput> {
    console.warn(`[${this.name}] Using fallback due to error:`, error?.message);

    return {
      result: {
        error: 'Orchestrator failed to execute',
        message: error?.message,
      },
      agentsUsed: [],
      executionFlow: ['Orchestrator failed', 'Using fallback'],
    };
  }
}
