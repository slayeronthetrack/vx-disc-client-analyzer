# Como Aplicar as Migrations do Intelligent Question Bank

## Opção 1: Via Supabase Dashboard (Recomendado)

1. **Acesse o Supabase Dashboard**
   - Vá para: https://supabase.com/dashboard
   - Selecione seu projeto: `eolvvdmzeifbeugkhkyg`

2. **Abra o SQL Editor**
   - No menu lateral, clique em "SQL Editor"
   - Clique em "New query"

3. **Execute o script consolidado**
   - Abra o arquivo: `supabase/apply-migrations.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run" (ou pressione Ctrl+Enter)

4. **Verifique os resultados**
   - O script mostrará:
     - Contagem de linhas nas tabelas (deve ser 0 inicialmente)
     - Lista de indexes criados
     - Lista de políticas RLS criadas

5. **Aplique o seed (dados iniciais)**
   - Abra o arquivo: `supabase/seed/question_bank_seed.sql`
   - Copie todo o conteúdo
   - Cole no SQL Editor
   - Clique em "Run"
   - Deve inserir 20 perguntas estáticas

## Opção 2: Via Supabase CLI (Alternativa)

Se preferir usar CLI:

```bash
# 1. Link o projeto (se ainda não estiver linkado)
supabase link --project-ref eolvvdmzeifbeugkhkyg

# 2. Aplique as migrations
supabase db push

# 3. Aplique o seed
supabase db execute --file supabase/seed/question_bank_seed.sql
```

## Verificação Pós-Migration

Execute estas queries no SQL Editor para verificar:

```sql
-- 1. Verificar tabelas criadas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('question_bank', 'question_performance');

-- 2. Verificar extensão pgvector
SELECT * FROM pg_extension WHERE extname = 'vector';

-- 3. Contar perguntas inseridas
SELECT COUNT(*) as total_questions FROM question_bank WHERE source = 'static';

-- 4. Ver uma pergunta de exemplo
SELECT 
  id,
  question_text,
  disc_type,
  context_tags,
  profession_tags,
  quality_score,
  status,
  source
FROM question_bank
LIMIT 1;

-- 5. Verificar indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'question_bank'
ORDER BY indexname;

-- 6. Verificar políticas RLS
SELECT 
  policyname,
  cmd,
  permissive
FROM pg_policies
WHERE tablename = 'question_bank'
ORDER BY policyname;
```

## Resultado Esperado

Após aplicar as migrations com sucesso, você deve ter:

✅ **Tabelas criadas:**
- `question_bank` - Tabela principal com 20 perguntas
- `question_performance` - Tabela de métricas (vazia inicialmente)

✅ **Extensões habilitadas:**
- `uuid-ossp` - Para geração de UUIDs
- `vector` - Para embeddings e similaridade semântica

✅ **Indexes criados:**
- 12 indexes em `question_bank` (incluindo GIN e IVFFlat)
- 6 indexes em `question_performance`

✅ **Políticas RLS:**
- 5 políticas em `question_bank`
- 7 políticas em `question_performance`

✅ **Dados iniciais:**
- 20 perguntas estáticas migradas de `data/questions.ts`
- Cada pergunta com `quality_score=75`, `source='static'`, `status='active'`
- Context tags apropriados para cada pergunta

## Troubleshooting

### Erro: "extension vector does not exist"
- A extensão pgvector pode não estar disponível no seu plano Supabase
- Solução temporária: Comente as linhas relacionadas a `embedding_vector` e o index `idx_question_bank_embedding`

### Erro: "relation question_bank already exists"
- As tabelas já foram criadas anteriormente
- Solução: Use `DROP TABLE IF EXISTS question_bank CASCADE;` antes de recriar

### Erro: "policy already exists"
- As políticas RLS já existem
- Solução: Use `DROP POLICY IF EXISTS "policy_name" ON table_name;` antes de recriar

## Próximos Passos

Após aplicar as migrations:

1. ✅ Verificar que as tabelas foram criadas
2. ✅ Verificar que os dados foram inseridos
3. ⏭️ Continuar com Fase 2: Implementar QuestionBankService
4. ⏭️ Implementar QuestionSearchEngine
5. ⏭️ Integrar com o fluxo de teste existente

## Rollback (Se necessário)

Para reverter as migrations:

```sql
-- CUIDADO: Isso apagará todas as tabelas e dados!

DROP TABLE IF EXISTS question_performance CASCADE;
DROP TABLE IF EXISTS question_bank CASCADE;
DROP EXTENSION IF EXISTS vector;
```
