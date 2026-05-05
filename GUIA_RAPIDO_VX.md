# 🚀 Guia Rápido - Deploy VX DISC App

## ⚡ 3 Passos para Colocar no Ar

---

## 📍 PASSO 1: Copiar o Projeto

### Via Explorador de Arquivos (RECOMENDADO)

1. Abra o **Explorador de Arquivos** do Windows
2. Navegue até o workspace do Kiro (onde você está agora)
3. Encontre a pasta **`disc-app`**
4. **Copie** a pasta inteira (Ctrl+C)
5. Navegue até `C:\Users\Julio\Documents\vx-projects\`
6. **Cole** a pasta (Ctrl+V)

✅ **Resultado**: Você terá `C:\Users\Julio\Documents\vx-projects\disc-app\`

---

## 💻 PASSO 2: Instalar e Testar

Abra o **PowerShell** e execute:

```powershell
# Navegar até o projeto
cd C:\Users\Julio\Documents\vx-projects\disc-app

# Instalar dependências (leva ~2 minutos)
npm install

# Rodar localmente
npm run dev
```

Abra no navegador: **`http://localhost:3000`**

### ✅ O Que Você Deve Ver:

- ✅ Background **preto** (#0B0F14)
- ✅ Logo **VX CONSULTORIA** no topo
- ✅ Título grande: **"DESCUBRA SEU PERFIL COMPORTAMENTAL"** (branco + laranja)
- ✅ Botão **laranja** "INICIAR DIAGNÓSTICO GRATUITO"
- ✅ Seção "POR QUE FAZER O TESTE DISC?" com 3 cards
- ✅ CTA laranja: **"AQUI NA VX, CAMINHAMOS LADO A LADO COM SEU TIME DE VENDAS"**

### 🧪 Teste o Fluxo Completo:

1. Clique em "Iniciar Diagnóstico"
2. Responda as 10 perguntas
3. Veja o resultado DISC
4. Navegue para o Dashboard

Se tudo funcionar → **Prossiga para o Passo 3**

---

## 🌐 PASSO 3: Deploy no Vercel

No mesmo PowerShell:

```powershell
# Instalar Vercel CLI (só precisa fazer 1 vez)
npm install -g vercel

# Login no Vercel
vercel login
```

Siga as instruções no navegador para fazer login.

Depois:

```powershell
# Deploy para produção
vercel --prod
```

### Responda:

- **Set up and deploy?** → Digite `Y` e Enter
- **Which scope?** → Escolha sua conta
- **Link to existing project?** → Digite `N` e Enter
- **Project name?** → Digite `vx-disc-test-app` e Enter
- **Directory?** → Apenas Enter (usa o padrão)
- **Override settings?** → Digite `N` e Enter

### ⏱️ Aguarde ~2 minutos

O Vercel vai:
1. Fazer upload dos arquivos
2. Instalar dependências
3. Fazer build do projeto
4. Gerar a URL de produção

### 🎉 Você Receberá:

```
✅ Production: https://vx-disc-test-app.vercel.app
```

**COPIE ESSA URL!**

---

## ✅ Validação Final

Abra a URL de produção no navegador e teste:

### Desktop:
- [ ] Home carrega rápido (< 3s)
- [ ] Identidade VX correta (laranja + preto)
- [ ] Botões funcionam
- [ ] Teste completo funciona
- [ ] Resultado aparece

### Mobile:
- [ ] Abra no celular
- [ ] Layout responsivo
- [ ] Botões clicáveis
- [ ] Texto legível

---

## 📱 Compartilhe a URL

### Para Teste Beta:

```
Olá!

Criei um diagnóstico DISC profissional para entender 
o perfil comportamental de clientes.

Teste aqui: https://vx-disc-test-app.vercel.app

Leva 5 minutos e você recebe o resultado na hora.

Me conta o que achou!
```

---

## 🚨 Se Der Erro

### Erro: "Cannot find module"
```powershell
cd C:\Users\Julio\Documents\vx-projects\disc-app
rm -rf node_modules
rm package-lock.json
npm install
npm run dev
```

### Erro: "Port 3000 in use"
```powershell
npx kill-port 3000
npm run dev
```

### Erro no Vercel
```powershell
vercel --debug
```

---

## ⏰ Tempo Total Estimado

- **Passo 1** (Copiar): 1 minuto
- **Passo 2** (Instalar + Testar): 5 minutos
- **Passo 3** (Deploy): 5 minutos

**Total: ~10 minutos** ⚡

---

## 🎯 Depois do Deploy

**NÃO adicione features ainda!**

Primeiro:
1. ✅ Compartilhe com 3-5 pessoas
2. ✅ Colete feedback
3. ✅ Veja onde travam
4. ✅ Meça taxa de conclusão

**Depois**: Implemente Fase 1 (Captura de Leads + GoHighLevel)

---

## 💡 Comandos Úteis

```powershell
# Ver logs do Vercel
vercel logs

# Ver lista de deploys
vercel ls

# Abrir projeto no Vercel dashboard
vercel open
```

---

## 📊 Checklist Completo

- [ ] Projeto copiado para `C:\Users\Julio\Documents\vx-projects\disc-app`
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` funcionando em `localhost:3000`
- [ ] Identidade VX validada localmente
- [ ] Vercel CLI instalado
- [ ] Login no Vercel feito
- [ ] `vercel --prod` executado
- [ ] URL de produção recebida
- [ ] Teste completo em produção (desktop)
- [ ] Teste completo em produção (mobile)
- [ ] URL compartilhada com 3-5 pessoas

---

**🚀 Pronto! Seu app VX DISC está no ar!**

**Próximo passo**: Me mande a URL quando estiver funcionando para construirmos a Fase 1 (Captura + GHL).
