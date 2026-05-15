# 🚀 DEPLOY AGORA - Checklist Executivo

## ⏱️ Tempo Total: 1 hora

---

## ✅ ETAPA 1 - Migração (20 min)

### 1.1 Criar Diretório
```powershell
New-Item -Path "C:\Users\Julio\Documents\vx-projects" -ItemType Directory -Force
```

### 1.2 Copiar Projeto
```powershell
Copy-Item -Path "C:\Windows\System32\WindowsPowerShell\v1.0\vx-disc-test-app" `
          -Destination "C:\Users\Julio\Documents\vx-projects\vx-disc-test-app" `
          -Recurse -Force
```

### 1.3 Navegar
```powershell
cd C:\Users\Julio\Documents\vx-projects\vx-disc-test-app
```

### 1.4 Instalar
```powershell
npm install
```

### 1.5 Rodar Local
```powershell
npm run dev
```

### 1.6 Validar
Abrir: `http://localhost:3000`

**Checklist**:
- [ ] Home carrega
- [ ] Botão "Iniciar Diagnóstico" funciona
- [ ] Teste carrega
- [ ] Consegue responder perguntas
- [ ] Resultado aparece

---

## ✅ ETAPA 2 - Deploy Vercel (15 min)

### 2.1 Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 2.2 Login
```powershell
vercel login
```

### 2.3 Deploy
```powershell
vercel
```

**Responder**:
- Set up and deploy? **Y**
- Which scope? **Sua conta**
- Link to existing project? **N**
- Project name? **vx-disc-test-app**
- Directory? **./** (Enter)
- Override settings? **N**

### 2.4 Deploy Produção
```powershell
vercel --prod
```

### 2.5 Copiar URL
Você receberá algo como:
```
https://vx-disc-test-app.vercel.app
```

**✅ COPIE ESSA URL**

---

## ✅ ETAPA 3 - Validação Real (25 min)

### 3.1 Teste Desktop
Abrir URL no Chrome:
- [ ] Home carrega rápido (< 2s)
- [ ] Visual VX correto
- [ ] Botões funcionam
- [ ] Navegação suave

### 3.2 Teste Mobile
Abrir URL no celular:
- [ ] Layout responsivo
- [ ] Botões clicáveis
- [ ] Texto legível
- [ ] Scroll suave

### 3.3 Teste Fluxo Completo
Desktop ou Mobile:
1. [ ] Home → Iniciar Diagnóstico
2. [ ] Responder 20 perguntas
3. [ ] Ver resultado
4. [ ] Refazer teste
5. [ ] Dados persistem (F5 no meio do teste)

### 3.4 Teste Performance
- [ ] Lighthouse Score > 80
- [ ] Sem erros no console
- [ ] Imagens carregam
- [ ] Fontes carregam

---

## 🎉 RESULTADO ESPERADO

Ao final dessa 1 hora você terá:

✅ Projeto em local seguro
✅ Rodando localmente sem erros
✅ URL de produção funcionando
✅ Testado em desktop e mobile
✅ Pronto para compartilhar com clientes

---

## 📱 COMPARTILHE A URL

Assim que estiver no ar, compartilhe:

**Para mim**:
```
URL: https://vx-disc-test-app.vercel.app
Status: ✅ No ar
Testes: ✅ Funcionando
```

**Para clientes** (teste beta):
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
rm -rf node_modules
rm package-lock.json
npm install
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

## 🎯 APÓS DEPLOY

**NÃO ADICIONE FEATURES AINDA**

Primeiro:
1. ✅ Compartilhe com 3-5 pessoas
2. ✅ Colete feedback
3. ✅ Veja onde travam
4. ✅ Meça taxa de conclusão

**Depois disso**: Fase 1 (Captura + GHL)

---

## ⏰ CRONÔMETRO

- **00:00 - 00:20**: Migração + npm install
- **00:20 - 00:35**: Deploy Vercel
- **00:35 - 01:00**: Validação completa

---

## ✅ CHECKLIST FINAL

- [ ] Projeto migrado
- [ ] `npm run dev` funcionando
- [ ] Deploy Vercel completo
- [ ] URL de produção funcionando
- [ ] Testado em desktop
- [ ] Testado em mobile
- [ ] Fluxo completo validado
- [ ] URL compartilhada

---

**🚀 EXECUTE AGORA E ME MANDE A URL!**

**Depois disso, construímos a Fase 1 comercial.**
