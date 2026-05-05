# 📋 Requisitos: Sistema de Autenticação Completo

## 🎯 Objetivo

Implementar um sistema completo de autenticação para o VX DISC Client Analyzer, incluindo:
1. Cadastro de usuários (signup)
2. Recuperação de senha (forgot password)
3. Redefinição de senha (reset password)
4. Verificação de email

---

## 📝 Requisitos Funcionais

### 1. Cadastro de Usuários (Signup)

#### 1.1 Formulário de Cadastro Progressivo

**Passo 1 - Dados Essenciais (Obrigatório)**
- Nome completo
- Email (único)
- Senha (mínimo 8 caracteres, 1 letra, 1 número)
- Confirmar senha
- Empresa/Organização
- Checkbox: Aceitar Termos de Uso

**Passo 2 - Dados Profissionais (Opcional)**
- Telefone/WhatsApp
- Cargo/Função (select)
- Tamanho da empresa (select)
- Setor/Indústria (select)
- Botão: "Continuar" ou "Pular"

**Passo 3 - Preferências (Opcional)**
- Como conheceu o VX DISC? (select)
- Objetivo principal (select)
- Checkbox: Aceitar receber emails de marketing
- Botão: "Finalizar" ou "Pular"

#### 1.2 Validações

**Email:**
- Formato válido
- Único no sistema
- Não permitir emails descartáveis (temp-mail.org, etc.)

**Senha:**
- Mínimo 8 caracteres
- Pelo menos 1 letra
- Pelo menos 1 número
- Indicador de força (Fraca/Média/Forte)
- Confirmar senha deve ser igual

**Nome:**
- Mínimo 2 caracteres
- Máximo 100 caracteres

**Empresa:**
- Mínimo 2 caracteres
- Máximo 100 caracteres

#### 1.3 Fluxo de Cadastro

1. Usuário preenche Passo 1
2. Sistema valida dados
3. Sistema cria conta (status: não verificado)
4. Sistema envia email de verificação
5. Usuário é redirecionado para Passo 2 (ou pode pular)
6. Usuário preenche Passo 2 (opcional)
7. Usuário é redirecionado para Passo 3 (ou pode pular)
8. Usuário preenche Passo 3 (opcional)
9. Usuário é redirecionado para dashboard
10. Banner: "Verifique seu email para ativar sua conta"

---

### 2. Verificação de Email

#### 2.1 Envio de Email de Verificação

**Quando enviar:**
- Imediatamente após cadastro
- Quando usuário solicitar reenvio

**Conteúdo do email:**
- Assunto: "Verifique seu email - VX DISC"
- Saudação personalizada
- Link de verificação (token único, expira em 24h)
- Botão: "Verificar Email"
- Texto alternativo com link completo

#### 2.2 Verificação de Email

**Fluxo:**
1. Usuário clica no link do email
2. Sistema valida token
3. Se válido: marca email como verificado
4. Se inválido/expirado: mostra erro e opção de reenviar
5. Redireciona para dashboard com mensagem de sucesso

---

### 3. Recuperação de Senha (Forgot Password)

#### 3.1 Solicitar Recuperação

**Página:** `/forgot-password`

**Formulário:**
- Email
- Botão: "Enviar Link de Recuperação"

**Validações:**
- Email deve estar cadastrado
- Não revelar se email existe (segurança)

**Fluxo:**
1. Usuário informa email
2. Sistema valida formato
3. Sistema busca usuário no banco
4. Se existe: envia email de recuperação
5. Se não existe: não envia, mas mostra mesma mensagem (segurança)
6. Mostra mensagem: "Se o email estiver cadastrado, você receberá um link de recuperação"

#### 3.2 Email de Recuperação

**Conteúdo:**
- Assunto: "Recuperação de Senha - VX DISC"
- Saudação personalizada
- Explicação: "Você solicitou recuperação de senha"
- Link de redefinição (token único, expira em 1h)
- Botão: "Redefinir Senha"
- Aviso: "Se você não solicitou, ignore este email"

#### 3.3 Redefinir Senha

**Página:** `/reset-password?token=xxx`

**Formulário:**
- Nova senha
- Confirmar nova senha
- Botão: "Redefinir Senha"

