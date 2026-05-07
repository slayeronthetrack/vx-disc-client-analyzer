# Deployment Guide - Intelligent Question Bank

Guia completo para fazer deploy do banco de perguntas inteligente em produção.

## Pré-requisitos

### 1. Supabase Project
- [ ] Projeto Supabase criado
- [ ] URL do projeto anotada
- [ ] Anon key anotada
- [ ] Service role key anotada (para migrations)

### 2. OpenAI API
- [ ] Conta OpenAI criada
- [ ] API key gerada
- [ ] Créditos disponíveis
- [ ] Rate limits verificados

### 3. Vercel Account (ou outro host)
- [ ] Conta criada
- [ ] Projeto conectado ao repositório
- [ ] Variáveis de ambiente configuradas

---

## Passo 1: Configurar Supabase

### 1.1 Aplicar Migrations

```bash
# Opção 1: Via Supabase CLI
supabase db push

# Opção 2: Via SQL Editor no Dashboard
# Copiar e executar: supabase/apply-migrations.sql
```

**Migrations a aplicar:**
1. `20260506_enable_pgvector.sql` - Habilita extensão pgvector
2. `20260506_create_question_bank.sql` - Cria tabela principal
3. `20260506_create_question_performance.sql` - Cria tabela de tracking
4. `20260506_create_indexes.sql` - Cria índices de performance
5. `20260506_question_bank_rls.sql` - Configura RLS para question_bank
6. `20260506_question_performance_rls.sql` - Configura RLS para question_performance

**Verificar:**
```sql
-- Verificar que tabelas foram criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('question_bank', 'question_performance');

-- Verificar que extensão pgvector está ativa
SELECT * FROM pg_extension WHERE extname = 'vector';

-- Verificar índices
SELECT indexname FROM pg_indexes 
WHERE tablename IN ('question_bank', 'question_performance');
```

### 1.2 Carregar Seed Data

```bash
# Via SQL Editor no Dashboard
# Executar: supabase/seed/question_bank_seed.sql
```

**Verificar:**
```sql
-- Deve retornar 20 perguntas
SELECT COUNT(*) FROM question_bank WHERE source = 'static';

-- Verificar distribuição DISC
SELECT disc_type, COUNT(*) 
FROM question_bank 
WHERE status = 'active'
GROUP BY disc_type;
```

### 1.3 Configurar RLS Policies

As policies já foram criadas pelas migrations, mas verificar:

```sql
-- Verificar policies de question_bank
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'question_bank';

-- Deve ter 5 policies:
-- 1. select_active_questions (SELECT para todos)
-- 2. insert_questions (INSERT para authenticated)
-- 3. update_questions (UPDATE para admins)
-- 4. delete_questions (DELETE para admins)
-- 5. select_all_for_admins (SELECT * para admins)
```

---

## Passo 2: Configurar Variáveis de Ambiente

### 2.1 Desenvolvimento (.env.local)

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key

# OpenAI
OPENAI_API_KEY=sk-your-openai-key

# Cron (opcional)
CRON_SECRET=your-random-secret-for-cron-jobs
```

### 2.2 Produção (Vercel)

No Vercel Dashboard:
1. Ir para Settings → Environment Variables
2. Adicionar as mesmas variáveis acima
3. Marcar para Production, Preview, Development

**Importante:**
- ✅ `NEXT_PUBLIC_*` são expostas no client
- ✅ `OPENAI_API_KEY` é server-only
- ✅ `CRON_SECRET` é server-only

---

## Passo 3: Deploy da Aplicação

### 3.1 Via Vercel (Recomendado)

```bash
# Instalar Vercel CLI
npm i -g vercel

# Deploy
vercel --prod
```

Ou via GitHub:
1. Conectar repositório ao Vercel
2. Push para branch main
3. Deploy automático

### 3.2 Build Local (Teste)

```bash
# Instalar dependências
npm install

# Build
npm run build

