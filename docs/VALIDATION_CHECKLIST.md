# Validation Checklist - Intelligent Question Bank

Checklist completo para validar a implementação do banco de perguntas inteligente.

## Fase 10.1: Fluxo Antigo (Backward Compatibility)

### ✅ Landing Page
- [ ] Landing page carrega sem erros
- [ ] Design permanece idêntico
- [ ] Botão "Fazer Teste" funciona
- [ ] Navegação para /test funciona
- [ ] Nenhuma mudança visual detectada

**Como validar:**
1. Abrir `http://localhost:3000`
2. Verificar que a página carrega normalmente
3. Comparar visualmente com versão anterior (se disponível)
4. Clicar em "Fazer Teste" e verificar redirecionamento

---

### ✅ Fluxo de Teste Completo
- [ ] Página /test carrega corretamente
- [ ] Perguntas são exibidas (20 por padrão)
- [ ] Usuário consegue selecionar opções
- [ ] Botão "Próxima" funciona
- [ ] Progresso é exibido corretamente
- [ ] Teste pode ser concluído até o fim
- [ ] Redirecionamento para /result funciona

**Como validar:**
1. Fazer login ou criar conta
2. Ir para `/test`
3. Responder todas as 20 perguntas
4. Verificar que não há erros no console
5. Confirmar redirecionamento para `/result`

**Logs esperados no console:**
```
[QuestionBank] Searching for questions...
[QuestionBank] { found: X, needed: 20, searchTime: 'Xms', source: 'bank' | 'mixed' | 'fallback' }
```

---

### ✅ Página de Resultado
- [ ] Página /result carrega sem erros
- [ ] Perfil DISC é exibido corretamente
- [ ] Gráfico DISC (pie chart) aparece
- [ ] Scores e percentagens estão corretos
- [ ] Perfil de Valores é exibido (se disponível)
- [ ] Perfil Psicológico é exibido (se disponível)
- [ ] Análise da Marina é gerada
- [ ] Análise da Marina está bem formatada (sem markdown)

**Como validar:**
1. Completar um teste
2. Verificar que `/result` carrega
3. Confirmar que todos os perfis aparecem
4. Verificar que a análise da Marina está presente
5. Ler a análise e confirmar que faz sentido

**Estrutura esperada:**
```
✅ Perfil DISC
  - Dominante: [D/I/S/C]
  - Scores: D=X, I=X, S=X, C=X
  - Percentagens: D=X%, I=X%, S=X%, C=X%
  - Gráfico visual

✅ Análise da Marina
  - Diagnóstico (3-4 parágrafos)
  - Pontos Fortes (3-4 itens)
  - Pontos de Atenção (3-4 itens)
  - Recomendações (3-4 ações)
```

---

