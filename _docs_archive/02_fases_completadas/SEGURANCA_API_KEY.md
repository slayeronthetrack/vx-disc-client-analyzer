# ⚠️ ALERTA DE SEGURANÇA - API KEY EXPOSTA

## 🚨 AÇÃO IMEDIATA NECESSÁRIA

Você expôs sua chave da OpenAI publicamente. **Siga estes passos AGORA:**

### 1. Revogar a Chave Exposta

1. Acesse: https://platform.openai.com/api-keys
2. Faça login na sua conta OpenAI
3. Encontre a chave que começa com: `sk-proj-hBMfz...`
4. Clique no botão **"Revoke"** ou **"Delete"**
5. Confirme a revogação

### 2. Criar Nova Chave

1. Na mesma página, clique em **"Create new secret key"**
2. Dê um nome: `VX DISC Test - Production`
3. Copie a nova chave (ela só aparece uma vez!)
4. Guarde em local seguro

### 3. Atualizar o Projeto

1. Abra o arquivo `.env.local`
2. Substitua a chave antiga pela nova:
   ```
   OPENAI_API_KEY=sk-proj-SUA-NOVA-CHAVE-AQUI
   ```
3. Salve o arquivo
4. Reinicie o servidor

### 4. Verificar Uso Indevido

1. Acesse: https://platform.openai.com/usage
2. Verifique se há uso suspeito nos últimos minutos
3. Se houver cobranças inesperadas, contate o suporte da OpenAI

## 🔒 BOAS PRÁTICAS DE SEGURANÇA

### ✅ O QUE FAZER:

1. **SEMPRE** manter chaves em `.env.local`
2. **NUNCA** commitar `.env.local` no Git
3. **SEMPRE** adicionar `.env.local` no `.gitignore`
4. **USAR** variáveis de ambiente em produção
5. **REVOGAR** chaves imediatamente se expostas
6. **CRIAR** chaves diferentes para dev/prod
7. **MONITORAR** uso regularmente

### ❌ O QUE NÃO FAZER:

1. ❌ Compartilhar chaves em chat/email
2. ❌ Commitar chaves no código
3. ❌ Usar a mesma chave em múltiplos projetos
4. ❌ Deixar chaves em código público
5. ❌ Compartilhar screenshots com chaves visíveis
6. ❌ Armazenar chaves em texto plano em nuvem

## 📋 CHECKLIST DE SEGURANÇA

- [ ] Chave exposta foi revogada
- [ ] Nova chave foi criada
- [ ] `.env.local` foi atualizado
- [ ] Servidor foi reiniciado
- [ ] `.env.local` está no `.gitignore`
- [ ] Não há chaves no código fonte
- [ ] Uso da API foi verificado

## 🔍 VERIFICAR .gitignore

Certifique-se de que `.env.local` está no `.gitignore`:

```gitignore
# Variáveis de ambiente
.env
.env.local
.env.development.local
.env.test.local
.env.production.local
```

## 💰 LIMITES E CUSTOS

### Configurar Limites de Uso:

1. Acesse: https://platform.openai.com/account/limits
2. Configure um limite mensal (ex: $10)
3. Configure alertas de uso (ex: 80% do limite)
4. Adicione método de pagamento com limite

### Custos Estimados:

- **GPT-4o-mini**: ~$0.15 por 1M tokens de entrada
- **Análise DISC**: ~2000 tokens = $0.0003 por análise
- **100 análises/dia**: ~$0.03/dia = $0.90/mês

## 🚀 PRÓXIMOS PASSOS

Após seguir todos os passos acima:

1. **Teste a nova chave:**
   ```bash
   $env:PORT=3001; npm run dev
   ```

2. **Gere uma análise de teste:**
   - Acesse: http://localhost:3001/result
   - Clique em "Gerar Análise Personalizada"
   - Verifique se funciona

3. **Monitore o uso:**
   - Verifique em: https://platform.openai.com/usage
   - Confirme que a análise foi gerada

## 📞 SUPORTE

Se você detectar uso indevido:

- **Email OpenAI**: support@openai.com
- **Documentação**: https://platform.openai.com/docs
- **Status**: https://status.openai.com

## ⚠️ LEMBRETE FINAL

**NUNCA compartilhe chaves de API em:**
- Chat público
- Email
- Código no GitHub
- Screenshots
- Documentação pública
- Mensagens de erro

**SEMPRE use variáveis de ambiente!**
