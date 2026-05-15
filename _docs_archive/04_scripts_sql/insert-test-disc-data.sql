-- Inserir dados de teste DISC para validação do Chat IA
-- Execute este SQL no Supabase SQL Editor

-- 1. Inserir um teste DISC de exemplo (Perfil Dominância)
INSERT INTO disc_tests (
  user_id,
  dominant_profile,
  scores,
  answers,
  created_at
)
VALUES (
  'cfce857c-7d22-4450-abe6-fc234a13c75a',
  'D',
  '{"D": 85, "I": 45, "S": 30, "C": 40}'::jsonb,
  '{}'::jsonb,
  NOW()
)
ON CONFLICT DO NOTHING;

-- 2. Verificar se foi inserido
SELECT 
  id,
  user_id,
  dominant_profile,
  scores,
  created_at
FROM disc_tests 
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'
ORDER BY created_at DESC
LIMIT 1;

-- 3. Testar a query que o chat usa
SELECT dominant_profile, scores
FROM disc_tests
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'
ORDER BY created_at DESC
LIMIT 1;
