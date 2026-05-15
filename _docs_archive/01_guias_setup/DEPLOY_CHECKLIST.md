# ✅ Checklist de Deploy - VX DISC

## 🎯 OBJETIVO
Colocar o VX DISC no ar em 1-2 horas

---

## 📋 PASSO A PASSO RÁPIDO

### ☐ 1. Preparar Variáveis de Ambiente (5 min)

Copie do seu `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=_______________
NEXT_PUBLIC_SUPABASE_ANON_KEY=_______________
SUPABASE_SERVICE_ROLE_KEY=_______________
OPENAI_API_KEY=_______________
```

**Onde encontrar:**
- Supabase: https://supabase.com/dashboard → Settings → API
- OpenAI: https://platform.openai.com/api-keys

---

### ☐ 2. Criar Repositório GitHub (10 min)

```bash
# Se ainda não tem git inicializado
git init
git add .
git commit -m "feat: sistema VX DISC completo"

# Criar repo no GitHub: https://github.com/new
# Nome: vx-disc-test-app

# Adicionar remote e push
git remote add origin https://github.com/SEU_USUARIO/vx-disc-test-app.git
git branch -M main
git push -u origin main
```

---

### ☐ 3. Deploy no Vercel (15-20 min)

#### Via Dashboard (Mais Fácil):

1. **Acessar:** https://vercel.com
2. **Login** com GitHub
3. **Add New** → **Project**
4. **Import** seu repositório
5. **Configure:**
   - Framework: Next.js ✅ (auto-detectado)
   - Install Command: `npm install --legacy-peer-deps`
   - Build Command: `npm run build` ✅ (padrão)
6. **Environment Variables:**
   - Adicionar as 4 variáveis copiadas no passo 1
   - Marcar: Production ✅ Preview ✅ Development ✅
7. **Deploy** 🚀

**Aguardar 2-3 minutos...**

---

### ☐ 4. Testar Deploy (10-15 min)

URL recebida: `https://vx-disc-test-app.vercel.app`

**Checklist de Testes:**

- [ ] Página inicial carrega
- [ ] `/login` - Login funciona
- [ ] `/register` - Registro funciona
- [ ] `/test` - Teste DISC funciona
- [ ] `/result` - Resultado é exibido
- [ ] Download PDF funciona
- [ ] Chat com IA funciona
- [ ] `/history` - Histórico funciona
- [ ] Console sem erros críticos

---

### ☐ 5. Configurar Supabase (5 min)

No Supabase Dashboard:

1. **Settings** → **API**
2. **Allowed Origins** → Adicionar:
   ```
   https://vx-disc-test-app.vercel.app
   ```
3. **Save**

---

## 🐛 TROUBLESHOOTING RÁPIDO

### Build Falha
```
Erro: npm install failed
Solução: Usar --legacy-peer-deps no Install Command
```

### 500 Internal Server Error
```
Causa: Variáveis de ambiente faltando
Solução: Verificar se todas as 4 variáveis foram adicionadas
```

### 401 Unauthorized
```
Causa: CORS ou RLS
Solução: Adicionar URL Vercel no Supabase Allowed Origins
```

### Página em Branco
```
Causa: JavaScript error
Solução: Abrir console (F12) e verificar erro
```

---

## ✅ DEPLOY CONCLUÍDO

Quando tudo estiver funcionando:

- ✅ URL de produção: `https://vx-disc-test-app.vercel.app`
- ✅ Sistema no ar
- ✅ Pronto para testes reais

---

## 🎯 PRÓXIMO PASSO

**Landing Page Simples** (2-3 horas)

Vou criar uma landing page minimalista para capturar leads.

---

## 📞 PRECISA DE AJUDA?

**Erros comuns:**
- Build: Verificar `npm run build` local
- Variáveis: Verificar se copiou corretamente
- CORS: Adicionar URL no Supabase
- 401: Verificar RLS policies

**Me avise quando:**
- ✅ Deploy concluído com sucesso
- ❌ Encontrou algum erro
- ❓ Tem dúvidas

---

**Tempo estimado total: 45-60 minutos**

**Boa sorte! 🚀**
