-- ============================================
-- SCRIPT SIMPLES - SÓ O ESSENCIAL
-- ============================================
-- Este script faz apenas o necessário:
-- 1. Corrige a constraint de roles
-- 2. Cria seu perfil admin
-- 3. Atualiza RLS policies das tabelas principais
-- ============================================

-- ============================================
-- PARTE 1: CORRIGIR CONSTRAINT E CRIAR ADMIN
-- ============================================

-- Remover constraint antiga
ALTER TABLE profiles 
DROP CONSTRAINT IF EXISTS profiles_role_check;

-- Adicionar nova constraint com super_admin
ALTER TABLE profiles
ADD CONSTRAINT profiles_role_check 
CHECK (role IN ('user', 'admin', 'super_admin', 'company_admin', 'manager', 'viewer'));

-- Criar seu perfil admin
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
WHERE u.id = 'cfce857c-7d22-4450-abe6-fc234a13c75a'
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();

-- ============================================
-- PARTE 2: ATUALIZAR RLS POLICIES ESSENCIAIS
-- ============================================

-- PROFILES TABLE
-- IMPORTANTE: Usar auth.jwt() em vez de subquery para evitar recursão infinita!
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- Policies de usuário comum (sem recursão)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Policy de admin (usa JWT, sem recursão)
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
    OR user_id = auth.uid()
  );

-- DISC_TESTS TABLE
-- Usar auth.jwt() para evitar recursão
DROP POLICY IF EXISTS "Admins can view all tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can view own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can insert own tests" ON disc_tests;

CREATE POLICY "Users can view own tests"
  ON disc_tests FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own tests"
  ON disc_tests FOR INSERT
  WITH CHECK (user_id = auth.uid());

CREATE POLICY "Admins can view all tests"
  ON disc_tests FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
    OR user_id = auth.uid()
  );

-- COMPANIES TABLE
-- Usar auth.jwt() para evitar recursão
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

-- COMPANY_TESTS TABLE
-- Usar auth.jwt() para evitar recursão
DROP POLICY IF EXISTS "Admins can view all company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can insert company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can update company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can delete company tests" ON company_tests;

CREATE POLICY "Admins can view all company tests"
  ON company_tests FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can insert company tests"
  ON company_tests FOR INSERT
  WITH CHECK (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can update company tests"
  ON company_tests FOR UPDATE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

CREATE POLICY "Admins can delete company tests"
  ON company_tests FOR DELETE
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
  );

-- ============================================
-- PARTE 3: VERIFICAR SE FUNCIONOU
-- ============================================

-- Verificar seu perfil
SELECT 
  '========================================' as separador,
  'VERIFICAÇÃO DO PERFIL ADMIN' as titulo,
  '========================================' as separador2;

SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUCESSO! Você é super admin!'
    WHEN p.role IN ('admin', 'company_admin') THEN '⚠️ Admin (mas não super_admin)'
    ELSE '❌ Não é admin'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';

-- Verificar tabelas que existem
SELECT 
  '========================================' as separador,
  'TABELAS DISPONÍVEIS' as titulo,
  '========================================' as separador2;

SELECT 
  tablename,
  CASE 
    WHEN tablename IN ('profiles', 'disc_tests', 'companies', 'company_tests') THEN '✅ Essencial'
    ELSE '📦 Opcional'
  END as tipo
FROM pg_tables
WHERE schemaname = 'public'
AND tablename IN ('profiles', 'disc_tests', 'companies', 'company_tests', 'question_bank', 'question_performance', 'learning_patterns')
ORDER BY tablename;

-- Contar policies corrigidas
SELECT 
  '========================================' as separador,
  'RESUMO DAS POLICIES' as titulo,
  '========================================' as separador2;

SELECT 
  COUNT(*) as total_policies_admin
FROM pg_policies
WHERE policyname LIKE '%admin%'
AND qual LIKE '%super_admin%';

-- ============================================
-- PRONTO! ✅
-- ============================================
-- Agora:
-- 1. Verifique se apareceu "✅ SUCESSO! Você é super admin!"
-- 2. Feche TODAS as abas do localhost:3000
-- 3. Limpe o cache do navegador (Ctrl + Shift + Delete)
-- 4. Faça LOGIN novamente
-- 5. Acesse: http://localhost:3000/admin
-- 6. Deve funcionar! ✅
-- ============================================
