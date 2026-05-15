Agora que você analisou a arquitetura do projeto VX Teste DISC, quero que execute a próxima etapa com segurança.

OBJETIVO PRINCIPAL:
Organizar o fluxo de login, permissões, redirecionamento por tipo de usuário e melhorar a base visual do sistema com estilo Apple premium.

NÃO refatore o projeto inteiro de uma vez.
NÃO quebre funcionalidades existentes.
NÃO remova agentes de IA, Supabase, testes, dashboards ou serviços existentes.
Faça alterações progressivas e bem organizadas.

ETAPA 1 — Corrigir fluxo após login

Implementar uma função central de redirecionamento por role.

Regras:

super_admin ou admin:
- redirecionar para /admin

company_admin:
- redirecionar para /company/dashboard
- mostrar apenas dados da empresa vinculada ao usuário

employee ou user:
- redirecionar para /dashboard
- mostrar histórico de testes e botão para novo teste

Verifique os arquivos:
- app/login/page.tsx
- middleware.ts
- utils/auth.ts
- lib/services/authService.ts
- lib/supabase/client.ts
- lib/supabase/server.ts

Crie ou ajuste uma função como:
getRedirectPathByRole(user)

ETAPA 2 — Proteger rotas

Criar proteção clara:

/admin
- apenas super_admin e admin

/company/dashboard
- company_admin, admin e super_admin

/dashboard
- usuário autenticado

/test
- usuário autenticado ou acesso via convite/link da empresa

/result
- usuário vê apenas seus resultados
- company_admin vê resultados da própria empresa
- admin/super_admin vê todos

ETAPA 3 — Ajustar dashboard do usuário comum

A rota /dashboard deve ser o painel do funcionário/usuário.

Ela precisa conter:
- boas-vindas
- histórico de testes
- botão “Fazer novo teste”
- cards para testes de 20, 40, 60 e 80 perguntas
- acesso aos resultados anteriores
- acesso aos feedbacks gerados por IA

ETAPA 4 — Ajustar dashboard da empresa

A rota /company/dashboard deve ser o painel do company_admin.

Ela precisa conter:
- nome da empresa
- total de funcionários
- total de testes
- distribuição dos perfis DISC
- link de convite da empresa
- botão para copiar link
- lista de funcionários
- resultado individual de cada funcionário
- botão para ver detalhes do resultado

Garantir que company_admin só veja dados da própria empresa.

ETAPA 5 — Melhorar design global estilo Apple

Criar ou ajustar componentes base:
- Sidebar
- Navbar
- Card
- Button
- Input
- Table
- Badge
- Loading state
- Empty state

Estilo visual:
- Apple-like
- minimalista
- premium
- SaaS enterprise
- glassmorphism leve
- cantos arredondados
- sombras suaves
- muito espaçamento
- tipografia forte
- animações suaves com Framer Motion, se já estiver instalado
- cores neutras com destaque laranja VX #F7971E

Não quero visual Bootstrap.
Não quero dashboard genérico.
Quero aparência de produto premium.

ETAPA 6 — Depois de alterar, me entregue um relatório

No final, informe:
1. arquivos alterados
2. o que foi corrigido
3. o que ainda falta
4. comandos para testar
5. possíveis riscos ou pontos que precisam de revisão manual

Comece pela ETAPA 1 e ETAPA 2.
Depois avance para os dashboards e design.