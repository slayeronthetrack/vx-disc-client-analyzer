# 🧪 Como Testar Agora

**Data**: 2026-05-06  
**Status**: ✅ Pronto para testar

---

## ⚡ MUDANÇAS APLICADAS

### 1. ✅ Middleware com Session Refresh
- Atualiza sessão automaticamente em cada request
- Renova tokens antes de expirarem
- Protege rotas privadas

### 2. ✅ Melhor Tratamento de Erros
- Mensagens específicas por tipo de erro
- Logs completos com headers e status
- Usuário sabe exatamente o que fazer

### 3. ✅ Build Compilado com Sucesso
```
✓ Compiled successfully in 14.0s
✓ 17 routes compiled
```

---

## 🎯 ANTES DE TESTAR

### ⚠️ EXECUTAR SQL NO SUPABASE (OBRIGATÓRIO)

**Arquivo**: `supabase/fix-rls-policies.sql`

**Passos**:
1. Abrir [Supabase Dashboard](https://supabase.com/dashboard)
2. Selecionar seu projeto
3. Ir em **SQL Editor** (menu lateral)
4. Clicar em **New Query**
5. Copiar todo o conteúdo de `supabase/fix-rls-policies.sql`
6. Colar no editor
7. Clicar em **Run** (ou Ctrl+Enter)
8. Verificar mensagem de sucesso: ✅ RLS Policies configured successfully!

**Por que é necessário**:
- Sem RLS policies, o INSERT em `disc_tests` vai falhar
- Mesmo com sessão válida, Supabase bloqueia sem policies
- É uma proteção de segurança do Supabase

---

## 🧪 FLUXO DE TESTE

### Teste 1: Login e Sessão ✅

1. **Fazer logout** (se estiver logado)
   - Ir em `/login`
   - Clicar em "Sair" (se houver)

2. **Fazer login novamente**
   - Email: seu email cadastrado
   - Senha: sua senha
   - Clicar em "Entrar"

3. **Verificar no console do browser**:
   ```
   [Auth] User logged in: { userId: '...', email: '...' }
   ```

4. **Verificar cookies**:
   - Abrir DevTools → Application → Cookies
   - Procurar cookies do Supabase (sb-*)
   - Devem existir e ter valores

---

### Teste 2: Completar Perfil ✅

1. **Ir para `/profile`**
   - Deve carregar sem redirecionar para login
   - Se redirecionar: sessão não está funcionando

2. **Preencher dados**:
   - Nome completo
   - Cargo
   - Empresa
   - Objetivo do teste

3. **Salvar perfil**
   - Clicar em "Salvar"
   - Verificar mensagem de sucesso

---

### Teste 3: Iniciar Teste DISC ✅

1. **Ir para `/test`**
   - Deve mostrar tela de seleção de perguntas
   - Se redirecionar para login: middleware não está funcionando

2. **Selecionar quantidade**:
   - Escolher "20 perguntas" (mais rápido)
   - Clicar em "Iniciar Teste"

3. **Verificar no console**:
   ```
   [Test] Questions generated: { count: 20, source: 'bank' }
   ```

---

### Teste 4: Responder Perguntas ✅

1. **Responder cada pergunta**:
   - Selecionar 1 ou 2 opções
   - Clicar em "Próxima"
   - Verificar progresso: "Pergunta 1 de 20" → "Pergunta 20 de 20"

2. **Verificar contador**:
   - Deve mostrar "1/2 selecionadas" ou "2/2 selecionadas"
   - Botão "Próxima" só ativa com pelo menos 1 seleção

---

### Teste 5: Finalizar e Salvar ✅ (CRÍTICO)

1. **Na última pergunta**:
   - Responder normalmente
   - Botão muda para "Finalizar Teste"
   - Clicar em "Finalizar Teste"

2. **Verificar logs no console**:
   ```
   [calculate-result] Request received: { userId: '...', answersCount: 20 }
   [calculate-result] Checking authentication...
   [calculate-result] Auth check result: { hasUser: true, userId: '...' }
   [calculate-result] User authenticated: { userId: '...', email: '...' }
   [calculate-result] Integrated profile calculated: { dominant: 'D' }
   [Marina] { success: true, executionTime: '1234ms' }
   [calculate-result] Test saved successfully
   [Test] Result calculated successfully
   ```

3. **Resultado esperado**:
   - ✅ Redireciona para `/result`
   - ✅ Mostra análise DISC
   - ✅ Mostra gráfico de perfil

---

## 🐛 SE DER ERRO

### Erro 401: "Sessão expirada"

**Sintoma**:
```
[Test] API error: { status: 401, statusText: 'Unauthorized' }
Sessão expirada. Por favor, faça login novamente.
```

**Solução**:
1. Fazer logout
2. Fazer login novamente
3. Tentar novamente

**Se persistir**:
- Verificar se middleware está ativo (deve estar)
- Verificar cookies no browser (DevTools → Application → Cookies)
- Limpar cookies e fazer login novamente

---

### Erro 500: "Erro ao salvar teste"

**Sintoma**:
```
[calculate-result] Error saving test: { message: 'new row violates row-level security policy' }
```

**Solução**:
1. **Executar SQL de RLS policies** (ver seção "ANTES DE TESTAR")
2. Tentar novamente

**Verificar se policies foram criadas**:
```sql
SELECT policyname FROM pg_policies WHERE tablename = 'disc_tests';
```

Deve retornar:
- Users can insert their own tests
- Users can view their own tests
- Users can update their own tests
- Users can delete their own tests

---

### Erro: "API error: {}"

**Sintoma**:
```
[Test] API error: {}
```

**Solução**:
1. Abrir DevTools → Network
2. Filtrar por "calculate-result"
3. Clicar na request
4. Ver "Response" tab
5. Copiar erro completo
6. Enviar para análise

---

## 📊 LOGS ESPERADOS (SUCESSO)

### Console do Browser:
```
[Test] Questions generated: { count: 20, source: 'bank' }
[Test] Result calculated successfully
```

### Console do Servidor (Terminal):
```
[calculate-result] Request received: { userId: '...', answersCount: 20 }
[calculate-result] Checking authentication...
[calculate-result] Auth check result: { hasUser: true, userId: '...' }
[calculate-result] User authenticated: { userId: '...', email: '...' }
[calculate-result] Extended answers: { count: 20 }
[calculate-result] Integrated profile calculated: { hasDisc: true, dominant: 'D' }
[Marina] { success: true, usedFallback: false, executionTime: '1234ms' }
[calculate-result] Preparing to save test: { userId: '...', answersCount: 20 }
[calculate-result] Test saved successfully
```

---

## ✅ CHECKLIST DE TESTE

- [ ] SQL de RLS policies executado no Supabase
- [ ] Logout e login novamente
- [ ] Perfil completo
- [ ] Teste iniciado (20 perguntas)
- [ ] Todas as perguntas respondidas
- [ ] Teste finalizado sem erro 401
- [ ] Teste salvo sem erro 500
- [ ] Redirecionado para `/result`
- [ ] Resultado exibido corretamente

---

## 🎯 PRÓXIMOS PASSOS APÓS SUCESSO

1. **Testar com 40 perguntas**
   - Verificar se IA é chamada ou se usa banco
   - Verificar performance (deve ser < 3s)

2. **Testar com 60 perguntas**
   - Verificar se IA é chamada ou se usa banco
   - Verificar performance (deve ser < 5s)

3. **Verificar análise integrada**
   - Deve incluir DISC + Valores + Tipos Psicológicos
   - Deve ser personalizada com nome e cargo

---

## 📝 REPORTAR RESULTADOS

Após testar, reportar:

1. **Status de cada teste** (✅ ou ❌)
2. **Logs do console** (browser e servidor)
3. **Erros encontrados** (se houver)
4. **Tempo de carregamento** (primeira pergunta e finalização)
5. **Qualidade da análise** (faz sentido? está personalizada?)

---

**Boa sorte! 🚀**
