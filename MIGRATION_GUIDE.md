# 🚨 Guia de Migração - AÇÃO IMEDIATA

## ⚠️ PROBLEMA CRÍTICO

O projeto foi criado em:
```
C:\Windows\System32\WindowsPowerShell\v1.0\
```

Isso causa:
- ❌ Problemas de permissão
- ❌ Risco de apagar arquivos do sistema
- ❌ Erros com npm/node_modules
- ❌ Impossibilidade de versionamento

---

## ✅ SOLUÇÃO - Migração em 5 Passos

### Passo 1: Criar Diretório Correto

Abra o PowerShell como **Administrador** e execute:

```powershell
# Criar diretório de projetos
New-Item -Path "C:\Users\Julio\Documents\vx-projects" -ItemType Directory -Force
```

---

### Passo 2: Copiar Arquivos do Projeto

**Opção A - Via PowerShell (Recomendado)**:

```powershell
# Copiar todo o projeto
Copy-Item -Path "C:\Windows\System32\WindowsPowerShell\v1.0\vx-disc-test-app" `
          -Destination "C:\Users\Julio\Documents\vx-projects\vx-disc-test-app" `
          -Recurse -Force
```

**Opção B - Via Windows Explorer**:
1. Abra `C:\Windows\System32\WindowsPowerShell\v1.0\`
2. Copie a pasta `vx-disc-test-app`
3. Cole em `C:\Users\Julio\Documents\vx-projects\`

---

### Passo 3: Navegar para o Novo Diretório

```powershell
cd C:\Users\Julio\Documents\vx-projects\vx-disc-test-app
```

---

### Passo 4: Instalar Dependências

```powershell
npm install
```

**Se der erro de permissão**:
```powershell
# Limpar cache do npm
npm cache clean --force

# Tentar novamente
npm install
```

---

### Passo 5: Rodar o Projeto

```powershell
npm run dev
```

Abra no navegador:
```
http://localhost:3000
```

---

## ✅ Validação

Teste o fluxo completo:
1. ✅ Home carrega
2. ✅ Iniciar Diagnóstico → /test
3. ✅ Responder 20 perguntas
4. ✅ Ver resultado → /result
5. ✅ Dashboard → /dashboard

---

## 🚀 Próximo Passo: Deploy Vercel

Após validar localmente, faça deploy:

### 1. Criar conta Vercel (se não tiver)
```
https://vercel.com/signup
```

### 2. Instalar Vercel CLI
```powershell
npm install -g vercel
```

### 3. Fazer Login
```powershell
vercel login
```

### 4. Deploy
```powershell
# Na pasta do projeto
vercel
```

Siga as instruções:
- Project name: `vx-disc-test-app`
- Framework: `Next.js`
- Build command: (deixe padrão)
- Output directory: (deixe padrão)

### 5. Deploy para Produção
```powershell
vercel --prod
```

Você receberá uma URL tipo:
```
https://vx-disc-test-app.vercel.app
```

---

## 🧹 Limpeza (Opcional)

Após confirmar que tudo funciona no novo local:

```powershell
# CUIDADO: Execute apenas após validar o novo projeto
Remove-Item -Path "C:\Windows\System32\WindowsPowerShell\v1.0\vx-disc-test-app" -Recurse -Force
```

---

## 📝 Checklist Final

- [ ] Projeto copiado para `C:\Users\Julio\Documents\vx-projects\`
- [ ] `npm install` executado com sucesso
- [ ] `npm run dev` funcionando
- [ ] Fluxo completo testado localmente
- [ ] Deploy no Vercel realizado
- [ ] URL de produção funcionando
- [ ] Projeto antigo removido (opcional)

---

## 🆘 Problemas Comuns

### Erro: "Cannot find module"
```powershell
rm -rf node_modules
rm package-lock.json
npm install
```

### Erro: "Port 3000 already in use"
```powershell
# Matar processo na porta 3000
npx kill-port 3000

# Ou usar outra porta
npm run dev -- -p 3001
```

### Erro de Permissão
```powershell
# Executar PowerShell como Administrador
# Ou mudar permissões da pasta
icacls "C:\Users\Julio\Documents\vx-projects" /grant Julio:F /t
```

---

## ✅ Após Migração Bem-Sucedida

Você estará pronto para:
1. ✅ Compartilhar link de produção
2. ✅ Testar em dispositivos móveis
3. ✅ Iniciar Fase 1 (Captura + GHL)
4. ✅ Validar com leads reais

---

**🚀 Execute agora e me avise quando estiver rodando no novo local!**
