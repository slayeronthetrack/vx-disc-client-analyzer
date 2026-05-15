# 🧪 Plano de Testes - Sistema de Convites

## Objetivo
Validar a integração completa entre o sistema de convites e o fluxo de teste DISC.

---

## ✅ Checklist de Testes

### 1. **Setup Inicial**
- [ ] Servidor de desenvolvimento rodando
- [ ] Banco de dados acessível
- [ ] Usuário company_admin criado
- [ ] Empresa ativa criada
- [ ] Login funcionando

---

## 📋 Testes Funcionais

### **TESTE 1: Criar Convite**
**Objetivo:** Validar criação de convite no dashboard

**Passos:**
1. Login como company_admin
2. Acessar `/company/dashboard/invitations`
3. Clicar em "Novo Convite"
4. Preencher dados:
   - Nome: "João Silva"
   - Email: "joao.silva@test.com"
   - Cargo: "Analista de Vendas"
   - Departamento: "Comercial"
5. Clicar em "Criar Convite"

**Resultado Esperado:**
- ✅ Convite criado com sucesso
- ✅ Status inicial: `pending`
- ✅ Token único gerado
- ✅ Data de expiração: +30 dias
- ✅ Convite aparece na lista

**Validações no Banco:**
```sql
SELECT * FROM test_invitations 
WHERE employee_email = 'joao.silva@test.com'
ORDER BY created_at DESC LIMIT 1;
```

---

### **TESTE 2: Copiar Link do Convite**
**Objetivo:** Validar geração e cópia do link

**Passos:**
1. Na lista de convites, localizar o convite criado
2. Clicar no botão "Copiar Link"
3. Verificar notificação de sucesso
4. Colar link em um editor de texto

**Resultado Esperado:**
- ✅ Link copiado: `http://localhost:3000/test/invite/{token}`
- ✅ Token presente na URL
- ✅ Notificação de sucesso exibida

---

### **TESTE 3: Enviar Convite**
**Objetivo:** Validar mudança de status ao enviar

**Passos:**
1. Na lista de convites, clicar em "Enviar"
2. Verificar mudança de status

**Resultado Esperado:**
- ✅ Status atualizado para: `sent`
- ✅ Campo `sent_at` preenchido
- ✅ Badge de status atualizado na UI

**Validações no Banco:**
```sql
SELECT status, sent_at 
FROM test_invitations 
WHERE employee_email = 'joao.silva@test.com';
```

---

### **TESTE 4: Abrir Link do Convite (Navegador Anônimo)**
**Objetivo:** Validar página pública de convite

**Passos:**
1. Abrir navegador em modo anônimo
2. Colar o link do convite
3. Aguardar carregamento da página

**Resultado Esperado:**
- ✅ Página carrega sem erros
- ✅ Logo da empresa exibido
- ✅ Nome da empresa exibido
- ✅ Dados do funcionário exibidos:
  - Nome: "João Silva"
  - Email: "joao.silva@test.com"
  - Cargo: "Analista de Vendas"
- ✅ Informações sobre o teste exibidas
- ✅ Botão "Iniciar Teste DISC" visível
- ✅ Status atualizado para: `opened`

**Validações no Banco:**
```sql
SELECT status, opened_at 
FROM test_invitations 
WHERE employee_email = 'joao.silva@test.com';
```

---

### **TESTE 5: Iniciar Teste via Convite**
**Objetivo:** Validar redirecionamento e pré-preenchimento

**Passos:**
1. Na página do convite, clicar em "Iniciar Teste DISC"
2. Verificar redirecionamento
3. Verificar formulário de dados

**Resultado Esperado:**
- ✅ Redirecionado para: `/test/{company-slug}?invitation={token}`
- ✅ Banner informativo exibido: "Você está usando um convite da empresa"
- ✅ Dados pré-preenchidos:
  - Nome: "João Silva" ✅
  - Email: "joao.silva@test.com" ✅ (desabilitado)
  - Cargo: "Analista de Vendas" ✅
  - Departamento: "Comercial" ✅
- ✅ Campo email está desabilitado
- ✅ Status atualizado para: `started`

**Validações no Banco:**
```sql
SELECT status, started_at 
FROM test_invitations 
WHERE employee_email = 'joao.silva@test.com';
```

---

