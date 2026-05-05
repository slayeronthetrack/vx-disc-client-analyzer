# ✅ Tasks: Sistema de Autenticação Completo

## 📋 Fase 1 - Banco de Dados e Infraestrutura

### 1.1 Criar Migrations do Banco de Dados
- [ ] 1.1.1 Criar migration `001_create_users_table.sql`
- [ ] 1.1.2 Criar migration `002_create_email_verification_tokens_table.sql`
- [ ] 1.1.3 Criar migration `003_create_password_reset_tokens_table.sql`
- [ ] 1.1.4 Executar migrations no Supabase
- [ ] 1.1.5 Verificar tabelas criadas corretamente

### 1.2 Atualizar Tipos TypeScript
- [ ] 1.2.1 Criar `types/auth.ts` com interfaces de autenticação
- [ ] 1.2.2 Atualizar `types/user.ts` com novos campos
- [ ] 1.2.3 Criar `types/tokens.ts` com tipos de tokens

### 1.3 Configurar Serviço de Email
- [ ] 1.3.1 Criar conta no Resend (ou usar serviço existente)
- [ ] 1.3.2 Adicionar `RESEND_API_KEY` no `.env.local`
- [ ] 1.3.3 Testar envio de email básico

---

## 📋 Fase 2 - Utilitários e Validações

### 2.1 Criar Utilitários de Token
- [ ] 2.1.1 Atualizar `lib/tokens.ts` com `generateToken()`
- [ ] 2.1.2 Adicionar `hashToken()` em `lib/tokens.ts`
- [ ] 2.1.3 Adicionar `verifyToken()` em `lib/tokens.ts`

### 2.2 Criar Validações
- [ ] 2.2.1 Criar `utils/validation.ts` com schemas Zod
- [ ] 2.2.2 Adicionar `signupStep1Schema`
- [ ] 2.2.3 Adicionar `signupStep2Schema`
- [ ] 2.2.4 Adicionar `signupStep3Schema`
- [ ] 2.2.5 Adicionar `forgotPasswordSchema`
- [ ] 2.2.6 Adicionar `resetPasswordSchema`

### 2.3 Criar Utilitários de Senha
- [ ] 2.3.1 Criar `utils/passwordStrength.ts`
- [ ] 2.3.2 Implementar `calculatePasswordStrength()`
- [ ] 2.3.3 Criar testes unitários

### 2.4 Criar Lista de Emails Descartáveis
- [ ] 2.4.1 Criar `utils/disposableEmails.ts`
- [ ] 2.4.2 Adicionar lista de domínios descartáveis
- [ ] 2.4.3 Implementar `isDisposableEmail()`

---

## 📋 Fase 3 - Templates de Email

### 3.1 Criar Templates HTML
- [ ] 3.1.1 Criar `emails/templates/email-verification.html`
- [ ] 3.1.2 Criar `emails/templates/password-reset.html`
- [ ] 3.1.3 Criar `emails/templates/password-changed.html`
- [ ] 3.1.4 Criar `emails/styles/email-styles.css`

### 3.2 Criar Funções de Geração de Email
- [ ] 3.2.1 Atualizar `lib/email.ts` com `generateEmailVerificationEmail()`
- [ ] 3.2.2 Adicionar `generatePasswordResetEmail()`
- [ ] 3.2.3 Adicionar `generatePasswordChangedEmail()`
- [ ] 3.2.4 Adicionar `sendEmail()` genérico

---

## 📋 Fase 4 - APIs de Autenticação

### 4.1 API de Signup
- [ ] 4.1.1 Criar `app/api/auth/signup/route.ts`
- [ ] 4.1.2 Implementar validação de dados
- [ ] 4.1.3 Implementar verificação de email único
- [ ] 4.1.4 Implementar verificação de email descartável
- [ ] 4.1.5 Implementar hash de senha
- [ ] 4.1.6 Implementar criação de usuário no banco
- [ ] 4.1.7 Implementar geração de token de verificação
- [ ] 4.1.8 Implementar envio de email de verificação
- [ ] 4.1.9 Implementar rate limiting
- [ ] 4.1.10 Adicionar tratamento de erros
- [ ] 4.1.11 Testar API com Postman/Insomnia

### 4.2 API de Verificação de Email
- [ ] 4.2.1 Criar `app/api/auth/verify-email/route.ts`
- [ ] 4.2.2 Implementar validação de token
- [ ] 4.2.3 Implementar verificação de expiração
- [ ] 4.2.4 Implementar atualização de usuário
- [ ] 4.2.5 Implementar marcação de token como usado
- [ ] 4.2.6 Adicionar tratamento de erros
- [ ] 4.2.7 Testar API

### 4.3 API de Reenvio de Verificação
- [ ] 4.3.1 Criar `app/api/auth/resend-verification/route.ts`
- [ ] 4.3.2 Implementar validação de usuário
- [ ] 4.3.3 Implementar geração de novo token
- [ ] 4.3.4 Implementar envio de email
- [ ] 4.3.5 Implementar rate limiting (1 email / 5 min)
- [ ] 4.3.6 Testar API

