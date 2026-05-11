-- ============================================
-- Script para corrigir RLS da tabela company_tests
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- PASSO 1: Ver as policies atuais da tabela company_tests
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies 
WHERE tablename = 'company_tests';

-- ============================================
-- PASSO 2: Corrigir policies para company_tests
-- ============================================

-- Remover policies antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Public can insert company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can view all company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can update company tests" ON company_tests;
DROP POLICY IF EXISTS "Admins can delete company tests" ON company_tests;
DROP POLICY IF EXISTS "Employees can view their own tests" ON company_tests;

-- Criar policy para INSERT (acesso público para submissão de testes)
-- Qualquer pessoa pode submeter um teste (não requer autenticação)
CREATE POLICY "Public can insert company tests" 
ON company_tests 
FOR INSERT 
TO anon, authenticated
WITH CHECK (true);

-- Criar policy para SELECT (admins podem ver todos os testes)
CREATE POLICY "Admins can view all company tests" 
ON company_tests 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- Criar policy para UPDATE (admins podem atualizar testes)
CREATE POLICY "Admins can update company tests" 
ON company_tests 
FOR UPDATE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
)
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- Criar policy para DELETE (admins podem deletar testes)
CREATE POLICY "Admins can delete company tests" 
ON company_tests 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- Policy adicional: Funcionários podem ver seus próprios testes (opcional)
-- Descomente se quiser permitir que funcionários vejam seus resultados
-- CREATE POLICY "Employees can view their own tests" 
-- ON company_tests 
-- FOR SELECT 
-- TO authenticated 
-- USING (email = auth.email());

-- ============================================
-- PASSO 3: Verificar se as policies foram criadas
-- ============================================

SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'INSERT' THEN 'Permite submeter testes (público)'
    WHEN cmd = 'SELECT' THEN 'Permite ver testes (admins)'
    WHEN cmd = 'UPDATE' THEN 'Permite atualizar testes (admins)'
    WHEN cmd = 'DELETE' THEN 'Permite deletar testes (admins)'
  END as descricao,
  CASE 
    WHEN roles::text LIKE '%anon%' THEN 'Público + Autenticado'
    ELSE 'Apenas Autenticado'
  END as acesso
FROM pg_policies 
WHERE tablename = 'company_tests'
ORDER BY cmd;

-- ============================================
-- PASSO 4: Testar inserção pública
-- ============================================

-- Este SELECT deve retornar true se as policies estão corretas
SELECT 
  'RLS habilitado' as status,
  relrowsecurity as habilitado
FROM pg_class 
WHERE relname = 'company_tests';