### **TESTE 6: Completar Teste**
**Objetivo:** Validar conclusão e vinculação

**Passos:**
1. Clicar em "Iniciar Teste"
2. Responder todas as 24 perguntas
3. Clicar em "Finalizar Teste"
4. Aguardar processamento

**Resultado Esperado:**
- ✅ Teste salvo com sucesso
- ✅ Página de conclusão exibida
- ✅ Status do convite: `completed`
- ✅ Campo `completed_at` preenchido
- ✅ Campo `test_id` vinculado ao teste criado
- ✅ Teste criado com `invitation_id` vinculado

**Validações no Banco:**
```sql
-- Verificar convite
SELECT id, status, completed_at, test_id 
FROM test_invitations 
WHERE employee_email = 'joao.silva@test.com';

-- Verificar teste
SELECT id, invitation_id, name, email, disc_result 
FROM company_tests 
WHERE email = 'joao.silva@test.com'
ORDER BY created_at DESC LIMIT 1;

-- Verificar vinculação bidirecional
SELECT 
  ti.id as invitation_id,
  ti.status,
  ti.test_id,
  ct.id as test_id_from_test,
  ct.invitation_id
FROM test_invitations ti
LEFT JOIN company_tests ct ON ti.test_id = ct.id
WHERE ti.employee_email = 'joao.silva@test.com';
```

---

### **TESTE 7: Visualizar Resultado no Dashboard**
**Objetivo:** Validar exibição do teste no dashboard

**Passos:**
1. Voltar ao dashboard como company_admin
2. Acessar `/company/dashboard`
3. Verificar lista de testes
4. Acessar `/company/dashboard/invitations`
5. Verificar status do convite

**Resultado Esperado:**
- ✅ Teste aparece na lista de testes
- ✅ Nome: "João Silva"
- ✅ Email: "joao.silva@test.com"
- ✅ Perfil DISC calculado
- ✅ Convite com status `completed`
- ✅ Badge verde no convite
- ✅ Link para visualizar teste funcionando

---

## 🔍 Testes de Edge Cases

### **TESTE 8: Token Inválido**
**Passos:**
1. Acessar `/test/invite/token-invalido-123`

**Resultado Esperado:**
- ✅ Página de erro exibida
- ✅ Mensagem: "Convite não encontrado ou expirado"
- ✅ Status HTTP: 404

---

### **TESTE 9: Convite Expirado**
**Passos:**
1. Criar convite com data de expiração no passado (via SQL)
2. Tentar acessar o link

**Resultado Esperado:**
- ✅ Página de erro exibida
- ✅ Mensagem: "Este convite expirou"
- ✅ Status atualizado para: `expired`

---

### **TESTE 10: Teste sem Convite (Fluxo Normal)**
**Objetivo:** Garantir que o fluxo normal ainda funciona

**Passos:**
1. Acessar `/test/{company-slug}` diretamente (sem invitation)
2. Preencher dados manualmente
3. Completar teste

**Resultado Esperado:**
- ✅ Formulário vazio (sem pré-preenchimento)
- ✅ Todos os campos editáveis
- ✅ Teste salvo sem `invitation_id`
- ✅ Sem banner de convite

---

### **TESTE 11: Convite de Empresa Diferente**
**Objetivo:** Validar segurança

**Passos:**
1. Criar convite para Empresa A
2. Tentar usar token em `/test/{empresa-b-slug}?invitation={token}`

**Resultado Esperado:**
- ✅ Convite não é carregado
- ✅ Formulário vazio
- ✅ Sem pré-preenchimento

---

### **TESTE 12: Múltiplos Testes do Mesmo Convite**
**Objetivo:** Validar comportamento de reteste

**Passos:**
1. Usar convite já completado
2. Tentar fazer novo teste

**Resultado Esperado:**
- ✅ Convite ainda pode ser usado (ou)
- ✅ Mensagem informando que já foi usado

---

## 📊 Testes de Dashboard

### **TESTE 13: Filtros de Convites**
**Passos:**
1. Criar múltiplos convites com diferentes status
2. Testar filtros:
   - Por status (pending, sent, opened, started, completed)
   - Por departamento
   - Por busca (nome/email)

**Resultado Esperado:**
- ✅ Filtros funcionam corretamente
- ✅ Contadores atualizados
- ✅ Lista filtrada corretamente