**Validações:**
- Token válido e não expirado
- Senha atende requisitos mínimos
- Senhas coincidem

**Fluxo:**
1. Usuário clica no link do email
2. Sistema valida token
3. Se válido: mostra formulário
4. Se inválido/expirado: mostra erro e link para solicitar novo
5. Usuário define nova senha
6. Sistema atualiza senha (hash bcrypt)
7. Sistema invalida token usado
8. Redireciona para login com mensagem de sucesso

---

### 4. Segurança

#### 4.1 Tokens

**Verificação de Email:**
- Token único (UUID v4)
- Expira em 24 horas
- Armazenado no banco com hash

**Recuperação de Senha:**
- Token único (UUID v4)
- Expira em 1 hora
- Armazenado no banco com hash
- Invalidado após uso

#### 4.2 Rate Limiting

**Signup:**
- 5 tentativas por IP / 15 minutos

**Forgot Password:**
- 3 tentativas por IP / 15 minutos
- 1 email por usuário / 5 minutos

**Reset Password:**
- 5 tentativas por token / 15 minutos

#### 4.3 Senhas

- Hash com bcrypt (cost factor 12)
- Nunca armazenar em texto plano
- Nunca enviar por email
- Validar força no frontend e backend

---

## 🗄️ Estrutura do Banco de Dados

### Tabela: `users`

```sql
CREATE TABLE users (
  -- Identificação
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Dados Essenciais
  name VARCHAR(100) NOT NULL,
  email VARCHAR(255) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  company VARCHAR(100) NOT NULL,
  
  -- Dados Profissionais
  phone VARCHAR(20),
  is_phone_whatsapp BOOLEAN DEFAULT false,
  role VARCHAR(50),
  company_size VARCHAR(50),
  industry VARCHAR(50),
  
  -- Preferências
  referral_source VARCHAR(50),
  primary_goal VARCHAR(100),
  
  -- Verificação
  email_verified BOOLEAN DEFAULT false,
  email_verified_at TIMESTAMPTZ,
  
  -- Perfil
  profile_completed BOOLEAN DEFAULT false,
  profile_completion_percentage INT DEFAULT 40,
  onboarding_step INT DEFAULT 1,
  
  -- Consentimentos (LGPD)
  terms_accepted BOOLEAN DEFAULT false,
  terms_accepted_at TIMESTAMPTZ,
  marketing_emails_consent BOOLEAN DEFAULT false,
  
  -- Auditoria
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  last_login_at TIMESTAMPTZ,
  deleted_at TIMESTAMPTZ,
  
  -- Índices
  CONSTRAINT users_email_key UNIQUE (email)
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_created_at ON users(created_at);
CREATE INDEX idx_users_email_verified ON users(email_verified);
```

### Tabela: `email_verification_tokens`

```sql
CREATE TABLE email_verification_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT email_verification_tokens_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_email_verification_tokens_token_hash 
  ON email_verification_tokens(token_hash);
CREATE INDEX idx_email_verification_tokens_user_id 
  ON email_verification_tokens(user_id);
CREATE INDEX idx_email_verification_tokens_expires_at 
  ON email_verification_tokens(expires_at);
```

### Tabela: `password_reset_tokens`

```sql
CREATE TABLE password_reset_tokens (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash VARCHAR(255) NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  CONSTRAINT password_reset_tokens_user_id_fkey 
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE INDEX idx_password_reset_tokens_token_hash 
  ON password_reset_tokens(token_hash);
CREATE INDEX idx_password_reset_tokens_user_id 
  ON password_reset_tokens(user_id);
CREATE INDEX idx_password_reset_tokens_expires_at 
  ON password_reset_tokens(expires_at);
```

---

## 🎨 Interface do Usuário

### Páginas a Criar

1. **`/signup`** - Cadastro (3 passos)
2. **`/verify-email`** - Verificação de email
3. **`/forgot-password`** - Solicitar recuperação
4. **`/reset-password`** - Redefinir senha

### Componentes a Criar

1. **`SignupStep1.tsx`** - Dados essenciais
2. **`SignupStep2.tsx`** - Dados profissionais
3. **`SignupStep3.tsx`** - Preferências
4. **`PasswordStrengthIndicator.tsx`** - Indicador de força
5. **`EmailVerificationBanner.tsx`** - Banner de verificação

