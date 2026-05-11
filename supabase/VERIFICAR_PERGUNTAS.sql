-- ============================================
-- VERIFICAR PERGUNTAS NO BANCO
-- Execute estas queries no Supabase SQL Editor
-- ============================================

-- 1. TOTAL DE PERGUNTAS
SELECT COUNT(*) as total_perguntas FROM question_bank;

-- Resultado esperado: 1000 (ou quantos batches você executou × 100)

-- ============================================

-- 2. PERGUNTAS POR TIPO DISC
SELECT 
  disc_type,
  COUNT(*) as quantidade,
  ROUND(COUNT(*) * 100.0 / (SELECT COUNT(*) FROM question_bank), 2) as percentual
FROM question_bank
GROUP BY disc_type
ORDER BY quantidade DESC;

-- Deve mostrar distribuição entre D, I, S, C

-- ============================================

-- 3. PERGUNTAS POR STATUS
SELECT 
  status,
  COUNT(*) as quantidade
FROM question_bank
GROUP BY status;

-- Todas devem estar 'active'

-- ============================================

-- 4. PERGUNTAS POR SOURCE
SELECT 
  source,
  COUNT(*) as quantidade
FROM question_bank
GROUP BY source;

-- Todas devem ser 'static' (geradas pelo script)

-- ============================================

-- 5. VER 10 PERGUNTAS ALEATÓRIAS
SELECT 
  id,
  LEFT(question_text, 80) as pergunta,
  disc_type,
  quality_score,
  created_at
FROM question_bank
ORDER BY RANDOM()
LIMIT 10;

-- Mostra 10 perguntas aleatórias para você ver a qualidade

-- ============================================

-- 6. VER UMA PERGUNTA COMPLETA COM OPÇÕES
SELECT 
  id,
  question_text,
  options,
  disc_type,
  value_types,
  psychological_traits,
  quality_score,
  clarity_score
FROM question_bank
ORDER BY RANDOM()
LIMIT 1;

-- Mostra uma pergunta completa com todas as opções e metadados

-- ============================================

-- 7. PERGUNTAS POR DIFICULDADE
SELECT 
  difficulty_level,
  COUNT(*) as quantidade
FROM question_bank
GROUP BY difficulty_level;

-- Todas devem ser 'medium' (configuração padrão)

-- ============================================

-- 8. ESTATÍSTICAS DE QUALIDADE
SELECT 
  MIN(quality_score) as min_quality,
  AVG(quality_score) as avg_quality,
  MAX(quality_score) as max_quality,
  MIN(clarity_score) as min_clarity,
  AVG(clarity_score) as avg_clarity,
  MAX(clarity_score) as max_clarity
FROM question_bank;

-- Deve mostrar scores entre 0-100

-- ============================================

-- 9. PERGUNTAS MAIS RECENTES
SELECT 
  id,
  LEFT(question_text, 60) as pergunta,
  disc_type,
  created_at
FROM question_bank
ORDER BY created_at DESC
LIMIT 20;

-- Mostra as 20 perguntas mais recentes (últimos batches executados)

-- ============================================

-- 10. BUSCAR PERGUNTAS POR PALAVRA-CHAVE
SELECT 
  id,
  question_text,
  disc_type
FROM question_bank
WHERE question_text ILIKE '%pressão%'
   OR question_text ILIKE '%decisão%'
   OR question_text ILIKE '%equipe%'
LIMIT 10;

-- Busca perguntas que contenham palavras específicas

-- ============================================

-- 11. VERIFICAR OPÇÕES DE UMA PERGUNTA
SELECT 
  question_text,
  jsonb_array_length(options) as num_opcoes,
  options
FROM question_bank
WHERE jsonb_array_length(options) != 4
LIMIT 10;

-- Verifica se há perguntas com número incorreto de opções
-- Deve retornar 0 linhas (todas devem ter 4 opções)

-- ============================================

-- 12. PERGUNTAS POR VALUE TYPE
SELECT 
  UNNEST(value_types) as value_type,
  COUNT(*) as quantidade
FROM question_bank
GROUP BY value_type
ORDER BY quantidade DESC;

-- Mostra distribuição dos tipos de valores

-- ============================================

-- 13. DASHBOARD COMPLETO
SELECT 
  'Total de Perguntas' as metrica,
  COUNT(*)::text as valor
FROM question_bank

UNION ALL

SELECT 
  'Perguntas Ativas',
  COUNT(*)::text
FROM question_bank
WHERE status = 'active'

UNION ALL

SELECT 
  'Tipos DISC Únicos',
  COUNT(DISTINCT disc_type)::text
FROM question_bank

UNION ALL

SELECT 
  'Média Quality Score',
  ROUND(AVG(quality_score), 2)::text
FROM question_bank

UNION ALL

SELECT 
  'Média Clarity Score',
  ROUND(AVG(clarity_score), 2)::text
FROM question_bank;

-- Dashboard resumido com métricas principais

-- ============================================

-- 14. EXPORTAR PERGUNTAS PARA JSON (OPCIONAL)
-- Use esta query se quiser exportar as perguntas
SELECT jsonb_agg(
  jsonb_build_object(
    'id', id,
    'text', question_text,
    'options', options,
    'disc_type', disc_type,
    'quality_score', quality_score
  )
) as perguntas
FROM question_bank
LIMIT 100;

-- Exporta 100 perguntas em formato JSON

-- ============================================

-- 15. TESTAR BUSCA ALEATÓRIA (SIMULA O QUE O SISTEMA FAZ)
SELECT 
  id,
  question_text,
  disc_type,
  quality_score
FROM question_bank
WHERE status = 'active'
  AND quality_score >= 60
ORDER BY RANDOM()
LIMIT 20;

-- Simula a busca que o sistema faz ao gerar um teste de 20 perguntas

-- ============================================
-- FIM DAS QUERIES
-- ============================================

-- 💡 DICA: Execute as queries na ordem para entender melhor o banco!
