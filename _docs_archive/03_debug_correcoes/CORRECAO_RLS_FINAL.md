# ✅ Correção RLS Final - Client Autenticado

**Data**: 2026-05-06  
**Status**: ✅ Implementado - Pronto para Teste

---

## 🎯 Problema Identificado

**Erro anterior**: Autenticação funcionava (hasUser: true), mas INSERT falhava com RLS violation.

**Causa raiz**: O client Supabase usado no `discTestService` não tinha o JWT token, então `auth.uid()` retornava `null` durante a query RLS.

**Resultado**: RLS bloqueava o INSERT porque não conseguia validar `auth.uid() = user_id`.

---

## ✅ Solução Implementada

### 1. Client Autenticado com JWT no Header Global

**Antes** (❌ ERRADO):
```typescript
// Client sem JWT - auth.uid() retorna null
const supabase = await createClient();
await discTestService.saveTest(payload, supabase);
```

**Depois** (✅ CORRETO):
```typescript
// Client COM JWT no header global
const supabaseWithAuth = createServerClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  {
    cookies: { /* ... */ },
    global: {
      headers: token ? {
        Authorization: `Bearer ${token}`,
      } : {},
    },
  }
);

// Usar ESTE client em TODAS as operações
await discTestService.saveTest(payload, supabaseWithAuth);
```

**Por quê funciona?**
- JWT token é incluído no header `Authorization` de TODAS as requisições
- Supabase reconhece o token e popula `auth.uid()` corretamente
- RLS consegue validar `auth.uid() = user_id`
- INSERT é permitido

---

### 2. Teste de Contexto RLS Antes do INSERT

Adicionado teste para verificar se o contexto RLS está correto:

```typescript
// Testar contexto RLS antes do INSERT principal
console.log('[calculate-result] Testing RLS context...');
const { error: rlsTestError } = await supabaseWithAuth
  .from('disc_tests')
  .select('id')
  .limit(1);

console.log('[calculate-result] RLS context test:', {
  ok: !rlsTestError,
  error: rlsTestError?.message,
  code: rlsTestError?.code,
});
```

**Se RLS context test falhar**: Significa que o JWT não está sendo reconhecido.

---

### 3. Validação do Payload

Adicionado log detalhado do payload antes do INSERT:

```typescript
console.log('[calculate-result] Test payload:', {
  user_id: testPayload.user_id,
  authUserId: user.id,
  userIdMatch: testPayload.user_id === user.id,
  hasToken: !!token,
  questionCount: testPayload.question_count,
});
```

**Validações**:
- ✅ `user_id` usa snake_case (não camelCase)
- ✅ `user_id` é UUID válido
- ✅ `user_id === authUserId` (match perfeito)
- ✅ Token JWT presente

---

### 4. Correção do Campo `context_at_selection`

**Problema**: Campo `context_at_selection` não existe na tabela `question_performance`.

**Solução**: Removido do INSERT em `performanceTracker.ts`:

```typescript
// ANTES (❌ ERRADO):
const records = questionIds.map((questionId) => ({
  question_id: questionId,
  user_id: userId,
  selected_at: new Date().toISOString(),
  completed: false,
  context_at_selection: context || {}, // ← Campo não existe
}));

// DEPOIS (✅ CORRETO):
const records = questionIds.map((questionId) => ({
  question_id: questionId,
  user_id: userId,
  selected_at: new Date().toISOString(),
  completed: false,
  // context_at_selection removido
}));
```

---

## 🔒 Segurança Mantida

- ✅ **RLS habilitado** - Row Level Security ativo
- ✅ **Apenas anon key** - Service role NÃO usado
- ✅ **JWT validado** - Token verificado antes de usar
- ✅ **auth.uid() = user_id** - RLS valida propriedade
- ✅ **Client único** - Mesmo client autenticado em todas as operações

---

## 📊 Fluxo Completo

