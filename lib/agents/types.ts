/**
 * Agent Types
 * Tipos e interfaces para o sistema multiagente
 */

import type { ValueProfile, PsychologicalProfile } from '@/types/integrated-profile';

export type AgentRole = 
  | 'question-generator'
  | 'behavior-analyst'
  | 'commercial-consultant'
  | 'orchestrator';

export interface AgentConfig {
  name: string;
  role: AgentRole;
  description: string;
  apiKey: string;
  model: string;
  temperature: number;
  maxTokens: number;
  systemPrompt: string;
}

export interface VXAgentContext {
  // User Info
  userId: string;
  userName: string;
  userEmail?: string;
  jobTitle?: string;
  company?: string;
  testObjective?: string;

  // Test Info
  questionCount?: number;
  questionsAnswered?: number;
  
  // DISC Results
  scores?: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  percentages?: {
    D: number;
    I: number;
    S: number;
    C: number;
  };
  dominantProfile?: 'D' | 'I' | 'S' | 'C';
  
  // Integrated Profile (new)
  valueProfile?: ValueProfile;
  psychologicalProfile?: PsychologicalProfile;
  
  // Analysis
  marinaAnalysis?: string;
  
  // Chat
  chatHistory?: Array<{
    role: 'user' | 'assistant';
    content: string;
    timestamp: Date;
  }>;
  
  // Request Info
  requestingAgent?: AgentRole;
  userMessage?: string;
  intent?: string;
}

export interface AgentResponse<T = any> {
  success: boolean;
  data?: T;
  error?: string;
  agentName: string;
  agentRole: AgentRole;
  executionTime: number;
  usedFallback: boolean;
  timestamp: Date;
}

export interface AgentExecutionLog {
  agentName: string;
  agentRole: AgentRole;
  executionTime: number;
  success: boolean;
  usedFallback: boolean;
  error?: string;
  timestamp: Date;
}
