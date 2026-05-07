# 🚀 Guia de Deploy no Vercel - VX DISC

## ✅ PRÉ-REQUISITOS

- [x] Build de produção testado e funcionando
- [x] Conta no Vercel (criar em: https://vercel.com)
- [x] Conta no GitHub (repositório do projeto)
- [x] Variáveis de ambiente prontas

---

## 📋 PASSO A PASSO

### 1️⃣ Preparar Repositório GitHub

#### Opção A: Criar Novo Repositório
```bash
# Inicializar git (se ainda não tiver)
git init

# Adicionar todos os arquivos
git add .

# Fazer commit
git commit -m "feat: sistema VX DISC completo com aprendizado contínuo"

# Criar repositório no GitHub
# Acesse: https://github.com/new
# Nome: vx-disc-test-app
# Descrição: Sistema de Teste DISC com IA e Aprendizado Contínuo

# Adicionar remote
git remote add origin https://github.com/SEU_USUARIO/vx-disc-test-app.git

# Push
git branch -M main
git push -u origin main
```

#### Opção B: Usar Repositório Existente
```bash
# Verificar status
git status

# Adicionar mudanças
git add .

# Commit
git commit -m "feat: preparar para deploy vercel"

# Push
git push
```

---

### 2️⃣ Deploy no Vercel

#### Via Dashboard (Recomendado)

1. **Acessar Vercel**
   - Vá em: https://vercel.com
   - Clique em "Sign Up" ou "Login"
   - Conecte com GitHub

2. **Importar Projeto**
   - Clique em "Add New..." → "Project"
   - Selecione o repositório: `vx-disc-test-app`
   - Clique em "Import"

3. **Configurar Projeto**
   - **Framework Preset:** Next.js (detectado automaticamente)
   - **Root Directory:** `./` (deixar padrão)
   - **Build Command:** `npm run build` (já configurado)
   - **Install Command:** `npm install --legacy-peer-deps` (importante!)

4. **Adicionar Variáveis de Ambiente**
   
   Clique em "Environment Variables" e adicione:

   ```
   NEXT_PUBLIC_SUPABASE_URL
   Valor: https://seu-projeto.supabase.co
   
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   Valor: eyJhbGc... (sua chave anon)
   
   SUPABASE_SERVICE_ROLE_KEY
   Valor: eyJhbGc... (sua chave service role)
   
   OPENAI_API_KEY
   Valor: sk-proj-... (sua chave OpenAI)
   ```

   **⚠️ IMPORTANTE:**
   - Marque todas como "Production", "Preview" e "Development"
   - Não compartilhe essas chaves publicamente
   - Use as mesmas do seu `.env.local`

5. **Deploy**
   - Clique em "Deploy"
   - Aguarde 2-3 minutos
   - ✅ Deploy concluído!

#### Via CLI (Alternativa)

```bash
# Instalar Vercel CLI
npm install -g vercel

# Login
vercel login

# Deploy
vercel

# Seguir prompts:
# - Set up and deploy? Yes
# - Which scope? Sua conta
# - Link to existing project? No
# - Project name? vx-disc-test-app
# - Directory? ./
# - Override settings? No

# Adicionar variáveis de ambiente
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add OPENAI_API_KEY

# Deploy para produção
vercel --prod
```

---

### 3️⃣ Verificar Deploy

Após o deploy, você receberá uma URL como:
```
https://vx-disc-test-app.vercel.app
```

**Checklist de Verificação:**

- [ ] Página inicial carrega
- [ ] Login funciona
- [ ] Registro funciona
- [ ] Teste DISC funciona
- [ ] Resultado é exibido
- [ ] PDF é gerado
- [ ] Chat com IA funciona
- [ ] Histórico funciona
- [ ] Sistema de aprendizado funciona

---

### 4️⃣ Configurar Domínio Customizado (Opcional)

1. **No Vercel Dashboard:**
   - Vá em "Settings" → "Domains"
   - Clique em "Add"
   - Digite seu domínio: `vxdisc.com.br`

2. **No seu provedor de domínio:**
   - Adicione registro CNAME:
     ```
     Type: CNAME
     Name: www
     Value: cname.vercel-dns.com
     ```
   - Adicione registro A:
     ```
     Type: A
     Name: @
     Value: 76.76.21.21
     ```

3. **Aguardar propagação DNS** (5-30 minutos)

---

## 🔧 TROUBLESHOOTING

### Build Falha

**Erro:** `npm install failed`
```bash
# Solução: Usar --legacy-peer-deps
# No Vercel Dashboard:
# Settings → General → Install Command
# Mudar para: npm install --legacy-peer-deps
```

**Erro:** `TypeScript errors`
```bash
# Verificar localmente primeiro
npm run build

# Se funcionar local mas falhar no Vercel:
# Verificar versões do Node.js
# Vercel usa Node 18 por padrão
```

### Variáveis de Ambiente Não Funcionam

**Sintoma:** Erro 500 ou "Supabase not configured"

**Solução:**
1. Verificar se todas as variáveis foram adicionadas
2. Verificar se não tem espaços extras
3. Re-deploy após adicionar variáveis:
   ```bash
   vercel --prod
   ```

### CORS Errors

**Sintoma:** Erro de CORS ao chamar APIs

**Solução:**
1. No Supabase Dashboard:
   - Settings → API
   - Adicionar domínio Vercel em "Allowed Origins"
   ```
   https://vx-disc-test-app.vercel.app
   ```

### 401 Unauthorized

**Sintoma:** Usuário não consegue fazer login

**Solução:**
1. Verificar RLS policies no Supabase
2. Verificar se `NEXT_PUBLIC_SUPABASE_ANON_KEY` está correta
3. Verificar se JWT está sendo enviado corretamente

---

## 📊 MONITORAMENTO

### Vercel Analytics

1. **Habilitar Analytics:**
   - Dashboard → Analytics
   - Clique em "Enable"

2. **Métricas disponíveis:**
   - Page views
   - Unique visitors
   - Top pages
   - Performance metrics

### Logs

1. **Ver logs em tempo real:**
   - Dashboard → Deployments
   - Clique no deployment
   - Aba "Functions"
   - Ver logs de cada API route

2. **Via CLI:**
   ```bash
   vercel logs
   ```

---

## 🚀 DEPLOY AUTOMÁTICO

Após o primeiro deploy, o Vercel fará deploy automático a cada push:

```bash
# Fazer mudanças
git add .
git commit -m "feat: nova funcionalidade"
git push

# Vercel detecta push e faz deploy automático
# Preview deploy: branches
# Production deploy: main branch
```

---

## 🔐 SEGURANÇA

### Checklist de Segurança:

- [ ] Variáveis de ambiente configuradas
- [ ] Service role key NUNCA no frontend
- [ ] RLS policies habilitadas no Supabase
- [ ] CORS configurado corretamente
- [ ] Rate limiting nas APIs (futuro)
- [ ] Logs de auditoria (futuro)

---

## 📈 PERFORMANCE

### Otimizações Automáticas do Vercel:

- ✅ CDN global
- ✅ Compressão automática
- ✅ Image optimization
- ✅ Edge caching
- ✅ Automatic HTTPS

### Métricas Esperadas:

- **First Contentful Paint:** < 1.5s
- **Time to Interactive:** < 3s
- **Lighthouse Score:** > 90

---

## 🎯 PRÓXIMOS PASSOS APÓS DEPLOY

1. ✅ Testar todas as funcionalidades
2. ✅ Compartilhar link com 5-10 pessoas
3. ✅ Coletar feedback
4. ✅ Monitorar erros e performance
5. ✅ Iterar com base em dados reais

---

## 📞 SUPORTE

### Vercel Support
- Documentação: https://vercel.com/docs
- Discord: https://vercel.com/discord
- Twitter: @vercel

### Recursos Úteis
- Next.js Docs: https://nextjs.org/docs
- Supabase Docs: https://supabase.com/docs
- Vercel Examples: https://vercel.com/templates

---

## ✅ CHECKLIST FINAL

Antes de considerar o deploy completo:

- [ ] Build de produção funciona localmente
- [ ] Todas as variáveis de ambiente configuradas
- [ ] Repositório GitHub atualizado
- [ ] Deploy no Vercel bem-sucedido
- [ ] URL de produção acessível
- [ ] Login funciona
- [ ] Teste DISC funciona
- [ ] Resultado é exibido corretamente
- [ ] PDF é gerado
- [ ] Chat com IA funciona
- [ ] Sistema de aprendizado funciona
- [ ] Sem erros no console
- [ ] Performance aceitável (< 3s load)

---

**🎉 Parabéns! Seu sistema está no ar!**

**URL de Produção:** https://vx-disc-test-app.vercel.app

**Próximo passo:** Landing Page Simples
