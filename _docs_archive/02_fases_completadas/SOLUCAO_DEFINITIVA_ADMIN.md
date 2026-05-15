# 🔧 SOLUÇÃO DEFINITIVA - Criar Admin e Corrigir Acesso

## 🎯 Problema Identificado

Você está recebendo "Unauthorized" porque:

1. ✅ **Perfil criado** com role `super_admin` 
2. ❌ **RLS Policies** só aceitam role `admin`
3. ❌ **Código TypeScript** só verificava role `admin`

## 🛠️ Solução Completa

### Parte 1: Código TypeScript (JÁ CORRIGIDO ✅)

Atualizei automaticamente:
- ✅ `lib/hooks/useAuth.ts` - Agora aceita `super_admin`
- ✅ `lib/services/profileService.ts` - Agora aceita `super_admin`

### Parte 2: Banco de Dados (VOCÊ PRECISA EXECUTAR)

Execute **2 scripts SQL** no Supabase Dashboard:

---

## 📋 PASSO A PASSO

### 1️⃣ Abrir Supabase Dashboard

1. Acesse: https://supabase.com/dashboard
2. Selecione seu projeto
3. Vá em **SQL Editor** (menu lateral esquerdo)

---

### 2️⃣ Executar Script 1: Criar Perfil Admin

**Arquivo**: `supabase/FIX_ROLES_E_CRIAR_ADMIN.sql`

**O que faz**:
- Remove constraint antiga que só aceita 'user' e 'admin'
- Adiciona nova constraint que aceita 'super_admin'
- Cria seu perfil admin com email automático

**Como executar**:
1. Clique em **"New query"**
2. Copie TODO o conteúdo de `supabase/FIX_ROLES_E_CRIAR_ADMIN.sql`
3. Cole no editor
4. Clique em **"Run"** (ou Ctrl + Enter)
5. Verifique se apareceu: `✅ SUCESSO! Você é super admin!`

---

### 3️⃣ Executar Script 2: Corrigir RLS Policies

**Arquivo**: `supabase/FIX_RLS_ADMIN_ROLES.sql`

**O que faz**:
- Atualiza TODAS as RLS policies para aceitar múltiplos roles de admin
- Corrige acesso a: profiles, disc_tests, companies, company_tests, question_bank, etc.

**Como executar**:
1. Clique em **"New query"** novamente
2. Copie TODO o conteúdo de `supabase/FIX_RLS_ADMIN_ROLES.sql`
3. Cole no editor
4. Clique em **"Run"** (ou Ctrl + Enter)
5. Verifique se apareceu: `✅ TEM ACESSO ADMIN`

---

### 4️⃣ Limpar Cache e Fazer Login

**IMPORTANTE**: O navegador pode ter cache da sessão antiga!

1. **Feche TODAS as abas** do localhost:3000
2. **Limpe o cache**:
   - Chrome/Edge: `Ctrl + Shift + Delete`
   - Marque "Cookies" e "Cache"
   - Clique em "Limpar dados"
3. **Abra nova aba**
4. Acesse: http://localhost:3000/login
5. **Faça login** com suas credenciais
6. Acesse: http://localhost:3000/admin

**Deve funcionar!** ✅

---

## 🔍 Verificar se Funcionou

### No Supabase Dashboard

Execute esta query no SQL Editor:

```sql
-- Verificar seu perfil
SELECT 
  p.user_id,
  p.email,
  p.full_name,
  p.role,
  p.profile_completed,
  CASE 
    WHEN p.role IN ('admin', 'super_admin', 'company_admin') THEN '✅ TEM ACESSO ADMIN'
    ELSE '❌ SEM ACESSO ADMIN'
  END as status
FROM profiles p
WHERE p.user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';
```

**Resultado esperado**:
- `role` = `super_admin`
- `status` = `✅ TEM ACESSO ADMIN`

### No Sistema

