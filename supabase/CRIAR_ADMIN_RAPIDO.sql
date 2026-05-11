-- ============================================
-- CRIAR PERFIL ADMIN - VERSÃO RÁPIDA
-- ============================================

-- PASSO 1: Encontre seu user_id
-- Execute esta query e copie o 'user_id' do seu email:

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: Cole seu user_id abaixo e execute
-- ============================================

-- ⚠️ SUBSTITUA 'SEU_USER_ID_AQUI' pelo UUID que você copiou acima!

INSERT INTO profiles (
  user_id,
  full_name,
  role,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'SEU_USER_ID_AQUI',
  'Admin Sistema',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();

-- ============================================
-- PASSO 3: Verifique se funcionou
-- ============================================

SELECT 
  p.user_id,
  u.email,
  p.role,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ ADMIN CRIADO!'
    ELSE '❌ Não é admin'
  END as status
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email = 'SEU_EMAIL@AQUI.COM';  -- ⚠️ SUBSTITUA SEU EMAIL!

-- ============================================
-- PRONTO! Agora:
-- 1. Faça LOGOUT do sistema
-- 2. Faça LOGIN novamente
-- 3. Acesse: http://localhost:3000/admin
-- ============================================