### ✅ Análise da Marina
- [ ] Marina gera análise completa
- [ ] Análise tem 3-4 parágrafos de diagnóstico
- [ ] Pontos fortes são específicos (não genéricos)
- [ ] Pontos de atenção são construtivos
- [ ] Recomendações são acionáveis
- [ ] Texto está sem markdown (sem **, ##, -, •)
- [ ] Tom é profissional e consultivo
- [ ] Análise menciona o perfil dominante
- [ ] Se houver Valores/Psicológico, são integrados

**Como validar:**
1. Completar teste e ir para /result
2. Ler análise da Marina completamente
3. Verificar que não há formatação markdown
4. Confirmar que análise é específica ao perfil
5. Verificar que recomendações são práticas

**Exemplo de análise válida:**
```
Seu perfil dominante é Dominância, representando 45% do seu comportamento. 
Isso indica que você tende a ser direto, focado em resultados e assume 
controle em situações desafiadoras. No contexto de vendas, essa característica 
é uma vantagem competitiva significativa...

Pontos Fortes:
- Toma decisões rápidas e assertivas em negociações
- Foca em metas e resultados mensuráveis
- Assume liderança em situações de pressão

Pontos de Atenção:
- Pode ser percebido como muito direto ou impaciente
- Tendência a priorizar resultados sobre relacionamentos
- Pode ter dificuldade em delegar tarefas

Recomendações:
- Pratique escuta ativa antes de apresentar soluções
- Reserve tempo para construir rapport com clientes
- Desenvolva paciência em processos de venda consultiva
```

---

### ✅ Resultados Antigos Acessíveis
- [ ] Testes feitos antes da implementação aparecem
- [ ] Resultados antigos carregam corretamente
- [ ] Perfis DISC antigos são exibidos
- [ ] Análises antigas da Marina são acessíveis
- [ ] Não há erros ao carregar resultados antigos

**Como validar:**
1. Se houver testes anteriores, acessar `/profile` ou `/dashboard`
2. Verificar lista de testes anteriores
3. Clicar em um resultado antigo
4. Confirmar que carrega sem erros
5. Verificar que dados estão intactos

---

## Fase 10.2: IA Gera Apenas Quando Necessário

### ✅ Banco é Consultado Primeiro
- [ ] Logs mostram busca no banco antes de IA
- [ ] Tempo de busca é registrado
- [ ] Source é identificado corretamente

**Como validar:**
1. Abrir DevTools Console
2. Iniciar um novo teste
3. Verificar logs no console

**Logs esperados:**
```javascript
[QuestionBank] Searching for questions...
[QuestionSearchEngine] Extracted context: Profession: sales, Seniority: mid, ...
[QuestionBank] { 
  found: 20, 
  needed: 20, 
  searchTime: '150ms', 
  source: 'bank' 
}
```

**Verificar:**
- ✅ Log `[QuestionBank] Searching...` aparece PRIMEIRO
- ✅ Log `[QuestionGenerator]` NÃO aparece (se banco tem perguntas suficientes)
- ✅ `searchTime` é razoável (< 500ms)

---

### ✅ IA Não é Chamada se Banco Tem Perguntas Suficientes
- [ ] Com 20+ perguntas no banco, IA não é chamada
- [ ] Response metadata indica `source: 'bank'`
- [ ] Não há logs de `[QuestionGenerator]`
- [ ] Tempo de resposta é rápido (< 1s)

**Como validar:**
1. Garantir que banco tem 20+ perguntas (aplicar seed)
2. Iniciar novo teste
3. Verificar logs no console

**Logs esperados (banco cheio):**
```javascript
[QuestionBank] Searching for questions...
[QuestionBank] { found: 20, needed: 20, searchTime: '150ms', source: 'bank' }
// NÃO deve aparecer: [QuestionGenerator]
```

**Logs NÃO esperados:**
```javascript
❌ [QuestionGenerator] Generating X additional questions...
❌ [QuestionGenerator] { success: true, executionTime: '5000ms' }
```

---

### ✅ IA Gera Apenas Perguntas Faltantes
- [ ] Se banco tem 15 perguntas, IA gera apenas 5
- [ ] Logs mostram quantidade correta
- [ ] Response metadata indica `source: 'mixed'`
- [ ] Metadata mostra `fromBank: 15, generated: 5`

**Como validar:**
1. Limpar banco ou garantir que tem < 20 perguntas
2. Iniciar novo teste
3. Verificar logs no console

**Logs esperados (banco parcial):**
```javascript
[QuestionBank] Searching for questions...
[QuestionBank] { found: 15, needed: 20, searchTime: '120ms', source: 'mixed' }
[QuestionGenerator] Generating 5 additional questions...
[QuestionGenerator] { success: true, executionTime: '3500ms', questionCount: 5 }
```

**Response metadata esperado:**
```javascript
{
  questions: [...], // 20 perguntas
  source: 'mixed',
  metadata: {
    questionCount: 20,
    fromBank: 15,
    generated: 5,
    searchTime: '120ms',
    generationTime: '3500ms'
  }
}
```

---

### ✅ Fallback para Perguntas Estáticas
- [ ] Se IA falha, usa perguntas de `questions.ts`
- [ ] Response metadata indica `source: 'fallback'`
- [ ] Teste funciona normalmente
- [ ] Perguntas estáticas são DISC-only

**Como validar:**
1. Simular falha da IA (remover OPENAI_API_KEY temporariamente)
2. Limpar banco de perguntas
3. Iniciar novo teste
4. Verificar logs no console

**Logs esperados (fallback):**
```javascript
[QuestionBank] Searching for questions...
[QuestionBank] { found: 0, needed: 20, searchTime: '50ms', source: 'mixed' }
[QuestionGenerator] Generating 20 additional questions...
[QuestionGenerator] Error, using fallback: [error message]
[QuestionGenerator] Using fallback questions
```

**Response metadata esperado:**
```javascript
{
  questions: [...], // 20 perguntas estáticas
  source: 'fallback',
  metadata: {
    questionCount: 20,
    hasIntegratedProfile: false // Fallback é DISC-only
  }
}
```

---

## Validação de Performance

### ✅ Tempos de Resposta
- [ ] Busca no banco: < 500ms
- [ ] Geração com IA: < 15s
- [ ] Validação de perguntas: < 200ms por pergunta
- [ ] Cálculo de perfil: < 1s
- [ ] Análise da Marina: < 10s

**Como medir:**
1. Verificar logs no console (incluem tempos)
2. Usar DevTools Network tab
3. Medir tempo total do fluxo

**Benchmarks:**
```
✅ Banco cheio (20 perguntas):
   - Total: < 1s
   - Busca: ~150ms
   - Sem geração IA

✅ Banco parcial (10 perguntas):
   - Total: < 8s
   - Busca: ~100ms
   - Geração: ~5s (10 perguntas)
   - Validação: ~2s

✅ Banco vazio:
   - Total: < 15s
   - Busca: ~50ms
   - Geração: ~10s (20 perguntas)
   - Validação: ~4s
```

---

## Validação de Qualidade

### ✅ Perguntas do Banco
- [ ] Perguntas têm context_tags apropriadas
- [ ] Quality score >= 60 (ativas)
- [ ] Distribuição DISC balanceada (~25% cada)
- [ ] Sem duplicatas
- [ ] Sem termos clínicos

**Como validar:**
1. Acessar Supabase Dashboard
2. Verificar tabela `question_bank`
3. Conferir campos:
   - `status = 'active'`
   - `quality_score >= 60`
   - `profession_tags`, `seniority_tags`, etc. preenchidos

**Query SQL para validar:**
```sql
-- Verificar distribuição DISC
SELECT disc_type, COUNT(*) as count
FROM question_bank
WHERE status = 'active'
GROUP BY disc_type;

-- Deve retornar algo como:
-- D: 5-6 perguntas
-- I: 5-6 perguntas
-- S: 5-6 perguntas
-- C: 5-6 perguntas

-- Verificar quality scores
SELECT 
  AVG(quality_score) as avg_score,
  MIN(quality_score) as min_score,
  MAX(quality_score) as max_score
FROM question_bank
WHERE status = 'active';

-- avg_score deve ser >= 70
-- min_score deve ser >= 60
```

---

### ✅ Perguntas Geradas pela IA
- [ ] Perguntas têm 4 opções
- [ ] Cada opção tem DISC type único (D, I, S, C)
- [ ] Perguntas passam por validação
- [ ] Perguntas são salvas no banco
- [ ] Quality score inicial = 70
- [ ] Source = 'ai-generated'

**Como validar:**
1. Limpar banco
2. Gerar perguntas com IA
3. Verificar no Supabase que perguntas foram salvas
4. Conferir campos

**Query SQL:**
```sql
SELECT 
  id,
  question_text,
  quality_score,
  source,
  status,
  created_at
FROM question_bank
WHERE source = 'ai-generated'
ORDER BY created_at DESC
LIMIT 10;
```

---

## Validação de Integração

### ✅ Performance Tracking
- [ ] Uso de perguntas é registrado
- [ ] Tabela `question_performance` recebe registros
- [ ] `last_used_at` é atualizado em `question_bank`
- [ ] `usage_count` é incrementado

**Como validar:**
1. Completar um teste
2. Verificar no Supabase

**Query SQL:**
```sql
-- Verificar registros de performance
SELECT 
  qp.question_id,
  qp.user_id,
  qp.selected_at,
  qp.completed,
  qb.usage_count,
  qb.last_used_at
FROM question_performance qp
JOIN question_bank qb ON qp.question_id = qb.id
ORDER BY qp.selected_at DESC
LIMIT 20;
```

---

### ✅ Context Engine
- [ ] Contexto é extraído do perfil do usuário
- [ ] Logs mostram contexto extraído
- [ ] Perguntas são filtradas por contexto
- [ ] Ranking usa context score

**Como validar:**
1. Criar perfil com job_title específico (ex: "Sales Manager")
2. Iniciar teste
3. Verificar logs

**Logs esperados:**
```javascript
[QuestionSearchEngine] Extracted context: Profession: sales, Seniority: mid, Confidence: 75%
```

---

## Checklist Final

### Pré-Produção
- [ ] Todas as migrations aplicadas
- [ ] Seed data carregado (20 perguntas)
- [ ] RLS policies ativas
- [ ] Variáveis de ambiente configuradas
- [ ] OpenAI API key válida
- [ ] Supabase configurado

### Funcionalidades Core
- [ ] ✅ Busca no banco funciona
- [ ] ✅ Geração com IA funciona
- [ ] ✅ Validação de perguntas funciona
- [ ] ✅ Fallback funciona
- [ ] ✅ Fluxo de teste completo funciona
- [ ] ✅ Análise da Marina funciona
- [ ] ✅ Resultados são salvos corretamente

### Performance
- [ ] ✅ Busca < 500ms
- [ ] ✅ Geração < 15s
- [ ] ✅ Validação < 200ms/pergunta
- [ ] ✅ Sem erros no console
- [ ] ✅ Sem memory leaks

### Qualidade
- [ ] ✅ Perguntas têm quality score >= 60
- [ ] ✅ Distribuição DISC balanceada
- [ ] ✅ Sem duplicatas
- [ ] ✅ Sem termos clínicos
- [ ] ✅ Context tags preenchidas

### Backward Compatibility
- [ ] ✅ Landing page não mudou
- [ ] ✅ Fluxo de teste não quebrou
- [ ] ✅ Página de resultado não quebrou
- [ ] ✅ Análise da Marina funciona
- [ ] ✅ Resultados antigos acessíveis

### Testes
- [ ] ✅ Testes unitários passam (npm test)
- [ ] ✅ Cobertura >= 80%
- [ ] ✅ Sem erros de TypeScript
- [ ] ✅ Sem warnings críticos

---

## Status: ✅ PRONTO PARA PRODUÇÃO

Quando todos os itens acima estiverem marcados, o sistema está pronto para deploy em produção.