### 4.4 API de Forgot Password
- [ ] 4.4.1 Criar `app/api/auth/forgot-password/route.ts`
- [ ] 4.4.2 Implementar validação de email
- [ ] 4.4.3 Implementar busca de usuário (sem revelar se existe)
- [ ] 4.4.4 Implementar geração de token de reset
- [ ] 4.4.5 Implementar envio de email de recuperação
- [ ] 4.4.6 Implementar rate limiting (3 tentativas / 15 min)
- [ ] 4.4.7 Adicionar log de IP e user agent
- [ ] 4.4.8 Testar API

### 4.5 API de Reset Password
- [ ] 4.5.1 Criar `app/api/auth/reset-password/route.ts`
- [ ] 4.5.2 Implementar validação de token
- [ ] 4.5.3 Implementar verificação de expiração
- [ ] 4.5.4 Implementar validação de nova senha
- [ ] 4.5.5 Implementar hash de nova senha
- [ ] 4.5.6 Implementar atualização de senha no banco
- [ ] 4.5.7 Implementar marcação de token como usado
- [ ] 4.5.8 Implementar envio de email de confirmação
- [ ] 4.5.9 Implementar rate limiting
- [ ] 4.5.10 Testar API

### 4.6 API de Validação de Token
- [ ] 4.6.1 Criar `app/api/auth/validate-token/route.ts`
- [ ] 4.6.2 Implementar validação de token
- [ ] 4.6.3 Implementar verificação de expiração
- [ ] 4.6.4 Retornar status do token
- [ ] 4.6.5 Testar API

---

## 📋 Fase 5 - Componentes UI

### 5.1 Componentes de Autenticação
- [ ] 5.1.1 Criar `components/auth/SignupStep1.tsx`
- [ ] 5.1.2 Criar `components/auth/SignupStep2.tsx`
- [ ] 5.1.3 Criar `components/auth/SignupStep3.tsx`
- [ ] 5.1.4 Criar `components/auth/PasswordStrengthIndicator.tsx`
- [ ] 5.1.5 Criar `components/auth/EmailVerificationBanner.tsx`

### 5.2 Componentes UI Genéricos
- [ ] 5.2.1 Criar `components/ui/ProgressBar.tsx`
- [ ] 5.2.2 Criar `components/ui/StepIndicator.tsx`

---

## 📋 Fase 6 - Páginas de Autenticação

### 6.1 Página de Signup
- [ ] 6.1.1 Criar `app/(auth)/signup/page.tsx`
- [ ] 6.1.2 Implementar navegação entre passos
- [ ] 6.1.3 Implementar validação de formulário
- [ ] 6.1.4 Implementar chamada à API de signup
- [ ] 6.1.5 Implementar indicador de progresso
- [ ] 6.1.6 Implementar indicador de força de senha
- [ ] 6.1.7 Implementar estados de loading
- [ ] 6.1.8 Implementar tratamento de erros
- [ ] 6.1.9 Implementar opção de pular passos opcionais
- [ ] 6.1.10 Testar fluxo completo

### 6.2 Página de Verificação de Email
- [ ] 6.2.1 Criar `app/(auth)/verify-email/page.tsx`
- [ ] 6.2.2 Implementar validação de token via URL
- [ ] 6.2.3 Implementar chamada à API de verificação
- [ ] 6.2.4 Implementar estados de loading
- [ ] 6.2.5 Implementar mensagens de sucesso/erro
- [ ] 6.2.6 Implementar opção de reenviar email
- [ ] 6.2.7 Testar fluxo completo

### 6.3 Página de Forgot Password
- [ ] 6.3.1 Criar `app/(auth)/forgot-password/page.tsx`
- [ ] 6.3.2 Implementar formulário de email
- [ ] 6.3.3 Implementar validação de formulário
- [ ] 6.3.4 Implementar chamada à API de forgot password
- [ ] 6.3.5 Implementar estados de loading
- [ ] 6.3.6 Implementar mensagem de sucesso
- [ ] 6.3.7 Testar fluxo completo

### 6.4 Página de Reset Password
- [ ] 6.4.1 Criar `app/(auth)/reset-password/page.tsx`
- [ ] 6.4.2 Implementar validação de token via URL
- [ ] 6.4.3 Implementar formulário de nova senha
- [ ] 6.4.4 Implementar validação de formulário
- [ ] 6.4.5 Implementar indicador de força de senha
- [ ] 6.4.6 Implementar chamada à API de reset password
- [ ] 6.4.7 Implementar estados de loading
- [ ] 6.4.8 Implementar mensagens de sucesso/erro
- [ ] 6.4.9 Testar fluxo completo

### 6.5 Atualizar Página de Login
- [ ] 6.5.1 Adicionar link "Esqueceu a senha?"
- [ ] 6.5.2 Adicionar link "Criar conta"
- [ ] 6.5.3 Testar navegação

---

