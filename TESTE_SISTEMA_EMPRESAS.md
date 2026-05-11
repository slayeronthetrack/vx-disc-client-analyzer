# ✅ Checklist de Testes - Sistema de Empresas

## 1. Gestão de Empresas (Admin)

### Criar Empresa ✅
- [x] Acessar `/admin/companies/new`
- [x] Preencher formulário
- [x] Criar empresa com sucesso
- [ ] Verificar se aparece na lista

### Listar Empresas
- [ ] Acessar `/admin/companies`
- [ ] Ver lista de empresas
- [ ] Testar filtros (busca, ativo/inativo)
- [ ] Testar ordenação (nome, data, total de testes)
- [ ] Testar paginação

### Ver Detalhes da Empresa
- [ ] Clicar em uma empresa da lista
- [ ] Ver detalhes completos
- [ ] Ver estatísticas (total de testes, uso do limite)
- [ ] Ver médias DISC

### Editar Empresa
- [ ] Clicar em "Editar"
- [ ] Modificar dados
- [ ] Salvar alterações
- [ ] Verificar se foi atualizado

### Deletar Empresa
- [ ] Tentar deletar uma empresa
- [ ] Confirmar exclusão
- [ ] Verificar se foi removida da lista

---

## 2. Portal de Testes (Público)

### Acessar Portal da Empresa
- [ ] Acessar `/test/[slug-da-empresa]`
- [ ] Ver branding customizado (logo, cores)
- [ ] Ver mensagem de boas-vindas personalizada

### Realizar Teste
- [ ] Iniciar teste pela empresa
- [ ] Responder todas as questões
- [ ] Submeter teste
- [ ] Ver resultado com branding da empresa

---

## 3. Gestão de Funcionários

### Listar Funcionários
- [ ] Acessar `/admin/employees`
- [ ] Ver lista de funcionários
- [ ] Filtrar por empresa
- [ ] Filtrar por perfil DISC

### Ver Detalhes do Funcionário
- [ ] Clicar em um funcionário
- [ ] Ver perfil completo
- [ ] Ver histórico de testes
- [ ] Ver resultados DISC

---

## 4. Dashboard Admin

### Métricas Gerais
- [ ] Acessar `/admin`
- [ ] Ver total de empresas
- [ ] Ver total de testes realizados
- [ ] Ver empresas próximas do limite
- [ ] Ver atividade recente

### Analytics
- [ ] Acessar `/admin/analytics`
- [ ] Ver gráficos de uso
- [ ] Ver distribuição DISC
- [ ] Ver tendências

---

## 5. Validações e Limites

### Limite de Testes
- [ ] Empresa atingir limite de testes
- [ ] Tentar fazer novo teste
- [ ] Ver mensagem de limite atingido
- [ ] Admin aumentar limite
- [ ] Conseguir fazer novo teste

### Slug Único
- [ ] Tentar criar empresa com slug duplicado
- [ ] Ver erro de validação
- [ ] Criar com slug único

---

## 6. Permissões e Segurança

### Roles de Admin
- [ ] Login como `super_admin` - acesso total ✅
- [ ] Login como `admin` - acesso total ✅
- [ ] Login como `company_admin` - acesso à sua empresa
- [ ] Login como `user` - sem acesso admin

### RLS Policies
- [ ] Admins podem criar empresas ✅
- [ ] Admins podem ver todas empresas
- [ ] Admins podem editar empresas
- [ ] Admins podem deletar empresas
- [ ] Users não podem acessar rotas admin

---

## Problemas Encontrados

### ✅ Resolvidos
1. Middleware desabilitado causando 401 - **RESOLVIDO**
2. server.ts não aceitava Bearer token - **RESOLVIDO**
3. Role 'user' em vez de 'admin' - **RESOLVIDO**
4. RLS bloqueando INSERT - **RESOLVIDO**
5. companyService usando cliente anônimo - **RESOLVIDO**

### ⚠️ Para Verificar
- [ ] Outras tabelas (company_tests, company_employees) têm RLS correto?
- [ ] Todas as API routes passam cliente autenticado?
- [ ] Frontend mostra erros de forma amigável?

---

## Próximos Passos

1. **Testar cada item do checklist acima**
2. **Corrigir problemas encontrados**
3. **Validar sistema de aprendizado contínuo**
4. **Testar integração com IA (chat, análise DISC)**
5. **Deploy para produção**
