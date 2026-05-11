# 🧪 Como Testar o Company Management System

## ✅ O Que Já Está Funcionando

### Backend (100%)
- ✅ Database com 5 tabelas criadas
- ✅ API Routes completas
- ✅ Services e validações
- ✅ RLS policies configuradas

### Frontend (85%)
- ✅ Admin layout com sidebar
- ✅ Dashboard principal
- ✅ CRUD completo de empresas
- ✅ Lista de funcionários com filtros
- ✅ Modal de detalhes

---

## 🚀 Passo a Passo para Testar

### 1️⃣ Verificar o Servidor de Desenvolvimento

```bash
# Se não estiver rodando, inicie:
npm run dev
```

Acesse: http://localhost:3000

---

### 2️⃣ Fazer Login como Admin

**Opção A: Se você já tem um usuário admin**
1. Acesse: http://localhost:3000/login
2. Faça login com suas credenciais
3. Vá para: http://localhost:3000/admin

**Opção B: Criar um usuário admin no Supabase**

1. Acesse o Supabase Dashboard
2. Vá em **Authentication** → **Users**
3. Crie um novo usuário ou use um existente
4. Vá em **Table Editor** → **profiles**
5. Encontre o usuário e edite o campo `role` para `super_admin`

---

### 3️⃣ Testar o Dashboard Admin

**URL**: http://localhost:3000/admin

**O que você deve ver:**
- ✅ Sidebar com navegação
- ✅ Cards de métricas (empresas, testes, etc.)
- ✅ Botão "Criar Nova Empresa"

**Teste:**
- [ ] Navegue pelos itens do menu
- [ ] Verifique se as métricas aparecem
- [ ] Clique em "Empresas" no menu

---

### 4️⃣ Testar Lista de Empresas

**URL**: http://localhost:3000/admin/companies

**O que você deve ver:**
- ✅ Tabela com empresas cadastradas (ou vazia)
- ✅ Barra de busca
- ✅ Filtros (Status, Limite)
- ✅ Botão "Criar Nova Empresa"

**Teste:**
- [ ] Buscar por nome de empresa
- [ ] Filtrar por status (Ativo/Inativo)
- [ ] Ordenar por diferentes colunas
- [ ] Clicar em "Ver Detalhes" de uma empresa

---

### 5️⃣ Testar Criação de Empresa

**URL**: http://localhost:3000/admin/companies/new

**Passo a passo:**

