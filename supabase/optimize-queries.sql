-- OTIMIZAÇÃO DE QUERIES - Question Bank
-- Objetivo: Reduzir bank_query_ms de 723ms para < 200ms
-- Execute no Supabase SQL Editor

-- ============================================================================
-- PARTE 1: CRIAR ÍNDICES OTIMIZADOS
-- ============================================================================

-- Índice composto para a query principal (status + quality_score)
CREATE INDEX IF NOT EXISTS idx_question_bank_active_quality 
ON question_bank(status, quality_score DESC) 
WHERE status = 'active';

-- Índice para context_tags (GIN para arrays)
CREATE INDEX IF NOT EXISTS idx_question_bank_context_tags 
ON question_bank USING GIN (context_tags);

-- Índice para profession_tags
CREATE INDEX IF NOT EXISTS idx_question_bank_profession_tags 
ON question_bank USING GIN (profession_tags);

-- Índice para industry_tags
CREATE INDEX IF NOT EXISTS idx_question_bank_industry_tags 
ON question_bank USING GIN (industry_tags);

-- Índice para difficulty_level
CREATE INDEX IF NOT EXISTS idx_question_bank_difficulty 
ON question_bank(difficulty_level);

-- Índice para created_at (útil para ordenação)
CREATE INDEX IF NOT EXISTS idx_question_bank_created_at 
ON question_bank(created_at DESC);

-- ============================================================================
-- PARTE 2: ANALISAR PERFORMANCE ATUAL
-- ============================================================================

-- Ver tamanho da tabela
SELECT 
  pg_size_pretty(pg_total_relation_size('question_bank')) as total_size,
  pg_size_pretty(pg_relation_size('question_bank')) as table_size,
  pg_size_pretty(pg_indexes_size('question_bank')) as indexes_size;

-- Ver todos os índices
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'question_bank'
ORDER BY indexname;

-- Testar query atual (EXPLAIN ANALYZE)
EXPLAIN ANALYZE
SELECT *
FROM question_bank
WHERE status = 'active'
  AND quality_score >= 60
ORDER BY quality_score DESC
LIMIT 60;

-- ============================================================================
-- PARTE 3: VACUUM E ANALYZE
-- ============================================================================

-- Atualizar estatísticas da tabela
ANALYZE question_bank;

-- Limpar espaço não utilizado (opcional, pode demorar)
-- VACUUM FULL question_bank;

-- ============================================================================
-- PARTE 4: CRIAR VIEW MATERIALIZADA (CACHE)
-- ============================================================================

-- View materializada para perguntas ativas de alta qualidade
CREATE MATERIALIZED VIEW IF NOT EXISTS mv_active_questions AS
SELECT 
  id,
  question_text,
  options,
  disc_type,
  value_types,
  psychological_traits,
  context_tags,
  profession_tags,
  seniority_tags,
  objective_tags,
  industry_tags,
  difficulty_level,
  quality_score,
  usage_count,
  created_at
FROM question_bank
WHERE status = 'active'
  AND quality_score >= 60
ORDER BY quality_score DESC, created_at DESC;

-- Índice na view materializada
CREATE INDEX IF NOT EXISTS idx_mv_active_questions_quality 
ON mv_active_questions(quality_score DESC);

CREATE INDEX IF NOT EXISTS idx_mv_active_questions_context 
ON mv_active_questions USING GIN (context_tags);

-- Refresh automático (executar periodicamente)
-- REFRESH MATERIALIZED VIEW CONCURRENTLY mv_active_questions;

-- ============================================================================
-- PARTE 5: FUNÇÃO OTIMIZADA PARA SELEÇÃO DE PERGUNTAS
-- ============================================================================

