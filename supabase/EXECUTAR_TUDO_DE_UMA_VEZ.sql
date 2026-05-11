-- ============================================
-- SCRIPT COMPLETO - EXECUTAR TUDO DE UMA VEZ
-- ============================================
-- Este script faz TUDO que você precisa:
-- 1. Corrige a constraint de roles
-- 2. Cria seu perfil admin
-- 3. Atualiza todas as RLS policies
-- 4. Verifica se funcionou
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
-- PARTE 2: ATUALIZAR RLS POLICIES
-- ============================================

-- PROFILES TABLE
DROP POLICY IF EXISTS "Admins can view all profiles" ON profiles;
CREATE POLICY "Admins can view all profiles"
  ON profiles FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- DISC_TESTS TABLE
DROP POLICY IF EXISTS "Admins can view all tests" ON disc_tests;
CREATE POLICY "Admins can view all tests"
  ON disc_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() 
      AND role IN ('admin', 'super_admin', 'company_admin')
    )
  );

-- COMPANIES TABLE
DROP POLICY IF EXISTS "Admins can view all companies" ON companies;
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

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

-- COMPANY_TESTS TABLE
DROP POLICY IF EXISTS "Admins can view all company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can insert company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can update company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can delete company tests" ON company_tests;

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

-- QUESTION_BANK TABLE (se existir - pode estar comentado se não existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_bank') THEN
    DROP POLICY IF EXISTS "Admins can view all questions" ON question_bank;
    DROP POLICY IF EXISTS "Admins can insert questions" ON question_bank;
    DROP POLICY IF EXISTS "Admins can update questions" ON question_bank;
    DROP POLICY IF EXISTS "Admins can delete questions" ON question_bank;

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
  END IF;
END $$;

-- QUESTION_PERFORMANCE TABLE (se existir)
DO $$ 
BEGIN
  IF EXISTS (SELECT FROM pg_tables WHERE schemaname = 'public' AND tablename = 'question_performance') THEN
    DROP POLICY IF EXISTS "Admins can view all question performance" ON question_performance;

    CREATE POLICY "Admins can view all question performance"
      ON question_performance FOR SELECT
      USING (
        EXISTS (
          SELECT 1 FROM profiles
          WHERE user_id = auth.uid() 
          AND role IN ('admin', 'super_admin', 'company_admin')
        )
      );
  END IF;
END $$;

-- LEARNING_PATTERNS TABLE (se existir - COMENTADO porque pode não existir)
-- DROP POLICY IF EXISTS "Admins can view all learning patterns" ON learning_patterns;
-- CREATE POLICY "Admins can view all learning patterns"
--   ON learning_patterns FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE user_id = auth.uid() 
--       AND role IN ('admin', 'super_admin', 'company_admin')
--     )
--   );

-- LEARNING_INSIGHTS TABLE (se existir - COMENTADO porque pode não existir)
-- DROP POLICY IF EXISTS "Admins can view all learning insights" ON learning_insights;
-- CREATE POLICY "Admins can view all learning insights"
--   ON learning_insights FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE user_id = auth.uid() 
--       AND role IN ('admin', 'super_admin', 'company_admin')
--     )
--   );

-- LEARNING_RECOMMENDATIONS TABLE (se existir - COMENTADO porque pode não existir)
-- DROP POLICY IF EXISTS "Admins can view all learning recommendations" ON learning_recommendations;
-- CREATE POLICY "Admins can view all learning recommendations"
--   ON learning_recommendations FOR SELECT
--   USING (
--     EXISTS (
--       SELECT 1 FROM profiles
--       WHERE user_id = auth.uid() 
--       AND role IN ('admin', 'super_admin', 'company_admin')
--     )
--   );

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

-- Verificar policies atualizadas
SELECT 
  '========================================' as separador,
  'POLICIES ATUALIZADAS' as titulo,
  '========================================' as separador2;

SELECT 
  tablename,
  policyname,
  CASE 
    WHEN qual LIKE '%super_admin%' THEN '✅ Aceita super_admin'
    WHEN qual LIKE '%admin%' THEN '⚠️ Só aceita admin'
    ELSE '❓ Verificar manualmente'
  END as status
FROM pg_policies
WHERE policyname LIKE '%admin%'
ORDER BY tablename, policyname;

-- Contar policies corrigidas
SELECT 
  '========================================' as separador,
  'RESUMO' as titulo,
  '========================================' as separador2;

SELECT 
  COUNT(*) as total_policies_admin,
  SUM(CASE WHEN qual LIKE '%super_admin%' THEN 1 ELSE 0 END) as policies_corrigidas,
  SUM(CASE WHEN qual LIKE '%super_admin%' THEN 0 ELSE 1 END) as policies_pendentes
FROM pg_policies
WHERE policyname LIKE '%admin%';

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
