# 🔧 CORREÇÃO - Erro ao Salvar Teste DISC

## 🐛 Problema Identificado

**Erro no navegador:**
```
Error saving test: {}
```

**Causas identificadas:**
1. ❌ Chamada incorreta de `saveTest()` com 2 parâmetros (deveria ser 1)
2. ❌ Faltando campos obrigatórios `question_count` e `question_source`
3. ❌ Políticas RLS da tabela `disc_tests` podem estar incorretas
4. ❌ Console.error não mostrava detalhes do erro do Supabase

---

## ✅ Correções Aplicadas

### 1. Corrigido `app/test/page.tsx`

**Antes:**
```typescript
await discTestService.saveTest(user.id, {  // ❌ 2 parâmetros
  questions: ...,
  // ❌ Faltando question_count e question_source
});
```

**Depois:**
```typescript
await discTestService.saveTest({  // ✅ 1 parâmetro
  user_id: user.id,  // ✅ user_id dentro do objeto
  questions: ...,
  question_count: 20,  // ✅ Campo obrigatório
  question_source: 'legacy',  // ✅ Campo obrigatório
});
```

### 2. Melhorado tratamento de erro

**Antes:**
```typescript
console.error('Error saving test:', err);  // ❌ Mostra apenas {}
```

**Depois:**
```typescript
console.error('Error saving test:', {
  message: err?.message,
  code: err?.code,
  details: err?.details,
  hint: err?.hint,
  error: err,
});  // ✅ Mostra todos os detalhes do erro
```

### 3. Criado SQL para corrigir RLS

Arquivo: `supabase/fix-disc-tests-rls.sql`

**Políticas criadas:**
- ✅ `Users can view own tests` - SELECT apenas próprios testes
- ✅ `Users can insert own tests` - INSERT apenas com auth.uid() = user_id
- ✅ `Users can update own tests` - UPDATE apenas próprios testes
- ✅ `Users can delete own tests` - DELETE apenas próprios testes
- ✅ `Admins can view all tests` - Admins veem todos os testes

---

## 🚀 Como Aplicar as Correções

### Passo 1: Executar SQL no Supabase

Acesse: https://eolvvdmzeifbeugkhkyg.supabase.co

**SQL Editor → New Query → Cole:**
```sql
-- Conteúdo do arquivo: supabase/fix-disc-tests-rls.sql
```

**Clique em Run**

Você deve ver:
```
✅ 5 políticas criadas
✅ Lista de políticas ativas
✅ UUID do usuário autenticado
```

### Passo 2: Reiniciar o Servidor Next.js

```bash
# Parar o servidor (Ctrl+C)
# Iniciar novamente
npm run dev
```

### Passo 3: Testar o Fluxo Completo

1. **Login**
   - Acesse: http://localhost:3000/login
   - Faça login com suas credenciais

2. **Fazer Teste DISC**
   - Acesse: http://localhost:3000/test
   - Responda as 20 perguntas
   - Selecione exatamente 2 opções por pergunta

3. **Verificar Salvamento**
   - Abra o Console do navegador (F12)
   - Clique em "Finalizar Teste"
   - **Se houver erro**, você verá:
     ```
     Error saving test: {
       message: "...",
       code: "...",
       details: "...",
       hint: "..."
     }
     ```
   - **Se funcionar**, você será redirecionado para `/result`

4. **Verificar no Supabase**
   ```sql
   SELECT 
     id,
     user_id,
     dominant_profile,
     question_count,
     question_source,
     created_at
   FROM disc_tests
   ORDER BY created_at DESC
   LIMIT 1;
   ```
   
   Você deve ver:
   - ✅ `user_id` = UUID do usuário autenticado
   - ✅ `question_count` = 20
   - ✅ `question_source` = 'legacy'
   - ✅ `dominant_profile` = D, I, S ou C

---

## 🔍 Diagnóstico de Erros

### Erro: "new row violates row-level security policy"

**Causa:** RLS está bloqueando o INSERT

