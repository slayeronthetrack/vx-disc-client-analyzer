-- ============================================
-- CRIAR PERFIL DISC COMPLETO PARA TESTE
-- Execute este SQL no Supabase SQL Editor
-- ============================================

-- 1. INSERIR/ATUALIZAR PERFIL DO USUÁRIO
INSERT INTO profiles (
  user_id,
  email,
  full_name,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'cfce857c-7d22-4450-abe6-fc234a13c75a',
  'teste@vx.com',
  'Usuário Teste VX',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  profile_completed = true,
  updated_at = NOW();

-- 2. INSERIR TESTE DISC (Perfil Dominância - D)
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

-- 3. VERIFICAR SE FOI CRIADO
SELECT 
  '✅ PERFIL' as tipo,
  user_id,
  email,
  full_name,
  profile_completed
FROM profiles 
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'

UNION ALL

SELECT 
  '✅ TESTE DISC' as tipo,
  user_id,
  dominant_profile::text as email,
  scores::text as full_name,
  true as profile_completed
FROM disc_tests 
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'
ORDER BY created_at DESC
LIMIT 1;

-- 4. TESTAR A QUERY QUE O CHAT USA
SELECT 
  '🎯 CONTEXTO DISC PARA O CHAT' as info,
  dominant_profile,
  scores
FROM disc_tests
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'
ORDER BY created_at DESC
LIMIT 1;

-- ============================================
-- RESULTADO ESPERADO:
-- ✅ PERFIL: teste@vx.com | Usuário Teste VX
-- ✅ TESTE DISC: D (Dominância) | Scores: D:85, I:45, S:30, C:40
-- ============================================
