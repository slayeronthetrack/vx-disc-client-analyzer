-- ============================================
-- CORRIGIR RLS POLICIES PARA ACEITAR SUPER_ADMIN
-- ============================================
-- Este script atualiza TODAS as RLS policies para aceitar
-- múltiplos tipos de admin: admin, super_admin, company_admin
-- ============================================

-- ============================================
-- PROFILES TABLE
-- ============================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- DISC_TESTS TABLE
-- ============================================

-- Drop existing admin policies
DROP POLICY IF EXISTS "Admins can view all tests" ON disc_tests;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all tests"
  ON disc_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- COMPANIES TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- COMPANY_TESTS TABLE
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can insert company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can update company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can delete company tests" ON company_tests;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all company tests"
  ON company_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can insert company tests"
  ON company_tests FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can update company tests"
  ON company_tests FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can delete company tests"
  ON company_tests FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- QUESTION_BANK TABLE (se existir)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all questions" ON question_bank;
DROP POLICY IF EXISTS "Admins can insert questions" ON question_bank;
DROP POLICY IF EXISTS "Admins can update questions" ON question_bank;
DROP POLICY IF EXISTS "Admins can delete questions" ON question_bank;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all questions"
  ON question_bank FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can insert questions"
  ON question_bank FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can update questions"
  ON question_bank FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

CREATE POLICY "Admins can delete questions"
  ON question_bank FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- QUESTION_PERFORMANCE TABLE (se existir)
-- ============================================

-- Drop existing policies
DROP POLICY IF EXISTS "Admins can view all question performance" ON question_performance;

-- Recreate with multiple admin roles
CREATE POLICY "Admins can view all question performance"
  ON question_performance FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- LEARNING SYSTEM TABLES (se existirem)
-- ============================================

-- learning_patterns
DROP POLICY IF EXISTS "Admins can view all learning patterns" ON learning_patterns;
CREATE POLICY "Admins can view all learning patterns"
  ON learning_patterns FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- learning_insights
DROP POLICY IF EXISTS "Admins can view all learning insights" ON learning_insights;
CREATE POLICY "Admins can view all learning insights"
  ON learning_insights FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- learning_recommendations
DROP POLICY IF EXISTS "Admins can view all learning recommendations" ON learning_recommendations;
CREATE POLICY "Admins can view all learning recommendations"
  ON learning_recommendations FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- ============================================
-- VERIFICAR SE FUNCIONOU
-- ============================================

-- Verificar seu perfil
SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role IN ('admin', 'super_admin', 'company_admin') THEN '✅ TEM ACESSO ADMIN'
    ELSE '❌ SEM ACESSO ADMIN'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';

-- Listar todas as policies de admin
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- ============================================
-- PRONTO! Agora:
-- 1. Faça LOGOUT do sistema
-- 2. Limpe o cache do navegador (Ctrl + Shift + Delete)
-- 3. Faça LOGIN novamente
-- 4. Acesse: http://localhost:3000/admin
-- 5. Deve funcionar! ✅
-- ============================================
