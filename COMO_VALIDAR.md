# 🎯 Como Fazer a Validação - Passo a Passo

## 1️⃣ Servidor Já Está Rodando

✅ Servidor ativo em: **http://localhost:3000**

---

## 2️⃣ Abra o Navegador

```
http://localhost:3000
```

---

## 3️⃣ Fluxo de Validação

### Passo 1: Login/Registro
1. Se não tiver conta, clique em "Registrar"
2. Preencha:
   - Nome completo
   - Email
   - Senha
   - Cargo (ex: "Gerente de Vendas")
   - Empresa (ex: "Tech Corp")
   - Objetivo do teste (ex: "Melhorar performance comercial")

### Passo 2: Fazer Teste DISC
1. Vá para `/test` ou clique em "Fazer Teste"
2. Responda as 20 perguntas
3. Selecione 1 ou 2 opções por pergunta
4. Complete até o fim

### Passo 3: Ver Resultado
1. Aguarde a análise da Marina (pode levar 5-10 segundos)
2. Leia a análise completa
3. **Verifique**:
   - ❌ Tem `**texto**` ou `## título`? (markdown quebrado)
   - ✅ Texto fluido e profissional?
   - ✅ Usa seu nome, cargo e empresa?
   - ✅ Recomendações práticas e específicas?

### Passo 4: Abrir Chat
1. Clique no ícone de chat (canto inferior direito)
2. Digite: **"Como melhorar minhas vendas?"**
3. Aguarde resposta do Lucas (5-10 segundos)
4. **Verifique**:
   - ❌ Tem markdown quebrado?
   - ✅ Resposta tem 2-4 parágrafos (não muito longa)?
   - ✅ Lucas menciona seu perfil DISC?
   - ✅ Lucas usa insights da análise da Marina?
   - ✅ Recomendações práticas e específicas?

---

## 4️⃣ O Que Observar

### ✅ Marina (Análise DISC)

**BOM**:
```
Seu perfil dominante é Dominância, representando 38% do seu 
comportamento. Como gerente de vendas na Tech Corp, isso significa 
que você naturalmente assume o controle em negociações...
```

**RUIM**:
```
**Seu perfil é Dominância**

## Pontos Fortes:
- Você é orientado para resultados
- Você toma decisões rápidas
```

### ✅ Lucas (Chat)

**BOM**:
```
João, pelo seu perfil Dominância que a Marina analisou, você tem 
uma vantagem natural em vendas: decisão rápida e foco em resultados. 
Mas isso pode estar te atrapalhando na prospecção. Você está indo 
direto para o pitch sem construir rapport?

Teste isso esta semana: nas próximas 5 ligações, comece com uma 
pergunta aberta sobre o negócio do cliente. Me conta, você já faz 
isso ou vai direto ao ponto?
```

**RUIM**:
```
**Como melhorar suas vendas:**

1. Seja mais organizado
2. Melhore sua comunicação
3. Desenvolva empatia

Espero ter ajudado! 😊
```

---

## 5️⃣ Logs do Servidor

### Como Ver os Logs

**Opção 1: Terminal onde o servidor está rodando**
- Procure por mensagens com `[Marina]` e `[Lucas]`

**Opção 2: Console do Navegador (F12)**
- Aba "Console"
- Procure por erros ou warnings

### O Que Procurar

✅ **Sucesso**:
```
[Marina] { success: true, usedFallback: false, executionTime: 2341ms }
[Lucas] { success: true, usedFallback: false, executionTime: 1823ms }
```

⚠️ **Fallback**:
```
[Marina] { success: true, usedFallback: true, executionTime: 234ms }
```

❌ **Erro**:
```
[Marina] Error: API key missing
[Lucas] Error: Failed to fetch
```

---

## 6️⃣ Checklist Rápido

### Marina
- [ ] Sem markdown (`**`, `##`, `-`)
- [ ] Texto profissional e fluido
- [ ] Usa nome, cargo, empresa
- [ ] Recomendações práticas

### Lucas
- [ ] Sem markdown
- [ ] Resposta curta (2-4 parágrafos)
- [ ] Usa análise da Marina
- [ ] Recomendações práticas
- [ ] Faz perguntas

### Fluxo
- [ ] Marina gerou análise
- [ ] Lucas usou análise da Marina
- [ ] Histórico do chat funciona

---

## 7️⃣ Depois da Validação

### Se tudo estiver OK:
✅ Me avise: "Validação aprovada"
✅ Envie prints ou trechos das respostas
✅ Avançamos para **Perguntas Dinâmicas**

### Se houver problemas:
⚠️ Me avise: "Encontrei problema X"
⚠️ Envie print ou copie o texto problemático
⚠️ Ajustamos e testamos novamente

---

## 🎯 Objetivo

Confirmar que:
1. Marina escreve como consultora profissional (sem markdown)
2. Lucas escreve como consultor comercial (sem markdown)
3. Lucas usa análise da Marina para personalizar respostas
4. Fluxo encadeado funciona

---

**Tempo estimado**: 10-15 minutos  
**Servidor**: http://localhost:3000  
**Pronto para começar!** 🚀