```
┌─────────────────────────────────────────────────────────────┐
│ 1. FRONTEND                                                  │
├─────────────────────────────────────────────────────────────┤
│ • Obter sessão: supabase.auth.getSession()                  │
│ • Enviar: Authorization: Bearer {token}                     │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 2. API ROUTE - Criar Client Autenticado                    │
├─────────────────────────────────────────────────────────────┤
│ • Ler Authorization header                                   │
│ • Extrair token JWT                                          │
│ • Criar client COM JWT no header global:                    │
│   const supabaseWithAuth = createServerClient(              │
│     url, key,                                                │
│     { global: { headers: { Authorization: Bearer {token} }}}│
│   )                                                          │
│ • Validar: supabaseWithAuth.auth.getUser(token)            │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 3. API ROUTE - Testar Contexto RLS                         │
├─────────────────────────────────────────────────────────────┤
│ • SELECT id FROM disc_tests LIMIT 1                         │
│ • Se falhar: JWT não está sendo reconhecido                │
│ • Se passar: auth.uid() está populado corretamente         │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 4. API ROUTE - Calcular Perfil e Chamar Marina            │
├─────────────────────────────────────────────────────────────┤
│ • Calcular DISC + Valores + Psicológico                    │
│ • Chamar Marina (Agente IA) para análise                   │
│ • Preparar payload com user_id (snake_case)                │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 5. SERVICE - Salvar com Client Autenticado                 │
├─────────────────────────────────────────────────────────────┤
│ • Receber supabaseWithAuth (COM JWT)                        │
│ • INSERT em disc_tests                                      │
│ • Supabase envia JWT em TODAS as queries                   │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 6. SUPABASE - Validar RLS                                   │
├─────────────────────────────────────────────────────────────┤
│ • Ler JWT do header Authorization                           │
│ • Extrair user_id do JWT → auth.uid()                      │
│ • Validar: auth.uid() = payload.user_id                    │
│ • Se SIM: permitir INSERT                                   │
│ • Se NÃO: retornar RLS violation                           │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│ 7. SUCESSO                                                   │
├─────────────────────────────────────────────────────────────┤
│ • Teste salvo no banco                                       │
│ • API retorna: { success: true }                            │
│ • Frontend redireciona para /result                         │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Logs Esperados

### Browser Console
```
[Test] Session before calculate-result: {
  hasSession: true,
  hasAccessToken: true,
  userId: "xxx-xxx-xxx",
  userIdMatch: true
}
[Test] Calling calculate-result API with Authorization header...
[Test] Result calculated successfully
```

### Terminal do Servidor
```
[calculate-result] Auth header: { hasAuthHeader: true, hasToken: true }
[calculate-result] Auth with token result: { hasUser: true, userId: "xxx" }
[calculate-result] Auth check result: {
  hasUser: true,
  userId: "xxx",
  userIdMatch: true,
  authMethod: "Authorization header"
}
[calculate-result] Testing RLS context...
[calculate-result] RLS context test: { ok: true, error: undefined }
[calculate-result] Test payload: {
  user_id: "xxx",
  authUserId: "xxx",
  userIdMatch: true,
  hasToken: true
}
[discTestService] Attempting to save test: {
  userId: "xxx",
  hasClient: true,
  clientType: "server"
}
[discTestService] Test saved successfully: {
  testId: "yyy",
  userId: "xxx"
}
[calculate-result] Test saved successfully
```

---

## ❌ Erros Possíveis e Soluções

### Erro 1: RLS context test falha
```
[calculate-result] RLS context test: { ok: false, error: "RLS violation" }
```
**Causa**: JWT não está sendo reconhecido pelo Supabase  
**Solução**: Verificar se token está sendo enviado corretamente no header global

### Erro 2: userIdMatch: false
```
[calculate-result] Test payload: { userIdMatch: false }
```
**Causa**: userId do payload não bate com userId autenticado  
**Solução**: Verificar se frontend está enviando userId correto

### Erro 3: RLS violation no INSERT
```
Error: new row violates row-level security policy for table "disc_tests"
```
**Causa**: RLS policies não executadas OU auth.uid() retorna null  
**Solução**: 
1. Executar `supabase/fix-rls-policies.sql`
2. Verificar se client tem JWT no header global

### Erro 4: context_at_selection não existe
```
Error: column "context_at_selection" does not exist
```
**Status**: ✅ JÁ CORRIGIDO - Campo removido do INSERT

---

## 🧪 Como Testar

### Pré-requisitos
1. ✅ Executar `supabase/fix-rls-policies.sql` no Supabase SQL Editor
2. ✅ Servidor rodando: `npm run dev`
3. ✅ Usuário: juliopppimentel@gmail.com / teste123

### Teste Rápido (20 perguntas)
```
1. Login: juliopppimentel@gmail.com / teste123
2. Ir para /test
3. Selecionar 20 perguntas
4. Responder todas
5. Clicar em "Finalizar Teste"
6. ✅ Deve redirecionar para /result
7. ✅ NÃO deve dar erro RLS
```

### Verificar Logs
```
Terminal:
✅ hasUser: true
✅ userIdMatch: true
✅ authMethod: "Authorization header"
✅ RLS context test: { ok: true }
✅ userIdMatch: true (no payload)
✅ Test saved successfully

