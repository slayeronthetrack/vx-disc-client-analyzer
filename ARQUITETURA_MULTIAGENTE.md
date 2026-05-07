# 🤖 Arquitetura Multiagente - VX DISC System

## 📋 Visão Geral

O sistema VX DISC foi evoluído para uma **arquitetura multiagente**, onde cada agente de IA possui:
- ✅ Função específica e bem definida
- ✅ API Key própria (OpenAI)
- ✅ Configuração independente (model, temperature, maxTokens)
- ✅ System prompt personalizado
- ✅ Fallback seguro
- ✅ Logs e auditoria

---

## 🎯 Agentes do Sistema

### 1. QuestionGeneratorAgent
**Nome interno**: `QuestionGeneratorAgent`  
**Role**: `question-generator`  
**API Key**: `QUESTION_GENERATOR_OPENAI_API_KEY`

**Função:**
- Gerar perguntas DISC dinâmicas
- Respeitar quantidade escolhida (10-100)
- Garantir 4 alternativas por pergunta
- Garantir uma alternativa para cada fator DISC (D, I, S, C)
- Usar fallback se falhar

**Configuração:**
```typescript
{
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 4000
}
```

**Fallback:**
- Usa perguntas base do sistema (`data/questions.ts`)
- Cria variações se precisar de mais de 20 perguntas

---

### 2. MarinaBehaviorAnalystAgent
**Nome**: Marina Alves  
**Cargo**: Analista Comportamental da VX Comercial  
**Role**: `behavior-analyst`  
**API Key**: `MARINA_OPENAI_API_KEY`

**Função:**
- Analisar resultado DISC
- Interpretar comportamento do usuário
- Gerar diagnóstico profissional
- Identificar pontos fortes, pontos de atenção e recomendações práticas

**Configuração:**
```typescript
{
  model: 'gpt-4o-mini',
  temperature: 0.7,
  maxTokens: 2000
}
```

**Estilo:**
- Profissional, clara e analítica
- Direta e objetiva, sem emoção exagerada
- Focada em comportamento real, não teoria
- Sem emojis
- Linguagem de consultoria executiva

**Fallback:**
- Usa análise baseada em templates por perfil dominante
- Mantém qualidade profissional

---

### 3. LucasCommercialConsultantAgent
**Nome**: Lucas Ferreira  
**Cargo**: Consultor Comercial da VX Comercial  
**Role**: `commercial-consultant`  
**API Key**: `LUCAS_OPENAI_API_KEY`

**Função:**
- Conversar com usuário após o resultado
- Orientar sobre vendas, comunicação, liderança e desenvolvimento
- Usar perfil DISC, análise da Marina, cargo, empresa e histórico da conversa

**Configuração:**
```typescript
{
  model: 'gpt-4o-mini',
  temperature: 0.8,
  maxTokens: 1500
}
```

**Estilo:**
- Direto, estratégico e prático
- Focado em resultados e ações
- Sem emojis
- Conversas objetivas (não longas)

**Fallback:**
- Usa respostas genéricas mas personalizadas
- Mantém tom profissional

---

### 4. VXOrchestratorAgent
**Nome interno**: `VXOrchestratorAgent`  
**Role**: `orchestrator`  
**API Key**: `VX_ORCHESTRATOR_OPENAI_API_KEY`

**Função:**
- Coordenar os outros agentes
- Decidir qual agente deve ser acionado
- Permitir que um agente use a saída do outro
- Centralizar o contexto do usuário
- Preparar arquitetura para novos agentes

**Configuração:**
```typescript
{
  model: 'gpt-4o-mini',
  temperature: 0.3,
  maxTokens: 500
}
```

**Fluxos:**
- `generate-questions` → QuestionGeneratorAgent
- `analyze-disc` → MarinaBehaviorAnalystAgent
- `chat` → LucasCommercialConsultantAgent (pode consultar Marina primeiro)
- `auto` → Detecta intenção automaticamente

---

## 🏗️ Estrutura de Arquivos

```
lib/agents/
├── types.ts                          # Tipos e interfaces
├── BaseAgent.ts                      # Classe base abstrata
├── QuestionGeneratorAgent.ts         # Gerador de perguntas
├── MarinaBehaviorAnalystAgent.ts     # Marina Alves
├── LucasCommercialConsultantAgent.ts # Lucas Ferreira
├── VXOrchestratorAgent.ts            # Orquestrador
├── AgentRegistry.ts                  # Registro de agentes
└── index.ts                          # Exportações
```

---

## 🔧 BaseAgent

Classe abstrata que todos os agentes herdam:

