# 🔧 VERIFICAR VARIÁVEIS DE AMBIENTE NA VERCEL

## 🎯 Situação Atual

O deploy está **Building** na Vercel. Enquanto aguarda, vamos garantir que as variáveis de ambiente estão configuradas.

---

## ✅ Variáveis Necessárias

O projeto precisa destas variáveis de ambiente:

### Supabase (ESSENCIAIS):
- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`

### OpenAI (ESSENCIAL):
- `OPENAI_API_KEY`

### App (OPCIONAL):
- `NEXT_PUBLIC_APP_URL` (pode ser a URL da Vercel)

---

## 🔍 Como Verificar na Vercel

### 1. Abrir Configurações

1. Acesse: https://vercel.com/dashboard
2. Clique no projeto: **vx-comercial-disc-analyzer**
3. Clique em: **Settings** (menu superior)
4. Clique em: **Environment Variables** (menu lateral)

### 2. Verificar se Existem

Você deve ver as variáveis listadas:

```
NEXT_PUBLIC_SUPABASE_URL          ✅
NEXT_PUBLIC_SUPABASE_ANON_KEY     ✅
SUPABASE_SERVICE_ROLE_KEY         ✅
OPENAI_API_KEY                    ✅
```

### 3. Se Faltarem Variáveis

**Adicione as que faltam**:

1. Clique em: **Add New**
2. Preencha:
   - **Key**: Nome da variável (ex: `NEXT_PUBLIC_SUPABASE_URL`)
   - **Value**: Valor da variável (pegue do Supabase Dashboard)
   - **Environments**: Marque **Production**, **Preview**, **Development**
3. Clique em: **Save**

---

## 📊 Onde Pegar os Valores

### Supabase Variables

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em: **Settings** → **API**
4. Copie:
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** → `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   - **service_role** → `SUPABASE_SERVICE_ROLE_KEY` (⚠️ Mantenha secreto!)

### OpenAI API Key

1. Acesse: https://platform.openai.com/api-keys
2. Copie sua API key
3. Use em: `OPENAI_API_KEY`

---

## ⚠️ IMPORTANTE: Service Role Key

**NUNCA** use `SUPABASE_SERVICE_ROLE_KEY` no frontend!

- ✅ **Correto**: Usar apenas em API routes (server-side)
- ❌ **Errado**: Usar em componentes client-side

O código já está correto, usando apenas `ANON_KEY` no frontend.

---

## 🔄 Depois de Adicionar Variáveis

Se você adicionou ou alterou variáveis:

1. **Vá em**: Deployments
2. **Clique nos 3 pontinhos** do deploy mais recente
3. **Clique**: "Redeploy"
4. **Aguarde** novo deploy

---

## 🎯 Aguardar Deploy Atual

O deploy atual está rodando. Aguarde:

- 🟡 **Building** → Compilando (2-5 minutos)
- 🟢 **Ready** → Sucesso!
- 🔴 **Error** → Erro (veja os logs)

---

## 📋 Checklist

- [ ] Variáveis de ambiente configuradas na Vercel?
- [ ] `NEXT_PUBLIC_SUPABASE_URL` existe?
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` existe?
- [ ] `SUPABASE_SERVICE_ROLE_KEY` existe?
- [ ] `OPENAI_API_KEY` existe?
- [ ] Deploy completou?
- [ ] Status é "Ready"?

---

## 🆘 Se Deploy Falhar

### Ver Logs do Erro

1. Clique no deploy com erro
2. Veja a aba **"Build Logs"**
3. Procure por:
   - `Error:` (mensagens de erro)
   - `Failed to compile` (erro de compilação)
   - `Module not found` (dependência faltando)
4. **Me envie o erro**

---

**Aguarde o deploy completar e verifique as variáveis de ambiente!** 🔧
