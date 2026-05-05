# 🚀 Guia de Instalação - VX DISC Test App

## 📋 Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn
- Conta no Vercel (para deploy)

---

## ⚡ Instalação Rápida

### 1️⃣ Copiar o Projeto

**Opção A - Via Explorador de Arquivos (Recomendado)**

1. Abra o Explorador de Arquivos
2. Navegue até a pasta `disc-app` no workspace do Kiro
3. Copie a pasta inteira (Ctrl+C)
4. Navegue até `C:\Users\Julio\Documents\vx-projects\`
5. Cole a pasta (Ctrl+V)

**Opção B - Via PowerShell**

```powershell
# Criar diretório de destino
New-Item -Path "C:\Users\Julio\Documents\vx-projects" -ItemType Directory -Force

# Copiar projeto (substitua [CAMINHO_DO_WORKSPACE] pelo caminho real)
Copy-Item -Path "[CAMINHO_DO_WORKSPACE]\disc-app" -Destination "C:\Users\Julio\Documents\vx-projects\disc-app" -Recurse
```

### 2️⃣ Instalar Dependências

```powershell
cd C:\Users\Julio\Documents\vx-projects\disc-app
npm install
```

### 3️⃣ Rodar Localmente

```powershell
npm run dev
```

Abra: `http://localhost:3000`

---

## 🎨 Identidade Visual VX

O projeto já está configurado com:

- **Cores principais**:
  - Laranja VX: `#F7971E`
  - Preto/Cinza escuro: `#0B0F14`
  - Cinza secundário: `#1A1F26`
  - Cinza texto: `#8B92A0`

- **Tipografia**: Inter (bold, impactante)
- **Estilo**: Profissional, corporativo, foco em resultados

---

## 🚀 Deploy no Vercel

### Passo 1: Instalar Vercel CLI

```powershell
npm install -g vercel
```

### Passo 2: Login

```powershell
vercel login
```

### Passo 3: Deploy

```powershell
vercel --prod
```

Responda:
- Set up and deploy? **Y**
- Which scope? **Sua conta**
- Link to existing project? **N**
- Project name? **vx-disc-test-app**
- Directory? **./** (Enter)
- Override settings? **N**

### Passo 4: Copiar URL

Você receberá algo como:
```
https://vx-disc-test-app.vercel.app
```

---

## ✅ Checklist de Validação

Após deploy, teste:

- [ ] Home carrega com identidade VX
- [ ] Logo VX aparece corretamente
- [ ] Cores laranja (#F7971E) e preto (#0B0F14) aplicadas
- [ ] Botão "Iniciar Diagnóstico" funciona
- [ ] Teste completo (10 perguntas) funciona
- [ ] Barra de progresso laranja aparece
- [ ] Resultado mostra perfil DISC
- [ ] Dashboard mostra métricas mockadas
- [ ] Layout responsivo em mobile
- [ ] Sem erros no console

---

## 📱 Estrutura do Projeto

```
disc-app/
├── app/
│   ├── page.tsx              # Home (identidade VX)
│   ├── test/page.tsx         # Teste DISC
│   ├── result/page.tsx       # Resultado
│   ├── dashboard/page.tsx    # Dashboard
│   ├── layout.tsx            # Layout global
│   └── globals.css           # Estilos globais VX
│
├── components/
│   ├── Button.tsx            # Botão VX (laranja)
│   ├── Card.tsx              # Card VX (preto/laranja)
│   ├── ProgressBar.tsx       # Barra de progresso laranja
│   └── Logo.tsx              # Logo VX
│
├── data/
│   ├── questions.ts          # 10 perguntas DISC
│   └── profiles.ts           # Descrições dos perfis
│
├── types/
│   └── disc.ts               # TypeScript types
│
├── utils/
│   ├── calculateDISC.ts      # Algoritmo de cálculo
│   └── storage.ts            # localStorage
│
└── tailwind.config.ts        # Cores VX configuradas
```

---

## 🎯 Funcionalidades

✅ **Home Page**
- Hero section com identidade VX
- Seção "Por que fazer o teste DISC?"
- Seção "Como funciona"
- CTA com frase VX: "Caminhamos lado a lado com seu time"

✅ **Teste DISC**
- 10 perguntas objetivas
- Barra de progresso laranja
- Navegação anterior/próxima
- Persistência de progresso (localStorage)

✅ **Página de Resultado**
- Perfil dominante destacado
- Pontuações D, I, S, C
- Pontos fortes
- Estilo de comunicação
- Abordagem comercial
- CTA para refazer teste

✅ **Dashboard**
- Métricas mockadas (testes, taxa de conclusão, leads)
- Distribuição de perfis DISC
- Design profissional VX

---

## 🔧 Comandos Úteis

```powershell
# Desenvolvimento
npm run dev

# Build para produção
npm run build

# Rodar produção localmente
npm start

# Lint
npm run lint

# Deploy Vercel
vercel --prod
```

---

## 🚨 Troubleshooting

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

## 📈 Próximos Passos

Após deploy bem-sucedido:

1. ✅ Compartilhe com 3-5 pessoas
2. ✅ Colete feedback
3. ✅ Meça taxa de conclusão
4. ✅ Valide experiência mobile
5. 🚀 Implemente Fase 1 (Captura de Leads + GHL)

---

## 💡 Suporte

Para dúvidas ou problemas:
- Verifique o console do navegador (F12)
- Rode `npm run build` para ver erros de build
- Use `vercel --debug` para debug de deploy

---

**🎉 Projeto pronto para produção com identidade visual VX Comercial!**