# Testar build
npm start
```

**Verificar:**
- ✅ Build completa sem erros
- ✅ Sem warnings críticos de TypeScript
- ✅ Tamanho do bundle razoável

---

## Passo 4: Configurar Cron Jobs

### 4.1 Vercel Cron (Recomendado)

Arquivo `vercel.json` já está configurado:

```json
{
  "crons": [
    {
      "path": "/api/cron/update-scores",
      "schedule": "0 2 * * *"
    }
  ]
}
```

**Verificar no Vercel Dashboard:**
1. Ir para Settings → Cron Jobs
2. Confirmar que job está ativo
3. Testar execução manual

### 4.2 GitHub Actions (Alternativa)

Se preferir GitHub Actions, criar `.github/workflows/update-scores.yml`:

```yaml
name: Update Question Scores

on:
  schedule:
    - cron: '0 2 * * *'
  workflow_dispatch:

jobs:
  update-scores:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run update-scores
        env:
          NEXT_PUBLIC_SUPABASE_URL: ${{ secrets.SUPABASE_URL }}
          NEXT_PUBLIC_SUPABASE_ANON_KEY: ${{ secrets.SUPABASE_ANON_KEY }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

---

## Passo 5: Validação Pós-Deploy

### 5.1 Smoke Tests

```bash
# 1. Verificar que site carrega
curl https://your-domain.com

# 2. Verificar API de geração de perguntas
curl -X POST https://your-domain.com/api/ai/generate-questions \
  -H "Content-Type: application/json" \
  -d '{"userId":"test","questionCount":20}'

# 3. Verificar cron endpoint (com auth)
curl https://your-domain.com/api/cron/update-scores \
  -H "Authorization: Bearer $CRON_SECRET"
```

### 5.2 Testes Manuais

Seguir checklist em `docs/VALIDATION_CHECKLIST.md`:

1. ✅ Landing page carrega
2. ✅ Fazer teste completo
3. ✅ Ver resultado
4. ✅ Análise da Marina aparece
5. ✅ Verificar logs no console

### 5.3 Verificar Logs

**Vercel:**
1. Ir para Deployments → Latest
2. Clicar em "View Function Logs"
3. Verificar logs de:
   - `/api/ai/generate-questions`
   - `/api/cron/update-scores`

**Logs esperados:**
```
[QuestionBank] Searching for questions...
[QuestionBank] { found: 20, needed: 20, source: 'bank' }
```

---

## Passo 6: Monitoramento

### 6.1 Métricas a Monitorar

**Performance:**
- Tempo de busca no banco (< 500ms)
- Tempo de geração com IA (< 15s)
- Taxa de uso do banco vs IA
- Taxa de fallback

**Qualidade:**
- Quality scores médios
- Taxa de perguntas flagged
- Taxa de perguntas archived
- Feedback dos usuários

**Custos:**
- Chamadas à OpenAI API
- Tokens consumidos
- Custo por teste

### 6.2 Dashboards

**Supabase:**
```sql
-- Dashboard de uso
SELECT 
  DATE(created_at) as date,
  source,
  COUNT(*) as questions_created
FROM question_bank
GROUP BY DATE(created_at), source
ORDER BY date DESC;

-- Dashboard de qualidade
SELECT 
  CASE 
    WHEN quality_score >= 90 THEN 'Excellent'
    WHEN quality_score >= 70 THEN 'Good'
    WHEN quality_score >= 50 THEN 'Fair'
    ELSE 'Poor'
  END as category,
  COUNT(*) as count,
  AVG(quality_score) as avg_score
FROM question_bank
WHERE status = 'active'
GROUP BY category;

-- Dashboard de performance
SELECT 
  qb.id,
  qb.question_text,
  qb.quality_score,
  qb.usage_count,
  COUNT(qp.id) as performance_records,
  AVG(CASE WHEN qp.completed THEN 1 ELSE 0 END) * 100 as completion_rate
FROM question_bank qb
LEFT JOIN question_performance qp ON qb.id = qp.question_id
WHERE qb.status = 'active'
GROUP BY qb.id
ORDER BY qb.usage_count DESC
LIMIT 20;
```

### 6.3 Alertas

Configurar alertas para:
- ❌ Taxa de erro > 5%
- ❌ Tempo de resposta > 20s
- ❌ Fallback rate > 10%
- ❌ Quality score médio < 60
- ❌ Custo OpenAI > threshold

---

## Passo 7: Otimizações Pós-Deploy

### 7.1 Cache

Considerar adicionar cache para:
- Perguntas frequentes
- Embeddings calculados
- Resultados de busca

### 7.2 Rate Limiting

Implementar rate limiting para:
- Geração de perguntas (max 10/min por usuário)
- Validação de perguntas (max 100/min)
- Cálculo de embeddings (max 50/min)

### 7.3 Batch Processing

Para operações em lote:
- Gerar embeddings em background
- Atualizar quality scores em batch
- Processar feedback em batch

---

## Rollback Plan

Se algo der errado:

### Opção 1: Rollback do Deploy
```bash
# Vercel
vercel rollback

# Ou via Dashboard: Deployments → Previous → Promote to Production
```

### Opção 2: Rollback do Banco
```sql
-- Desabilitar question bank temporariamente
-- Forçar uso de fallback
UPDATE question_bank SET status = 'archived';

-- Ou deletar perguntas problemáticas
DELETE FROM question_bank WHERE source = 'ai-generated' AND created_at > '2026-05-06';
```

### Opção 3: Feature Flag
```typescript
// Adicionar em .env
ENABLE_QUESTION_BANK=false

// No código
if (process.env.ENABLE_QUESTION_BANK === 'true') {
  // Usar question bank
} else {
  // Usar fallback
}
```

---

## Troubleshooting

### Problema: Perguntas não são geradas
**Sintomas:** Sempre usa fallback
**Causas possíveis:**
- OpenAI API key inválida
- Rate limit atingido
- Créditos esgotados

**Solução:**
1. Verificar API key
2. Verificar logs de erro
3. Verificar dashboard OpenAI

### Problema: Busca no banco é lenta
**Sintomas:** searchTime > 1s
**Causas possíveis:**
- Índices não criados
- Muitas perguntas no banco
- Query ineficiente

**Solução:**
1. Verificar índices: `SELECT * FROM pg_indexes WHERE tablename = 'question_bank'`
2. Analisar query: `EXPLAIN ANALYZE SELECT ...`
3. Adicionar índices se necessário

### Problema: Perguntas duplicadas
**Sintomas:** Mesma pergunta aparece múltiplas vezes
**Causas possíveis:**
- Anti-duplication não funcionando
- Embeddings não gerados

**Solução:**
1. Gerar embeddings: `npm run generate-embeddings`
2. Verificar similaridade: Query SQL
3. Arquivar duplicatas manualmente

---

## Checklist Final de Deploy

- [ ] ✅ Migrations aplicadas
- [ ] ✅ Seed data carregado
- [ ] ✅ RLS policies ativas
- [ ] ✅ Variáveis de ambiente configuradas
- [ ] ✅ Build completa sem erros
- [ ] ✅ Deploy realizado
- [ ] ✅ Cron jobs configurados
- [ ] ✅ Smoke tests passaram
- [ ] ✅ Testes manuais passaram
- [ ] ✅ Logs verificados
- [ ] ✅ Monitoramento configurado
- [ ] ✅ Rollback plan documentado

---

## Status: ✅ PRONTO PARA PRODUÇÃO

Quando todos os itens acima estiverem completos, o sistema está pronto para uso em produção.

## Suporte

Para problemas ou dúvidas:
1. Verificar logs no Vercel
2. Verificar dados no Supabase
3. Consultar `docs/VALIDATION_CHECKLIST.md`
4. Consultar `__tests__/README.md`
