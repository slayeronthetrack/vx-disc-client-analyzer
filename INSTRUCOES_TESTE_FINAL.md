# 🎯 Instruções Finais: Como Testar o Bug #2

**Data**: 2026-05-06  
**Usuário**: juliopppimentel@gmail.com  
**Senha**: teste123

---

## ⚡ INÍCIO RÁPIDO

### 1. Executar SQL no Supabase (2 minutos) ⚠️ OBRIGATÓRIO

1. Abrir: https://supabase.com/dashboard
2. Selecionar seu projeto
3. Clicar em **SQL Editor** (menu lateral)
4. Clicar em **New Query**
5. Abrir o arquivo: `supabase/fix-rls-policies.sql`
6. Copiar **TODO** o conteúdo
7. Colar no editor do Supabase
8. Clicar em **Run** (ou Ctrl+Enter)
9. Verificar mensagem: ✅ RLS Policies configured successfully!

**Por que é obrigatório?**
- Sem isso, o teste vai falhar com erro 500
- É uma proteção de segurança do Supabase
- Permite que você salve seus próprios testes

---

### 2. Iniciar Servidor (30 segundos)

Abrir terminal e executar:

```bash
npm run dev
```

Aguardar mensagem:
```
✓ Ready in 2s
- Local: http://localhost:3000
```

---

### 3. Testar com 60 Perguntas (5 minutos)

#### Passo 1: Login
1. Abrir: http://localhost:3000/login
2. Email: `juliopppimentel@gmail.com`
3. Senha: `teste123`
4. Clicar em "Entrar"

#### Passo 2: Completar Perfil (se necessário)
1. Se redirecionar para `/profile`, preencher:
   - Nome: Julio Pimentel
   - Cargo: Developer
   - Empresa: VX
   - Objetivo: Teste
2. Salvar

#### Passo 3: Iniciar Teste
1. Ir para: http://localhost:3000/test
2. Selecionar: **60 perguntas**
3. Clicar em "Iniciar Teste"

#### Passo 4: Responder Perguntas
1. Responder cada pergunta (1 ou 2 opções)
2. Clicar em "Próxima"
3. Repetir 60 vezes

#### Passo 5: Finalizar (MOMENTO CRÍTICO)
1. Na pergunta 60, clicar em "Finalizar Teste"
2. **Observar o que acontece**:
   - ✅ **SUCESSO**: Redireciona para `/result` e mostra análise
   - ❌ **FALHA**: Mostra erro "Sessão expirada" ou "Erro ao salvar"

---

### 4. Testar com 100 Perguntas (10 minutos)

Repetir passos 3-5, mas selecionar **100 perguntas** no passo 3.

---

## 📊 O QUE OBSERVAR

### Console do Browser (F12)

**Abrir DevTools → Console**

**Logs esperados (SUCESSO)**:
```
[Test] Questions generated: { count: 60, source: 'bank' }
[Test] Result calculated successfully
```

**Logs de erro (FALHA)**:
```
[Test] API error: { status: 401, statusText: 'Unauthorized' }
Sessão expirada. Por favor, faça login novamente.
```

---

### Terminal do Servidor

**Logs esperados (SUCESSO)**:
```
[calculate-result] Request received: { userId: '...', answersCount: 60 }
[calculate-result] Checking authentication...
[calculate-result] Auth check result: { hasUser: true, userId: '...' }
[calculate-result] User authenticated: { userId: '...', email: 'juliopppimentel@gmail.com' }
[calculate-result] Test saved successfully
```

**Logs de erro (FALHA)**:
```
[calculate-result] Authentication failed: { error: 'Auth session missing!' }
```

---

## ✅ CRITÉRIOS DE SUCESSO

### Bug #2 está RESOLVIDO se:

- ✅ Teste com 60 perguntas finaliza sem erro
- ✅ Redireciona para `/result`
- ✅ Mostra análise DISC
- ✅ Teste com 100 perguntas finaliza sem erro
- ✅ Redireciona para `/result`
- ✅ Mostra análise DISC

### Bug #2 ainda EXISTE se:

- ❌ Erro 401: "Sessão expirada"
- ❌ Erro 500: "Erro ao salvar teste"
- ❌ Não redireciona para `/result`
- ❌ Mostra erro vazio `{}`

---

## 🐛 SE DER ERRO

### Erro 401: "Sessão expirada"

**Solução**:
1. Fazer logout
2. Limpar cookies:
   - DevTools → Application → Cookies
   - Deletar todos os cookies do localhost
3. Fazer login novamente
4. Tentar novamente

**Se persistir**:
- Verificar se SQL de RLS foi executado
- Verificar logs do servidor
- Reportar erro completo

---

### Erro 500: "Erro ao salvar teste"

**Causa**: RLS policies não foram executadas

**Solução**:
1. Executar SQL de RLS policies (ver seção 1)
2. Verificar no Supabase:
   - Ir em **Database** → **Policies**
   - Procurar tabela `disc_tests`
   - Deve ter 4 policies
3. Tentar novamente

---

### Erro: "API error: {}"

**Solução**:
1. Abrir DevTools → Network
2. Filtrar por "calculate-result"
3. Clicar na request
4. Ver "Response" tab
5. Copiar erro completo
6. Reportar

---

## 📝 REPORTAR RESULTADOS

Após testar, me enviar:

### 1. Status
- ✅ ou ❌ Teste com 60 perguntas
- ✅ ou ❌ Teste com 100 perguntas

### 2. Se deu erro
- Qual erro? (401, 500, outro)
- Mensagem completa
- Screenshot (se possível)

### 3. Logs
- Console do browser (copiar logs)
- Terminal do servidor (copiar logs)

---

## 🎯 RESUMO DO QUE FOI CORRIGIDO

### Antes (Bug #2)
```
❌ Middleware não atualizava sessão
❌ Sessões expiravam durante o teste
❌ Erro 401 ao finalizar teste
❌ Mensagem de erro vazia: {}
❌ Usuário não sabia o que fazer
```

### Depois (Correção)
```
✅ Middleware atualiza sessão automaticamente
✅ Sessões renovadas em cada request
✅ Cookies atualizados automaticamente
✅ Mensagens de erro específicas
✅ Usuário sabe exatamente o que fazer
✅ Logs detalhados para debugging
```

---

## 📁 ARQUIVOS MODIFICADOS

1. ✅ `middleware.ts` - Session refresh automático
2. ✅ `app/test/page.tsx` - Melhor tratamento de erros
3. ✅ `app/api/ai/calculate-result/route.ts` - Logs detalhados

**Total**: 3 arquivos, ~120 linhas modificadas

---

## 🚀 PRÓXIMOS PASSOS

### Se o teste passar ✅
1. Validar que Bug #2 está resolvido
2. Otimizar performance (bank_query_ms < 200ms)
3. Expandir banco de perguntas (200+ perguntas)

### Se o teste falhar ❌
1. Reportar erro completo
2. Enviar logs do console e servidor
3. Investigar causa raiz
4. Aplicar correção adicional

---

**Tempo estimado total**: 15-20 minutos

**Dificuldade**: Fácil (apenas seguir os passos)

**Prioridade**: Alta (validar correção do Bug #2)

---

## 💡 DICAS

1. **Mantenha o DevTools aberto** durante todo o teste
2. **Observe os logs** em tempo real
3. **Não feche o terminal** do servidor
4. **Copie os logs** antes de fechar qualquer coisa
5. **Tire screenshots** se der erro

---

**Boa sorte! 🚀**

Se tudo funcionar, o Bug #2 está oficialmente resolvido! 🎉
