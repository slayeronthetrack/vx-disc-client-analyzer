# 🚀 GUIA RÁPIDO - TESTE FASE 2

**Status:** FASE 2 implementada e pronta para teste  
**Servidor:** ✅ Rodando em http://localhost:3001  
**Data:** 2026-05-05

---

## ✅ O QUE FOI IMPLEMENTADO

1. ✅ **Teste com 2 respostas** (checkbox em vez de radio)
2. ✅ **Validação mínimo/máximo** (exatamente 2 opções)
3. ✅ **Contador visual** (X/2 opções selecionadas)
4. ✅ **Perfil obrigatório** (bloqueia teste se não completo)
5. ✅ **Integração com IA** (análise personalizada)
6. ✅ **Salvamento no Supabase** (com ai_analysis)

---

## 🧪 TESTE RÁPIDO (5 MINUTOS)

### 1️⃣ Login
```
1. Abra: http://localhost:3001/login
2. Email: seu_email@exemplo.com
3. Senha: sua_senha
4. Clique em "Entrar"
```

**✅ Deve:** Redirecionar para /dashboard ou /profile

---

### 2️⃣ Completar Perfil (se necessário)
```
1. Vá para: http://localhost:3001/profile
2. Preencha:
   - Nome Completo
   - Cargo
   - Empresa
3. Clique em "Salvar Perfil"
```

**✅ Deve:** Mostrar mensagem de sucesso e redirecionar para /test

---

### 3️⃣ Fazer Teste (PRINCIPAL)
```
1. Vá para: http://localhost:3001/test
2. Na primeira pergunta:
   - Selecione 1 opção → Contador mostra "1/2"
   - Botão "Próxima" deve estar DESABILITADO
   - Selecione 2ª opção → Contador mostra "2/2" (verde)
   - Botão "Próxima" deve estar HABILITADO
   - Outras opções ficam DESABILITADAS (cinza)
3. Clique em "Próxima"
4. Repita para todas as 10 perguntas
5. Na última pergunta, clique em "Finalizar Teste"
```

**✅ Deve:** 
- Mostrar "Salvando..." com spinner
- Aguardar alguns segundos
- Redirecionar para /result

---

### 4️⃣ Ver Resultado (CRÍTICO)
```
1. Em: http://localhost:3001/result
2. Verifique se aparece:
   ✅ Perfil dominante (D, I, S ou C)
   ✅ Descrição do perfil
   ✅ Características principais
   ✅ Gráfico de scores (D, I, S, C)
   ✅ **Seção "Análise Personalizada com IA"** (roxo/azul)
   ✅ Ícone de robô 🤖
   ✅ Texto da análise IA
```

**✅ Deve:** Mostrar TUDO acima, especialmente a análise IA

---

## 🎯 CHECKLIST RÁPIDO

- [ ] Login funcionou
- [ ] Perfil foi salvo
- [ ] Teste aceita 2 respostas por pergunta
- [ ] Contador mostra X/2
- [ ] Botão desabilita quando < 2 respostas
- [ ] Outras opções desabilitam quando = 2 respostas
- [ ] Teste foi finalizado e salvou
- [ ] Resultado apareceu
- [ ] **Análise IA apareceu** (seção roxa/azul)

---

## 🐛 SE ALGO NÃO FUNCIONAR

### Problema: Loading infinito
**Solução:**
```bash
# Limpar cache do navegador
Ctrl + Shift + Delete → Limpar tudo

# Fazer logout e login novamente
```

### Problema: Análise IA não aparece
**Verificar:**
1. Console do navegador (F12) → Ver erros
2. Verificar se API `/api/ai/calculate-result` foi chamada
3. Verificar se campo `ai_analysis` foi salvo no Supabase

### Problema: Erro 500
**Verificar:**
1. Supabase está configurado?
2. Tabela `profiles` existe?
3. Perfil do usuário existe?

---

## 📊 VERIFICAR NO SUPABASE

```sql
-- Ver último teste
SELECT * FROM disc_tests 
WHERE user_id = 'SEU_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar se tem análise IA
SELECT ai_analysis FROM disc_tests 
WHERE user_id = 'SEU_USER_ID' 
ORDER BY created_at DESC 
LIMIT 1;
```

**✅ Deve ter:**
- `answers` com 10 perguntas
- Cada resposta com 2 `discTypes`
- `scores` calculados
- `dominant_profile` definido
- `ai_analysis` com texto (se IA funcionou)

---

## ✅ SE TUDO FUNCIONAR

**FASE 2 VALIDADA! 🎉**

**Próximos passos:**
1. ✅ FASE 2 completa
2. 🚀 Avançar para FASE 3:
   - Chat IA melhorado
   - Relatório PDF
   - Dashboard admin completo

---

## 🆘 PRECISA DE AJUDA?

**Console do navegador (F12):**
- Ver erros em vermelho
- Ver logs do `useAuth`
- Ver chamadas de API

**Servidor (terminal):**
- Ver logs de requisições
- Ver erros de compilação

---

**Boa sorte no teste! 🎯**

Se tudo funcionar, me avise: "FASE 2 validada ✅"
