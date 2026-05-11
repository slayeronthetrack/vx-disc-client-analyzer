-- ============================================
-- CORRIGIR RECURSÃO INFINITA NAS RLS POLICIES
-- ============================================
-- Problema: A policy de "Admins can view all profiles" 
-- fazia SELECT na própria tabela profiles, causando recursão infinita.
--
-- Solução: Usar auth.jwt() em vez de subquery em profiles
-- ============================================

-- PASSO 1: Remover TODAS as policies problemáticas da tabela profiles
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

-- PASSO 2: Recriar policies SEM auto-referência
-- A policy de usuário comum usa auth.uid() diretamente (sem subquery em profiles)
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (user_id = auth.uid());

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (user_id = auth.uid());

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- PASSO 3: Para admins verem todos os profiles, usar auth.jwt() em vez de subquery
-- Isso evita a recursão
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'company_admin')
    OR user_id = auth.uid()
  );

-- PASSO 4: Verificar todas as policies atuais na tabela profiles
SELECT 
  '========================================' as separador,
  'POLICIES DA TABELA PROFILES' as titulo,
  '========================================' as separador2;

SELECT 
  policyname, 
  cmd,
  CASE 
    WHEN qual LIKE '%auth.jwt()%' THEN '✅ Usa JWT (sem recursão)'
    WHEN qual LIKE '%FROM profiles%' THEN '❌ Usa subquery (recursão!)'
    ELSE '✅ Simples (sem recursão)'
  END as status,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
ORDER BY policyname;

-- PASSO 5: Verificar seu perfil
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
-- 1. Verifique se todas as policies mostram "✅ Usa JWT" ou "✅ Simples"
-- 2. Feche TODAS as abas do localhost:3000
-- 3. Limpe o cache do navegador (Ctrl + Shift + Delete)
-- 4. Faça LOGOUT e LOGIN novamente (IMPORTANTE!)
-- 5. Acesse: http://localhost:3000/admin
-- 6. Deve funcionar! ✅
-- ============================================

-- ============================================
-- EXPLICAÇÃO DO PROBLEMA
-- ============================================
-- ❌ ANTES (com recursão):
-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles  -- ❌ Consulta profiles dentro da policy de profiles!
--       WHERE user_id = auth.uid() 
--       AND role IN ('admin', 'super_admin')
--     )
--   );
--
-- Fluxo com recursão:
-- 1. User tenta SELECT em profiles
-- 2. Supabase executa a policy
-- 3. Policy faz SELECT em profiles
-- 4. Supabase executa a policy novamente
-- 5. Policy faz SELECT em profiles
-- 6. ... RECURSÃO INFINITA! 💥
--
-- ✅ AGORA (sem recursão):
-- CREATE POLICY "Admins can view all profiles"
--   ON profiles FOR SELECT
--   USING (
--     auth.jwt() ->> 'role' IN ('admin', 'super_admin')  -- ✅ Lê do JWT, não consulta tabela!
--     OR user_id = auth.uid()
--   );
--
-- Fluxo sem recursão:
-- 1. User tenta SELECT em profiles
-- 2. Supabase executa a policy
-- 3. Policy lê auth.jwt() (token JWT do usuário)
-- 4. Retorna resultado
-- 5. FIM! ✅
-- ============================================
