-- ============================================
-- CRIAR PERFIL ADMIN PARA TESTES
-- ============================================
-- Este script cria ou atualiza um perfil de usuário
-- para ter acesso admin ao sistema
-- ============================================

-- IMPORTANTE: Substitua 'SEU_USER_ID_AQUI' pelo ID do seu usuário
-- Você pode encontrar o user_id em: Authentication → Users → copie o UUID

-- ============================================
-- OPÇÃO 1: Criar perfil admin para usuário existente
-- ============================================

-- Primeiro, vamos verificar se o perfil já existe
-- Execute esta query para ver seus usuários:
SELECT 
  id as user_id,
  email,
  created_at
FROM auth.users
ORDER BY created_at DESC
LIMIT 5;

-- Copie o 'user_id' do usuário que você quer tornar admin
-- e substitua abaixo em 'SEU_USER_ID_AQUI'

-- ============================================
-- Criar ou atualizar perfil para super_admin
-- ============================================

-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo UUID do seu usuário!
INSERT INTO profiles (
  user_id,
  full_name,
  role,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'SEU_USER_ID_AQUI',  -- ⚠️ SUBSTITUA AQUI!
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
-- Verificar se funcionou
-- ============================================

-- Execute esta query para confirmar:
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.profile_completed,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'super_admin'
ORDER BY p.created_at DESC;

-- ============================================
-- OPÇÃO 2: Se você não tem usuário ainda
-- ============================================

-- 1. Vá no Supabase Dashboard
-- 2. Authentication → Users
-- 3. Clique em "Add user"
-- 4. Preencha:
--    - Email: admin@teste.com
--    - Password: Admin123!
--    - Auto Confirm User: ✅ (marque esta opção!)
-- 5. Clique em "Create user"
-- 6. Copie o UUID do usuário criado
-- 7. Execute o INSERT acima substituindo o user_id

-- ============================================
-- OPÇÃO 3: Atualizar perfil existente
-- ============================================

-- Se você já tem um perfil mas não é admin, execute:
UPDATE profiles
SET 
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW()
WHERE user_id = 'SEU_USER_ID_AQUI';  -- ⚠️ SUBSTITUA AQUI!

-- ============================================
-- Verificar todos os perfis
-- ============================================

SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ ADMIN'
    WHEN p.role = 'admin' THEN '⚠️ Admin'
    ELSE '❌ Usuário comum'
  END as status
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;

-- ============================================
-- TROUBLESHOOTING
-- ============================================

-- Se der erro "violates foreign key constraint":
-- Significa que o user_id não existe na tabela auth.users
-- Solução: Verifique se copiou o UUID correto

-- Se der erro "duplicate key value":
-- Significa que o perfil já existe
-- Solução: Use o UPDATE em vez do INSERT (OPÇÃO 3)

-- Se não aparecer nada:
-- Significa que não há perfis criados
-- Solução: Execute o INSERT (OPÇÃO 1)

-- ============================================
-- ROLES DISPONÍVEIS
-- ============================================

-- super_admin: Acesso total ao sistema (recomendado para testes)
-- admin: Acesso admin limitado
-- company_admin: Admin de uma empresa específica
-- manager: Gerente de equipe
-- viewer: Apenas visualização
-- user: Usuário comum (padrão)

-- ============================================
-- APÓS EXECUTAR
-- ============================================

-- 1. Faça LOGOUT do sistema
-- 2. Faça LOGIN novamente
-- 3. Acesse: http://localhost:3000/admin
-- 4. Deve funcionar! ✅
