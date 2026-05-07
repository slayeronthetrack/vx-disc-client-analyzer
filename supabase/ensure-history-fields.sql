-- Migration: Garantir campos para histórico de testes
-- Adiciona campos se não existirem (safe migration)

-- Verificar e adicionar question_count se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'question_count'
  ) THEN
    ALTER TABLE disc_tests ADD COLUMN question_count INTEGER DEFAULT 20;
    COMMENT ON COLUMN disc_tests.question_count IS 'Número de perguntas respondidas no teste';
  END IF;
END $$;

-- Verificar e adicionar question_source se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'question_source'
  ) THEN
    ALTER TABLE disc_tests ADD COLUMN question_source TEXT DEFAULT 'legacy';
    COMMENT ON COLUMN disc_tests.question_source IS 'Origem das perguntas: ai, fallback, legacy';
  END IF;
END $$;

-- Verificar e adicionar user_context se não existir
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'user_context'
  ) THEN
    ALTER TABLE disc_tests ADD COLUMN user_context JSONB;
    COMMENT ON COLUMN disc_tests.user_context IS 'Contexto do usuário no momento do teste (cargo, empresa, objetivo)';
  END IF;
END $$;

-- Criar índices para melhorar performance de queries de histórico
CREATE INDEX IF NOT EXISTS idx_disc_tests_user_created 
  ON disc_tests(user_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_disc_tests_user_profile 
  ON disc_tests(user_id, dominant_profile);

CREATE INDEX IF NOT EXISTS idx_disc_tests_created 
  ON disc_tests(created_at DESC);

-- Garantir RLS policies para histórico
-- Policy: Usuário pode ver apenas seus próprios testes
DROP POLICY IF EXISTS "Users can view own tests" ON disc_tests;
CREATE POLICY "Users can view own tests"
  ON disc_tests
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Usuário pode inserir apenas seus próprios testes
DROP POLICY IF EXISTS "Users can insert own tests" ON disc_tests;
CREATE POLICY "Users can insert own tests"
  ON disc_tests
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode atualizar apenas seus próprios testes
DROP POLICY IF EXISTS "Users can update own tests" ON disc_tests;
CREATE POLICY "Users can update own tests"
  ON disc_tests
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Usuário pode deletar apenas seus próprios testes (se necessário)
DROP POLICY IF EXISTS "Users can delete own tests" ON disc_tests;
CREATE POLICY "Users can delete own tests"
  ON disc_tests
  FOR DELETE
  USING (auth.uid() = user_id);

-- Comentários para documentação
COMMENT ON TABLE disc_tests IS 'Armazena todos os testes DISC realizados pelos usuários';
COMMENT ON COLUMN disc_tests.id IS 'ID único do teste (UUID)';
COMMENT ON COLUMN disc_tests.user_id IS 'ID do usuário que realizou o teste';
COMMENT ON COLUMN disc_tests.created_at IS 'Data e hora de conclusão do teste';
COMMENT ON COLUMN disc_tests.dominant_profile IS 'Perfil DISC dominante (D, I, S, C)';
COMMENT ON COLUMN disc_tests.scores IS 'Pontuações DISC (D, I, S, C)';
COMMENT ON COLUMN disc_tests.dominant_values IS 'Array de valores dominantes (Teoria dos Valores)';
COMMENT ON COLUMN disc_tests.psychological_profile IS 'Perfil psicológico completo (MBTI-like)';

-- Verificar se RLS está habilitado
ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;

-- Mensagem de sucesso
DO $$
BEGIN
  RAISE NOTICE 'Migration concluída com sucesso!';
  RAISE NOTICE 'Campos verificados/adicionados: question_count, question_source, user_context';
  RAISE NOTICE 'Índices criados para otimizar queries de histórico';
  RAISE NOTICE 'RLS policies atualizadas para segurança';
END $$;