1. Acesse: http://localhost:3000/admin
2. **Se carregar o dashboard** = Funcionou! ✅
3. **Se mostrar "Unauthorized"** = Ainda tem problema ❌

---

## ❌ Troubleshooting

### Erro: "Unauthorized" ainda aparece

**Causa**: Cache do navegador ou sessão antiga

**Solução**:
1. Abra o console do navegador (F12)
2. Vá na aba "Application" (Chrome) ou "Storage" (Firefox)
3. Expanda "Cookies"
4. Delete TODOS os cookies de localhost:3000
5. Feche o navegador completamente
6. Abra novamente e faça login

### Erro: "constraint does not exist"

**Não é problema!** Significa que a constraint já foi removida antes.

### Erro: "policy already exists"

**Não é problema!** O script usa `DROP POLICY IF EXISTS` antes de criar.

### Erro: "relation does not exist"

**Problema!** Alguma tabela não existe. Verifique se executou as migrations:
- `supabase/migrations/CONSOLIDATED_MIGRATIONS.sql`

---

## 🧪 Testar o Sistema

Depois que o admin funcionar:

### 1. Dashboard
- Acesse: http://localhost:3000/admin
- Deve mostrar métricas e atividades

### 2. Criar Empresa
- Acesse: http://localhost:3000/admin/companies/new
- Preencha o formulário
- Clique em "Criar Empresa"
- Deve criar sem erros

### 3. Listar Empresas
- Acesse: http://localhost:3000/admin/companies
- Deve mostrar a empresa criada

### 4. Ver Detalhes
- Clique em "Ver Detalhes" na empresa
- Deve mostrar informações completas

---

## 📊 Resumo das Mudanças

### Código TypeScript (Automático ✅)

| Arquivo | Mudança |
|---------|---------|
| `lib/hooks/useAuth.ts` | Aceita `admin`, `super_admin`, `company_admin` |
| `lib/services/profileService.ts` | Aceita `admin`, `super_admin`, `company_admin` |

### Banco de Dados (Manual - Você Executa)

| Script | O que faz |
|--------|-----------|
| `FIX_ROLES_E_CRIAR_ADMIN.sql` | Cria perfil admin com constraint correta |
| `FIX_RLS_ADMIN_ROLES.sql` | Atualiza todas as RLS policies |

---

## 🎯 Checklist Final

Antes de testar:

- [ ] Executou `FIX_ROLES_E_CRIAR_ADMIN.sql` no Supabase
- [ ] Executou `FIX_RLS_ADMIN_ROLES.sql` no Supabase
- [ ] Verificou que role = `super_admin` no banco
- [ ] Limpou cache do navegador
- [ ] Fechou todas as abas do localhost:3000
- [ ] Fez login novamente
- [ ] Tentou acessar `/admin`

---

## 🚀 Próximos Passos

Depois que o admin funcionar:

1. **Criar empresas** no painel admin
2. **Testar o fluxo completo** de criação/edição
3. **Implementar visualizações** de gráficos DISC
4. **Criar portal público** de testes
5. **Implementar exportação** de PDF

---

## 📝 Roles Disponíveis

| Role | Acesso Admin | Descrição |
|------|--------------|-----------|
| `super_admin` | ✅ Sim | Acesso total ao sistema |
| `company_admin` | ✅ Sim | Admin de empresa específica |
| `admin` | ✅ Sim | Admin limitado |
| `manager` | ❌ Não | Gerente de equipe |
| `viewer` | ❌ Não | Apenas visualização |
| `user` | ❌ Não | Usuário comum |

**Para testes, use sempre `super_admin`!**

---

## 🆘 Precisa de Ajuda?

Se ainda não funcionar, me avise:

1. **Qual erro aparece?** (copie a mensagem completa)
2. **Em qual passo você está?**
3. **O que a query de verificação retornou?**
4. **Tem algum erro no console do navegador?** (F12)

**Estou aqui para ajudar!** 💪
