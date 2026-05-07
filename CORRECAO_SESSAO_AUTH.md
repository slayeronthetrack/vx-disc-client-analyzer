# Correção: Sessão de Autenticação (Bug 2)

**Data**: 2026-05-06  
**Status**: ✅ CORRIGIDO

---

## 🔍 PROBLEMA IDENTIFICADO

### Sintoma
```
[Test] API error: {}
Console: Auth session missing!
```

### Causa Raiz
O **middleware não estava atualizando a sessão do Supabase**, causando:

1. **Cookies desatualizados**: Session tokens expiravam sem refresh
2. **API routes sem autenticação**: `createClient()` no servidor não encontrava sessão válida
3. **Erro vazio no frontend**: Error object vazio `{}` sendo logado

---

## ✅ CORREÇÕES APLICADAS

### 1. Middleware com Session Refresh ✅

**Arquivo**: `middleware.ts`

**Antes**:
```typescript
// Middleware desabilitado - permitia tudo
export async function middleware(req: NextRequest) {
  return NextResponse.next();
}
```

**Depois**:
```typescript
// Middleware com refresh automático de sessão
export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: { headers: req.headers },
  });

  // Criar cliente Supabase com cookie handling
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return req.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            req.cookies.set(name, value);
            response.cookies.set(name, value, options); // ← Atualiza cookies
          });
        },
      },
    }
  );

  // Refresh session automaticamente
  const { data: { user } } = await supabase.auth.getUser();

  // Proteção de rotas
  if (!user && isPrivateRoute) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return response; // ← Retorna response com cookies atualizados
}
```

**Benefícios**:
- ✅ Session tokens são automaticamente renovados
- ✅ Cookies são atualizados em cada request
- ✅ API routes recebem sessão válida
- ✅ Proteção de rotas ativada

---

### 2. Melhor Tratamento de Erros ✅

**Arquivo**: `app/test/page.tsx`

**Antes**:
```typescript
console.error('[Test] API error:', errorData);
throw new Error(errorData.details || errorData.error || 'Erro');
```

**Depois**:
```typescript
console.error('[Test] API error:', {
  status: aiResponse.status,
  statusText: aiResponse.statusText,
  url: aiResponse.url,
  headers: Object.fromEntries(aiResponse.headers.entries()),
  errorData,
  errorText,
});

// Mensagem específica por status code
let errorMessage = 'Erro ao calcular resultado';
if (aiResponse.status === 401) {
  errorMessage = 'Sessão expirada. Por favor, faça login novamente.';
} else if (aiResponse.status === 403) {
  errorMessage = 'Acesso negado. Verifique suas permissões.';
} else if (errorData.details) {
  errorMessage = errorData.details;
}

throw new Error(errorMessage);
```

**Benefícios**:
- ✅ Logs completos com headers e status
- ✅ Mensagens de erro específicas por tipo
- ✅ Usuário sabe exatamente o que fazer (ex: "faça login novamente")

---

### 3. Logs Detalhados na API ✅

**Arquivo**: `app/api/ai/calculate-result/route.ts`

**Antes**:
```typescript
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  console.error('[calculate-result] Authentication error:', {
    error: authError?.message,
    hasUser: !!user,
  });
  return NextResponse.json({ error: 'Usuário não autenticado' }, { status: 401 });
}
```

**Depois**:
```typescript
console.log('[calculate-result] Checking authentication...');

const { data: { user }, error: authError } = await supabase.auth.getUser();

console.log('[calculate-result] Auth check result:', {
  hasUser: !!user,
  userId: user?.id,
  userEmail: user?.email,
  authError: authError?.message,
  authErrorCode: authError?.status,
});

if (authError || !user) {
  console.error('[calculate-result] Authentication failed:', {
    error: authError?.message,
    code: authError?.status,
    name: authError?.name,
    hasUser: !!user,
  });
  return NextResponse.json(
    { 
      error: 'Usuário não autenticado', 
      details: 'Sua sessão expirou. Por favor, faça login novamente.',
      code: 'AUTH_SESSION_MISSING',
    },
    { status: 401 }
  );
}
```

**Benefícios**:
- ✅ Logs antes e depois da verificação
- ✅ Mostra userId, email, error code
- ✅ Retorna código de erro estruturado
- ✅ Mensagem clara para o usuário

---

## 🎯 PRÓXIMOS PASSOS

### 1. Executar SQL de RLS Policies ⚠️ PENDENTE

