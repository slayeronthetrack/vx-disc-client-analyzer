# 🧪 Teste Rápido - Correção RLS

## ⚡ Guia de 3 Minutos

---

## 1️⃣ Executar Migration (1 min)

### Abra o Supabase Dashboard

1. Vá para: https://supabase.com/dashboard
2. Selecione seu projeto
3. Clique em **SQL Editor** (menu lateral esquerdo)
4. Clique em **New Query**

### Cole e Execute

```sql
-- Copie TODO o conteúdo de: supabase/fix-rls-policies.sql
-- Cole aqui e clique em RUN
```

### Verifique o Sucesso

Você deve ver:
```
✅ RLS Policies configured successfully!
Policies created:
  1. INSERT - Users can insert their own tests
  2. SELECT - Users can view their own tests
  3. UPDATE - Users can update their own tests
  4. DELETE - Users can delete their own tests
```

---

## 2️⃣ Reiniciar Servidor (30 seg)

```bash
# No terminal onde está rodando npm run dev
# Pressione: Ctrl+C

# Reinicie:
npm run dev

# Aguarde: ✓ Ready in X.Xs
```

---

## 3️⃣ Testar Fluxo (1 min 30 seg)

### A. Fazer Login
1. Abra: http://localhost:3000
2. Clique em **"Entrar"**
3. Use suas credenciais
4. Verifique que está logado

### B. Iniciar Teste
1. Vá para: http://localhost:3000/test
2. Escolha: **20 perguntas**
3. Clique: **"Iniciar Teste"**

### C. Responder Perguntas
1. Selecione 1-2 opções por pergunta
2. Clique em **"Próxima"**
3. Repita até a pergunta 20

### D. Finalizar Teste
1. Na pergunta 20, clique: **"Finalizar Teste"**
2. Aguarde o salvamento

### E. Verificar Resultado

**✅ SUCESSO se:**
- Não aparece erro na tela
- Você é redirecionado para `/result`
- Vê seu perfil DISC (D, I, S ou C)
- Vê a análise da Marina
- Vê o gráfico de pizza

**❌ ERRO se:**
- Aparece: "new row violates row-level security policy"
- Aparece: "Erro ao salvar teste"
- Fica preso na tela do teste
- Não redireciona para `/result`

---

## 📊 Verificar Logs

### Terminal do Servidor

**Procure por:**
```javascript
[calculate-result] User authenticated: { userId: '...', email: '...' }
[discTestService] Attempting to save test: { userId: '...', hasClient: true, clientType: 'server' }
[discTestService] Test saved successfully: { testId: '...', userId: '...' }
[calculate-result] Test saved successfully
```

**✅ Se ver isso**: Funcionou!

**❌ Se ver erro RLS**: Migration não foi aplicada ou há outro problema

### Console do Navegador (F12)

**Procure por:**
```javascript
[Test] Result calculated successfully
```

**✅ Se ver isso**: Funcionou!

**❌ Se ver erro**: Copie TODO o log e me envie

---

## 🐛 Troubleshooting Rápido

### Erro: "Usuário não autenticado"

**Causa**: Sessão expirou  
**Solução**: Faça logout e login novamente

### Erro: "new row violates row-level security policy"

**Causa**: Migration não foi aplicada  
**Solução**: Execute `supabase/fix-rls-policies.sql` novamente

### Erro: "column does not exist"

**Causa**: Tabela sem novos campos  
**Solução**: Execute `supabase/fix-disc-tests-table.sql` também

### Erro: "Usuário não autorizado"

**Causa**: userId não corresponde a auth.uid()  
**Solução**: Verifique que está usando o usuário correto

---

## ✅ Checklist Rápido

- [ ] Migration RLS executada no Supabase
- [ ] Servidor reiniciado
- [ ] Login realizado
- [ ] Teste iniciado (20 perguntas)
- [ ] Perguntas respondidas
- [ ] Teste finalizado
- [ ] **Salvamento bem-sucedido (SEM ERRO)**
- [ ] Redirecionamento para `/result`
- [ ] Resultado exibido corretamente

---

## 📞 Se Não Funcionar

### Copie e Me Envie:

1. **Logs do Terminal** (todas as linhas com `[calculate-result]` e `[discTestService]`)
2. **Logs do Console** (F12 → Console, todas as linhas com `[Test]`)
3. **Mensagem de Erro** (se houver)
4. **Screenshot** da tela de erro (se houver)

---

**Boa sorte! Deve funcionar agora! 🚀**
