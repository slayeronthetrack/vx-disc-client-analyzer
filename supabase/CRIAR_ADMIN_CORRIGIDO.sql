-- ============================================
-- CRIAR PERFIL ADMIN - VERSÃO CORRIGIDA
-- ============================================

-- PASSO 1: Buscar informações do usuário
-- Execute esta query e veja seus dados:

SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC;

-- ============================================
-- PASSO 2: Criar perfil admin com email
-- ============================================

-- ⚠️ SUBSTITUA os valores abaixo:
-- - 'SEU_USER_ID_AQUI' pelo UUID que você copiou
-- - 'seu-email@exemplo.com' pelo seu email

INSERT INTO profiles (
  user_id,
  full_name,
  email,
  role,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'cfce857c-7d22-4450-abe6-fc234a13c75a',  -- ⚠️ Seu UUID
  'Admin Sistema',
  'seu-email@exemplo.com',  -- ⚠️ SEU EMAIL AQUI!
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
-- PASSO 3: Verificar se funcionou
-- ============================================

SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ ADMIN CRIADO COM SUCESSO!'
    WHEN p.role = 'admin' THEN '⚠️ Admin (não super_admin)'
    ELSE '❌ Não é admin'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';  -- ⚠️ Seu UUID

-- ============================================
-- ALTERNATIVA: Criar perfil automaticamente
-- pegando o email do auth.users
-- ============================================

-- Esta versão busca o email automaticamente:

INSERT INTO profiles (
  user_id,
  full_name,
  email,
  role,
  profile_completed,
  created_at,
  updated_at)
SELECT 
  u.id,
  'Admin Sistema',
  u.email,  -- Pega o email automaticamente
  'super_admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'  -- ⚠️ Seu UUID
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();

-- ============================================
-- PRONTO! Agora:
-- 1. Faça LOGOUT do sistema
-- 2. Faça LOGIN novamente  
-- 3. Acesse: http://localhost:3000/admin
-- 4. Deve funcionar! ✅
-- ============================================
