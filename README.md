# VX DISC Test App

Aplicativo web interno profissional para diagnóstico comportamental DISC desenvolvido para a equipe VX.

## 🎯 Sobre o Projeto

O VX DISC Test App é um **aplicativo SaaS interno** (não um site institucional) que permite à equipe VX aplicar testes de diagnóstico comportamental DISC em clientes, visualizar resultados detalhados e gerenciar o histórico de testes através de um dashboard administrativo.

### Características Principais

- ✅ **Aplicativo profissional** com aparência de SaaS premium
- ✅ **Teste DISC completo** com 20 perguntas
- ✅ **Cálculo automático** de pontuações D, I, S, C
- ✅ **Resultados detalhados** com recomendações práticas
- ✅ **Dashboard administrativo** para gestão de clientes
- ✅ **Persistência local** com localStorage (MVP)
- ✅ **Design responsivo** mobile-first
- ✅ **Identidade visual VX** aplicada em todas as telas

## 🚀 Stack Técnica

- **Next.js 14** (App Router)
- **React 18**
- **TypeScript**
- **TailwindCSS**
- **localStorage** (persistência MVP)

## 📁 Estrutura do Projeto

```
vx-disc-test-app/
├── app/                      # Next.js App Router
│   ├── page.tsx              # Home (/)
│   ├── test/page.tsx         # Teste DISC (/test)
│   ├── result/page.tsx       # Resultado (/result)
│   └── dashboard/page.tsx    # Dashboard VX (/dashboard)
│
├── components/
│   ├── layout/               # Componentes de layout
│   │   ├── Container.tsx
│   │   ├── Section.tsx
│   │   ├── Grid.tsx
│   │   └── Header.tsx
│   │
│   └── ui/                   # Componentes UI
│       ├── Button.tsx
│       ├── Card.tsx
│       ├── Logo.tsx
│       ├── ProgressBar.tsx
│       ├── Loading.tsx
│       ├── Sidebar.tsx
│       └── MetricCard.tsx
│
├── data/                     # Dados mockados
│   ├── questions.ts          # 20 perguntas DISC
│   ├── profiles.ts           # Descrições dos perfis
│   └── clients.ts            # Clientes mockados
│
├── types/                    # TypeScript types
│   ├── disc.ts
│   └── client.ts
│
└── utils/                    # Utilitários
    ├── calculateDISC.ts      # Cálculo de pontuação
    ├── storage.ts            # localStorage abstraction
    └── auth.ts               # Mock authentication
```

## 🎨 Identidade Visual VX

### Cores

- **Fundo principal**: `#0B0F14`
- **Fundo secundário**: `#111821`
- **Laranja VX**: `#F7971E`
- **Laranja hover**: `#FF8C1A`
- **Branco**: `#FFFFFF`
- **Cinza secundário**: `#A0A0A0`

### Tipografia

- **Principal**: Montserrat
- **Fallback**: Inter

## 🔧 Instalação e Execução

### Pré-requisitos

- Node.js 18+ instalado
- npm ou yarn

### Passo a Passo

1. **Clone o repositório** (ou navegue até a pasta do projeto)

```bash
cd vx-disc-test-app
```

2. **Instale as dependências**

```bash
npm install
# ou
yarn install
```

3. **Execute o servidor de desenvolvimento**

```bash
npm run dev
# ou
yarn dev
```

4. **Abra no navegador**

```
http://localhost:3000
```

## 📱 Rotas do Aplicativo

| Rota | Descrição |
|------|-----------|
| `/` | Home - Apresentação do diagnóstico DISC |
| `/test` | Teste DISC - 20 perguntas interativas |
| `/result` | Resultado - Pontuações e recomendações |
| `/dashboard` | Dashboard VX - Gestão de clientes e testes |

## 🎯 Fluxo de Uso

1. **Home** (`/`) - Usuário acessa a página inicial
2. **Iniciar Diagnóstico** - Clica no botão "Iniciar Diagnóstico"
3. **Teste** (`/test`) - Responde 20 perguntas (progresso salvo automaticamente)
4. **Resultado** (`/result`) - Visualiza pontuações DISC e recomendações
5. **Dashboard** (`/dashboard`) - Equipe VX gerencia clientes e testes

## 💾 Persistência de Dados (MVP)

O aplicativo usa **localStorage** para persistência temporária:

- **`vx_disc_test`**: Progresso do teste (respostas + pergunta atual)
- **`vx_disc_result`**: Resultado calculado do teste

### Limpeza de Dados

- Dados do teste são limpos automaticamente após calcular o resultado
- Botão "Refazer Teste" limpa todos os dados e reinicia

## 🔐 Autenticação (MVP)

Atualmente usa **mock authentication** (sempre retorna `true`).

**Futuro**: Integração com Supabase para autenticação real.

## 🚀 Próximos Passos (Pós-MVP)

- [ ] Integração com Supabase (backend + auth)
- [ ] Geração de PDF dos resultados
- [ ] Envio de resultados por email
- [ ] Histórico completo de testes por cliente
- [ ] Comparação de perfis
- [ ] Análise de equipes
- [ ] Integração com CRM/GHL
- [ ] IA para análise avançada de perfis

## 📦 Build para Produção

```bash
npm run build
npm run start
```

## 🎨 Padrão Visual

### O que É

- ✅ Aplicativo SaaS interno profissional
- ✅ Interface de sistema com navegação estruturada
- ✅ Visual premium com profundidade (camadas, gradientes, shadows)
- ✅ Microinterações sofisticadas (hover, transitions)

### O que NÃO É

- ❌ Landing page promocional
- ❌ Site institucional
- ❌ Quiz infantil ou genérico
- ❌ Template simples empilhado

## 📄 Licença

Projeto interno VX - Todos os direitos reservados.

---

**Desenvolvido com ❤️ para VX**
