# 🧪 Guia de Teste Manual - Sistema VX DISC

## 📋 Informações do Teste

- **URL do Sistema:** http://localhost:3001
- **Data:** 2026-05-05
- **Versão:** 1.0.0
- **Testador:** _[Seu nome]_

---

## ✅ Fluxo Completo de Teste

### 1. Teste de Registro de Usuário

**URL:** http://localhost:3001/register

**Passos:**
1. Acesse a página de registro
2. Preencha o formulário:
   - Nome Completo: `João Silva`
   - E-mail: `joao.silva@teste.com`
   - Senha: `senha123`
   - Confirmar Senha: `senha123`
3. Clique em "Criar Conta"

**Resultado Esperado:**
- ✅ Mensagem de sucesso aparece
- ✅ Redirecionamento automático para `/profile` após 2 segundos
- ✅ Perfil criado no banco de dados Supabase

**Status:** [ ] Passou [ ] Falhou

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

### 2. Teste de Configuração de Perfil

**URL:** http://localhost:3001/profile

**Passos:**
1. Após o registro, você deve estar na página de perfil
2. Preencha o formulário:
   - Nome Completo: `João Silva` (já preenchido)
   - Cargo: `Gerente de Vendas`
   - Empresa: `VX Tecnologia`
   - Objetivo do Teste: `Desenvolvimento pessoal e melhoria de comunicação`
3. Clique em "Salvar Perfil"

**Resultado Esperado:**
- ✅ Mensagem de sucesso aparece
- ✅ Redirecionamento automático para `/test` após 2 segundos
- ✅ Dados salvos no banco de dados

**Status:** [ ] Passou [ ] Falhou

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

### 3. Teste do Questionário DISC

**URL:** http://localhost:3001/test

**Passos:**
1. Após salvar o perfil, você deve estar na página do teste
2. Leia a primeira pergunta
3. Selecione uma opção (D, I, S ou C)
4. Clique em "Próxima"
5. Repita para todas as 10 perguntas
6. Na última pergunta, clique em "Finalizar Teste"

**Resultado Esperado:**
- ✅ Barra de progresso atualiza (1/10, 2/10, etc.)
- ✅ Botão "Próxima" só fica ativo após selecionar uma opção
- ✅ Botão "Anterior" funciona para voltar
- ✅ Respostas são salvas automaticamente
- ✅ Após finalizar, redirecionamento para `/result`

**Status:** [ ] Passou [ ] Falhou

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

### 4. Teste da Página de Resultado

**URL:** http://localhost:3001/result

**Passos:**
1. Após finalizar o teste, você deve estar na página de resultado
2. Verifique se o perfil dominante é exibido (D, I, S ou C)
3. Verifique se os percentuais são exibidos
4. Verifique se a descrição do perfil é exibida

**Resultado Esperado:**
- ✅ Perfil dominante exibido com destaque
- ✅ Percentuais D, I, S, C exibidos corretamente
- ✅ Descrição do perfil exibida
- ✅ Características do perfil exibidas
- ✅ Layout responsivo e bonito

**Status:** [ ] Passou [ ] Falhou

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

### 5. Teste de Logout e Login

**Passos:**
1. Clique no botão de logout (se disponível)
2. Acesse http://localhost:3001/login
3. Faça login com as credenciais:
   - E-mail: `joao.silva@teste.com`
   - Senha: `senha123`
4. Clique em "Entrar"

**Resultado Esperado:**
- ✅ Logout funciona e redireciona para `/login`
- ✅ Login funciona com credenciais corretas
- ✅ Redirecionamento para `/profile` ou `/dashboard` após login
- ✅ Sessão persiste após refresh da página

**Status:** [ ] Passou [ ] Falhou

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

### 6. Teste de Dashboard Admin (se aplicável)

**URL:** http://localhost:3001/dashboard

**Passos:**
1. Faça login com uma conta admin
2. Verifique se o dashboard carrega
3. Verifique se as métricas são exibidas
4. Teste a navegação para outras páginas admin

**Resultado Esperado:**
- ✅ Dashboard carrega corretamente
- ✅ Métricas são exibidas
- ✅ Navegação funciona

**Status:** [ ] Passou [ ] Falhou [ ] N/A

**Observações:**
```
_[Anote aqui qualquer problema encontrado]_
```

---

## 📱 Teste de Responsividade

### Mobile (320px - 480px)
**Passos:**
1. Abra o DevTools (F12)
2. Ative o modo responsivo
3. Teste com largura de 375px (iPhone)
4. Navegue por todas as páginas

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Botões são clicáveis (mínimo 44px)
- ✅ Texto é legível
- ✅ Sem scroll horizontal

**Status:** [ ] Passou [ ] Falhou

---

### Tablet (768px - 1024px)
**Passos:**
1. Teste com largura de 768px (iPad)
2. Navegue por todas as páginas

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Espaçamento adequado

**Status:** [ ] Passou [ ] Falhou

---

### Desktop (1024px+)
**Passos:**
1. Teste com largura de 1920px
2. Navegue por todas as páginas

**Resultado Esperado:**
- ✅ Layout se adapta corretamente
- ✅ Conteúdo centralizado

**Status:** [ ] Passou [ ] Falhou

---

## 🐛 Teste de Casos de Erro

### 1. Registro com E-mail Duplicado
**Passos:**
1. Tente registrar com e-mail já existente

**Resultado Esperado:**
- ✅ Mensagem de erro clara
- ✅ Formulário não é limpo

**Status:** [ ] Passou [ ] Falhou

---

### 2. Login com Credenciais Inválidas
**Passos:**
1. Tente fazer login com senha errada

**Resultado Esperado:**
- ✅ Mensagem de erro clara
- ✅ Não redireciona

**Status:** [ ] Passou [ ] Falhou

---

### 3. Acesso a Páginas Protegidas sem Autenticação
**Passos:**
1. Abra uma aba anônima
2. Tente acessar `/profile`, `/test`, `/result`, `/dashboard`

**Resultado Esperado:**
- ✅ Redirecionamento para `/login`

**Status:** [ ] Passou [ ] Falhou

---

## 🎯 Checklist Final

- [ ] Todos os testes de fluxo passaram
- [ ] Todos os testes de responsividade passaram
- [ ] Todos os testes de erro passaram
- [ ] Sem erros no console do navegador
- [ ] Sem erros no console do servidor
- [ ] Performance aceitável (< 3s por página)

---

## 📝 Resumo dos Problemas Encontrados

### Críticos (Impedem o uso do sistema)
```
_[Liste aqui]_
```

### Médios (Afetam a experiência mas não impedem o uso)
```
_[Liste aqui]_
```

### Menores (Melhorias desejáveis)
```
_[Liste aqui]_
```

---

## ✅ Conclusão

**Status Geral:** [ ] Aprovado [ ] Aprovado com Ressalvas [ ] Reprovado

**Comentários Finais:**
```
_[Seus comentários aqui]_
```

**Próximos Passos:**
```
_[O que precisa ser feito]_
```
