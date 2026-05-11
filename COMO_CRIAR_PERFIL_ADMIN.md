# 👤 Como Criar Perfil Admin - Guia Passo a Passo

## 🎯 Objetivo

Criar um usuário com permissões de **super_admin** para acessar o painel administrativo.

---

## 📋 Método 1: Usando Usuário Existente (Recomendado)

### Passo 1: Encontrar seu User ID

1. **Abra o Supabase Dashboard**
   - URL: https://supabase.com/dashboard/project/SEU_PROJECT_ID

2. **Vá em Authentication → Users**
   - Menu lateral esquerdo
   - Clique em "Authentication"
   - Clique em "Users"

3. **Encontre seu usuário**
   - Procure pelo seu email
   - Clique no usuário

4. **Copie o UUID**
   - Você verá algo como: `a1b2c3d4-e5f6-7890-abcd-ef1234567890`
   - Copie este UUID completo

### Passo 2: Executar SQL no Supabase

1. **Vá em SQL Editor**
   - Menu lateral esquerdo
   - Clique em "SQL Editor"
   - Clique em "New query"

2. **Cole este código** (substitua o UUID):

```sql
-- SUBSTITUA 'SEU_USER_ID_AQUI' pelo UUID que você copiou!
INSERT INTO profiles (
  user_id,
  full_name,
  role,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'SEU_USER_ID_AQUI',  -- ⚠️ COLE SEU UUID AQUI!
  'Admin Sistema',
  'super_admin',
  true,
  NOW(),
  NOW()
)
ON CONFLICT (user_id) 
DO UPDATE SET
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW();
```

3. **Clique em "Run"** (ou pressione Ctrl + Enter)

4. **Verifique se funcionou**:

```sql
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.profile_completed
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'super_admin';
```

**Deve aparecer seu usuário com role = 'super_admin'** ✅

### Passo 3: Fazer Login Novamente

1. **Faça LOGOUT** do sistema
   - http://localhost:3000
   - Clique em "Sair" ou vá para `/login`

2. **Faça LOGIN** novamente
   - Use o mesmo email e senha

3. **Acesse o Admin**
   - http://localhost:3000/admin
   - **Deve funcionar!** ✅

---

## 📋 Método 2: Criar Novo Usuário Admin

### Passo 1: Criar Usuário no Supabase

1. **Vá em Authentication → Users**

2. **Clique em "Add user"** (botão verde no canto superior direito)

3. **Preencha o formulário**:
   ```
   Email: admin@teste.com
   Password: Admin123!
   Auto Confirm User: ✅ (IMPORTANTE: marque esta opção!)
   ```

4. **Clique em "Create user"**

5. **Copie o UUID** do usuário criado

### Passo 2: Criar Perfil Admin

1. **Vá em SQL Editor**

2. **Execute este SQL** (substitua o UUID):

```sql
INSERT INTO profiles (
  user_id,
  full_name,
  role,
  profile_completed,
  created_at,
  updated_at
)
VALUES (
  'UUID_DO_USUARIO_CRIADO',  -- ⚠️ COLE O UUID AQUI!
  'Admin Sistema',
  'super_admin',
  true,
  NOW(),
  NOW()
);
```

### Passo 3: Fazer Login

1. **Acesse**: http://localhost:3000/login

2. **Faça login com**:
   ```
   Email: admin@teste.com
   Password: Admin123!
   ```

3. **Acesse**: http://localhost:3000/admin

4. **Deve funcionar!** ✅

---

## 📋 Método 3: Atualizar Perfil Existente

Se você já tem um perfil mas não é admin:

### SQL para Atualizar

```sql
-- Primeiro, encontre seu user_id
SELECT 
  id as user_id,
  email
FROM auth.users
WHERE email = 'seu-email@exemplo.com';  -- ⚠️ SUBSTITUA SEU EMAIL!

-- Depois, atualize o perfil
UPDATE profiles
SET 
  role = 'super_admin',
  profile_completed = true,
  updated_at = NOW()
WHERE user_id = 'SEU_USER_ID_AQUI';  -- ⚠️ COLE O UUID AQUI!
```

---

## 🔍 Verificar se Funcionou

### No Supabase Dashboard

1. **Vá em Table Editor → profiles**

2. **Procure seu usuário**

3. **Verifique**:
   - `role` = `super_admin` ✅
   - `profile_completed` = `true` ✅

### No Sistema

1. **Faça login**

2. **Acesse**: http://localhost:3000/admin

3. **Se aparecer o dashboard** = Funcionou! ✅

4. **Se redirecionar para home** = Não funcionou ❌

---

## ❌ Troubleshooting

### Erro: "violates foreign key constraint"

**Causa**: O user_id não existe na tabela `auth.users`

**Solução**:
1. Verifique se copiou o UUID correto
2. Verifique se o usuário existe em Authentication → Users

### Erro: "duplicate key value"

**Causa**: O perfil já existe

**Solução**: Use UPDATE em vez de INSERT:
```sql
UPDATE profiles
SET role = 'super_admin'
WHERE user_id = 'SEU_USER_ID';
```

### Erro: "Forbidden - Admin access required"

**Causa**: O perfil não foi atualizado ou você não fez logout/login

**Solução**:
1. Verifique se o role está como `super_admin` no banco
2. Faça LOGOUT
3. Faça LOGIN novamente
4. Tente acessar `/admin` novamente

### Erro: Redireciona para home ao acessar /admin

**Causa**: Middleware de autenticação não reconhece como admin

**Solução**:
1. Abra o console do navegador (F12)
2. Execute:
   ```javascript
   const { data: { session } } = await supabase.auth.getSession();
   console.log('User:', session?.user);
   ```
3. Verifique se o usuário está logado
4. Faça logout e login novamente

---

## 📊 Verificar Todos os Perfis

Execute este SQL para ver todos os perfis:

```sql
SELECT 
  p.user_id,
  u.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role = 'super_admin' THEN '✅ SUPER ADMIN'
    WHEN p.role = 'admin' THEN '⚠️ Admin'
    ELSE '❌ Usuário comum'
  END as status,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
ORDER BY p.created_at DESC;
```

---

## 🎯 Checklist Final

Antes de testar o sistema, verifique:

- [ ] Usuário existe em Authentication → Users
- [ ] Perfil existe na tabela `profiles`
- [ ] Campo `role` = `super_admin`
- [ ] Campo `profile_completed` = `true`
- [ ] Fez LOGOUT do sistema
- [ ] Fez LOGIN novamente
- [ ] Consegue acessar `/admin`

---

## 📝 Roles Disponíveis

| Role | Descrição | Acesso |
|------|-----------|--------|
| `super_admin` | Administrador total | ✅ Tudo |
| `admin` | Administrador limitado | ⚠️ Parcial |
| `company_admin` | Admin de empresa | 🏢 Sua empresa |
| `manager` | Gerente de equipe | 👥 Sua equipe |
| `viewer` | Apenas visualização | 👁️ Somente leitura |
| `user` | Usuário comum (padrão) | ❌ Sem acesso admin |

**Para testes, use sempre `super_admin`!**

---

## 🚀 Após Criar o Perfil

1. **Faça logout**: http://localhost:3000/login
2. **Faça login** com o usuário admin
3. **Acesse**: http://localhost:3000/admin
4. **Teste criar uma empresa**
5. **Deve funcionar!** ✅

---

**Precisa de ajuda? Me avise qual erro está aparecendo!** 🆘
