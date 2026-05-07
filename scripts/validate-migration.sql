-- Script de Validação da Migration
-- Verifica se a migration foi aplicada corretamente e se os testes antigos continuam funcionando

-- 1. Verificar se as colunas foram criadas
SELECT 
  column_name, 
  data_type, 
  column_default,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'disc_tests'
  AND column_name IN ('question_count', 'question_source', 'generated_questions')
ORDER BY column_name;

-- 2. Verificar se os índices foram criados
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'disc_tests'
  AND indexname IN ('idx_disc_tests_question_source', 'idx_disc_tests_question_count');

-- 3. Verificar se os registros antigos foram atualizados corretamente
SELECT 
  COUNT(*) as total_tests,
  COUNT(CASE WHEN question_count = 20 THEN 1 END) as tests_with_20_questions,
  COUNT(CASE WHEN question_source = 'legacy' THEN 1 END) as legacy_tests,
  COUNT(CASE WHEN question_count IS NULL THEN 1 END) as null_question_count,
  COUNT(CASE WHEN question_source IS NULL THEN 1 END) as null_question_source
FROM disc_tests;

-- 4. Verificar se os testes antigos ainda podem ser consultados normalmente
SELECT 
  id,
  user_id,
  dominant_profile,
  scores,
  question_count,
  question_source,
  created_at
FROM disc_tests
ORDER BY created_at DESC
LIMIT 5;

-- 5. Verificar se a constraint CHECK está funcionando
-- Este comando deve FALHAR (esperado) se a constraint estiver correta
-- Descomente para testar:
-- INSERT INTO disc_tests (user_id, questions, answers, result, scores, dominant_profile, question_count, question_source)
-- VALUES (
--   (SELECT id FROM auth.users LIMIT 1),
--   '[]'::jsonb,
--   '[]'::jsonb,
--   '{}'::jsonb,
--   '{"D":0,"I":0,"S":0,"C":0}'::jsonb,
--   'D',
--   20,
--   'invalid_source' -- Deve falhar aqui
-- );

-- 6. Testar query típica usada pela aplicação (compatibilidade)
SELECT 
  dt.id,
  dt.dominant_profile,
  dt.scores,
  dt.ai_analysis,
  dt.question_count,
  dt.question_source,
  dt.created_at,
  p.full_name,
  p.email
FROM disc_tests dt
JOIN profiles p ON dt.user_id = p.user_id
ORDER BY dt.created_at DESC
LIMIT 3;

-- 7. Verificar se as políticas RLS ainda estão ativas
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'disc_tests'
ORDER BY policyname;

-- 8. Resumo final
SELECT 
  'Migration Status' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_name = 'disc_tests' 
        AND column_name IN ('question_count', 'question_source', 'generated_questions')
      HAVING COUNT(*) = 3
    ) THEN '✅ SUCESSO - Todas as colunas criadas'
    ELSE '❌ ERRO - Colunas faltando'
  END as status
UNION ALL
SELECT 
  'Default Values' as check_type,
  CASE 
    WHEN NOT EXISTS (
      SELECT 1 FROM disc_tests 
      WHERE question_count IS NULL OR question_source IS NULL
    ) THEN '✅ SUCESSO - Todos os registros atualizados'
    ELSE '❌ ERRO - Registros com valores NULL'
  END as status
UNION ALL
SELECT 
  'Indexes' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_indexes 
      WHERE tablename = 'disc_tests' 
        AND indexname IN ('idx_disc_tests_question_source', 'idx_disc_tests_question_count')
      HAVING COUNT(*) = 2
    ) THEN '✅ SUCESSO - Índices criados'
    ELSE '❌ ERRO - Índices faltando'
  END as status
UNION ALL
SELECT 
  'RLS Policies' as check_type,
  CASE 
    WHEN EXISTS (
      SELECT 1 FROM pg_policies 
      WHERE tablename = 'disc_tests'
      HAVING COUNT(*) >= 3
    ) THEN '✅ SUCESSO - Políticas RLS ativas'
    ELSE '❌ ERRO - Políticas RLS faltando'
  END as status;