---

## 🔌 APIs a Criar

### Autenticação

1. **`POST /api/auth/signup`** - Criar conta
2. **`POST /api/auth/verify-email`** - Verificar email
3. **`POST /api/auth/resend-verification`** - Reenviar verificação
4. **`POST /api/auth/forgot-password`** - Solicitar recuperação
5. **`POST /api/auth/reset-password`** - Redefinir senha
6. **`GET /api/auth/validate-token`** - Validar token

### Usuário

1. **`GET /api/user/profile`** - Obter perfil
2. **`PATCH /api/user/profile`** - Atualizar perfil
3. **`PATCH /api/user/complete-onboarding`** - Completar onboarding

---

## 📧 Emails a Implementar

### 1. Email de Verificação

**Template:** `email-verification.html`

```html
Assunto: Verifique seu email - VX DISC

Olá [Nome],

Bem-vindo ao VX DISC Client Analyzer!

Para começar a usar sua conta, precisamos verificar seu email.

[Botão: Verificar Email]

Ou copie e cole este link no seu navegador:
[Link completo]

Este link expira em 24 horas.

Se você não criou esta conta, ignore este email.

Atenciosamente,
Equipe VX Consultoria
```

### 2. Email de Recuperação de Senha

**Template:** `password-reset.html`

```html
Assunto: Recuperação de Senha - VX DISC

Olá [Nome],

Você solicitou a recuperação de senha da sua conta VX DISC.

Clique no botão abaixo para redefinir sua senha:

[Botão: Redefinir Senha]

Ou copie e cole este link no seu navegador:
[Link completo]

Este link expira em 1 hora.

Se você não solicitou esta recuperação, ignore este email.
Sua senha permanecerá inalterada.

Atenciosamente,
Equipe VX Consultoria
```

### 3. Email de Confirmação de Senha Alterada

**Template:** `password-changed.html`

```html
Assunto: Senha Alterada - VX DISC

Olá [Nome],

Sua senha foi alterada com sucesso.

Se você não fez esta alteração, entre em contato conosco imediatamente.

Atenciosamente,
Equipe VX Consultoria
```

---

## ✅ Critérios de Aceitação

### Signup

- [ ] Usuário consegue criar conta com dados essenciais
- [ ] Validações funcionam corretamente
- [ ] Email de verificação é enviado
- [ ] Usuário pode pular passos opcionais
- [ ] Indicador de força de senha funciona
- [ ] Termos de uso devem ser aceitos

### Verificação de Email

- [ ] Link de verificação funciona
- [ ] Token expira após 24h
- [ ] Usuário pode solicitar reenvio
- [ ] Banner aparece para usuários não verificados

### Recuperação de Senha

- [ ] Usuário consegue solicitar recuperação
- [ ] Email de recuperação é enviado
- [ ] Link de redefinição funciona
- [ ] Token expira após 1h
- [ ] Senha é atualizada corretamente
- [ ] Token é invalidado após uso

### Segurança

- [ ] Senhas são hasheadas com bcrypt
- [ ] Tokens são hasheados no banco
- [ ] Rate limiting funciona
- [ ] Não revela se email existe (forgot password)

---

## 🚀 Prioridades

### Fase 1 - Essencial (1 semana)
1. Criar tabelas no banco
2. Implementar signup (Passo 1 apenas)
3. Implementar forgot password
4. Implementar reset password
5. Envio de emails

### Fase 2 - Importante (3 dias)
1. Signup progressivo (Passos 2 e 3)
2. Verificação de email
3. Banner de verificação
4. Indicador de força de senha

### Fase 3 - Melhorias (2 dias)
1. Social login (Google, LinkedIn)
2. Autofill inteligente
3. Melhorias de UX
4. Analytics de signup

---

## 📊 Métricas de Sucesso

- Taxa de conversão de signup > 60%
- Taxa de verificação de email > 70%
- Taxa de recuperação de senha bem-sucedida > 90%
- Tempo médio de signup < 2 minutos

---

**Status:** 📋 Requisitos Definidos
**Próximo Passo:** Criar design.md com arquitetura técnica