CREATE OR REPLACE FUNCTION select_questions_optimized(
  p_question_count INTEGER DEFAULT 20,
  p_min_quality_score INTEGER DEFAULT 60,
  p_context_tags TEXT[] DEFAULT NULL,
  p_profession_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id TEXT,
  question_text TEXT,
  options JSONB,
  disc_type TEXT,
  value_types TEXT[],
  psychological_traits JSONB,
  context_tags TEXT[],
  profession_tags TEXT[],
  difficulty_level TEXT,
  quality_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qb.id,
    qb.question_text,
    qb.options,
    qb.disc_type,
    qb.value_types,
    qb.psychological_traits,
    qb.context_tags,
    qb.profession_tags,
    qb.difficulty_level,
    qb.quality_score
  FROM question_bank qb
  WHERE qb.status = 'active'
    AND qb.quality_score >= p_min_quality_score
    AND (p_context_tags IS NULL OR qb.context_tags && p_context_tags)
    AND (p_profession_tags IS NULL OR qb.profession_tags && p_profession_tags)
  ORDER BY qb.quality_score DESC, RANDOM()
  LIMIT p_question_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- Testar função
SELECT COUNT(*) FROM select_questions_optimized(60, 60);

-- ============================================================================
-- PARTE 6: CONFIGURAÇÕES DE PERFORMANCE
-- ============================================================================

-- Aumentar work_mem para queries complexas (apenas para esta sessão)
SET work_mem = '64MB';

-- Aumentar shared_buffers (requer reinicialização do Postgres - não fazer agora)
-- ALTER SYSTEM SET shared_buffers = '256MB';

-- ============================================================================
-- PARTE 7: MONITORAMENTO
-- ============================================================================

-- Ver queries lentas
SELECT 
  query,
  calls,
  total_time,
  mean_time,
  max_time
FROM pg_stat_statements
WHERE query LIKE '%question_bank%'
ORDER BY mean_time DESC
LIMIT 10;

-- Ver uso de índices
SELECT 
  schemaname,
  tablename,
  indexname,
  idx_scan,
  idx_tup_read,
  idx_tup_fetch
FROM pg_stat_user_indexes
WHERE tablename = 'question_bank'
ORDER BY idx_scan DESC;

-- ============================================================================
-- VERIFICAÇÃO FINAL
-- ============================================================================

-- Contar perguntas ativas
SELECT COUNT(*) as active_questions 
FROM question_bank 
WHERE status = 'active' AND quality_score >= 60;

-- Distribuição por qualidade
SELECT 
  CASE 
    WHEN quality_score >= 90 THEN '90-100 (Excelente)'
    WHEN quality_score >= 80 THEN '80-89 (Ótimo)'
    WHEN quality_score >= 70 THEN '70-79 (Bom)'
    WHEN quality_score >= 60 THEN '60-69 (Aceitável)'
    ELSE '< 60 (Baixo)'
  END as quality_range,
  COUNT(*) as count
FROM question_bank
WHERE status = 'active'
GROUP BY quality_range
ORDER BY quality_range DESC;

-- ============================================================================
-- SUCESSO
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Otimizações aplicadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Índices criados:';
  RAISE NOTICE '  - idx_question_bank_active_quality (status + quality_score)';
  RAISE NOTICE '  - idx_question_bank_context_tags (GIN)';
  RAISE NOTICE '  - idx_question_bank_profession_tags (GIN)';
  RAISE NOTICE '  - idx_question_bank_industry_tags (GIN)';
  RAISE NOTICE '  - idx_question_bank_difficulty';
  RAISE NOTICE '  - idx_question_bank_created_at';
  RAISE NOTICE '';
  RAISE NOTICE 'View materializada criada:';
  RAISE NOTICE '  - mv_active_questions (cache de perguntas ativas)';
  RAISE NOTICE '';
  RAISE NOTICE 'Função otimizada criada:';
  RAISE NOTICE '  - select_questions_optimized()';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '  1. Popular o banco com 250+ perguntas';
  RAISE NOTICE '  2. Testar performance com a aplicação';
  RAISE NOTICE '  3. Monitorar bank_query_ms (meta: < 200ms)';
END $$;
