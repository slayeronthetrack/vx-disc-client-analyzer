# ✅ Checklist Rápido: Validar Bug #2

**Tempo total**: 15-20 minutos

---

## 📋 PASSO A PASSO

### ☐ 1. Executar SQL no Supabase (2 min)

1. Abrir: https://supabase.com/dashboard
2. Clicar em: **SQL Editor**
3. Abrir arquivo: `supabase/fix-rls-policies.sql`
4. Copiar TODO o conteúdo
5. Colar no editor
6. Clicar em: **Run**
7. Verificar: ✅ RLS Policies configured successfully!

---

### ☐ 2. Iniciar Servidor (30 seg)

```bash
npm run dev
```

Aguardar: `✓ Ready in 2s`

---

### ☐ 3. Login (1 min)

1. Abrir: http://localhost:3000/login
2. Email: `juliopppimentel@gmail.com`
3. Senha: `teste123`
4. Clicar: **Entrar**

---

### ☐ 4. Completar Perfil (1 min) - Se necessário

Se redirecionar para `/profile`:
- Nome: Julio Pimentel
- Cargo: Developer
- Empresa: VX
- Objetivo: Teste
- Clicar: **Salvar**

---

### ☐ 5. Teste com 60 Perguntas (5 min)

1. Ir para: http://localhost:3000/test
2. Selecionar: **60 perguntas**
3. Clicar: **Iniciar Teste**
4. Responder todas as 60 perguntas
5. Clicar: **Finalizar Teste**

**Resultado esperado**:
- ✅ Redireciona para `/result`
- ✅ Mostra análise DISC
- ❌ Erro 401 ou 500

---

### ☐ 6. Teste com 100 Perguntas (10 min)

1. Voltar para: http://localhost:3000/test
2. Selecionar: **100 perguntas**
3. Clicar: **Iniciar Teste**
4. Responder todas as 100 perguntas
5. Clicar: **Finalizar Teste**

**Resultado esperado**:
- ✅ Redireciona para `/result`
- ✅ Mostra análise DISC
- ❌ Erro 401 ou 500

---

## 📊 LOGS A OBSERVAR

### Console do Browser (F12 → Console)

**Sucesso**:
```
✅ [Test] Questions generated: { count: 60 }
✅ [Test] Result calculated successfully
```

**Erro**:
```
❌ [Test] API error: { status: 401 }
❌ Sessão expirada. Por favor, faça login novamente.
```

---

### Terminal do Servidor

**Sucesso**:
```
✅ [calculate-result] Checking authentication...
✅ [calculate-result] Auth check result: { hasUser: true }
✅ [calculate-result] Test saved successfully
```

**Erro**:
```
❌ [calculate-result] Authentication failed
❌ [calculate-result] Error saving test
```

---

## ✅ RESULTADO FINAL

### Bug #2 está RESOLVIDO se:
- ✅ Ambos os testes finalizaram sem erro
- ✅ Ambos redirecionaram para `/result`
- ✅ Ambos mostraram análise DISC

### Bug #2 ainda EXISTE se:
- ❌ Erro 401: "Sessão expirada"
- ❌ Erro 500: "Erro ao salvar teste"
- ❌ Não redireciona para `/result`

---

## 📝 REPORTAR

Após testar, me enviar:

1. **Status**:
   - ✅ ou ❌ Teste com 60 perguntas
   - ✅ ou ❌ Teste com 100 perguntas

2. **Se deu erro**:
   - Qual erro? (401, 500, outro)
   - Mensagem completa
   - Screenshot

3. **Logs**:
   - Console do browser
   - Terminal do servidor

---

## 🚀 DOCUMENTAÇÃO COMPLETA

- **Instruções detalhadas**: `INSTRUCOES_TESTE_FINAL.md`
- **Resumo executivo**: `RESUMO_EXECUTIVO_FINAL.md`
- **Documentação técnica**: `CORRECAO_SESSAO_AUTH.md`

---

**Boa sorte! 🎉**
