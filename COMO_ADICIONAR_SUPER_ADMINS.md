# 🔐 Como Adicionar Super Admins

## 📋 E-mails para Super Admin

- `marcosrodriguesmwrf@gmail.com`
- `gestao.vx1@gmail.com`

---

## ⚠️ PRÉ-REQUISITOS

**Os usuários DEVEM ter se registrado no sistema primeiro!**

Se ainda não se registraram:
1. Acesse: https://vx-comercial-disc-analyzer.vercel.app/register
2. Crie uma conta com cada e-mail
3. Depois execute os scripts abaixo

---

## 🚀 MÉTODO 1: Script Simples (Usuários Já Existem)

### Passo 1: Abrir Supabase Dashboard
1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

### Passo 2: Executar Script
1. Clique em **"New Query"**
2. Abra o arquivo: `supabase/add-super-admins.sql`
3. Copie todo o conteúdo
4. Cole no SQL Editor
5. Clique em **"Run"** (ou pressione Ctrl+Enter)

### Passo 3: Verificar Resultado
Você deve ver uma tabela com:
```
email                           | role         | created_at | updated_at
--------------------------------|--------------|------------|------------
marcosrodriguesmwrf@gmail.com   | super_admin  | ...        | ...
gestao.vx1@gmail.com            | super_admin  | ...        | ...
```

---

## 🔧 MÉTODO 2: Script Completo (Cria se Não Existir)

### Quando Usar
- Se não tem certeza se os usuários já se registraram
- Para criar/atualizar perfis automaticamente

### Passos
1. Abra o Supabase SQL Editor
2. Abra o arquivo: `supabase/create-super-admins-if-not-exists.sql`
3. Copie e cole no editor
4. Execute o script
5. Verifique o resultado final

---

## ✅ VERIFICAÇÃO

### Testar no Sistema
1. Faça login com um dos e-mails
2. Acesse: `/admin/admins`
3. Você deve ver a página de gerenciamento de admins
4. Essa página só aparece para super_admin

### Verificar no Banco
Execute no SQL Editor:
```sql
SELECT 
  u.email,
  p.role
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.role DESC, u.email;
```

---

## 🎯 DIFERENÇAS ENTRE ROLES

### **super_admin** (Novo)
- ✅ Acesso total ao sistema
- ✅ Pode gerenciar empresas
- ✅ Pode ver analytics
- ✅ **Pode adicionar/remover admins** (exclusivo)
- ✅ Acesso à página `/admin/admins`

### **admin**
- ✅ Pode gerenciar empresas
- ✅ Pode ver analytics
- ❌ **NÃO pode gerenciar outros admins**
- ❌ Não vê a página `/admin/admins`

### **user**
- ✅ Pode fazer testes DISC
- ✅ Pode ver histórico próprio
- ❌ Sem acesso ao painel admin

---

## 🔄 REMOVER SUPER ADMIN

Se precisar remover o acesso super_admin de alguém:

```sql
UPDATE profiles
SET role = 'admin'  -- ou 'user'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'email@exemplo.com'
);
```

---

## 📞 TROUBLESHOOTING

### Problema: "0 rows affected"
**Causa**: Usuário não existe no sistema
**Solução**: 
1. Peça para o usuário se registrar primeiro
2. Execute o script novamente

### Problema: "Não vejo a página /admin/admins"
**Causa**: Role não foi atualizado ou cache do navegador
**Solução**:
1. Verifique o role no banco de dados
2. Faça logout e login novamente
3. Limpe o cache do navegador (Ctrl+Shift+R)

### Problema: "Permission denied"
**Causa**: RLS policies bloqueando
**Solução**: Execute os scripts como admin do Supabase (não via API)

---

## 📝 LOGS DE AUDITORIA

Para ver quem tem acesso admin:

```sql
SELECT 
  u.email,
  p.role,
  p.created_at as "Conta Criada",
  p.updated_at as "Última Atualização"
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin')
ORDER BY p.role DESC, p.created_at DESC;
```

---

## ✨ PRONTO!

Após executar o script, os 2 e-mails terão acesso completo de super_admin! 🎉
