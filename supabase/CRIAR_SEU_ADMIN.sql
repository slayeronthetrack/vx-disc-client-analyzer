-- ============================================
-- CRIAR PERFIL ADMIN - VERSÃO AUTOMÁTICA
-- ============================================
-- Este script pega o email automaticamente do auth.users
-- Você só precisa substituir o UUID!
-- ============================================

-- ⚠️ SUBSTITUA 'cfce857c-7d22-4450-abe6-fc234a13c75a' pelo seu UUID
-- (O UUID que você já tem: cfce857c-7d22-4450-abe6-fc234a13c75a)

INSERT INTO profiles (
  user_id,
  full_name,
  email,
  role,
  profile_completed,
  created_at,
  updated_at
)
SELECT 
  u.id,
  'Admin Sistema',
  u.email,  -- ✅ Pega o email automaticamente!
  'super_admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'  -- ⚠️ SEU UUID AQUI!
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();

-- ============================================
-- Verificar se funcionou:
-- ============================================

SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUCESSO!'
    ELSE '❌ Erro'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';

-- ============================================
-- PRONTO! 
-- 1. Faça LOGOUT: http://localhost:3000/login
-- 2. Faça LOGIN novamente
-- 3. Acesse: http://localhost:3000/admin
-- ============================================
