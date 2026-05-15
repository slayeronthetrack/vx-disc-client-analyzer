# 🔧 CORRIGIR RLS DO CHAT - INSTRUÇÕES

## Problema Identificado
As mensagens do chat não estão sendo salvas no banco de dados devido às políticas RLS (Row Level Security) muito restritivas.

## Solução
Execute o SQL abaixo no Supabase SQL Editor para permitir inserção e leitura de mensagens:

### Passo 1: Acessar Supabase
1. Acesse: https://supabase.com/dashboard/project/eolvvdmzeifbeugkhkyg
2. Vá em **SQL Editor** no menu lateral

### Passo 2: Executar SQL
Copie e execute o conteúdo do arquivo `fix-chat-messages-rls.sql`:

```sql
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
```

### Passo 3: Verificar
Após executar, você deve ver:
- ✅ `DROP POLICY` (pode dar erro se não existir, tudo bem)
- ✅ `CREATE POLICY` (2x)

### Passo 4: Testar
Execute os testes novamente:
```bash
node test-fase-3-3-chat.js
```

## Nota de Segurança
⚠️ **IMPORTANTE**: Essas políticas são permissivas para facilitar o desenvolvimento.

Em produção, você deve:
1. Usar políticas baseadas em `auth.uid()`
2. Configurar `SUPABASE_SERVICE_ROLE_KEY` no `.env.local`
3. Usar cliente admin server-side

## Alternativa: Service Role Key
Se preferir não alterar as políticas, adicione a Service Role Key:

1. Acesse: https://supabase.com/dashboard/project/eolvvdmzeifbeugkhkyg/settings/api
2. Copie a **service_role key** (secret)
3. Adicione no `.env.local`:
```env
SUPABASE_SERVICE_ROLE_KEY=sua_service_role_key_aqui
```
4. Reinicie o servidor: `npm run dev`
