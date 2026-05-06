-- Adicionar Colunas para Perfil Integrado (Valores + Tipos Psicológicos)
-- Execute este SQL no Supabase SQL Editor
-- Data: 2026-05-06

-- ============================================================================
-- STEP 1: Verificar colunas existentes
-- ============================================================================

SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'disc_tests'
ORDER BY ordinal_position;

-- ============================================================================
-- STEP 2: Adicionar colunas para Valores (Teoria dos Valores)
-- ============================================================================

-- Scores dos valores (Poder, Altruísmo, Tradição, etc.)
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS value_scores jsonb;

-- Valores dominantes (array com dominante + secundários)
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS dominant_values text[];

-- Percentagens dos valores
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS value_percentages jsonb;

-- ============================================================================
-- STEP 3: Adicionar colunas para Tipos Psicológicos
-- ============================================================================

-- Scores das dimensões psicológicas
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS psychological_scores jsonb;

-- Perfil psicológico completo (código + dimensões)
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS psychological_profile jsonb;

-- ============================================================================
-- STEP 4: Adicionar coluna para análise integrada
-- ============================================================================

-- Análise integrada da Marina (DISC + Valores + Psicológico)
ALTER TABLE disc_tests 
ADD COLUMN IF NOT EXISTS integrated_analysis text;

-- ============================================================================
-- STEP 5: Verificar colunas adicionadas
-- ============================================================================

SELECT 
  column_name, 
  data_type,
  is_nullable
FROM information_schema.columns 
WHERE table_name = 'disc_tests'
AND column_name IN (
  'value_scores',
  'dominant_values',
  'value_percentages',
  'psychological_scores',
  'psychological_profile',
  'integrated_analysis'
)
ORDER BY column_name;

-- ============================================================================
-- STEP 6: Verificar se há testes com dados integrados
-- ============================================================================

SELECT 
  id,
  user_id,
  created_at,
  question_count,
  CASE WHEN value_scores IS NOT NULL THEN '✅' ELSE '❌' END as has_values,
  CASE WHEN psychological_profile IS NOT NULL THEN '✅' ELSE '❌' END as has_psychological,
  CASE WHEN integrated_analysis IS NOT NULL THEN '✅' ELSE '❌' END as has_integrated_analysis
FROM disc_tests
ORDER BY created_at DESC
LIMIT 10;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Colunas para Perfil Integrado adicionadas com sucesso!';
  RAISE NOTICE '';
  RAISE NOTICE 'Colunas adicionadas:';
  RAISE NOTICE '  1. value_scores (jsonb) - Scores dos valores';
  RAISE NOTICE '  2. dominant_values (text[]) - Valores dominantes';
  RAISE NOTICE '  3. value_percentages (jsonb) - Percentagens dos valores';
  RAISE NOTICE '  4. psychological_scores (jsonb) - Scores psicológicos';
  RAISE NOTICE '  5. psychological_profile (jsonb) - Perfil psicológico completo';
  RAISE NOTICE '  6. integrated_analysis (text) - Análise integrada da Marina';
  RAISE NOTICE '';
  RAISE NOTICE 'Próximos passos:';
  RAISE NOTICE '  1. Refazer teste com 100 perguntas';
  RAISE NOTICE '  2. Verificar se dados aparecem em /result';
  RAISE NOTICE '  3. Seções "Seus Motivadores Internos" e "Seu Estilo de Pensamento" devem aparecer';
END $$;
