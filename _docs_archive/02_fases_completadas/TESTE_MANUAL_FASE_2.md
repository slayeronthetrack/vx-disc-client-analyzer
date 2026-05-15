# 🧪 TESTE MANUAL - FASE 2

**Objetivo:** Validar todas as funcionalidades implementadas na FASE 2

---

## 📋 CHECKLIST DE TESTES

### ✅ TESTE 1: Perfil Obrigatório

**Cenário:** Tentar fazer teste sem perfil completo

**Passos:**
1. Faça login no sistema
2. Acesse diretamente `/test`
3. **Resultado esperado:**
   - ✅ Deve mostrar tela "Perfil Incompleto"
   - ✅ Mensagem: "Você precisa completar seu perfil antes de fazer o teste DISC"
   - ✅ Botão "Completar Perfil"
4. Clique em "Completar Perfil"
5. **Resultado esperado:**
   - ✅ Redireciona para `/profile`

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 2: Completar Perfil

**Cenário:** Preencher perfil completo

**Passos:**
1. Em `/profile`, preencha:
   - Nome Completo
   - Cargo
   - Empresa
   - Objetivo do Teste (opcional)
2. Clique em "Salvar Perfil"
3. **Resultado esperado:**
   - ✅ Mensagem de sucesso
   - ✅ Redireciona para `/test` após 2 segundos

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 3: Seleção de 2 Respostas

**Cenário:** Testar seleção múltipla no teste

**Passos:**
1. Em `/test`, na primeira pergunta:
2. Selecione 1 opção
   - **Resultado esperado:**
   - ✅ Checkbox marcado
   - ✅ Contador mostra "1/2 opções selecionadas"
   - ✅ Botão "Próxima" desabilitado
3. Selecione 2ª opção
   - **Resultado esperado:**
   - ✅ Ambos checkboxes marcados
   - ✅ Contador mostra "2/2 opções selecionadas" (verde)
   - ✅ Botão "Próxima" habilitado
   - ✅ Outras opções ficam desabilitadas (cinza)
4. Tente selecionar 3ª opção
   - **Resultado esperado:**
   - ✅ Não permite selecionar (botão desabilitado)
5. Desmarque uma opção
   - **Resultado esperado:**
   - ✅ Contador volta para "1/2"
   - ✅ Outras opções ficam habilitadas novamente
   - ✅ Botão "Próxima" desabilitado

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 4: Navegação Entre Perguntas

**Cenário:** Testar navegação e persistência de respostas

**Passos:**
1. Selecione 2 opções na pergunta 1
2. Clique em "Próxima"
3. **Resultado esperado:**
   - ✅ Vai para pergunta 2
   - ✅ Barra de progresso atualiza (2/10)
4. Selecione 2 opções na pergunta 2
5. Clique em "Anterior"
6. **Resultado esperado:**
   - ✅ Volta para pergunta 1
   - ✅ Respostas da pergunta 1 ainda estão marcadas
7. Clique em "Próxima" novamente
8. **Resultado esperado:**
   - ✅ Volta para pergunta 2
   - ✅ Respostas da pergunta 2 ainda estão marcadas

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 5: Completar Teste

**Cenário:** Responder todas as 10 perguntas

**Passos:**
1. Responda todas as 10 perguntas (2 opções cada)
2. Na última pergunta, clique em "Finalizar Teste"
3. **Resultado esperado:**
   - ✅ Botão muda para "Salvando..."
   - ✅ Spinner aparece
   - ✅ Aguarda alguns segundos
   - ✅ Redireciona para `/result`

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 6: Visualizar Resultado

**Cenário:** Ver resultado com análise IA

**Passos:**
1. Em `/result`, verifique:
2. **Resultado esperado:**
   - ✅ Perfil dominante exibido (D, I, S ou C)
   - ✅ Descrição do perfil
   - ✅ Características principais
   - ✅ Gráfico de scores (D, I, S, C)
   - ✅ **Seção "Análise Personalizada com IA"** (roxo/azul)
   - ✅ Ícone de robô 🤖
   - ✅ Texto da análise IA
   - ✅ Informações do perfil do usuário
   - ✅ Data de conclusão do teste

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 7: Verificar Salvamento no Supabase

**Cenário:** Confirmar que dados foram salvos

**Passos:**
1. Abra Supabase Dashboard
2. Vá para SQL Editor
3. Execute:
```sql
SELECT * FROM disc_tests 
WHERE user_id = 'SEU_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;
```
4. **Resultado esperado:**
   - ✅ Registro existe
   - ✅ Campo `answers` tem array com 10 perguntas
   - ✅ Cada resposta tem 2 `discTypes`
   - ✅ Campo `scores` tem valores corretos
   - ✅ Campo `dominant_profile` tem valor (D, I, S ou C)
   - ✅ Campo `ai_analysis` tem texto (se IA funcionou)
   - ✅ Campo `created_at` tem timestamp

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 8: Refazer Teste

**Cenário:** Fazer teste novamente

**Passos:**
1. Em `/result`, clique em "Refazer Teste"
2. **Resultado esperado:**
   - ✅ Redireciona para `/test`
   - ✅ Perguntas aparecem vazias (sem respostas anteriores)
3. Complete o teste novamente
4. **Resultado esperado:**
   - ✅ Novo resultado salvo
   - ✅ Resultado anterior ainda existe no banco

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 9: Console do Navegador

**Cenário:** Verificar se há erros

**Passos:**
1. Abra Console (F12)
2. Faça o fluxo completo: Login → Perfil → Teste → Resultado
3. **Resultado esperado:**
   - ✅ Nenhum erro em vermelho
   - ✅ Logs do `useAuth` aparecem
   - ✅ "Profile: Found"
   - ✅ "State loaded successfully"

**Status:** [ ] Passou [ ] Falhou

---

### ✅ TESTE 10: Performance

**Cenário:** Verificar velocidade

**Passos:**
1. Observe o tempo de carregamento de cada página
2. **Resultado esperado:**
   - ✅ Login: < 1s
   - ✅ Perfil: < 1s
   - ✅ Teste: < 1s
   - ✅ Salvamento: < 3s
   - ✅ Resultado: < 2s

**Status:** [ ] Passou [ ] Falhou

---

## 📊 RESUMO DOS TESTES

**Total de testes:** 10

**Passaram:** ___/10  
**Falharam:** ___/10

---

## 🐛 PROBLEMAS ENCONTRADOS

### Críticos (impedem uso):
```
_[Liste aqui]_
```

### Médios (afetam experiência):
```
_[Liste aqui]_
```

### Menores (melhorias):
```
_[Liste aqui]_
```

---

## ✅ CONCLUSÃO

**Status Geral:** [ ] ✅ APROVADO | [ ] ⚠️ APROVADO COM RESSALVAS | [ ] ❌ REPROVADO

**Comentários:**
```
_[Seus comentários aqui]_
```

**Próximos Passos:**
```
_[O que fazer depois]_
```

---

## 🚀 SE TODOS OS TESTES PASSAREM

**FASE 2 VALIDADA! ✅**

**Pode avançar para FASE 3:**
1. Chat IA melhorado
2. Relatório PDF
3. Dashboard admin completo

---

**Boa sorte nos testes! 🎯**