**Arquivo**: `supabase/fix-rls-policies.sql`

**O que fazer**:
1. Abrir Supabase Dashboard
2. Ir em **SQL Editor**
3. Copiar e colar o conteúdo de `supabase/fix-rls-policies.sql`
4. Executar

**O que o SQL faz**:
```sql
-- Habilita RLS
ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;

-- Cria políticas
CREATE POLICY "Users can insert their own tests"
ON disc_tests FOR INSERT TO authenticated
WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own tests"
ON disc_tests FOR SELECT TO authenticated
USING (auth.uid() = user_id);

-- ... (UPDATE e DELETE também)
```

**Por que é necessário**:
- ✅ Protege dados: usuários só veem seus próprios testes
- ✅ Permite INSERT: sem isso, `discTestService.saveTest()` falha
- ✅ Segurança: RLS garante isolamento de dados

---

### 2. Testar Fluxo Completo ✅ PRONTO PARA TESTAR

**Fluxo**:
1. Login → `/login`
2. Completar perfil → `/profile`
3. Iniciar teste → `/test`
4. Responder 20 perguntas
5. Finalizar teste → chama `/api/ai/calculate-result`
6. Ver resultado → `/result`

**O que esperar**:
- ✅ Middleware atualiza sessão automaticamente
- ✅ API route recebe usuário autenticado
- ✅ Teste é salvo com sucesso
- ✅ Redirecionamento para `/result`

**Se der erro 401**:
- Mensagem clara: "Sessão expirada. Por favor, faça login novamente."
- Fazer logout e login novamente
- Verificar se RLS policies foram executadas

---

## 📊 RESUMO DAS MUDANÇAS

| Arquivo | Mudança | Status |
|---------|---------|--------|
| `middleware.ts` | Session refresh automático | ✅ |
| `app/test/page.tsx` | Melhor tratamento de erros | ✅ |
| `app/api/ai/calculate-result/route.ts` | Logs detalhados | ✅ |
| `supabase/fix-rls-policies.sql` | RLS policies | ⚠️ EXECUTAR |

---

## 🔧 COMO FUNCIONA AGORA

### Fluxo de Autenticação

```
1. Usuário faz login
   ↓
2. Supabase cria session tokens
   ↓
3. Tokens salvos em cookies
   ↓
4. Middleware intercepta requests
   ↓
5. Middleware chama supabase.auth.getUser()
   ↓
6. Supabase verifica tokens
   ↓
7. Se expirado: refresh automático
   ↓
8. Cookies atualizados no response
   ↓
9. API routes recebem sessão válida
   ↓
10. discTestService.saveTest() funciona
```

### Proteção de Rotas

```
Rota Privada (/test, /profile, /result)
   ↓
Middleware verifica: user existe?
   ↓
   ├─ SIM → permite acesso
   └─ NÃO → redireciona para /login
```

---

## 🐛 DEBUGGING

### Se ainda der erro 401:

1. **Verificar cookies no browser**:
   - Abrir DevTools → Application → Cookies
   - Procurar por cookies do Supabase (sb-*)
   - Se não existirem: fazer logout e login novamente

2. **Verificar logs no console**:
   ```
   [calculate-result] Checking authentication...
   [calculate-result] Auth check result: { hasUser: true, userId: '...' }
   ```
   - Se `hasUser: false`: sessão não está sendo passada

3. **Verificar RLS policies**:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'disc_tests';
   ```
   - Deve retornar 4 policies (INSERT, SELECT, UPDATE, DELETE)

4. **Verificar variáveis de ambiente**:
   ```bash
   NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
   ```

---

## ✅ CHECKLIST FINAL

- [x] Middleware atualiza sessão automaticamente
- [x] Proteção de rotas ativada
- [x] Logs detalhados em API routes
- [x] Mensagens de erro específicas
- [ ] **RLS policies executadas no Supabase** ⚠️ PENDENTE
- [ ] **Teste completo do fluxo** ⚠️ PENDENTE

---

## 📝 NOTAS IMPORTANTES

1. **Middleware é crítico**: Sem ele, sessões expiram e API routes falham
2. **RLS é obrigatório**: Sem policies, INSERT falha mesmo com sessão válida
3. **Cookies são a chave**: Session tokens são armazenados em cookies HTTP-only
4. **Refresh é automático**: Middleware renova tokens antes de expirarem

---

**Próxima ação**: Executar `supabase/fix-rls-policies.sql` no Supabase SQL Editor
