-- Corrigir RLS para ai_chat_messages
-- Permitir inserção e leitura para usuários autenticados e não autenticados (para testes)

-- Remover políticas antigas
DROP POLICY IF EXISTS "Users can view own messages" ON ai_chat_messages;
DROP POLICY IF EXISTS "Users can insert own messages" ON ai_chat_messages;

-- Criar políticas mais permissivas (temporário para testes)
CREATE POLICY "Anyone can view messages"
  ON ai_chat_messages FOR SELECT
  USING (true);

CREATE POLICY "Anyone can insert messages"
  ON ai_chat_messages FOR INSERT
  WITH CHECK (true);

-- Nota: Em produção, você deve restringir essas políticas para apenas usuários autenticados
