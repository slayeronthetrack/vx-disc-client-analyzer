-- ============================================
-- Script para diagnosticar e corrigir RLS da tabela companies
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- PASSO 1: Ver as policies atuais da tabela companies
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
WHERE tablename = 'companies';

-- ============================================
-- PASSO 2: Corrigir policies para admins
-- ============================================

-- Remover policies antigas se existirem (para evitar conflitos)
DROP POLICY IF EXISTS "Admins can insert companies" ON companies;
DROP POLICY IF EXISTS "Admins can view companies" ON companies;
DROP POLICY IF EXISTS "Admins can update companies" ON companies;
DROP POLICY IF EXISTS "Admins can delete companies" ON companies;

-- Criar policy para INSERT (admins podem criar empresas)
CREATE POLICY "Admins can insert companies" 
ON companies 
FOR INSERT 
TO authenticated 
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- Criar policy para SELECT (admins podem ver todas as empresas)
CREATE POLICY "Admins can view companies" 
ON companies 
FOR SELECT 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- Criar policy para UPDATE (admins podem atualizar empresas)
CREATE POLICY "Admins can update companies" 
ON companies 
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

-- Criar policy para DELETE (admins podem deletar empresas)
CREATE POLICY "Admins can delete companies" 
ON companies 
FOR DELETE 
TO authenticated 
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin', 'company_admin')
  )
);

-- ============================================
-- PASSO 3: Verificar se as policies foram criadas
-- ============================================

SELECT 
  policyname,
  cmd,
  CASE 
    WHEN cmd = 'INSERT' THEN 'Permite criar empresas'
    WHEN cmd = 'SELECT' THEN 'Permite ver empresas'
    WHEN cmd = 'UPDATE' THEN 'Permite atualizar empresas'
    WHEN cmd = 'DELETE' THEN 'Permite deletar empresas'
  END as descricao
FROM pg_policies 
WHERE tablename = 'companies'
ORDER BY cmd;

-- ============================================
-- PASSO 4: Testar se o usuário atual tem permissão
-- ============================================

SELECT 
  'Seu user_id' as info,
  auth.uid()::text as valor
UNION ALL
SELECT 
  'Seu role' as info,
  role::text as valor
FROM profiles 
WHERE user_id = auth.uid();