**Solução:**
1. Verificar se o usuário está autenticado:
   ```sql
   SELECT auth.uid();
   ```
   Deve retornar um UUID, não NULL

2. Verificar se a política de INSERT existe:
   ```sql
   SELECT * FROM pg_policies 
   WHERE tablename = 'disc_tests' 
   AND cmd = 'INSERT';
   ```

3. Re-executar o SQL de correção RLS

### Erro: "column 'question_count' does not exist"

**Causa:** Migration não foi executada

**Solução:**
1. Executar a migration:
   ```sql
   -- Conteúdo de: supabase/migrations/20260505_add_dynamic_test_fields.sql
   ```

### Erro: "null value in column 'question_count' violates not-null constraint"

**Causa:** Código não está enviando os campos obrigatórios

**Solução:**
1. Verificar se o código foi atualizado corretamente
2. Reiniciar o servidor Next.js
3. Limpar cache do navegador (Ctrl+Shift+Delete)

### Erro: "Error saving test: {}"

**Causa:** Erro não está sendo capturado corretamente

**Solução:**
1. Verificar se o código de tratamento de erro foi atualizado
2. Reiniciar o servidor
3. Verificar o console do navegador novamente

---

## 📊 Estrutura Esperada do Teste Salvo

```json
{
  "id": "uuid",
  "user_id": "uuid-do-usuario-autenticado",
  "questions": [
    { "id": 1, "text": "..." }
  ],
  "answers": [
    { "questionId": 1, "discTypes": ["D", "I"] }
  ],
  "result": {
    "dominantProfile": "D",
    "scores": { "D": 15, "I": 10, "S": 8, "C": 7 },
    "aiAnalysis": "..."
  },
  "scores": { "D": 15, "I": 10, "S": 8, "C": 7 },
  "dominant_profile": "D",
  "ai_analysis": "...",
  "question_count": 20,
  "question_source": "legacy",
  "generated_questions": null,
  "created_at": "2026-05-05T..."
}
```

---

## ✅ Checklist de Validação

Após aplicar as correções:

- [ ] SQL de RLS executado sem erros
- [ ] 5 políticas criadas no Supabase
- [ ] Servidor Next.js reiniciado
- [ ] Login funciona
- [ ] Teste DISC carrega 20 perguntas
- [ ] Consegue selecionar 2 opções por pergunta
- [ ] Ao finalizar, NÃO aparece erro no console
- [ ] Redireciona para `/result`
- [ ] Resultado aparece corretamente
- [ ] Teste salvo no Supabase com `question_count=20` e `question_source='legacy'`
- [ ] Chat com Lucas funciona
- [ ] Análise da Marina funciona

---

## 🎯 Arquivos Modificados

1. ✅ `app/test/page.tsx` - Corrigido chamada de saveTest
2. ✅ `supabase/fix-disc-tests-rls.sql` - SQL para corrigir RLS
3. ✅ `CORRIGIR_SALVAMENTO_TESTE.md` - Esta documentação

---

## 📝 Próximos Passos

**Após validar que o salvamento funciona:**

1. ✅ Confirmar que não há mais erros no console
2. ✅ Confirmar que o teste é salvo no Supabase
3. ✅ Confirmar que o resultado aparece corretamente
4. ✅ Confirmar que Marina e Lucas funcionam

**Só então avançar para Task 2 - TypeScript Type Definitions**

---

## 🆘 Se Ainda Houver Erro

**Me envie:**
1. Print do erro completo no console do navegador
2. Resultado da query:
   ```sql
   SELECT * FROM pg_policies WHERE tablename = 'disc_tests';
   ```
3. Resultado da query:
   ```sql
   SELECT auth.uid();
   ```
4. Resultado da query:
   ```sql
   SELECT column_name, data_type, is_nullable, column_default
   FROM information_schema.columns
   WHERE table_name = 'disc_tests'
   ORDER BY ordinal_position;
   ```

---

**Status:** ✅ CORREÇÕES APLICADAS - AGUARDANDO VALIDAÇÃO
