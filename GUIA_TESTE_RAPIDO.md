# 🚀 Guia de Teste Rápido - Sistema de Convites

## ✅ Servidor Pronto!
**URL:** http://localhost:3000

---

## 📋 Teste Rápido (10 minutos)

### **PASSO 1: Login como Company Admin** 🔐

1. Abra o navegador: **http://localhost:3000/login**
2. Faça login com credenciais de company_admin
   - Se não tiver, crie um usuário e empresa primeiro

**✅ Checkpoint:** Você deve estar logado e ver o dashboard

---

### **PASSO 2: Acessar Página de Convites** 📧

1. No menu lateral, clique em **"Convites"**
2. Ou acesse diretamente: **http://localhost:3000/company/dashboard/invitations**

**✅ Checkpoint:** Você deve ver a página de gerenciamento de convites com:
- Cards de estatísticas no topo
- Botão "Novo Convite"
- Lista de convites (pode estar vazia)

---

### **PASSO 3: Criar Novo Convite** ➕

1. Clique no botão **"Novo Convite"**
2. Preencha o formulário:
   ```
   Nome: João Silva
   Email: joao.teste@email.com
   Cargo: Analista de Vendas
   Departamento: Comercial
   ```
3. Clique em **"Criar Convite"**

**✅ Checkpoint:** 
- Modal fecha
- Notificação de sucesso aparece
- Novo convite aparece na lista com status "Pendente"

---

### **PASSO 4: Copiar Link do Convite** 🔗

1. Na lista de convites, localize o convite que você criou
2. Clique no botão **"Copiar Link"** (ícone de link)
3. Cole o link em um editor de texto (Notepad, etc.)

**✅ Checkpoint:**
- Notificação "Link copiado!"
- Link deve ser algo como: `http://localhost:3000/test/invite/abc123...`

---

### **PASSO 5: Enviar Convite** 📤

1. Clique no botão **"Enviar"** no mesmo convite
2. Observe a mudança de status

**✅ Checkpoint:**
- Status muda de "Pendente" para "Enviado"
- Badge fica amarelo

---

### **PASSO 6: Abrir Link em Navegador Anônimo** 🕵️

1. Abra uma **janela anônima/privada** no navegador
   - Chrome: `Ctrl + Shift + N`
   - Firefox: `Ctrl + Shift + P`
   - Edge: `Ctrl + Shift + N`
2. Cole o link do convite
3. Pressione Enter

**✅ Checkpoint:** Você deve ver:
- Logo da empresa (se configurado)
- Nome da empresa
- Card com informações do convite:
  - ✅ Nome: "João Silva"
  - ✅ Email: "joao.teste@email.com"
  - ✅ Cargo: "Analista de Vendas"
  - ✅ Data de validade
- Informações sobre o teste (duração, perguntas, etc.)
- Botão grande **"Iniciar Teste DISC"**

---

### **PASSO 7: Verificar Status "Aberto"** 👀

1. Volte para a janela normal (com login de admin)
2. Atualize a página de convites (`F5`)

**✅ Checkpoint:**
- Status do convite mudou para "Aberto"
- Badge fica azul

---

### **PASSO 8: Iniciar Teste** 🎯

1. Volte para a janela anônima
2. Clique em **"Iniciar Teste DISC"**

**✅ Checkpoint:** Você deve ser redirecionado e ver:
- Banner azul no topo: "✓ Você está usando um convite da empresa. Seus dados foram pré-preenchidos."
- Formulário com dados PRÉ-PREENCHIDOS:
  - ✅ Nome: "João Silva"
  - ✅ Email: "joao.teste@email.com" (DESABILITADO - não pode editar)
  - ✅ Cargo: "Analista de Vendas"
  - ✅ Departamento: "Comercial"
- Botão "Iniciar Teste"

---

### **PASSO 9: Verificar Status "Iniciado"** ▶️

1. Volte para a janela normal (admin)
2. Atualize a página de convites

**✅ Checkpoint:**
- Status mudou para "Iniciado"
- Badge fica roxo

---

### **PASSO 10: Completar Teste** ✍️

1. Volte para a janela anônima
2. Clique em **"Iniciar Teste"** (no formulário)
3. Responda as 24 perguntas:
   - Selecione 1 ou 2 opções por pergunta
   - Use os botões "Próxima" e "Anterior" para navegar
4. Na última pergunta, clique em **"Finalizar Teste"**
5. Aguarde o processamento (pode levar alguns segundos)

**✅ Checkpoint:** Você deve ver:
- Página de conclusão com:
  - ✅ Ícone de sucesso (check verde)
  - ✅ Mensagem "Teste Concluído!"
  - ✅ Agradecimento
  - ✅ Informação que resultados estão disponíveis para a empresa

