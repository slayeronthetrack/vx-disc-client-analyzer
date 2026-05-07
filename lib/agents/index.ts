/**
 * Agents Module
 * Exporta todos os agentes e utilitários do sistema multiagente
 */

export { BaseAgent } from './BaseAgent';
export { QuestionGeneratorAgent } from './QuestionGeneratorAgent';
export { MarinaBehaviorAnalystAgent } from './MarinaBehaviorAnalystAgent';
export { LucasCommercialConsultantAgent } from './LucasCommercialConsultantAgent';
export { VXOrchestratorAgent } from './VXOrchestratorAgent';
export { AgentRegistry, getAgentRegistry, resetAgentRegistry } from './AgentRegistry';

export type {
  AgentRole,
  AgentConfig,
  VXAgentContext,
  AgentResponse,
  AgentExecutionLog,
} from './types';