```typescript
abstract class BaseAgent<TInput, TOutput> {
  protected config: AgentConfig;
  protected openai: OpenAI;

  // Método principal
  async execute(input: TInput, context: VXAgentContext): Promise<AgentResponse<TOutput>>

  // Métodos abstratos (cada agente implementa)
  protected abstract executeAgent(input: TInput, context: VXAgentContext): Promise<TOutput>
  protected abstract validateInput(input: TInput): void
  protected abstract validateResponse(response: TOutput): void
  protected abstract fallback(input: TInput, context: VXAgentContext, error: any): Promise<TOutput>

  // Utilitários
  protected async callOpenAI(messages, options): Promise<string>
  protected logExecution(log): void
}
```

---

## 📦 VXAgentContext

Contexto compartilhado entre todos os agentes:

```typescript
interface VXAgentContext {
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
  scores?: { D: number; I: number; S: number; C: number };
  percentages?: { D: number; I: number; S: number; C: number };
  dominantProfile?: 'D' | 'I' | 'S' | 'C';
  
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
```

---

## 🔄 AgentRegistry

Registro central de todos os agentes:

```typescript
const registry = getAgentRegistry();

// Obter agente
const marina = registry.getAgent('behavior-analyst');

// Executar agente
const response = await marina.execute(input, context);

// Listar agentes
const agents = registry.listAgents();
```

**Singleton Pattern:**
- Uma única instância compartilhada
- Inicialização automática com API keys do ambiente
- Fallback para `OPENAI_API_KEY` se key específica estiver ausente

---

## 🔐 Segurança

### API Keys

**Variáveis de ambiente:**
```env
QUESTION_GENERATOR_OPENAI_API_KEY=sk-proj-...
MARINA_OPENAI_API_KEY=sk-proj-...
LUCAS_OPENAI_API_KEY=sk-proj-...
VX_ORCHESTRATOR_OPENAI_API_KEY=sk-proj-...
OPENAI_API_KEY=sk-proj-...  # Fallback
```

**Regras:**
- ✅ Keys apenas no backend (API routes, server-side)
- ❌ Nunca expor no frontend
- ❌ Nunca salvar keys no banco de dados
- ❌ Nunca exibir keys em logs
- ✅ Documentar no `.env.example`

### Fallback Hierarchy

```
1. Key específica do agente (ex: MARINA_OPENAI_API_KEY)
   ↓ (se ausente)
2. Key fallback geral (OPENAI_API_KEY)
   ↓ (se ausente)
3. Fallback local seguro (sem IA)
```

---

## 📊 Logs e Auditoria

Cada execução de agente registra:

```typescript
{
  agentName: 'Marina Alves',
  agentRole: 'behavior-analyst',
  executionTime: 1234, // ms
  success: true,
  usedFallback: false,
  timestamp: Date
}
```

**O que NÃO é registrado:**
- ❌ API keys
- ❌ Dados sensíveis do usuário
- ❌ Conteúdo completo das mensagens (apenas metadados)

---

## 🔄 Fluxos de Comunicação

### Fluxo 1: Gerar Perguntas
```
User Request
    ↓
QuestionGeneratorAgent
    ↓
Return Questions
```

### Fluxo 2: Análise DISC
```
User Completes Test
    ↓
MarinaBehaviorAnalystAgent
    ↓
Return Analysis
```

### Fluxo 3: Chat Simples
```
User Message
    ↓
VXOrchestratorAgent
    ↓
LucasCommercialConsultantAgent
    ↓
Return Response
```

### Fluxo 4: Chat com Contexto Marina
```
User Message (first time)
    ↓
VXOrchestratorAgent
    ↓
MarinaBehaviorAnalystAgent (get analysis)
    ↓
LucasCommercialConsultantAgent (use Marina's analysis)
    ↓
Return Response
```

---

## 🧪 Testes

### Estrutura de Testes

```
lib/agents/__tests__/
├── BaseAgent.test.ts
├── QuestionGeneratorAgent.test.ts
├── MarinaBehaviorAnalystAgent.test.ts
├── LucasCommercialConsultantAgent.test.ts
├── VXOrchestratorAgent.test.ts
└── AgentRegistry.test.ts
```

### Casos de Teste Obrigatórios

**1. QuestionGeneratorAgent**
- ✅ Gerar 10 perguntas válidas
- ✅ Gerar 20 perguntas válidas
- ✅ Gerar 100 perguntas válidas
- ✅ Validar estrutura (4 opções, 1 de cada tipo DISC)
- ✅ Fallback quando API falha

**2. MarinaBehaviorAnalystAgent**
- ✅ Gerar análise com contexto DISC
- ✅ Retornar pontos fortes, atenção e recomendações
- ✅ Fallback quando API falha

**3. LucasCommercialConsultantAgent**
- ✅ Responder com base na análise da Marina
- ✅ Usar histórico da conversa
- ✅ Fallback quando API falha

