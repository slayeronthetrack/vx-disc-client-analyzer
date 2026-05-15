# 🔍 DIAGNÓSTICO - Loading Infinito

## 🐛 Problema

A página fica carregando infinitamente em `localhost:3000`.

---

## 🔍 Passo 1: Verificar Console do Navegador

Você já está com o DevTools aberto (F12). Agora:

1. **Clique na aba "Console"** (ao lado de "Elements")
2. **Procure por erros em vermelho**
3. **Me envie o que aparecer**

### Erros Comuns:

#### ❌ "Failed to fetch" ou "Network Error"
**Causa**: Servidor não está respondendo ou CORS

#### ❌ "Unauthorized" ou "403 Forbidden"
**Causa**: Problema de autenticação

#### ❌ "infinite recursion detected"
**Causa**: RLS policy com recursão (precisa executar SQL)

#### ❌ "Loading timeout"
**Causa**: useAuth hook travado

---

## 🔍 Passo 2: Verificar Network

1. **Clique na aba "Network"** no DevTools
2. **Recarregue a página** (F5)
3. **Procure por requisições em vermelho** (status 4xx ou 5xx)
4. **Clique na requisição com erro**
5. **Veja a aba "Response"**
6. **Me envie o erro**

---

## 🔍 Passo 3: Verificar Terminal do Servidor

No terminal onde você executou `npm run dev`:

1. **Procure por erros**
2. **Procure por warnings**
3. **Me envie o que aparecer**

### Erros Comuns no Servidor:

#### ❌ "EADDRINUSE: address already in use"
**Causa**: Porta 3000 já está em uso

**Solução**:
```powershell
# Matar processo na porta 3000
netstat -ano | findstr :3000
# Anote o PID (último número)
taskkill /PID <número> /F

# Tentar novamente
npm run dev
```

#### ❌ "Module not found"
**Causa**: Dependências não instaladas

**Solução**:
```powershell
npm install
npm run dev
```

---

## 🔧 Solução Rápida: Executar SQL Primeiro

O loading infinito pode ser causado pela recursão nas RLS policies.

**Execute AGORA no Supabase**:

1. Abra: https://supabase.com/dashboard → SQL Editor
2. Copie: `supabase/SOLUCAO_COMPLETA_RLS.sql` (TODO)
3. Cole e clique "Run"
4. Aguarde executar
5. **Recarregue a página** (F5)

---

## 🔧 Solução Alternativa: Limpar Cache e Cookies

1. No DevTools, clique com botão direito no ícone de **Reload** (ao lado da URL)
2. Selecione: **"Empty Cache and Hard Reload"**
3. Aguarde recarregar

Ou:

1. `Ctrl + Shift + Delete`
2. Marque: Cookies + Cache
3. Clique: "Limpar dados"
4. Feche o navegador
5. Abra novamente
6. Acesse: http://localhost:3000

---

## 🔧 Solução Drástica: Desabilitar RLS Temporariamente

**APENAS PARA TESTE LOCAL!**

Execute no Supabase SQL Editor:

```sql
-- DESABILITAR RLS (APENAS PARA TESTE!)
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
ALTER TABLE companies DISABLE ROW LEVEL SECURITY;
ALTER TABLE company_tests DISABLE ROW LEVEL SECURITY;
ALTER TABLE disc_tests DISABLE ROW LEVEL SECURITY;
```

Depois recarregue a página.

**Se funcionar**, o problema é nas RLS policies. Execute `SOLUCAO_COMPLETA_RLS.sql` e reabilite RLS:

```sql
-- REABILITAR RLS
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;
ALTER TABLE company_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;
```

---

## 📊 Checklist de Diagnóstico

- [ ] Verificou Console do navegador?
  - Qual erro aparece?

- [ ] Verificou Network do navegador?
  - Qual requisição está falhando?
  - Qual é o status code? (401, 403, 500?)

- [ ] Verificou Terminal do servidor?
  - Servidor iniciou corretamente?
  - Apareceu "Ready"?

- [ ] Executou SQL no Supabase?
  - `SOLUCAO_COMPLETA_RLS.sql`

- [ ] Limpou cache do navegador?
  - Ctrl + Shift + Delete

---

## 🆘 Me Envie

Para eu ajudar melhor, me envie:

1. **Screenshot do Console** (aba Console do DevTools)
2. **Screenshot do Network** (aba Network do DevTools)
3. **Texto do Terminal** (onde roda npm run dev)
4. **Você executou o SQL** no Supabase? (Sim/Não)

---

**Vamos resolver isso!** 💪
