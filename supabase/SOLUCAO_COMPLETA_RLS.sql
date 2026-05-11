-- ============================================
-- SOLUÇÃO COMPLETA - RLS SEM RECURSÃO
-- ============================================
-- Este script resolve o problema de recursão infinita
-- usando uma abordagem diferente: função helper
-- ============================================

-- PASSO 1: Criar função helper para verificar se é admin
-- Esta função NÃO causa recursão porque usa SECURITY DEFINER
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE user_id = auth.uid()
    AND role IN ('admin', 'super_admin', 'company_admin')
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- PASSO 2: Remover policies antigas da tabela profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- PASSO 3: Criar policies SEM recursão usando a função helper
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- Esta policy usa a função helper que tem SECURITY DEFINER
-- Isso permite que ela acesse profiles sem disparar as policies novamente
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (is_admin() OR user_id = auth.uid());

-- PASSO 4: Atualizar policies de outras tabelas
-- DISC_TESTS
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
  USING (is_admin() OR user_id = auth.uid());

-- COMPANIES
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

CREATE POLICY "Admins can view all companies"
  ON companies FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert companies"
  ON companies FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update companies"
  ON companies FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete companies"
  ON companies FOR DELETE
  USING (is_admin());

-- COMPANY_TESTS
DROP POLICY IF EXISTS "Admins can view all company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can insert company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can update company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can delete company tests" ON company_tests;

CREATE POLICY "Admins can view all company tests"
  ON company_tests FOR SELECT
  USING (is_admin());

CREATE POLICY "Admins can insert company tests"
  ON company_tests FOR INSERT
  WITH CHECK (is_admin());

CREATE POLICY "Admins can update company tests"
  ON company_tests FOR UPDATE
  USING (is_admin());

CREATE POLICY "Admins can delete company tests"
  ON company_tests FOR DELETE
  USING (is_admin());

-- PASSO 5: Verificar se funcionou
SELECT 
  '========================================' as separador,
  'FUNÇÃO HELPER CRIADA' as titulo,
  '========================================' as separador2;

SELECT 
  proname as function_name,
  prosecdef as is_security_definer,
  CASE 
    WHEN prosecdef THEN '✅ SECURITY DEFINER (evita recursão)'
    ELSE '❌ Normal (pode causar recursão)'
  END as status
FROM pg_proc
WHERE proname = 'is_admin';

SELECT 
  '========================================' as separador,
  'POLICIES ATUALIZADAS' as titulo,
  '========================================' as separador2;

SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%is_admin()%' THEN '✅ Usa função helper'
    WHEN qual LIKE '%user_id = auth.uid()%' THEN '✅ Simples (sem recursão)'
    ELSE '⚠️ Verificar'
  END as status
FROM pg_policies
WHERE tablename IN ('profiles', 'disc_tests', 'companies', 'company_tests')
ORDER BY tablename, policyname;

SELECT 
  '========================================' as separador,
  'SEU PERFIL ADMIN' as titulo,
  '========================================' as separador2;

SELECT 
  user_id,
  email,
  full_name,
  role,
  profile_completed,
  CASE 
    WHEN role = 'super_admin' THEN '✅ SUPER ADMIN'
    WHEN role IN ('admin', 'company_admin') THEN '⚠️ Admin'
    ELSE '❌ Usuário comum'
  END as status
FROM profiles
WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';

-- ============================================
-- PRONTO! ✅
-- ============================================
-- Agora:
-- 1. Verifique se a função is_admin() foi criada com SECURITY DEFINER
-- 2. Verifique se todas as policies usam is_admin() ou são simples
-- 3. Feche TODAS as abas do localhost:3000
-- 4. Limpe o cache do navegador (Ctrl + Shift + Delete)
-- 5. Faça LOGOUT e LOGIN novamente
-- 6. Acesse: http://localhost:3000/admin
-- 7. Deve funcionar! ✅
-- ============================================

-- ============================================
-- EXPLICAÇÃO DA SOLUÇÃO
-- ============================================
-- ❌ PROBLEMA: Recursão infinita
-- CREATE POLICY "..." USING (
--   EXISTS (SELECT 1 FROM profiles WHERE ...)  -- ❌ Consulta profiles dentro da policy!
-- );
--
-- ✅ SOLUÇÃO 1: Usar auth.jwt()
-- Problema: JWT não contém o campo 'role' por padrão no Supabase
--
-- ✅ SOLUÇÃO 2: Função SECURITY DEFINER (USADA AQUI)
-- CREATE FUNCTION is_admin() ... SECURITY DEFINER;
-- CREATE POLICY "..." USING (is_admin());  -- ✅ Função bypassa RLS!
--
-- Como funciona:
-- 1. User tenta SELECT em profiles
-- 2. Supabase executa a policy
-- 3. Policy chama is_admin()
-- 4. is_admin() tem SECURITY DEFINER, então bypassa RLS
-- 5. is_admin() consulta profiles SEM disparar policies
-- 6. Retorna true/false
-- 7. Policy usa o resultado
-- 8. FIM! ✅
-- ============================================
