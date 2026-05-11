# 🔧 CONFIGURAR LOCALHOST NO SUPABASE

## 🎯 Objetivo

Adicionar `http://localhost:3000` nas URLs permitidas do Supabase para poder testar localmente.

---

## 📋 Passo a Passo

### 1️⃣ Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Faça login (se necessário)
3. Selecione seu projeto

---

### 2️⃣ Ir para Authentication Settings

1. No menu lateral esquerdo, clique em: **Authentication**
2. Clique em: **URL Configuration** (ou **Settings**)

---

### 3️⃣ Adicionar Site URL

Procure por: **Site URL**

**Adicione**:
```
http://localhost:3000
```

---

### 4️⃣ Adicionar Redirect URLs

Procure por: **Redirect URLs** (ou **Additional Redirect URLs**)

**Adicione estas URLs** (uma por linha):

```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/**
https://vx-comercial-disc-analyzer.vercel.app
https://vx-comercial-disc-analyzer.vercel.app/auth/callback
https://vx-comercial-disc-analyzer.vercel.app/**
```

---

### 5️⃣ Salvar

Clique em: **Save** (ou **Update**)

---

## ✅ Configuração Completa

Depois de salvar, você deve ter:

### Site URL:
```
http://localhost:3000
```

### Redirect URLs:
```
http://localhost:3000
http://localhost:3000/auth/callback
http://localhost:3000/**
https://vx-comercial-disc-analyzer.vercel.app
https://vx-comercial-disc-analyzer.vercel.app/auth/callback
https://vx-comercial-disc-analyzer.vercel.app/**
```

---

## 🎯 Depois de Configurar

1. ✅ Execute SQL: `supabase/SOLUCAO_COMPLETA_RLS.sql`
2. ✅ Acesse: http://localhost:3000
3. ✅ Faça login
4. ✅ Teste criar empresa

---

## 📸 Onde Encontrar

### Caminho Completo:

```
Supabase Dashboard
  → Seu Projeto
    → Authentication (menu lateral)
      → URL Configuration
        → Site URL
        → Redirect URLs
```

---

## ⚠️ IMPORTANTE

- **Site URL**: Deve ser apenas UMA URL (use localhost para desenvolvimento)
- **Redirect URLs**: Pode ter VÁRIAS URLs (adicione localhost E vercel)

---

## 🔍 Verificar se Funcionou

Depois de salvar:

1. Acesse: http://localhost:3000/login
2. Tente fazer login
3. **Deve funcionar** sem erros de redirect

Se der erro de redirect = URLs não foram salvas corretamente

---

## 🆘 Se Não Encontrar

Procure por:
- **Authentication** → **Settings**
- **Authentication** → **Providers** → **Email**
- **Project Settings** → **Authentication**

Ou me avise e vou te ajudar a encontrar!

---

**Configure agora e me avise quando terminar!** 🔧
