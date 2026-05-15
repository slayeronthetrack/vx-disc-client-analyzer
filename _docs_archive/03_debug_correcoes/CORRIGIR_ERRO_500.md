# 🔧 Como Corrigir o Erro 500 do Supabase

## 🔴 Problema Identificado

O Supabase está retornando **erro 500** ao tentar buscar o perfil do usuário.

**Erro:**
```
Failed to load resource: the server responded with a status of 500
eolvvdmzeifbeugkhkyg.supabase.co/rest/v1/profiles
```

**Causa:**
- A tabela `profiles` pode ter algum problema
- O trigger que cria perfil automaticamente pode não estar funcionando
- As políticas RLS podem estar bloqueando

---

## ✅ SOLUÇÃO RÁPIDA (5 minutos)

### Passo 1: Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login
3. Selecione seu projeto: **eolvvdmzeifbeugkhkyg**

### Passo 2: Abrir SQL Editor

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New query"**

### Passo 3: Executar SQL de Correção

**Copie e cole este SQL:**

```sql
-- 1. Recriar tabela profiles (se necessário)
DROP TABLE IF EXISTS profiles CASCADE;

CREATE TABLE profiles (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE NOT NULL,
  full_name TEXT NOT NULL DEFAULT '',
  email TEXT NOT NULL,
  role TEXT DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  job_title TEXT,
  company TEXT,
  test_objective TEXT,
  profile_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Criar índices
CREATE INDEX IF NOT EXISTS idx_profiles_user_id ON profiles(user_id);
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);

-- 3. Habilitar RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

-- 4. Criar políticas
DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;

CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- 5. Recriar função de trigger
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
EXCEPTION
  WHEN OTHERS THEN
    RAISE WARNING 'Error creating profile: %', SQLERRM;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Recriar trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
```

**Clique em "Run" ou pressione Ctrl+Enter**

### Passo 4: Criar Perfil Manualmente para Usuário Atual

**Seu user_id:** `cfce857c-7d22-4450-abe6-fc234a13c75a`

Execute este SQL (substitua os dados):

```sql
INSERT INTO profiles (user_id, email, full_name, profile_completed)
VALUES (
  'cfce857c-7d22-4450-abe6-fc234a13c75a',
  'seu@email.com', -- COLOQUE SEU EMAIL AQUI
  'Seu Nome',      -- COLOQUE SEU NOME AQUI
  false
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;
```

### Passo 5: Verificar se Funcionou

Execute este SQL:

```sql
SELECT * FROM profiles WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';
```

**Deve retornar 1 linha com seus dados!**

---

## 🧪 Testar no Sistema

1. **Volte para o navegador** (http://localhost:3001)
2. **Faça logout** (se estiver logado)
3. **Faça login novamente**
4. **Tente acessar /profile**

**Deve funcionar agora!** ✅

---

## 🔍 Se Ainda Não Funcionar

### Verificar se o perfil foi criado:

```sql
-- Ver todos os perfis
SELECT * FROM profiles;

-- Ver todos os usuários
SELECT id, email, created_at FROM auth.users;
```

### Verificar políticas RLS:

```sql
-- Ver políticas da tabela profiles
SELECT * FROM pg_policies WHERE tablename = 'profiles';
```

### Desabilitar RLS temporariamente (APENAS PARA TESTE):

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

**⚠️ IMPORTANTE:** Reabilite depois:
```sql
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
```

---

## 📝 Resumo

1. ✅ Execute o SQL de correção no Supabase
2. ✅ Crie o perfil manualmente para seu usuário
3. ✅ Verifique se o perfil foi criado
4. ✅ Teste no navegador

**Tempo estimado:** 5 minutos

---

## 🆘 Se Precisar de Ajuda

Me envie:
1. Screenshot do erro no SQL Editor (se houver)
2. Resultado do SELECT * FROM profiles
3. Logs do console do navegador após tentar novamente
