# 🔍 Debug do Erro 500 - Logs Detalhados Adicionados

## ⚠️ Situação Atual

Você está recebendo erro 500 ao finalizar o teste:
```
[Test] API error: {}
Error saving test: {}
api/ai/calculate-result: Failed to load resource: the server responded with a status of 500
```

## ✅ O Que Foi Feito

Adicionei **logs extremamente detalhados** em TODOS os pontos críticos do código para identificar EXATAMENTE onde o erro está ocorrendo:

### 1. Frontend (`app/test/page.tsx`)
```typescript
// Agora captura TODOS os detalhes do erro da API
if (!aiResponse.ok) {
  const errorText = await aiResponse.text();
  let errorData: any = {};
  try {
    errorData = JSON.parse(errorText);
  } catch {
    errorData = { raw: errorText };
  }
  
  console.error('[Test] API error:', {
    status: aiResponse.status,
    statusText: aiResponse.statusText,
    url: aiResponse.url,
    errorData,
    errorText,  // ← NOVO: texto completo da resposta
  });
}
```

### 2. Backend (`app/api/ai/calculate-result/route.ts`)

Adicionei logs em CADA etapa:

```typescript
// 1. Início da requisição
console.log('[calculate-result] Request received:', {
  userId,
  userName,
  answersCount: answers?.length,
  questionsCount: questions?.length,
});

// 2. Após converter respostas
console.log('[calculate-result] Extended answers:', {
  count: extendedAnswers.length,
  sample: extendedAnswers[0],
});

// 3. Após calcular perfil (com try-catch)
try {
  integratedProfile = calculateIntegratedProfile(extendedAnswers);
  console.log('[calculate-result] Integrated profile calculated:', {...});
} catch (profileError) {
  console.error('[calculate-result] Error calculating profile:', {...});
  throw new Error(`Erro ao calcular perfil: ${profileError?.message}`);
}

// 4. Após executar Marina (com try-catch)
try {
  marinaResponse = await marina.execute(...);
  console.log('[calculate-result] Marina executed:', {...});
} catch (marinaError) {
  console.error('[calculate-result] Error executing Marina:', {...});
  // Usa fallback
}

// 5. Antes de salvar
console.log('[calculate-result] Preparing to save test:', {...});

// 6. Ao salvar (com try-catch)
try {
  await discTestService.saveTest({...});
  console.log('[calculate-result] Test saved successfully');
} catch (saveError) {
  console.error('[calculate-result] Error saving test:', {
    message, code, details, hint, stack
  });
  throw new Error(`Erro ao salvar teste: ${saveError?.message}`);
}
```

## 🔍 Como Identificar o Problema

### Passo 1: Verificar o Terminal do Servidor

Abra o terminal onde `npm run dev` está rodando e procure por:

#### ✅ Se Tudo Estiver OK (não deve ser o caso):
```
[calculate-result] Request received: { userId: '...', userName: '...', answersCount: 20, questionsCount: 20 }
[calculate-result] Extended answers: { count: 20, sample: {...} }
[calculate-result] Integrated profile calculated: { hasDisc: true, hasValues: false, hasPsychological: false, dominant: 'D' }
[calculate-result] Marina executed: { success: true, usedFallback: false }
[calculate-result] Preparing to save test: { userId: '...', answersCount: 20, questionsCount: 20, hasAnalysis: true }
[discTestService] Tabela sem campos novos, usando apenas campos base
[calculate-result] Test saved successfully
```

#### ❌ Se Houver Erro (esperado):

**Erro no Cálculo do Perfil:**
```
[calculate-result] Request received: {...}
[calculate-result] Extended answers: {...}
[calculate-result] Error calculating profile: {
  message: "...",
  stack: "...",
  extendedAnswersCount: 20
}
```

**Erro na Marina:**
```
[calculate-result] Request received: {...}
[calculate-result] Extended answers: {...}
[calculate-result] Integrated profile calculated: {...}
[calculate-result] Error executing Marina: {
  message: "...",
  stack: "..."
}
```

**Erro ao Salvar:**
```
[calculate-result] Request received: {...}
[calculate-result] Extended answers: {...}
[calculate-result] Integrated profile calculated: {...}
[calculate-result] Marina executed: {...}
[calculate-result] Preparing to save test: {...}
[calculate-result] Error saving test: {
  message: "column 'question_count' does not exist",
  code: "42703",
  details: "...",
  hint: "..."
}
```

### Passo 2: Verificar o Console do Navegador

Abra o DevTools (F12) → Console e procure por:

```javascript
[Test] API error: {
  status: 500,
  statusText: "Internal Server Error",
  url: "http://localhost:3000/api/ai/calculate-result",
  errorData: { error: "...", details: "..." },
  errorText: "..." // ← NOVO: texto completo do erro
}
```

## 📋 O Que Fazer Agora

### 1. Reiniciar o Servidor

```bash
# Parar o servidor (Ctrl+C)
# Reiniciar
npm run dev
```

### 2. Fazer o Teste Novamente

1. Vá para `/test`
2. Escolha 20 perguntas
3. Responda todas as perguntas
4. Clique em "Finalizar Teste"

### 3. Copiar TODOS os Logs

**Do Terminal (servidor):**
- Copie TODAS as linhas que começam com `[calculate-result]`
- Copie TODAS as linhas que começam com `[discTestService]`
- Copie TODAS as linhas de erro (em vermelho)

**Do Console do Navegador:**
- Copie a linha `[Test] API error: {...}`
- Copie a linha `Error saving test: {...}`
- Expanda os objetos (clique nas setinhas) e copie o conteúdo completo

### 4. Me Enviar os Logs

Cole TODOS os logs aqui para que eu possa identificar o problema exato.

## 🎯 Possíveis Causas

Com base nos logs, o erro pode ser:

### 1. Erro no Cálculo do Perfil
- `calculateIntegratedProfile()` está lançando exceção
- Dados das respostas estão em formato incorreto
- Falta algum campo obrigatório

### 2. Erro na Marina (Agente IA)
- Agente não está configurado corretamente
- Erro ao executar o agente
- Timeout ou erro de rede

### 3. Erro ao Salvar no Banco
- Colunas faltando na tabela `disc_tests`
- Formato de dados incompatível
- Erro de conexão com Supabase
- Permissões insuficientes

### 4. Erro de Validação
- Dados inválidos sendo enviados
- Campos obrigatórios faltando
- Formato JSON incorreto

## 🔧 Soluções Rápidas

### Se o erro for "column does not exist":
```bash
# Execute as migrations no Supabase SQL Editor
# Arquivo: supabase/fix-disc-tests-table.sql
```

### Se o erro for na Marina:
```typescript
// O código já tem fallback automático
// A Marina não deve impedir o salvamento
```

### Se o erro for no cálculo do perfil:
```typescript
// Verifique se as perguntas têm os campos corretos
// Verifique se as respostas estão no formato esperado
```

## 📞 Próximos Passos

1. ✅ Reinicie o servidor
2. ✅ Faça o teste novamente
3. ✅ Copie TODOS os logs (terminal + console)
4. ✅ Me envie os logs
5. ⏳ Aguarde análise e correção específica

---

**Com esses logs detalhados, vou conseguir identificar EXATAMENTE onde está o problema!** 🔍