---

### **TESTE 14: Estatísticas de Convites**
**Passos:**
1. Verificar cards de estatísticas
2. Comparar com dados reais do banco

**Resultado Esperado:**
- ✅ Total de convites correto
- ✅ Convites por status corretos
- ✅ Taxa de conclusão calculada corretamente
- ✅ Taxa de abertura calculada corretamente

---

### **TESTE 15: Deletar Convite**
**Passos:**
1. Criar convite de teste
2. Clicar em deletar
3. Confirmar exclusão

**Resultado Esperado:**
- ✅ Convite removido da lista
- ✅ Convite deletado do banco
- ✅ Notificação de sucesso

---

## 🚨 Testes de Erro

### **TESTE 16: Erro de Rede**
**Passos:**
1. Desconectar internet
2. Tentar criar convite

**Resultado Esperado:**
- ✅ Mensagem de erro amigável
- ✅ Botão de retry disponível

---

### **TESTE 17: Dados Inválidos**
**Passos:**
1. Tentar criar convite com email inválido
2. Tentar criar convite sem nome

**Resultado Esperado:**
- ✅ Validação de formulário
- ✅ Mensagens de erro claras
- ✅ Campos destacados em vermelho

---

## 📱 Testes de Responsividade

### **TESTE 18: Mobile**
**Passos:**
1. Abrir página de convite em mobile
2. Completar teste em mobile

**Resultado Esperado:**
- ✅ Layout responsivo
- ✅ Botões acessíveis
- ✅ Formulário usável
- ✅ Teste completável

---

## ⚡ Testes de Performance

### **TESTE 19: Carga de Convites**
**Passos:**
1. Criar 100+ convites
2. Acessar lista de convites
3. Testar paginação

**Resultado Esperado:**
- ✅ Página carrega em < 2s
- ✅ Paginação funciona
- ✅ Filtros rápidos

---

## 🔐 Testes de Segurança

### **TESTE 20: Acesso Não Autorizado**
**Passos:**
1. Tentar acessar `/company/dashboard/invitations` sem login
2. Tentar acessar como usuário normal (não company_admin)

**Resultado Esperado:**
- ✅ Redirecionado para login
- ✅ Acesso negado para não-admins

---

## 📝 Checklist Final

### Funcionalidades Core
- [ ] Criar convite
- [ ] Enviar convite
- [ ] Copiar link
- [ ] Abrir convite (público)
- [ ] Iniciar teste via convite
- [ ] Completar teste
- [ ] Visualizar resultado
- [ ] Deletar convite

### Validações
- [ ] Status transitions corretos
- [ ] Timestamps atualizados
- [ ] Vinculação bidirecional
- [ ] Pré-preenchimento de dados
- [ ] Email desabilitado quando via convite

### Edge Cases
- [ ] Token inválido
- [ ] Convite expirado
- [ ] Teste sem convite funciona
- [ ] Segurança entre empresas

### UX/UI
- [ ] Notificações funcionam
- [ ] Loading states
- [ ] Mensagens de erro claras
- [ ] Responsivo em mobile

---

## 🐛 Registro de Bugs

### Bug Template
```markdown
**ID:** BUG-001
**Severidade:** Alta/Média/Baixa
**Teste:** TESTE X
**Descrição:** 
**Passos para Reproduzir:**
1. 
2. 
**Resultado Esperado:**
**Resultado Atual:**
**Screenshots:**
**Logs:**
```

---

## ✅ Critérios de Aceitação

Para considerar o sistema pronto para produção:

1. ✅ Todos os testes funcionais passam
2. ✅ Pelo menos 90% dos edge cases cobertos
3. ✅ Zero bugs críticos
4. ✅ Máximo 2 bugs médios
5. ✅ Performance aceitável (< 2s load time)
6. ✅ Responsivo em mobile
7. ✅ Segurança validada

---

## 🚀 Próximos Passos Após Testes

1. Corrigir bugs encontrados
2. Documentar comportamentos inesperados
3. Criar testes automatizados
4. Deploy em staging
5. Testes de aceitação com usuários reais
6. Deploy em produção

---

**Data de Criação:** 2026-05-11
**Versão:** 1.0
**Status:** 🟡 Em Execução
