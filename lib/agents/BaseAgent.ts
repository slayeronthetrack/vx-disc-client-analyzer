/**
 * Base Agent
 * Classe base para todos os agentes do sistema
 */

import OpenAI from 'openai';
import type { AgentConfig, AgentResponse, VXAgentContext, AgentRole } from './types';

export abstract class BaseAgent<TInput = any, TOutput = any> {
  protected config: AgentConfig;
  protected openai: OpenAI;

  constructor(config: AgentConfig) {
    this.config = config;
    this.openai = new OpenAI({
      apiKey: config.apiKey,
    });
  }

  /**
   * Método principal de execução do agente
   */
  async execute(input: TInput, context: VXAgentContext): Promise<AgentResponse<TOutput>> {
    const startTime = Date.now();
    let usedFallback = false;

    try {
      // Validar entrada
      this.validateInput(input);

      // Executar lógica específica do agente
      const result = await this.executeAgent(input, context);

      // Validar resposta
      this.validateResponse(result);

      const executionTime = Date.now() - startTime;

      // Log de execução
      this.logExecution({
        agentName: this.config.name,
        agentRole: this.config.role,
        executionTime,
        success: true,
        usedFallback: false,
        timestamp: new Date(),
      });

      return {
        success: true,
        data: result,
        agentName: this.config.name,
        agentRole: this.config.role,
        executionTime,
        usedFallback: false,
        timestamp: new Date(),
      };
    } catch (error: any) {
      console.error(`[${this.config.name}] Error:`, {
        message: error?.message,
        code: error?.code,
        type: error?.type,
      });

      // Tentar fallback
      try {
        const fallbackResult = await this.fallback(input, context, error);
        usedFallback = true;

        const executionTime = Date.now() - startTime;

        // Log de execução com fallback
        this.logExecution({
          agentName: this.config.name,
          agentRole: this.config.role,
          executionTime,
          success: true,
          usedFallback: true,
          timestamp: new Date(),
        });

        return {
          success: true,
          data: fallbackResult,
          agentName: this.config.name,
          agentRole: this.config.role,
          executionTime,
          usedFallback: true,
          timestamp: new Date(),
        };
      } catch (fallbackError: any) {
        const executionTime = Date.now() - startTime;

        // Log de erro
        this.logExecution({
          agentName: this.config.name,
          agentRole: this.config.role,
          executionTime,
          success: false,
          usedFallback: true,
          error: fallbackError?.message,
          timestamp: new Date(),
        });

        return {
          success: false,
          error: fallbackError?.message || 'Agent execution failed',
          agentName: this.config.name,
          agentRole: this.config.role,
          executionTime,
          usedFallback: true,
          timestamp: new Date(),
        };
      }
    }
  }

  /**
   * Chamar OpenAI com configuração do agente
   */
  protected async callOpenAI(
    messages: Array<{ role: 'system' | 'user' | 'assistant'; content: string }>,
    options?: {
      temperature?: number;
      maxTokens?: number;
      responseFormat?: { type: 'json_object' };
    }
  ): Promise<string> {
    const response = await this.openai.chat.completions.create({
      model: this.config.model,
      messages,
      temperature: options?.temperature ?? this.config.temperature,
      max_tokens: options?.maxTokens ?? this.config.maxTokens,
      response_format: options?.responseFormat,
    });

    return response.choices[0]?.message?.content || '';
  }

  /**
   * Métodos abstratos que cada agente deve implementar
   */
  protected abstract executeAgent(input: TInput, context: VXAgentContext): Promise<TOutput>;
  protected abstract validateInput(input: TInput): void;
  protected abstract validateResponse(response: TOutput): void;
  protected abstract fallback(input: TInput, context: VXAgentContext, error: any): Promise<TOutput>;

  /**
   * Log de execução (pode ser sobrescrito)
   */
  protected logExecution(log: {
    agentName: string;
    agentRole: AgentRole;
    executionTime: number;
    success: boolean;
    usedFallback: boolean;
    error?: string;
    timestamp: Date;
  }): void {
    console.log(`[Agent Execution]`, {
      agent: log.agentName,
      role: log.agentRole,
      time: `${log.executionTime}ms`,
      success: log.success,
      fallback: log.usedFallback,
      error: log.error,
    });
  }

  /**
   * Getters
   */
  get name(): string {
    return this.config.name;
  }

  get role(): AgentRole {
    return this.config.role;
  }

  get description(): string {
    return this.config.description;
  }
}