1. **Preencha o formulário:**
   - Nome: "Empresa Teste"
   - Slug: (será gerado automaticamente como "empresa-teste")
   - Email de Contato: "contato@empresateste.com"
   - Telefone: "(11) 99999-9999"
   - Limite de Testes: 100
   - Cor Primária: Escolha uma cor (ex: #FF6B35)

2. **Upload de Logo (opcional):**
   - Clique em "Upload Logo"
   - Selecione uma imagem PNG/JPG

3. **Configurações:**
   - Marque "Empresa Ativa"

4. **Clique em "Criar Empresa"**

**O que deve acontecer:**
- ✅ Mensagem de sucesso
- ✅ Redirecionamento para página de detalhes
- ✅ Empresa aparece na lista

**Teste:**
- [ ] Criar empresa com todos os campos
- [ ] Criar empresa sem logo
- [ ] Tentar criar com slug duplicado (deve dar erro)
- [ ] Validar campos obrigatórios

---

### 6️⃣ Testar Página de Detalhes da Empresa

**URL**: http://localhost:3000/admin/companies/[id]

**O que você deve ver:**

#### Header da Empresa
- ✅ Logo (se tiver)
- ✅ Nome e slug
- ✅ Status (ativo/inativo)
- ✅ Link do teste com botão "Copiar"
- ✅ Botões: Editar, Deletar

#### Estatísticas
- ✅ Total de Testes
- ✅ Testes Concluídos
- ✅ Uso do Limite (%)
- ✅ Perfil Predominante

#### Lista de Funcionários
- Se houver testes: Tabela com funcionários
- Se não houver: Mensagem "Nenhum teste realizado"

**Teste:**
- [ ] Copiar link do teste
- [ ] Clicar em "Editar"
- [ ] Ver estatísticas
- [ ] Verificar lista de funcionários (se houver)

---

### 7️⃣ Testar Edição de Empresa

**URL**: http://localhost:3000/admin/companies/[id]/edit

**Passo a passo:**

1. Altere alguns campos (ex: nome, limite de testes)
2. Clique em "Salvar Alterações"

**O que deve acontecer:**
- ✅ Mensagem de sucesso
- ✅ Redirecionamento para detalhes
- ✅ Alterações salvas

**Teste:**
- [ ] Editar nome
- [ ] Alterar limite de testes
- [ ] Trocar cor primária
- [ ] Ativar/desativar empresa
- [ ] Upload de novo logo

---

### 8️⃣ Testar Lista de Funcionários (Se Houver Testes)

**Pré-requisito**: Empresa precisa ter testes realizados

**Funcionalidades para testar:**

#### Busca
- [ ] Buscar por nome
- [ ] Buscar por email
- [ ] Buscar por cargo
- [ ] Buscar por departamento

#### Filtros
- [ ] Filtrar por perfil DISC (D, I, S, C)
- [ ] Filtrar por departamento
- [ ] Combinar busca + filtros

#### Ordenação
- [ ] Ordenar por nome (A-Z, Z-A)
- [ ] Ordenar por email
- [ ] Ordenar por data do teste

#### Ações
- [ ] Clicar em "Ver" para abrir modal
- [ ] Verificar contador "Mostrando X de Y funcionários"

---

### 9️⃣ Testar Modal de Detalhes do Funcionário

**Como abrir**: Clique no botão "Ver" em qualquer funcionário

**O que você deve ver:**

#### Informações do Funcionário
- ✅ Nome, email, cargo, departamento
- ✅ Telefone (se tiver)
- ✅ Data do teste

#### Perfil DISC
- ✅ Perfil Dominante (grande, destacado)
- ✅ Perfil Secundário
- ✅ Percentuais

#### Scores DISC
- ✅ Barras de progresso para D, I, S, C
- ✅ Pontos e percentuais

#### Análise IA
- ✅ Texto da análise comportamental

#### Informações do Teste
- ✅ Versão do teste
- ✅ Número da tentativa
- ✅ Status
- ✅ Data de início

**Teste:**
- [ ] Abrir modal
- [ ] Verificar todas as informações
- [ ] Fechar modal (X ou botão "Fechar")
- [ ] Clicar em "Baixar PDF" (mostra alerta "em breve")

---

### 🔟 Testar Deleção de Empresa

**CUIDADO**: Esta ação é irreversível!

**Passo a passo:**

1. Vá para detalhes de uma empresa de teste
2. Clique no botão "Deletar"
3. Confirme a ação

**O que deve acontecer:**
- ✅ Confirmação antes de deletar
- ✅ Empresa removida do banco
- ✅ Redirecionamento para lista
- ✅ Testes da empresa também são deletados (CASCADE)

**Teste:**
- [ ] Deletar empresa sem testes
- [ ] Deletar empresa com testes
- [ ] Cancelar deleção

---

## 🐛 Checklist de Bugs Comuns

### Problemas de Autenticação
- [ ] Usuário não consegue acessar /admin
  - **Solução**: Verificar se role = 'super_admin' na tabela profiles

- [ ] Erro 401 nas APIs
  - **Solução**: Fazer login novamente

### Problemas de Dados
- [ ] Empresas não aparecem na lista
  - **Solução**: Verificar RLS policies no Supabase
  - **Solução**: Verificar se há empresas no banco

- [ ] Estatísticas zeradas
  - **Solução**: Criar testes para a empresa primeiro

### Problemas de UI
- [ ] Sidebar não aparece
  - **Solução**: Verificar console do navegador
  - **Solução**: Limpar cache

- [ ] Filtros não funcionam
  - **Solução**: Verificar console para erros JavaScript

---

## 📊 Dados de Teste Sugeridos

### Empresa 1: Tech Startup
```
Nome: Tech Innovations
Slug: tech-innovations
Email: contato@techinnovations.com
Telefone: (11) 98765-4321
Limite: 50
Cor: #FF6B35
Status: Ativo
```

### Empresa 2: Consultoria
```
Nome: Consultoria Empresarial
Slug: consultoria-empresarial
Email: contato@consultoria.com
Telefone: (21) 99876-5432
Limite: 100
Cor: #4ECDC4
Status: Ativo
```

### Empresa 3: E-commerce
```
Nome: Loja Virtual
Slug: loja-virtual
Email: contato@lojavirtual.com
Telefone: (31) 91234-5678
Limite: 200
Cor: #95E1D3
Status: Inativo
```

---

## 🔍 Como Verificar no Banco de Dados

### Supabase Dashboard

1. **Ver empresas criadas:**
   - Table Editor → `companies`
   - Verificar: name, slug, active, max_tests

2. **Ver testes realizados:**
   - Table Editor → `company_tests`
   - Verificar: company_id, name, email, disc_result

3. **Ver estatísticas:**
   - SQL Editor → Executar:
   ```sql
   SELECT * FROM company_stats;
   ```

4. **Ver perfis de usuários:**
   - Table Editor → `profiles`
   - Verificar: role (deve ser 'super_admin' para admin)

---

## ✅ Checklist Final de Testes

### Funcionalidades Básicas
- [ ] Login como admin
- [ ] Acessar dashboard
- [ ] Ver lista de empresas
- [ ] Criar nova empresa
- [ ] Editar empresa
- [ ] Ver detalhes da empresa
- [ ] Deletar empresa

### Funcionalidades Avançadas
- [ ] Buscar empresas
- [ ] Filtrar empresas
- [ ] Ordenar lista
- [ ] Copiar link do teste
- [ ] Upload de logo
- [ ] Escolher cor primária

### Lista de Funcionários (se houver testes)
- [ ] Ver lista de funcionários
- [ ] Buscar funcionários
- [ ] Filtrar por perfil DISC
- [ ] Filtrar por departamento
- [ ] Ordenar lista
- [ ] Abrir modal de detalhes
- [ ] Ver scores DISC
- [ ] Ver análise IA

### Validações
- [ ] Campos obrigatórios
- [ ] Slug único
- [ ] Email válido
- [ ] Cor hex válida
- [ ] Limite de testes > 0

---

## 🚨 O Que NÃO Está Implementado Ainda

### Portal de Teste Público
- ❌ `/test/[slug]` - Página pública para funcionários
- ❌ Formulário pré-teste
- ❌ Integração com teste DISC existente
- ❌ Página de resultado com branding

### Exportação
- ❌ Download PDF de resultados
- ❌ Exportação Excel
- ❌ QR Code do link

### Gráficos DISC
- ⏳ Gráfico de pizza na página da empresa (50% completo)
- ❌ Gráfico de barras de scores médios
- ❌ Análise por departamento

### Analytics
- ❌ Página de analytics
- ❌ Funil de conversão
- ❌ Tracking de eventos

---

## 📝 Reportar Problemas

Se encontrar algum bug, anote:

1. **O que você estava fazendo?**
2. **O que esperava que acontecesse?**
3. **O que aconteceu de fato?**
4. **Mensagem de erro (se houver)**
5. **Console do navegador (F12)**

---

## 🎯 Próximos Passos Após Testes

Depois de testar tudo, podemos:

1. **Finalizar gráficos DISC** - Adicionar visualizações na página da empresa
2. **Implementar portal de teste** - Permitir que funcionários façam o teste
3. **Adicionar exportação PDF** - Download de resultados
4. **Criar analytics** - Dashboard com métricas avançadas

---

**Boa sorte com os testes! 🚀**

Se encontrar qualquer problema, me avise com os detalhes e vou ajudar a resolver!