**4. VXOrchestratorAgent**
- ✅ Chamar agente correto por intent
- ✅ Fluxo encadeado Marina → Lucas
- ✅ Auto-detectar intenção

**5. AgentRegistry**
- ✅ Registrar todos os agentes
- ✅ Obter agente por role
- ✅ Listar agentes disponíveis

---

## 🚀 Como Usar

### 1. Gerar Perguntas

```typescript
import { getAgentRegistry } from '@/lib/agents';

const registry = getAgentRegistry();
const generator = registry.getAgent('question-generator');

const response = await generator.execute(
  { questionCount: 20 },
  {
    userId: 'user-123',
    userName: 'João Silva',
    jobTitle: 'Gerente de Vendas',
    company: 'Empresa XYZ',
  }
);

console.log(response.data.questions); // Array de 20 perguntas
console.log(response.data.source); // 'ai' ou 'fallback'
```

### 2. Análise DISC (Marina)

```typescript
const marina = registry.getAgent('behavior-analyst');

const response = await marina.execute(
  {
    scores: { D: 15, I: 10, S: 8, C: 7 },
    percentages: { D: 37, I: 25, S: 20, C: 18 },
    dominantProfile: 'D',
    questionCount: 20,
  },
  {
    userId: 'user-123',
    userName: 'João Silva',
    jobTitle: 'Gerente de Vendas',
  }
);

console.log(response.data.analysis); // Análise completa
console.log(response.data.strengths); // Array de pontos fortes
console.log(response.data.recommendations); // Array de recomendações
```

### 3. Chat (Lucas via Orquestrador)

```typescript
const orchestrator = registry.getAgent('orchestrator');

const response = await orchestrator.execute(
  {
    intent: 'chat',
    data: {
      userMessage: 'Como posso melhorar minhas vendas?',
      conversationHistory: [],
    },
  },
  {
    userId: 'user-123',
    userName: 'João Silva',
    dominantProfile: 'D',
    scores: { D: 15, I: 10, S: 8, C: 7 },
    marinaAnalysis: '...', // Opcional
  }
);

console.log(response.data.response); // Resposta do Lucas
console.log(response.agentsUsed); // ['commercial-consultant']
```

---

## 📈 Benefícios da Arquitetura

### Escalabilidade
- ✅ Fácil adicionar novos agentes
- ✅ Cada agente é independente
- ✅ Orquestrador coordena tudo

### Manutenibilidade
- ✅ Código modular e organizado
- ✅ Cada agente tem responsabilidade única
- ✅ Fácil testar isoladamente

### Segurança
- ✅ Keys separadas por agente
- ✅ Controle granular de acesso
- ✅ Logs e auditoria

### Confiabilidade
- ✅ Fallback em cada agente
- ✅ Sistema não quebra se um agente falhar
- ✅ Validação em todas as etapas

### Flexibilidade
- ✅ Configuração independente por agente
- ✅ Fácil trocar modelos ou providers
- ✅ Fluxos encadeados

---

## 🔮 Futuro

### Novos Agentes Planejados

**1. ContentGeneratorAgent**
- Gerar conteúdo personalizado (PDFs, relatórios)
- Key: `CONTENT_GENERATOR_OPENAI_API_KEY`

**2. TeamAnalystAgent**
- Analisar dinâmica de equipes
- Comparar perfis DISC
- Key: `TEAM_ANALYST_OPENAI_API_KEY`

**3. CoachingAgent**
- Sessões de coaching personalizadas
- Planos de desenvolvimento
- Key: `COACHING_OPENAI_API_KEY`

### Como Adicionar Novo Agente

1. Criar classe que herda `BaseAgent`
2. Implementar métodos abstratos
3. Registrar no `AgentRegistry`
4. Adicionar key no `.env`
5. Criar testes
6. Documentar

---

## ✅ Checklist de Implementação

- [x] Criar estrutura de tipos (`types.ts`)
- [x] Criar `BaseAgent` abstrato
- [x] Criar `QuestionGeneratorAgent`
- [x] Criar `MarinaBehaviorAnalystAgent`
- [x] Criar `LucasCommercialConsultantAgent`
- [x] Criar `VXOrchestratorAgent`
- [x] Criar `AgentRegistry`
- [x] Atualizar `.env.local` com keys
- [x] Atualizar `.env.example`
- [ ] Atualizar API `/api/ai/generate-questions`
- [ ] Atualizar API `/api/ai/calculate-result`
- [ ] Atualizar API `/api/ai/chat`
- [ ] Criar testes automatizados
- [ ] Testar fluxo completo
- [ ] Documentar uso

---

**Status**: ✅ ARQUITETURA CRIADA - PRONTO PARA INTEGRAÇÃO COM APIs

**Próximo passo**: Atualizar as APIs existentes para usar os novos agentes.
