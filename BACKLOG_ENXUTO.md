# 🎯 Backlog Enxuto - VX DISC

## Filosofia: Foco no Essencial

Este backlog contém **apenas o que é crítico** para finalizar o produto e colocá-lo em produção.

---

## 🔥 PRIORIDADE MÁXIMA (Fazer Agora)

### 1. ✅ Validar Marina e Lucas
**Status**: ⏳ Pendente  
**Tempo estimado**: 30-60 minutos  
**Responsável**: Você + Kiro

**Checklist**:
- [ ] Iniciar servidor: `npm run dev`
- [ ] Fazer teste DISC completo (20 perguntas)
- [ ] **Validar Marina**:
  - [ ] Análise não usa markdown (**, ##, -, •)
  - [ ] Texto fluido e profissional
  - [ ] Personalização ao cargo/empresa
  - [ ] Recomendações práticas e específicas
  - [ ] Não menciona "IA" ou "sistema"
- [ ] **Validar Lucas**:
  - [ ] Abrir chat após teste
  - [ ] Perguntar: "Como melhorar minhas vendas?"
  - [ ] Resposta usa análise da Marina
  - [ ] Resposta tem 2-4 parágrafos (não muito longa)
  - [ ] Faz perguntas para entender contexto
  - [ ] Conselhos específicos ao perfil DISC
  - [ ] Não usa markdown
- [ ] **Validar Fluxo Encadeado**:
  - [ ] Verificar logs do servidor
  - [ ] Confirmar: `[Marina] success: true`
  - [ ] Confirmar: `[Lucas] success: true`

**Critério de Sucesso**:
- Respostas profissionais e humanas
- Sem markdown quebrado
- Personalização real ao usuário
- Fluxo Marina → Lucas funcionando

**Se falhar**:
- Ajustar prompts
- Testar novamente
- Iterar até ficar bom

---

### 2. ⏳ Implementar Perguntas Dinâmicas
**Status**: ⏳ Não iniciado  
**Tempo estimado**: 2-3 horas  
**Responsável**: Kiro

**Objetivo**: Permitir que o usuário escolha entre 10 e 100 perguntas para o teste DISC.

**Tarefas**:
- [ ] **Criar API Route**:
  - [ ] Criar `app/api/ai/generate-questions/route.ts`
  - [ ] Integrar `QuestionGeneratorAgent`
  - [ ] Validar input (10-100)
  - [ ] Retornar perguntas geradas
  - [ ] Implementar fallback robusto
  
- [ ] **Atualizar UI do Teste**:
  - [ ] Adicionar seletor de quantidade (10, 20, 50, 100)
  - [ ] Mostrar loading durante geração
  - [ ] Salvar perguntas geradas no estado
  - [ ] Atualizar barra de progresso dinamicamente
  
- [ ] **Salvar no Banco**:
  - [ ] Salvar perguntas geradas em `generated_questions` (JSONB)
  - [ ] Atualizar `question_count` corretamente
  - [ ] Atualizar `question_source` para 'ai'
  
- [ ] **Testar**:
  - [ ] Gerar 10 perguntas
  - [ ] Gerar 50 perguntas
  - [ ] Gerar 100 perguntas
  - [ ] Verificar fallback se API falhar
  - [ ] Verificar salvamento no banco

**Arquivos envolvidos**:
- `app/api/ai/generate-questions/route.ts` (criar)
- `app/test/page.tsx` (atualizar)
- `lib/agents/QuestionGeneratorAgent.ts` (já existe)

**Critério de Sucesso**:
- Usuário pode escolher quantidade
- Perguntas são geradas dinamicamente
- Fallback funciona se API falhar
- Perguntas são salvas no banco

---

### 3. ⏳ Rodar Testes Automatizados
**Status**: ⏳ Não iniciado  
**Tempo estimado**: 1 hora  
**Responsável**: Kiro

**Objetivo**: Garantir que o sistema funciona corretamente antes de ir para produção.

**Tarefas**:
- [ ] Rodar testes existentes: `npm test`
- [ ] Verificar se todos passam
- [ ] Corrigir testes quebrados (se houver)
- [ ] Adicionar teste para fluxo encadeado Marina → Lucas
- [ ] Adicionar teste para perguntas dinâmicas

**Critério de Sucesso**:
- Todos os testes passam
- Cobertura mínima de 70%

---

## 🚀 PREPARAR PARA PRODUÇÃO (Depois)

### 4. ⏳ Landing Page
**Status**: ⏳ Não iniciado  
**Tempo estimado**: 4-6 horas  
**Responsável**: Você + Kiro

**Objetivo**: Criar página de vendas para capturar leads.

**Tarefas**:
- [ ] Hero section com proposta de valor
- [ ] Benefícios do teste DISC
- [ ] Como funciona (3 passos)
- [ ] Depoimentos (se houver)
- [ ] CTA: "Fazer Teste Grátis"
- [ ] Formulário de captura (nome, email, WhatsApp)
- [ ] Design VX (laranja + preto)

**Arquivos**:
- `app/landing/page.tsx` (criar)
- `components/landing/` (criar)

---

### 5. ⏳ Deploy Vercel
**Status**: ⏳ Não iniciado  
**Tempo estimado**: 1-2 horas  
**Responsável**: Você + Kiro

**Tarefas**:
- [ ] Criar projeto no Vercel
- [ ] Conectar repositório GitHub
- [ ] Configurar variáveis de ambiente:
  - [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - [ ] `SUPABASE_SERVICE_ROLE_KEY`
  - [ ] `OPENAI_API_KEY`
  - [ ] `NEXT_PUBLIC_APP_URL`
- [ ] Deploy
- [ ] Testar em produção
- [ ] Configurar domínio (se houver)

---

### 6. ⏳ Integração CRM/GHL
**Status**: ⏳ Não iniciado  
**Tempo estimado**: 2-3 horas  
**Responsável**: Você + Kiro

**Objetivo**: Enviar leads capturados para GoHighLevel.

**Tarefas**:
- [ ] Criar webhook no GHL
- [ ] Criar API route para enviar leads
- [ ] Integrar com formulário de captura
- [ ] Adicionar tags por perfil DISC
- [ ] Testar envio de leads

---

## ⏸️ PAUSADO (Não fazer agora)

Estas tarefas são importantes, mas **não são críticas** para lançar o produto:

- ❌ Dashboard avançado (filtros, gráficos, exportação)
- ❌ Novos agentes (onboarding, relatórios, treinamento)
- ❌ Guia de contribuição
- ❌ Relatórios comparativos
- ❌ Analytics avançado
- ❌ Monitoramento avançado
- ❌ Melhorias extras no chat (indicador de digitando, etc.)
- ❌ Exportar PDF (serviço existe, mas não é crítico)
- ❌ Área de clientes avançada

**Por que pausar?**
- Não impactam o lançamento do produto
- Podem ser feitas depois, com feedback de usuários reais
- Foco é validar o core do produto primeiro

---

## ✅ CONCLUÍDO

- ✅ Arquitetura multiagente implementada
- ✅ Marina integrada em `/api/ai/calculate-result`
- ✅ Lucas integrado em `/api/ai/chat`
- ✅ Prompts melhorados (humanização, sem markdown)
- ✅ Fluxo encadeado Marina → Lucas
- ✅ Single API key approach
- ✅ Build compilando sem erros
- ✅ Pastas duplicadas removidas (`disc-app/`, `vx-disc-client-analyzer/`)
- ✅ Teste DISC básico (20 perguntas) funcionando
- ✅ Fallbacks implementados

---

## 📊 Resumo

| Status | Quantidade | Tarefas |
|--------|------------|---------|
| 🔥 Fazer Agora | 3 | Validar agentes, Perguntas dinâmicas, Testes |
| 🚀 Depois | 3 | Landing, Deploy, CRM |
| ⏸️ Pausado | 9 | Dashboard, Novos agentes, Docs, etc. |
| ✅ Concluído | 9 | Arquitetura, Integração, Prompts, Limpeza |

---

## 🎯 Próxima Ação Imediata

```bash
# 1. Iniciar servidor
npm run dev

# 2. Abrir navegador
http://localhost:3000

# 3. Fazer teste DISC

# 4. Validar Marina e Lucas

# 5. Documentar resultados
```

**Tempo estimado**: 30-60 minutos  
**Objetivo**: Confirmar que os prompts melhorados funcionam

---

## 💡 Filosofia do Backlog Enxuto

### Princípios:
1. **Foco no Core**: Apenas o que é essencial para o produto funcionar
2. **Validação Rápida**: Testar com usuários reais antes de adicionar features
3. **Iteração**: Melhorar com base em feedback real, não em suposições
4. **Simplicidade**: Menos é mais

### O que NÃO fazer:
- ❌ Adicionar features "legais" mas não essenciais
- ❌ Otimizar prematuramente
- ❌ Criar documentação excessiva
- ❌ Implementar analytics antes de ter usuários

### O que fazer:
- ✅ Validar o core do produto
- ✅ Colocar em produção rápido
- ✅ Capturar leads
- ✅ Iterar com feedback real

---

**Última atualização**: 2026-05-05  
**Versão**: 1.0 (Enxuto)  
**Status**: 🔥 Foco total no essencial
