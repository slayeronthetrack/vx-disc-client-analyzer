-- Fix RLS Policies for disc_tests table
-- Garante que apenas o próprio usuário pode acessar seus testes

-- 1. Remover políticas antigas (se existirem)
DROP POLICY IF EXISTS "Users can view own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can insert own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can update own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can delete own tests" ON disc_tests;
DROP POLICY IF EXISTS "Admins can view all tests" ON disc_tests;

-- 2. Garantir que RLS está ativado
ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;

-- 3. Criar política de SELECT (visualização)
-- Usuários podem ver apenas seus próprios testes
CREATE POLICY "Users can view own tests"
  ON disc_tests
  FOR SELECT
  USING (auth.uid() = user_id);

-- 4. Criar política de INSERT (criação)
-- Usuários podem criar testes apenas para si mesmos
CREATE POLICY "Users can insert own tests"
  ON disc_tests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Criar política de UPDATE (atualização)
-- Usuários podem atualizar apenas seus próprios testes
CREATE POLICY "Users can update own tests"
  ON disc_tests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- 6. Criar política de DELETE (exclusão)
-- Usuários podem deletar apenas seus próprios testes
CREATE POLICY "Users can delete own tests"
  ON disc_tests
  FOR DELETE
  USING (auth.uid() = user_id);

-- 7. Criar política para admins (opcional)
-- Admins podem ver todos os testes
CREATE POLICY "Admins can view all tests"
  ON disc_tests
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE user_id = auth.uid() AND role = 'admin'
    )
  );

-- 8. Verificar políticas criadas
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
WHERE tablename = 'disc_tests'
ORDER BY policyname;

-- 9. Testar se o usuário autenticado consegue inserir
-- (Este SELECT deve retornar o UUID do usuário autenticado)
SELECT auth.uid() as current_user_id;
