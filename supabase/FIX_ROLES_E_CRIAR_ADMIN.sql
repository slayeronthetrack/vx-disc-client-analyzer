-- ============================================
-- CORRIGIR ROLES E CRIAR ADMIN
-- ============================================
-- Este script:
-- 1. Remove a constraint antiga que só aceita 'user' e 'admin'
-- 2. Adiciona nova constraint que aceita 'super_admin'
-- 3. Cria seu perfil admin
-- ============================================

-- PASSO 1: Remover constraint antiga
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- PASSO 2: Adicionar nova constraint com super_admin
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'super_admin', 'company_admin', 'manager', 'viewer'));

-- PASSO 3: Criar seu perfil admin
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
  u.email,
  'super_admin',
  true,
  NOW(),
  NOW()
FROM auth.users u
WHERE u.id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'  -- ⚠️ SEU UUID
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();

-- PASSO 4: Verificar se funcionou
SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUCESSO! Você é super admin!'
    WHEN p.role = 'admin' THEN '⚠️ Admin comum (não super)'
    ELSE '❌ Não é admin'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';

-- ============================================
-- PRONTO! Agora:
-- 1. Faça LOGOUT do sistema
-- 2. Faça LOGIN novamente
-- 3. Acesse: http://localhost:3000/admin
-- 4. Deve funcionar! ✅
-- ============================================

-- ============================================
-- VERIFICAR TODOS OS PERFIS ADMIN
-- ============================================

SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.profile_completed
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.created_at DESC;
