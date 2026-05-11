# 🔧 Corrigir Todas as APIs - Admin Role

## 🎯 Problema

Todas as API routes estão verificando apenas `['admin', 'super_admin']`, mas precisam aceitar também `'company_admin'`.

Além disso, o código de verificação está duplicado em múltiplos arquivos.

---

## ✅ Solução Aplicada

### 1. Criado Helper Centralizado

**Arquivo**: `lib/utils/apiAuth.ts`

```typescript
export async function checkAdminAccess() {
  // Verifica se user é admin, super_admin ou company_admin
  // Retorna { authorized: true, user, profile, supabase }
  // ou { authorized: false, response: NextResponse }
}
```

### 2. Atualizado `app/api/companies/route.ts`

✅ Já usa o helper `checkAdminAccess()`

---

## 📋 Arquivos que Precisam ser Atualizados

### API Routes com Admin Check:

1. ✅ `app/api/companies/route.ts` - **CORRIGIDO**
2. ❌ `app/api/companies/[id]/route.ts` - Precisa corrigir (3 métodos)
3. ❌ `app/api/companies/[id]/stats/route.ts` - Precisa corrigir
4. ❌ `app/api/companies/[id]/tests/route.ts` - Precisa corrigir
5. ❌ `app/api/admin/metrics/route.ts` - Precisa corrigir
6. ❌ `app/api/admin/activity/route.ts` - Precisa corrigir

---

## 🔧 Como Corrigir Manualmente

### Passo 1: Adicionar Import

```typescript
import { checkAdminAccess } from '@/lib/utils/apiAuth';
```

### Passo 2: Substituir Código de Verificação

**ANTES**:
```typescript
// Check authentication
const supabase = await createClient();
const { data: { user }, error: authError } = await supabase.auth.getUser();

if (authError || !user) {
  return NextResponse.json(
    { error: 'Unauthorized' },
    { status: 401 }
  );
}

// Check if user is admin
const { data: profile } = await supabase
  .from('profiles')
  .select('role')
  .eq('user_id', user.id)
  .single();

if (!profile || !['admin', 'super_admin'].includes(profile.role)) {
  return NextResponse.json(
    { error: 'Forbidden - Admin access required' },
    { status: 403 }
  );
}
```

**DEPOIS**:
```typescript
// Check admin access
const authCheck = await checkAdminAccess();
if (!authCheck.authorized) {
  return authCheck.response;
}

const { user, supabase } = authCheck;
```

---

## 🚀 Solução Automática

Vou atualizar todos os arquivos automaticamente agora.

---

## ✅ Benefícios

1. **Código centralizado**: Fácil de manter
2. **Aceita todos os roles de admin**: `admin`, `super_admin`, `company_admin`
3. **Melhor logging**: Mostra qual role foi rejeitado
4. **Type-safe**: TypeScript sabe quando `authorized` é `true`

---

## 📝 Após Correção

Depois de corrigir todos os arquivos:

1. **Reinicie o servidor** (se estiver rodando)
2. **Limpe o cache** do navegador
3. **Faça logout e login** novamente
4. **Teste criar empresa** no admin

Deve funcionar! ✅
