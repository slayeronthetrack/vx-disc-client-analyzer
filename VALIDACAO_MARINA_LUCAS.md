# 🧪 Validação Marina e Lucas - Checklist

## 📋 Instruções para Validação

### 1. Acesse o Sistema
```
http://localhost:3000
```

### 2. Fluxo Completo

#### Passo 1: Login/Registro
- [ ] Fazer login ou criar conta
- [ ] Completar perfil (nome, cargo, empresa, objetivo)

#### Passo 2: Fazer Teste DISC
- [ ] Ir para `/test`
- [ ] Responder as 20 perguntas
- [ ] Selecionar 1 ou 2 opções por pergunta
- [ ] Completar até o fim

#### Passo 3: Ver Resultado
- [ ] Aguardar análise da Marina
- [ ] Verificar se resultado aparece

#### Passo 4: Abrir Chat
- [ ] Clicar no ícone de chat (canto inferior direito)
- [ ] Fazer pergunta: "Como melhorar minhas vendas?"
- [ ] Verificar resposta do Lucas

---

## ✅ Checklist de Validação

### Marina (Análise DISC)

#### Formato e Estilo
- [ ] **Sem markdown**: Não usa `**`, `##`, `-`, `•`
- [ ] **Sem símbolos**: Não usa emojis ou símbolos desnecessários
- [ ] **Texto fluido**: Parágrafos bem construídos, não listas genéricas
- [ ] **Tom profissional**: Escreve como consultora experiente

#### Conteúdo
- [ ] **Não fala como IA**: Não menciona "IA", "sistema", "assistente"
- [ ] **Personalização**: Usa nome, cargo e empresa do usuário
- [ ] **Específica ao perfil**: Análise conectada ao perfil DISC dominante
- [ ] **Recomendações práticas**: Ações específicas, não conselhos vagos

#### Estrutura
- [ ] **Diagnóstico**: 2-3 parágrafos explicando o perfil
- [ ] **Pontos fortes**: 3-4 itens práticos
- [ ] **Pontos de atenção**: 3-4 itens construtivos
- [ ] **Recomendações**: 3-4 ações aplicáveis

---

### Lucas (Chat Comercial)

#### Formato e Estilo
- [ ] **Sem markdown**: Não usa `**`, `##`, `-`, `•`
- [ ] **Respostas curtas**: 2-4 parágrafos máximo
- [ ] **Tom direto**: Consultor comercial, não chatbot
- [ ] **Linguagem estratégica**: Foco em resultados e ações

#### Conteúdo
- [ ] **Usa análise da Marina**: Referencia insights da Marina
- [ ] **Personalizado ao perfil**: Conselhos específicos ao DISC
- [ ] **Não genérico**: Evita frases como "você precisa melhorar"
- [ ] **Faz perguntas**: Pergunta para entender contexto
- [ ] **Recomendações práticas**: Ações específicas, não teoria

#### Contexto
- [ ] **Conhece o usuário**: Usa nome, cargo, empresa
- [ ] **Conhece o perfil**: Referencia D, I, S ou C
- [ ] **Conhece a análise**: Usa insights da Marina

---

### Fluxo Encadeado

#### Marina → Lucas
- [ ] Marina gera análise após teste
- [ ] Análise é salva no banco
- [ ] Lucas tem acesso à análise no chat
- [ ] Lucas usa análise para personalizar respostas

#### Histórico do Chat
- [ ] Mensagens anteriores aparecem
- [ ] Contexto é mantido entre mensagens
- [ ] Sugestões de perguntas aparecem

---

## 📊 Logs para Verificar

### No Terminal do Servidor

Procure por:
```
[Marina] success: true
[Marina] usedFallback: false
[Marina] executionTime: XXXms

[Lucas] success: true
[Lucas] usedFallback: false
[Lucas] executionTime: XXXms
```

### No Console do Navegador (F12)

Procure por erros ou warnings relacionados a:
- API calls
- Supabase
- OpenAI

---

## 📝 Relatório de Validação

### O que funcionou:
- [ ] Marina gerou análise
- [ ] Análise está profissional
- [ ] Sem markdown quebrado
- [ ] Personalização funcionou
- [ ] Lucas respondeu
- [ ] Lucas usou análise da Marina
- [ ] Fluxo encadeado funcionou
- [ ] Histórico do chat funcionou

### O que não funcionou:
- [ ] (Listar problemas encontrados)

### Observações:
- (Adicionar observações importantes)

---

## 🎯 Critério de Aprovação

Para avançar para perguntas dinâmicas, **todos** os itens abaixo devem estar OK:

✅ Marina:
- Sem markdown
- Profissional e humana
- Personalizada ao usuário

✅ Lucas:
- Usa análise da Marina
- Respostas práticas e curtas
- Sem markdown

✅ Fluxo:
- Marina → Lucas funcionando
- Histórico mantido

---

## 🚀 Próximo Passo

Se tudo estiver OK:
- ✅ Avançar para **Perguntas Dinâmicas**

Se houver problemas:
- ⚠️ Ajustar prompts
- ⚠️ Testar novamente
- ⚠️ Iterar até aprovar

---

**Data**: 2026-05-05  
**Servidor**: http://localhost:3000  
**Status**: ⏳ Aguardando validação manual
