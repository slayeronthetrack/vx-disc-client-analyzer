# 🚨 CORREÇÃO URGENTE - RLS Policy

## ⚠️ Problema Atual

Você está vendo a tela de resultado, mas o teste **NÃO FOI SALVO** devido ao erro de RLS:
```
Error: new row violates row-level security policy for table "disc_tests"
```

## ✅ Solução (2 minutos)

### Passo 1: Abrir Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto: **VX Teste DISC**
3. Clique em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar Migration

1. Clique em **New Query**
2. Cole o seguinte SQL:

```sql
-- Fix RLS Policies for disc_tests Table
-- Execute this in Supabase SQL Editor

-- Enable RLS
ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies (if any)
DROP POLICY IF EXISTS "Users can insert their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can view their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can update their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can delete their own tests" ON disc_tests;

-- Policy: INSERT - Users can insert their own tests
CREATE POLICY "Users can insert their own tests"
ON disc_tests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: SELECT - Users can view their own tests
CREATE POLICY "Users can view their own tests"
ON disc_tests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: UPDATE - Users can update their own tests
CREATE POLICY "Users can update their own tests"
ON disc_tests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE - Users can delete their own tests
CREATE POLICY "Users can delete their own tests"
ON disc_tests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- Verify policies
SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd
FROM pg_policies
WHERE tablename = 'disc_tests'
ORDER BY policyname;
```

3. Clique em **RUN** (ou pressione Ctrl+Enter)

### Passo 3: Verificar Sucesso

Você deve ver uma tabela com 4 policies:
- Users can insert their own tests
- Users can view their own tests
- Users can update their own tests
- Users can delete their own tests

### Passo 4: Testar Novamente

1. Volte para o navegador
2. Vá para: http://localhost:3000/test
3. Escolha **20 perguntas**
4. Responda todas as perguntas
5. Clique em **"Finalizar Teste"**
6. ✅ Deve salvar com sucesso agora!

---

## 🔍 Como Saber se Funcionou

### ✅ SUCESSO

**Console do Navegador**:
```javascript
[Test] Result calculated successfully
```

**Terminal do Servidor**:
```javascript
[calculate-result] User authenticated: { userId: '...', email: '...' }
[discTestService] Attempting to save test: { userId: '...', hasClient: true, clientType: 'server' }
[discTestService] Test saved successfully: { testId: '...', userId: '...' }
[calculate-result] Test saved successfully
```

### ❌ AINDA COM ERRO

**Console do Navegador**:
```javascript
[Test] API error: { ... }
Error saving test: { ... }
```

**Ação**: Copie TODO o log do terminal e me envie

---

## 📞 Se Não Funcionar

### Opção 1: Verificar se a Policy Foi Criada

No Supabase SQL Editor, execute:

```sql
SELECT 
  policyname,
  cmd,
  roles
FROM pg_policies
WHERE tablename = 'disc_tests';
```

Deve retornar 4 linhas (INSERT, SELECT, UPDATE, DELETE)

### Opção 2: Verificar se RLS Está Habilitado

No Supabase SQL Editor, execute:

```sql
SELECT 
  tablename,
  rowsecurity
FROM pg_tables
WHERE tablename = 'disc_tests';
```

Deve retornar `rowsecurity = true`

### Opção 3: Testar INSERT Manual

No Supabase SQL Editor, execute:

```sql
-- Substitua 'SEU_USER_ID' pelo seu ID real
INSERT INTO disc_tests (
  user_id,
  questions,
  answers,
  result,
  ai_analysis,
  dominant_profile,
  scores
) VALUES (
  'SEU_USER_ID',
  '[]'::jsonb,
  '[]'::jsonb,
  '{}'::jsonb,
  'Test',
  'D',
  '{"D":10,"I":5,"S":3,"C":2}'::jsonb
);
```

Se funcionar: Policy está OK  
Se falhar: Policy não foi criada corretamente

---

## 🚀 Resumo

1. ✅ Abrir Supabase Dashboard
2. ✅ Ir para SQL Editor
3. ✅ Colar e executar o SQL acima
4. ✅ Verificar que 4 policies foram criadas
5. ✅ Testar novamente no navegador

**Tempo estimado: 2 minutos**

---

**Execute a migration agora e teste novamente!** 🚀
