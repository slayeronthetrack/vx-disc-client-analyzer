# 🔧 Correção: Erro de Autenticação na API

## ❌ Problema Identificado

Ao tentar criar uma empresa, você recebeu o erro:
```
Unauthorized
```

**Causa**: As requisições para a API não estavam enviando o token JWT de autenticação no header `Authorization`.

---

## ✅ Solução Implementada

### 1. Criado Helper de API (`lib/utils/apiClient.ts`)

Criei funções helper que automaticamente adicionam o token de autenticação:

```typescript
import { apiPost, apiGet, apiPatch, apiDelete } from '@/lib/utils/apiClient';

// Exemplo de uso:
const response = await apiPost('/api/companies', data);
```

### 2. Corrigido: Página de Criação de Empresa

**Arquivo**: `app/admin/companies/new/page.tsx`

✅ **Antes** (sem autenticação):
```typescript
const response = await fetch('/api/companies', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(data),
});
```

✅ **Depois** (com autenticação):
```typescript
const { apiPost } = await import('@/lib/utils/apiClient');
const response = await apiPost('/api/companies', data);
```

### 3. Corrigido: Página de Edição de Empresa

**Arquivo**: `app/admin/companies/[id]/edit/page.tsx`

Aplicada a mesma correção para:
- `loadCompany()` - Agora usa token ao buscar empresa
- `handleSubmit()` - Agora usa token ao atualizar empresa

---

## 🧪 Como Testar Agora

### 1. Recarregue a Página

Pressione `Ctrl + Shift + R` (ou `Cmd + Shift + R` no Mac) para forçar reload sem cache.

### 2. Tente Criar uma Empresa Novamente

1. Acesse: http://localhost:3000/admin/companies/new
2. Preencha o formulário:
   ```
   Nome: Empresa Teste
   Slug: empresa-teste
   Email: contato@empresateste.com
   Telefone: (11) 99999-9999
   Limite: 100
   Cor: #FF6B35
   Status: Ativo
   ```
3. Clique em "Criar Empresa"

### 3. Resultado Esperado

✅ **Sucesso**: 
- Mensagem "Empresa criada com sucesso!"
- Redirecionamento para página de detalhes
- Empresa aparece na lista

❌ **Se ainda der erro**:
- Verifique se você está logado
- Verifique se seu usuário tem role `super_admin` no Supabase
- Veja o console do navegador (F12) para mais detalhes

---

## 🔍 Verificar Autenticação

### No Console do Navegador (F12)

Execute este código para verificar se você está autenticado:

```javascript
// Verificar sessão
const { data: { session } } = await supabase.auth.getSession();
console.log('Session:', session);
console.log('User:', session?.user);
console.log('Token:', session?.access_token);
```

### No Supabase Dashboard

1. Vá em **Authentication** → **Users**
2. Encontre seu usuário
3. Vá em **Table Editor** → **profiles**
4. Verifique se o campo `role` está como `super_admin`

---

## 📝 Outras Páginas que Precisam de Correção

As seguintes páginas ainda fazem requisições sem autenticação e precisam ser atualizadas:

### ⚠️ Páginas Admin (Precisam de Token)

1. **Dashboard** (`app/admin/page.tsx`)
   - `loadDashboardData()` - 3 requisições sem token

2. **Lista de Empresas** (`app/admin/companies/page.tsx`)
   - `loadCompanies()` - sem token
   - `handleDelete()` - sem token

3. **Detalhes da Empresa** (`app/admin/companies/[id]/page.tsx`)
   - `loadCompanyData()` - 2 requisições sem token
   - `loadCompanyTests()` - sem token
   - `handleDelete()` - sem token

### ✅ Como Corrigir Cada Uma

**Padrão de correção**:

```typescript
// ANTES
const response = await fetch('/api/companies');

// DEPOIS
const { apiGet } = await import('@/lib/utils/apiClient');
const response = await apiGet('/api/companies');
```

```typescript
// ANTES
const response = await fetch('/api/companies/123', { method: 'DELETE' });

// DEPOIS
const { apiDelete } = await import('@/lib/utils/apiClient');
const response = await apiDelete('/api/companies/123');
```

---

## 🚀 Próximos Passos

### Opção 1: Testar Criação de Empresa Agora
Tente criar uma empresa novamente e veja se funciona!

### Opção 2: Corrigir Todas as Páginas
Posso atualizar todas as páginas admin para usar o helper de autenticação.

### Opção 3: Continuar com Outra Funcionalidade
Se a criação funcionar, podemos continuar implementando outras features.

---

## 💡 Dica: Verificar Erros de API

Sempre que uma requisição falhar, verifique:

1. **Console do navegador** (F12 → Console)
2. **Network tab** (F12 → Network)
   - Veja o status code (401 = não autenticado, 403 = sem permissão)
   - Veja os headers da requisição (tem Authorization?)
   - Veja a resposta do servidor

---

**Teste agora e me avise se funcionou! 🎉**
