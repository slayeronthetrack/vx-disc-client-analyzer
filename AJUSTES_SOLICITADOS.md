# 🔧 Ajustes Solicitados - Sistema VX DISC

## Status Atual vs Solicitado

### ✅ 1. Redirecionamento Automático após Login
**Status:** JÁ IMPLEMENTADO ✅

**Funcionamento Atual:**
- Super admin/Admin → `/admin` ✅
- Company admin → `/company/dashboard` ✅
- Employee/User → `/dashboard` ✅

**Arquivo:** `lib/auth/permissions.ts` - função `getRedirectPathByRole()`

---

### 🔧 2. Simplificar Autenticação
**Status:** A IMPLEMENTAR

**Problema Atual:**
- Email "marcosrodriguesmwrf" não funciona (falta @dominio.com)
- Sistema exige validação por email

**Solução:**
1. Remover validação obrigatória de email
2. Admin pode criar usuários com email e senha diretamente
3. Permitir emails sem validação (ex: "marcosrodriguesmwrf@interno.com")

**Arquivos a modificar:**
- `app/register/page.tsx` - Remover validação de email
- `lib/services/authService.ts` - Ajustar criação de usuário
- Supabase Auth Settings - Desabilitar confirmação de email

---

### 🔧 3. Dashboard da Empresa - Área de Resultados
**Status:** PARCIALMENTE IMPLEMENTADO

**Já existe:**
- `/company/dashboard` - Dashboard principal ✅
- `/company/dashboard/employees/[testId]` - Ver resultado individual ✅
- Lista de funcionários com testes ✅

**A melhorar:**
- Design da área de resultados
- Visualização mais detalhada
- Comparação entre funcionários
- Relatórios personalizados

---

### 🔧 4. Sistema de Perguntas Flexível (20, 40, 60, 80)
**Status:** A IMPLEMENTAR

**Atual:**
- Apenas 24 perguntas fixas

**Solicitado:**
- Suporte para 20, 40, 60 e 80 perguntas
- Funcionários podem escolher quantidade
- Todas as IAs de cálculo disponíveis

**Implementação necessária:**
1. Criar banco de perguntas expandido
2. Permitir seleção de quantidade no início do teste
3. Ajustar cálculo DISC para diferentes quantidades
4. Manter compatibilidade com testes existentes

---

### 🔧 5. Melhorias de Design
**Status:** A DEFINIR

**Áreas a melhorar:**
- Dashboard da empresa
- Página de resultados
- Fluxo de teste
- Página de convites

---

## 🎯 Prioridades

### ALTA (Fazer Agora)
1. ✅ Simplificar autenticação (remover validação email)
2. ✅ Corrigir problema do email "marcosrodriguesmwrf"

### MÉDIA (Próxima Sprint)
3. Sistema de perguntas flexível (20/40/60/80)
4. Melhorar área de resultados no dashboard

### BAIXA (Backlog)
5. Melhorias gerais de design

---

## 📋 Plano de Implementação

### FASE 1: Autenticação Simplificada (30 min)

**1.1. Desabilitar confirmação de email no Supabase**
```sql
-- Executar no Supabase SQL Editor
UPDATE auth.config 
SET enable_signup = true,
    enable_email_confirmations = false;
```

**1.2. Atualizar validação de email**
- Permitir emails sem @ (uso interno)
- Adicionar sufixo automático se necessário

**1.3. Criar função para admin criar usuários**
- Nova página: `/admin/users/new`
- Form: email, senha, role, company (se company_admin)

---

### FASE 2: Sistema de Perguntas Flexível (2-3 horas)

**2.1. Expandir banco de perguntas**
```typescript
// data/questions-20.ts
// data/questions-40.ts
// data/questions-60.ts
// data/questions-80.ts
```

**2.2. Adicionar seleção de quantidade**
- Tela inicial do teste
- Escolher: 20, 40, 60 ou 80 perguntas
- Salvar escolha no teste

**2.3. Ajustar cálculo DISC**
- Adaptar para diferentes quantidades
- Manter precisão do resultado

---

### FASE 3: Melhorias de Design (1-2 horas)

**3.1. Dashboard da empresa**
- Cards de estatísticas mais visuais
- Gráficos interativos
- Filtros avançados

**3.2. Página de resultados**
- Layout mais limpo
- Visualização de perfil DISC
- Comparação com média da empresa
- Download de PDF melhorado

---

## 🚀 Começar Agora

Vou implementar na seguinte ordem:

1. **Simplificar autenticação** (ALTA)
   - Remover validação de email
   - Permitir emails internos
   - Admin cria usuários diretamente

2. **Corrigir email "marcosrodriguesmwrf"**
   - Adicionar sufixo @interno.com automaticamente
   - Ou permitir login sem @

3. **Sistema de perguntas flexível** (MÉDIA)
   - Criar banco de perguntas
   - Adicionar seleção
   - Ajustar cálculos

4. **Melhorias de design** (BAIXA)
   - Refinar UI/UX
   - Adicionar animações
   - Melhorar responsividade

---

## ❓ Dúvidas para Confirmar

1. **Email "marcosrodriguesmwrf":**
   - Quer que aceite sem @ ?
   - Ou adicionar @interno.com automaticamente?
   - Ou criar com @vxdisc.com?

2. **Perguntas:**
   - Já tem as perguntas para 40, 60 e 80?
   - Ou quer que eu gere baseado nas 24 existentes?

3. **Design:**
   - Tem referências de design que gosta?
   - Cores específicas além do laranja?
   - Algum dashboard que admira?

---

**Aguardando confirmação para começar! 🚀**
