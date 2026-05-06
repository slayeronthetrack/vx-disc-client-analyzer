# ⚡ Validação Rápida - Antes de Testar

**Execute esta checklist ANTES de testar o erro 401**

---

## ✅ Checklist Pré-Teste

### 1. Servidor Rodando
```bash
# Verificar se servidor está rodando
# Deve mostrar: ✓ Ready in X ms
# URL: http://localhost:3000

# Se não estiver rodando:
npm run dev
```

### 2. Variáveis de Ambiente
```bash
# Verificar se .env.local existe e tem as variáveis:
# - NEXT_PUBLIC_SUPABASE_URL
# - NEXT_PUBLIC_SUPABASE_ANON_KEY
# - OPENAI_API_KEY

# Se não existir, copiar de .env.example:
cp .env.example .env.local
# E preencher com valores reais
```

### 3. RLS Policies Executadas
```sql
-- IMPORTANTE: Executar no Supabase SQL Editor
-- Arquivo: supabase/fix-rls-policies.sql

-- Como executar:
-- 1. Abrir Supabase Dashboard
-- 2. Ir para SQL Editor
-- 3. Copiar conteúdo de supabase/fix-rls-policies.sql
-- 4. Colar e executar
-- 5. Verificar mensagem: ✅ RLS Policies configured successfully!
```

### 4. Banco de Dados com Perguntas
```sql
-- Verificar se há perguntas no banco
SELECT COUNT(*) FROM question_bank WHERE is_active = true;

-- Deve retornar: 60 ou mais perguntas
-- Se retornar 0, executar: supabase/FINAL_fix_and_populate.sql
```

### 5. Usuário de Teste Existe
```
Email: juliopppimentel@gmail.com
Senha: teste123

Se não existir:
1. Ir para http://localhost:3000/register
2. Criar conta com esses dados
3. Completar perfil em /profile
```

---

## 🧪 Teste Rápido (1 minuto)

### Passo 1: Login
```
1. Abrir http://localhost:3000/login
2. Email: juliopppimentel@gmail.com
3. Senha: teste123
4. Clicar em "Entrar"
5. ✅ Deve entrar em 1-2 segundos (não 10-30s)
6. ✅ Deve redirecionar para /dashboard ou /profile
```

### Passo 2: Verificar Sessão
```
1. Abrir DevTools (F12)
2. Console
3. Executar:
   const { data } = await supabase.auth.getSession();
   console.log(data.session);
4. ✅ Deve mostrar session com access_token
```

### Passo 3: Teste Mínimo (20 perguntas)
```
1. Ir para http://localhost:3000/test
2. Selecionar "20 perguntas"
3. Clicar em "Iniciar Teste"
4. Responder 20 perguntas (pode clicar aleatoriamente)
5. Clicar em "Finalizar Teste"
6. ✅ Deve redirecionar para /result
7. ✅ NÃO deve mostrar erro 401
```

---

## 📊 Logs Esperados

### Browser Console (F12)
```
[Test] Getting current session...
[Test] Session before calculate-result: { hasSession: true, hasAccessToken: true }
[Test] Calling calculate-result API with Authorization header...
[Test] Result calculated successfully
```

### Terminal do Servidor
```
[calculate-result] Request received: { userId: "xxx", answersCount: 20 }
[calculate-result] Auth header: { hasAuthHeader: true, hasToken: true }
[calculate-result] Auth with token result: { hasUser: true }
[calculate-result] User authenticated: { userId: "xxx" }
[discTestService] Test saved successfully
```

---

## ❌ Problemas Comuns

### Problema 1: Servidor não inicia
```bash
# Erro: Port 3000 is in use
# Solução:
taskkill /PID <PID> /F
npm run dev
```

### Problema 2: 401 Unauthorized
```
Causa: RLS policies não executadas
Solução: Executar supabase/fix-rls-policies.sql no Supabase SQL Editor
```

### Problema 3: Sessão não encontrada
```
Causa: Cookies não salvos ou expirados
Solução: 
1. Limpar cookies do navegador
2. Fazer logout
3. Fazer login novamente
```

### Problema 4: Login lento (10-30s)
```
Causa: Middleware causando loop
Status: ✅ JÁ CORRIGIDO - Middleware desabilitado
Verificar: middleware.ts deve ter matcher: []
```

---

## ✅ Tudo Pronto?

Se todos os itens acima estão OK:
- ✅ Servidor rodando
- ✅ Variáveis de ambiente configuradas
- ✅ RLS policies executadas
- ✅ Banco com perguntas
- ✅ Usuário de teste existe
- ✅ Login rápido (1-2s)
- ✅ Sessão válida

**Você está pronto para testar!**

Siga as instruções em: `TESTE_401_CORRIGIDO.md`

---

## 🆘 Se Algo Falhar

1. **Verificar logs no terminal do servidor**
   - Procurar por `[calculate-result]`
   - Verificar se `hasAuthHeader: true`
   - Verificar se `hasUser: true`

2. **Verificar logs no browser console**
   - Procurar por `[Test]`
   - Verificar se `hasSession: true`
   - Verificar se `hasAccessToken: true`

3. **Verificar RLS no Supabase**
   - Dashboard → Authentication → Policies
   - Deve ter 4 policies para `disc_tests`
   - Todas devem estar habilitadas

4. **Verificar tabela disc_tests**
   - Dashboard → Table Editor → disc_tests
   - Verificar se RLS está habilitado (ícone de cadeado)

---

## 📞 Informações de Debug

Se precisar reportar erro, incluir:

```
1. Logs do browser console (F12)
2. Logs do terminal do servidor
3. Status HTTP da requisição (Network tab)
4. Screenshot do erro
5. Qual teste estava fazendo (20, 60 ou 100 perguntas)
```