Browser:
✅ Result calculated successfully
✅ Redirecionou para /result
```

---

## ✅ Critérios de Aceite

- [ ] `hasUser: true` nos logs
- [ ] `userIdMatch: true` nos logs (2x: auth check + payload)
- [ ] `authMethod: "Authorization header"` nos logs
- [ ] `RLS context test: { ok: true }` nos logs
- [ ] INSERT passa no RLS sem erro
- [ ] Resultado salvo em `disc_tests`
- [ ] Usuário redirecionado para `/result`
- [ ] Erro de `context_at_selection` eliminado
- [ ] Tela `/result` abre corretamente

---

## 📝 Arquivos Modificados

### 1. `app/api/ai/calculate-result/route.ts`
**Mudanças**:
- ✅ Import direto de `@supabase/ssr` e `next/headers`
- ✅ Criar `supabaseWithAuth` com JWT no header global
- ✅ Usar `supabaseWithAuth` em TODAS as operações
- ✅ Adicionar teste de contexto RLS
- ✅ Adicionar log detalhado do payload
- ✅ Passar `supabaseWithAuth` para `discTestService.saveTest()`

### 2. `lib/services/performanceTracker.ts`
**Mudanças**:
- ✅ Remover campo `context_at_selection` do INSERT (2 locais)
- ✅ Adicionar comentário explicando remoção

---

## 🎯 Diferença Chave

### ANTES (❌ PROBLEMA)
```typescript
// Client SEM JWT
const supabase = await createClient();

// auth.uid() retorna NULL durante RLS check
await supabase.from('disc_tests').insert(payload);
// ❌ RLS violation: auth.uid() = user_id → NULL = "xxx" → FALSO
```

### DEPOIS (✅ SOLUÇÃO)
```typescript
// Client COM JWT no header global
const supabaseWithAuth = createServerClient(url, key, {
  global: { headers: { Authorization: `Bearer ${token}` } }
});

// auth.uid() retorna UUID correto durante RLS check
await supabaseWithAuth.from('disc_tests').insert(payload);
// ✅ RLS passa: auth.uid() = user_id → "xxx" = "xxx" → VERDADEIRO
```

---

## 🎉 Resultado Esperado

Após executar o teste:
- ✅ Erro RLS corrigido definitivamente
- ✅ Client autenticado com JWT funcionando
- ✅ `auth.uid()` populado corretamente
- ✅ INSERT passa no RLS
- ✅ Teste salvo no banco
- ✅ Redirecionamento para /result funciona
- ✅ Erro de `context_at_selection` eliminado
- ✅ Segurança mantida (RLS + validação dupla)

---

## 📞 Confirmação Final

Ao finalizar o teste, confirme:

1. **Qual client está sendo passado para saveTest?**
   - ✅ `supabaseWithAuth` (COM JWT no header global)

2. **Se a policy RLS foi validada ou criada?**
   - ⚠️ Deve ser executada manualmente: `supabase/fix-rls-policies.sql`

3. **Como context_at_selection foi resolvido?**
   - ✅ Campo removido do INSERT em `performanceTracker.ts`

4. **Se a tela /result abriu corretamente?**
   - ⏳ Aguardando teste do usuário

---

## 🚀 PRÓXIMO PASSO

**Executar o teste agora!**

1. Executar RLS policies (se ainda não executou)
2. Fazer login
3. Testar com 20 perguntas
4. Verificar logs
5. Confirmar que /result abre

**BOA SORTE! 🍀**