## 📋 Fase 7 - Integração com NextAuth

### 7.1 Atualizar Configuração do NextAuth
- [ ] 7.1.1 Atualizar `lib/auth.ts` para usar nova tabela `users`
- [ ] 7.1.2 Adicionar verificação de `email_verified`
- [ ] 7.1.3 Atualizar callback de login para registrar `last_login_at`
- [ ] 7.1.4 Testar login com novo sistema

---

## 📋 Fase 8 - Banner de Verificação de Email

### 8.1 Implementar Banner
- [ ] 8.1.1 Criar componente `EmailVerificationBanner`
- [ ] 8.1.2 Adicionar banner no layout do dashboard
- [ ] 8.1.3 Implementar lógica de exibição (só para não verificados)
- [ ] 8.1.4 Implementar botão de reenviar email
- [ ] 8.1.5 Implementar botão de fechar (temporário)
- [ ] 8.1.6 Testar banner

---

## 📋 Fase 9 - Testes

### 9.1 Testes Unitários
- [ ] 9.1.1 Testar `calculatePasswordStrength()`
- [ ] 9.1.2 Testar `isDisposableEmail()`
- [ ] 9.1.3 Testar `hashToken()` e `verifyToken()`
- [ ] 9.1.4 Testar schemas de validação

### 9.2 Testes de Integração
- [ ] 9.2.1 Testar fluxo completo de signup
- [ ] 9.2.2 Testar fluxo completo de verificação de email
- [ ] 9.2.3 Testar fluxo completo de forgot password
- [ ] 9.2.4 Testar fluxo completo de reset password
- [ ] 9.2.5 Testar rate limiting
- [ ] 9.2.6 Testar expiração de tokens

### 9.3 Testes de Segurança
- [ ] 9.3.1 Testar que senhas são hasheadas
- [ ] 9.3.2 Testar que tokens são hasheados
- [ ] 9.3.3 Testar que tokens expiram
- [ ] 9.3.4 Testar que tokens usados não podem ser reutilizados
- [ ] 9.3.5 Testar rate limiting
- [ ] 9.3.6 Testar que forgot password não revela se email existe

---

## 📋 Fase 10 - Documentação e Finalização

### 10.1 Documentação
- [ ] 10.1.1 Criar `AUTHENTICATION_GUIDE.md` para desenvolvedores
- [ ] 10.1.2 Criar `USER_GUIDE.md` para usuários finais
- [ ] 10.1.3 Documentar variáveis de ambiente necessárias
- [ ] 10.1.4 Documentar fluxos de autenticação

### 10.2 Melhorias de UX
- [ ] 10.2.1 Adicionar animações de transição entre passos
- [ ] 10.2.2 Adicionar feedback visual em todos os formulários
- [ ] 10.2.3 Adicionar tooltips explicativos
- [ ] 10.2.4 Melhorar mensagens de erro

### 10.3 Otimizações
- [ ] 10.3.1 Implementar debounce na validação de email
- [ ] 10.3.2 Implementar cache de validações
- [ ] 10.3.3 Otimizar queries do banco de dados
- [ ] 10.3.4 Adicionar índices necessários

### 10.4 Monitoramento
- [ ] 10.4.1 Adicionar logs de signup
- [ ] 10.4.2 Adicionar logs de verificação de email
- [ ] 10.4.3 Adicionar logs de forgot/reset password
- [ ] 10.4.4 Adicionar métricas de conversão

---

## 📋 Fase 11 - Melhorias Futuras (Opcional)

### 11.1 Social Login
- [ ] 11.1.1 Implementar login com Google
- [ ] 11.1.2 Implementar login com LinkedIn
- [ ] 11.1.3 Implementar login com Microsoft

### 11.2 Two-Factor Authentication (2FA)
- [ ] 11.2.1 Implementar 2FA com TOTP
- [ ] 11.2.2 Implementar 2FA com SMS
- [ ] 11.2.3 Implementar backup codes

### 11.3 Autofill Inteligente
- [ ] 11.3.1 Detectar empresa pelo domínio do email
- [ ] 11.3.2 Sugerir setor baseado na empresa
- [ ] 11.3.3 Autocompletar endereço

---

## 📊 Progresso Geral

**Total de Tasks:** 150+
**Concluídas:** 0
**Em Progresso:** 0
**Pendentes:** 150+

---

## 🎯 Prioridades

### Alta Prioridade (Semana 1)
- Fase 1: Banco de Dados
- Fase 2: Utilitários
- Fase 3: Templates de Email
- Fase 4: APIs (4.1, 4.4, 4.5)

### Média Prioridade (Semana 2)
- Fase 4: APIs (4.2, 4.3, 4.6)
- Fase 5: Componentes UI
- Fase 6: Páginas

### Baixa Prioridade (Semana 3)
- Fase 7: Integração NextAuth
- Fase 8: Banner
- Fase 9: Testes
- Fase 10: Documentação

---

**Status:** 📋 Tasks Definidas
**Pronto para:** Implementação
