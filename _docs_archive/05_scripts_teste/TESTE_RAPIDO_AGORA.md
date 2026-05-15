# ⚡ TESTE RÁPIDO - AGORA

## ✅ Você já executou os SQLs no Supabase

Agora vamos testar se funcionou:

## 🧪 TESTE 1: Verificar se perfil existe

No Supabase SQL Editor, execute:

```sql
SELECT * FROM profiles WHERE user_id = 'cfce857c-7d22-4450-abe6-fc234a13c75a';
```

**Deve retornar 1 linha!**

---

## 🧪 TESTE 2: Testar no navegador

### Passo 1: Limpar cache e fazer logout
1. Abra http://localhost:3001
2. Abra Console (F12)
3. Execute no console:
```javascript
localStorage.clear();
sessionStorage.clear();
location.reload();
```

### Passo 2: Fazer login novamente
1. Vá para /login
2. Faça login com suas credenciais
3. **Observe o console** - deve aparecer:
```
[useAuth] Loading user state...
[useAuth] User: Found
[useAuth] Fetching profile...
[useAuth] Profile: Found  ← DEVE APARECER ISSO!
[useAuth] State loaded successfully
```

### Passo 3: Acessar /profile
1. Clique em "Configurar Perfil" ou vá para /profile
2. **NÃO DEVE TRAVAR!**
3. Deve carregar a página normalmente

### Passo 4: Acessar /test
1. Clique em "Fazer Teste" ou vá para /test
2. **NÃO DEVE TRAVAR!**
3. Deve carregar as perguntas

---

## 🔴 SE AINDA TRAVAR

Execute este SQL no Supabase (desabilita RLS temporariamente):

```sql
ALTER TABLE profiles DISABLE ROW LEVEL SECURITY;
```

Depois teste novamente.

---

## ✅ SE FUNCIONAR

Me avise dizendo:

**"agora tá funcionando"**

E vamos para a **FASE 2: Implementar seleção de 2 respostas no teste**

---

## 📋 CHECKLIST FASE 1

- [ ] Perfil existe no Supabase
- [ ] Login funciona sem travar
- [ ] /profile carrega sem travar
- [ ] /test carrega sem travar
- [ ] Console mostra "Profile: Found"

**Quando todos estiverem ✅, FASE 1 COMPLETA!**
