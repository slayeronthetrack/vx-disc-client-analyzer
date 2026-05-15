# 🧪 Como Testar o Sistema de Aprendizado

## ✅ Servidor Rodando
O servidor está ativo em: **http://localhost:3000**

---

## 📋 PASSO A PASSO PARA TESTAR

### 1️⃣ Fazer Login
1. Acesse: http://localhost:3000/login
2. Use suas credenciais:
   - **Email:** juliopppimentel@gmail.com
   - **Senha:** teste123

### 2️⃣ Iniciar Teste
1. Acesse: http://localhost:3000/test
2. Escolha quantidade de perguntas: **20** (mais rápido para testar)
3. Preencha os campos:
   - **Cargo:** `Desenvolvedor Full Stack Senior`
   - **Objetivo:** `Autoconhecimento e desenvolvimento profissional`
4. Clique em **"Iniciar Teste"**

### 3️⃣ Responder Perguntas
- Responda as 20 perguntas normalmente
- Tente responder **rapidamente** (< 30s por pergunta)
- **Não altere** as respostas depois de escolher
- Isso aumenta as chances das perguntas serem salvas no banco

### 4️⃣ Finalizar Teste
- Clique em **"Finalizar Teste"**
- Aguarde o processamento
- Você será redirecionado para a página de resultado

---

## 🔍 ONDE VERIFICAR OS LOGS

### No Terminal do Servidor
Procure por estas mensagens no terminal onde roda `npm run dev`:

```
[Learning] Processing test feedback...
[LearningSystem] Processing feedback: {
  testId: '...',
  userId: '...',
  questionCount: 20,
  completionRate: 1
}
[LearningSystem] Saving successful questions: { total: 20, successful: X }
[LearningSystem] New question saved: Pergunta...
[LearningSystem] New profile discovered: {
  jobTitle: 'Desenvolvedor Full Stack Senior',
  normalized: 'desenvolvedor-full-stack-senior',
  category: 'tecnologia'
}
[LearningSystem] New objective discovered: {
  testObjective: 'Autoconhecimento e desenvolvimento profissional',
  normalized: 'autoconhecimento-e-desenvolvimento-profissional',
  category: 'autoconhecimento'
}
[LearningSystem] Feedback processed successfully
```

### No Console do Navegador (F12)
Abra o DevTools (F12) e vá na aba **Console**. Procure por:
```
[Marina] { success: true, usedFallback: false, executionTime: '...' }
```

---

## 📊 VERIFICAR DADOS NO SUPABASE

Após completar o teste, execute estas queries no **Supabase SQL Editor**:

### 1. Perfis Descobertos
```sql
SELECT 
  job_title,
  normalized_title,
  category,
  frequency,
  last_seen
FROM discovered_profiles
ORDER BY frequency DESC, last_seen DESC;
```

**Resultado Esperado:**
```
job_title                          | category    | frequency | last_seen
-----------------------------------|-------------|-----------|-------------------
Desenvolvedor Full Stack Senior    | tecnologia  | 1         | 2026-05-07 ...
Gerente de Vendas                  | vendas      | 0         | ...
...
```

### 2. Objetivos Descobertos
```sql
SELECT 
  objective,
  normalized_objective,
  category,
  frequency,
  last_seen
FROM discovered_objectives
ORDER BY frequency DESC, last_seen DESC;
```

**Resultado Esperado:**
```
objective                                      | category         | frequency
-----------------------------------------------|------------------|----------
Autoconhecimento e desenvolvimento profissional| autoconhecimento | 1
Autoconhecimento                               | autoconhecimento | 0
...
```

### 3. Feedback das Perguntas
```sql
SELECT 
  question_text,
  response_time_ms,
  was_changed,
  final_answer,
  created_at
FROM question_feedback
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado Esperado:**
```
question_text                    | response_time_ms | was_changed | final_answer
---------------------------------|------------------|-------------|-------------
Pergunta 1: Como você age...     | 15000           | false       | {D}
Pergunta 2: Em situações...      | 15000           | false       | {I}
...
```

### 4. Perguntas Salvas no Banco
```sql
SELECT 
  id,
  question_text,
  quality_score,
  clarity_score,
  usage_count,
  source,
  created_at
FROM question_bank
ORDER BY created_at DESC
LIMIT 10;
```

**Resultado Esperado:**
Se as perguntas atenderem aos critérios de sucesso:
- Respondidas em < 30s
- Não alteradas
- Taxa de conclusão > 80%

Você verá perguntas salvas aqui!

### 5. Performance das Perguntas
```sql
SELECT 
  qp.question_id,
  qp.completed,
  qp.time_to_answer,
  qp.user_feedback_rating,
  qp.selected_option,
  qp.selected_at
