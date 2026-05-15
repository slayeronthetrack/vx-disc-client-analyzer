-- ============================================
-- VERIFICAR RESULTADOS DO SISTEMA DE APRENDIZADO
-- Execute estas queries no Supabase SQL Editor
-- ============================================

-- 1. PERFIS DESCOBERTOS
-- Deve mostrar "Gerente de vendas" com category "vendas"
SELECT 
  job_title,
  normalized_title,
  category,
  frequency,
  last_seen,
  created_at
FROM discovered_profiles
ORDER BY last_seen DESC;

-- Resultado esperado:
-- job_title          | normalized_title      | category | frequency | last_seen
-- Gerente de vendas  | gerente-de-vendas     | vendas   | 1         | 2026-05-07 ...

-- ============================================

-- 2. OBJETIVOS DESCOBERTOS
-- Deve mostrar "autoconhecimento" com category "autoconhecimento"
SELECT 
  objective,
  normalized_objective,
  category,
  frequency,
  last_seen,
  created_at
FROM discovered_objectives
ORDER BY last_seen DESC;

-- Resultado esperado:
-- objective          | normalized_objective  | category         | frequency | last_seen
-- autoconhecimento   | autoconhecimento      | autoconhecimento | 1         | 2026-05-07 ...

-- ============================================

-- 3. FEEDBACK DAS PERGUNTAS
-- Deve mostrar 20 registros (um para cada pergunta)
SELECT 
  COUNT(*) as total_feedback,
  AVG(response_time_ms) as avg_response_time,
  COUNT(CASE WHEN was_changed THEN 1 END) as changed_answers,
  COUNT(CASE WHEN NOT was_changed THEN 1 END) as confident_answers
FROM question_feedback
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Resultado esperado:
-- total_feedback | avg_response_time | changed_answers | confident_answers
-- 20             | 15000             | 0               | 20

-- ============================================

-- 4. DETALHES DO FEEDBACK (últimas 10 perguntas)
SELECT 
  question_text,
  response_time_ms,
  was_changed,
  final_answer,
  user_context->>'jobTitle' as job_title,
  user_context->>'testObjective' as test_objective,
  created_at
FROM question_feedback
ORDER BY created_at DESC
LIMIT 10;

-- ============================================

-- 5. PERGUNTAS SALVAS NO BANCO INTELIGENTE
-- Pode estar vazio se as perguntas não atenderam critérios de sucesso
SELECT 
  COUNT(*) as total_questions_saved
FROM question_bank
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Se retornar 0: Perguntas não atenderam critérios (tempo > 30s ou foram alteradas)
-- Se retornar > 0: Perguntas foram salvas com sucesso!

-- ============================================

-- 6. DASHBOARD COMPLETO
SELECT 
  'Perfis Descobertos' as metrica,
  COUNT(*)::text as valor
FROM discovered_profiles
WHERE last_seen > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'Objetivos Descobertos',
  COUNT(*)::text
FROM discovered_objectives
WHERE last_seen > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'Feedback Registrado',
  COUNT(*)::text
FROM question_feedback
WHERE created_at > NOW() - INTERVAL '1 hour'

UNION ALL

SELECT 
  'Perguntas no Banco',
  COUNT(*)::text
FROM question_bank
WHERE created_at > NOW() - INTERVAL '1 hour';

-- Resultado esperado:
-- metrica                    | valor
-- Perfis Descobertos         | 1
-- Objetivos Descobertos      | 1
-- Feedback Registrado        | 20
-- Perguntas no Banco         | 0-20 (depende dos critérios)

-- ============================================

-- 7. VERIFICAR CATEGORIZAÇÃO AUTOMÁTICA
-- Confirmar que "Gerente de vendas" foi categorizado como "vendas"
SELECT 
  job_title,
  category,
  CASE 
    WHEN category = 'vendas' THEN '✅ Categorizado corretamente'
    ELSE '❌ Categoria incorreta'
  END as status
FROM discovered_profiles
WHERE job_title ILIKE '%gerente%vendas%'
   OR job_title ILIKE '%vendas%';

-- ============================================

-- 8. HISTÓRICO DE FREQUÊNCIA
-- Ver quantas vezes cada perfil foi usado
SELECT 
  job_title,
  category,
  frequency,
  last_seen,
  CASE 
    WHEN frequency = 1 THEN 'Primeira vez'
    WHEN frequency BETWEEN 2 AND 5 THEN 'Uso moderado'
    WHEN frequency > 5 THEN 'Uso frequente'
  END as uso
FROM discovered_profiles
ORDER BY frequency DESC, last_seen DESC;

-- ============================================

-- 9. INSIGHTS GERADOS (se houver)
SELECT 
  insight_type,
  title,
  description,
  confidence_score,
  status,
  created_at
FROM learning_insights
ORDER BY created_at DESC
LIMIT 10;

-- Pode estar vazio - insights são gerados quando frequency >= 5

-- ============================================

-- 10. TESTE DE APRENDIZADO INCREMENTAL
-- Execute esta query ANTES e DEPOIS de fazer outro teste com o mesmo cargo
SELECT 
  job_title,
  frequency,
  last_seen
FROM discovered_profiles
WHERE job_title = 'Gerente de vendas';

-- Primeira vez: frequency = 1
-- Segunda vez: frequency = 2
-- Terceira vez: frequency = 3
-- Isso prova que o sistema está aprendendo!

-- ============================================
-- FIM DAS QUERIES
-- ============================================
