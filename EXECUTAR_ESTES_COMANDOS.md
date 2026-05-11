# ⚡ EXECUTAR ESTES COMANDOS

## 🎯 Copie e Cole no PowerShell

### 1. Parar o Servidor

Pressione: **Ctrl + C** no terminal

---

### 2. Limpar Cache e Iniciar sem Turbopack

Copie e cole estes comandos (um de cada vez):

```powershell
# Limpar cache do Next.js
Remove-Item -Recurse -Force .next

# Iniciar servidor SEM Turbopack
npm run dev -- --no-turbopack
```

---

### 3. Aguardar Iniciar

Aguarde aparecer:

```
✓ Ready in X.Xs
```

**SEM erros de "FATAL" ou "panic"!** ✅

---

### 4. Testar no Navegador

Abra: **http://localhost:3000**

**Deve carregar a página!** ✅

---

## 📋 Resumo dos Comandos

```powershell
# 1. Parar servidor
Ctrl + C

# 2. Limpar cache
Remove-Item -Recurse -Force .next

# 3. Iniciar sem Turbopack
npm run dev -- --no-turbopack
```

---

## ✅ Depois que Funcionar

1. ✅ Execute SQL no Supabase: `SOLUCAO_COMPLETA_RLS.sql`
2. ✅ Faça login
3. ✅ Teste criar empresa

---

**Execute agora!** 🚀
