/**
 * Agent Registry
 * Registro central de todos os agentes do sistema
 */

import { QuestionGeneratorAgent } from './QuestionGeneratorAgent';
import { MarinaBehaviorAnalystAgent } from './MarinaBehaviorAnalystAgent';
import { LucasCommercialConsultantAgent } from './LucasCommercialConsultantAgent';
import type { AgentRole } from './types';
import type { BaseAgent } from './BaseAgent';

export class AgentRegistry {
  private agents: Map<AgentRole, BaseAgent<any, any>>;

  constructor() {
    this.agents = new Map();
  }

  /**
   * Inicializar todos os agentes com suas API keys
   */
  initialize(apiKey: string): void {
    // Todos os agentes usam a mesma key
    // Separação é lógica (prompts, config), não física (keys)
    
    // Registrar Question Generator
    this.agents.set(
      'question-generator',
      new QuestionGeneratorAgent(apiKey)
    );

    // Registrar Marina
    this.agents.set(
      'behavior-analyst',
      new MarinaBehaviorAnalystAgent(apiKey)
    );

    // Registrar Lucas
    this.agents.set(
      'commercial-consultant',
      new LucasCommercialConsultantAgent(apiKey)
    );

    console.log('[AgentRegistry] All agents initialized with single API key');
  }

  /**
   * Obter agente por role
   */
  getAgent(role: AgentRole): BaseAgent<any, any> {
    const agent = this.agents.get(role);
    
    if (!agent) {
      throw new Error(`Agent not found: ${role}`);
    }
    
    return agent;
  }

  /**
   * Verificar se agente está registrado
   */
  hasAgent(role: AgentRole): boolean {
    return this.agents.has(role);
  }

  /**
   * Listar todos os agentes registrados
   */
  listAgents(): Array<{
    role: AgentRole;
    name: string;
    description: string;
  }> {
    const list: Array<{
      role: AgentRole;
      name: string;
      description: string;
    }> = [];

    this.agents.forEach((agent, role) => {
      list.push({
        role,
        name: agent.name,
        description: agent.description,
      });
    });

    return list;
  }

  /**
   * Limpar todos os agentes (útil para testes)
   */
  clear(): void {
    this.agents.clear();
  }
}

// Singleton instance
let registryInstance: AgentRegistry | null = null;

/**
 * Obter instância singleton do registry
 */
export function getAgentRegistry(): AgentRegistry {
  if (!registryInstance) {
    registryInstance = new AgentRegistry();
    
    // Usar apenas OPENAI_API_KEY
    const apiKey = process.env.OPENAI_API_KEY || '';

    if (!apiKey) {
      console.error('[AgentRegistry] OPENAI_API_KEY is missing!');
      throw new Error('OPENAI_API_KEY is required');
    }

    registryInstance.initialize(apiKey);
  }

  return registryInstance;
}

/**
 * Resetar registry (útil para testes)
 */
export function resetAgentRegistry(): void {
  registryInstance = null;
}