---

### **PASSO 11: Verificar Status "Completado"** ✅

1. Volte para a janela normal (admin)
2. Atualize a página de convites

**✅ Checkpoint:**
- Status mudou para "Completado"
- Badge fica verde
- Estatísticas atualizadas:
  - Total de convites: 1
  - Completados: 1
  - Taxa de conclusão: 100%

---

### **PASSO 12: Visualizar Teste no Dashboard** 📊

1. Clique em **"Dashboard"** no menu lateral
2. Ou acesse: **http://localhost:3000/company/dashboard**

**✅ Checkpoint:** Você deve ver:
- Novo teste na lista de funcionários
- Nome: "João Silva"
- Email: "joao.teste@email.com"
- Perfil DISC calculado (D, I, S ou C)
- Scores e percentuais

---

### **PASSO 13: Verificar Vinculação no Banco** 🗄️

Abra seu cliente SQL (DBeaver, pgAdmin, etc.) e execute:

```sql
-- Verificar convite
SELECT 
  id,
  employee_name,
  employee_email,
  status,
  test_id,
  created_at,
  sent_at,
  opened_at,
  started_at,
  completed_at
FROM test_invitations 
WHERE employee_email = 'joao.teste@email.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar teste
SELECT 
  id,
  invitation_id,
  name,
  email,
  position,
  disc_result->>'dominant' as perfil_dominante,
  created_at
FROM company_tests 
WHERE email = 'joao.teste@email.com'
ORDER BY created_at DESC 
LIMIT 1;

-- Verificar vinculação bidirecional
SELECT 
  ti.id as invitation_id,
  ti.employee_name,
  ti.status,
  ti.test_id as test_id_from_invitation,
  ct.id as test_id_from_test,
  ct.invitation_id as invitation_id_from_test,
  CASE 
    WHEN ti.test_id = ct.id AND ct.invitation_id = ti.id 
    THEN '✅ VINCULAÇÃO OK' 
    ELSE '❌ ERRO NA VINCULAÇÃO' 
  END as status_vinculacao
FROM test_invitations ti
LEFT JOIN company_tests ct ON ti.test_id = ct.id
WHERE ti.employee_email = 'joao.teste@email.com';
```

**✅ Checkpoint:**
- Convite tem `test_id` preenchido
- Teste tem `invitation_id` preenchido
- IDs correspondem (vinculação bidirecional OK)
- Todos os timestamps preenchidos corretamente

---

## 🎉 Teste Completo!

Se todos os checkpoints passaram, o sistema está funcionando perfeitamente! 

---

## 🧪 Testes Adicionais (Opcional)

### **TESTE EXTRA 1: Token Inválido**
1. Acesse: `http://localhost:3000/test/invite/token-invalido-123`
2. **Esperado:** Página de erro "Convite não encontrado"

### **TESTE EXTRA 2: Teste sem Convite**
1. Acesse diretamente: `http://localhost:3000/test/{seu-company-slug}`
2. **Esperado:** Formulário vazio, sem pré-preenchimento
3. Preencha manualmente e complete o teste
4. **Esperado:** Teste salvo normalmente, sem `invitation_id`

### **TESTE EXTRA 3: Deletar Convite**
1. Crie um novo convite de teste
2. Clique no botão de deletar (ícone de lixeira)
3. Confirme a exclusão
4. **Esperado:** Convite removido da lista

### **TESTE EXTRA 4: Filtros**
1. Crie múltiplos convites com diferentes status
2. Teste os filtros:
   - Status: Todos, Pendente, Enviado, Aberto, etc.
   - Busca por nome/email
   - Departamento
3. **Esperado:** Lista filtrada corretamente

---

## 🐛 Encontrou um Bug?

Anote aqui:

```markdown
**Bug:** 
**Onde:** 
**O que aconteceu:** 
**O que deveria acontecer:** 
**Como reproduzir:**
1. 
2. 
3. 
```

---

## ✅ Resultado Final

Marque o que funcionou:

- [ ] Criar convite
- [ ] Copiar link
- [ ] Enviar convite
- [ ] Abrir link (status → opened)
- [ ] Iniciar teste (status → started)
- [ ] Dados pré-preenchidos
- [ ] Email desabilitado
- [ ] Completar teste (status → completed)
- [ ] Vinculação bidirecional OK
- [ ] Teste aparece no dashboard
- [ ] Estatísticas atualizadas

**Total:** ___/12

---

## 📞 Precisa de Ajuda?

Se algo não funcionou como esperado, me avise e vou te ajudar a debugar! 🚀