FROM question_performance qp
ORDER BY qp.selected_at DESC
LIMIT 20;
```

---

## ✅ CHECKLIST DE VALIDAÇÃO

Após o teste, verifique:

- [ ] Logs aparecem no terminal do servidor
- [ ] Novo perfil foi descoberto em `discovered_profiles`
- [ ] Novo objetivo foi descoberto em `discovered_objectives`
- [ ] Feedback foi salvo em `question_feedback`
- [ ] Perguntas bem-sucedidas foram salvas em `question_bank` (se atenderem critérios)
- [ ] Métricas foram registradas em `question_performance`

---

## 🎯 CRITÉRIOS DE SUCESSO PARA PERGUNTAS

Para uma pergunta ser salva no banco inteligente, ela precisa:

1. ✅ **Tempo de resposta < 30 segundos**
2. ✅ **Não foi alterada** (usuário não mudou a resposta)
3. ✅ **Taxa de conclusão do teste > 80%** (teste foi concluído)

Se você responder rapidamente e não alterar as respostas, as perguntas serão salvas!

---

## 🔄 TESTAR MÚLTIPLAS VEZES

Para ver o sistema aprendendo:

1. **Teste 1:** Use cargo "Desenvolvedor Full Stack Senior"
   - Verifique: `frequency = 1` em `discovered_profiles`

2. **Teste 2:** Use o mesmo cargo novamente
   - Verifique: `frequency = 2` em `discovered_profiles`

3. **Teste 3:** Use cargo diferente "Gerente de Vendas"
   - Verifique: Novo perfil com `category = 'vendas'`

4. **Teste 4:** Use objetivo diferente "Melhorar liderança"
   - Verifique: Novo objetivo com `category = 'lideranca'`

---

## 🐛 TROUBLESHOOTING

### Logs não aparecem
**Causa:** Sistema de aprendizado roda assíncrono
**Solução:** Aguarde 5-10 segundos após finalizar o teste

### Perguntas não são salvas
**Causa:** Não atendem critérios de sucesso
**Solução:** 
- Responda mais rápido (< 30s)
- Não altere respostas
- Complete o teste (não abandone)

### Perfil não é descoberto
**Causa:** Campo "Cargo" não foi preenchido
**Solução:** Preencha o campo "Cargo" antes de iniciar o teste

### Objetivo não é descoberto
**Causa:** Campo "Objetivo" não foi preenchido
**Solução:** Preencha o campo "Objetivo do Teste" antes de iniciar

---

## 📈 CATEGORIZAÇÃO AUTOMÁTICA

O sistema categoriza automaticamente:

### Cargos
- **vendas:** vendas, comercial
- **tecnologia:** desenvolvedor, programador, tech, engenheiro
- **lideranca:** gerente, gestor, diretor, coordenador
- **marketing:** marketing, comunicação
- **rh:** rh, recursos humanos
- **financeiro:** financeiro, contábil
- **operacoes:** operações, logística
- **atendimento:** atendimento, suporte

### Objetivos
- **autoconhecimento:** autoconhecimento, conhecer
- **desenvolvimento:** desenvolvimento, crescimento
- **lideranca:** liderança, líder
- **comunicacao:** comunicação, comunicar
- **carreira:** carreira, transição
- **performance:** vendas, performance
- **equipe:** equipe, time

---

## 🎉 RESULTADO ESPERADO

Após alguns testes, você verá:

✅ Banco de perguntas crescendo
✅ Perfis profissionais sendo descobertos
✅ Objetivos sendo categorizados
✅ Frequências aumentando
✅ Sistema ficando mais inteligente!

**O sistema aprende sozinho! 🧠**

---

## 📞 PRÓXIMOS PASSOS

Depois de validar que está funcionando:

1. ✅ Fazer múltiplos testes com diferentes perfis
2. ✅ Verificar crescimento do banco de perguntas
3. ✅ Monitorar métricas de qualidade
4. ✅ Gerar insights automáticos (função `generate_learning_insights()`)

---

## 🚀 COMANDO RÁPIDO

Execute no Supabase para ver tudo de uma vez:

```sql
-- Dashboard do Sistema de Aprendizado
SELECT 'Perfis Descobertos' as tipo, COUNT(*) as total FROM discovered_profiles
UNION ALL
SELECT 'Objetivos Descobertos', COUNT(*) FROM discovered_objectives
UNION ALL
SELECT 'Perguntas no Banco', COUNT(*) FROM question_bank
UNION ALL
SELECT 'Feedback Registrado', COUNT(*) FROM question_feedback
UNION ALL
SELECT 'Métricas de Performance', COUNT(*) FROM question_performance;
```

**Boa sorte com os testes! 🎯**
