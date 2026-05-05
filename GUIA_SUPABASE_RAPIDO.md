# 🚀 Guia Rápido - Configurar Supabase (10 minutos)

## ✅ PASSO 1: Criar Conta (2 minutos)

1. Acesse: https://supabase.com
2. Clique em **"Start your project"**
3. Faça login com GitHub ou Email
4. Confirme seu email

---

## ✅ PASSO 2: Criar Projeto (3 minutos)

1. Clique em **"New Project"**
2. Preencha:
   - **Name:** `vx-disc-system`
   - **Database Password:** Crie uma senha forte (anote!)
   - **Region:** Escolha mais próximo (ex: South America)
3. Clique em **"Create new project"**
4. **AGUARDE 2-3 minutos** (criando banco de dados)

---

## ✅ PASSO 3: Executar SQL (2 minutos)

1. No menu lateral, clique em **"SQL Editor"**
2. Clique em **"New Query"**
3. Abra o arquivo `lib/supabase/schema.sql` no seu projeto
4. **Copie TODO o conteúdo** (Ctrl+A, Ctrl+C)
5. **Cole no SQL Editor** do Supabase (Ctrl+V)
6. Clique em **"Run"** (ou F5)
7. Aguarde aparecer **"Success. No rows returned"**

✅ **Pronto!** Tabelas criadas!

---

## ✅ PASSO 4: Copiar Credenciais (2 minutos)

1. No menu lateral, clique em **"Settings"** (ícone de engrenagem)
2. Clique em **"API"**
3. Você verá:

### Project URL
```
https://xxxxxxxxxxxxx.supabase.co
```
**Copie isso!**

### anon public key
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6...
```
**Copie isso também!** (é uma chave LONGA)

---

## ✅ PASSO 5: Configurar .env.local (1 minuto)

1. Abra o arquivo `.env.local` na raiz do projeto
2. Cole suas credenciais:

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxxxxxxxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
OPENAI_API_KEY=sk-...sua-chave (deixe em branco por enquanto)
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

3. **Salve o arquivo** (Ctrl+S)

---

## ✅ PASSO 6: Reiniciar Servidor (10 segundos)

No terminal onde o servidor está rodando:

1. Pressione **Ctrl+C** (para parar)
2. Digite: `npm run dev`
3. Pressione **Enter**

**PRONTO! Sistema funcionando com Supabase! 🎉**

---

## 🧪 TESTAR SE FUNCIONOU

1. Acesse: http://localhost:3000/register
2. Crie uma conta de teste
3. Se funcionar → **Supabase configurado com sucesso!** ✅
4. Se der erro → Me avise qual erro apareceu

---

## ❓ PROBLEMAS COMUNS

### Erro: "Invalid API key"
- Verifique se copiou a chave completa
- Não pode ter espaços ou quebras de linha
- Deve começar com `eyJ...`

### Erro: "Failed to fetch"
- Verifique se a URL está correta
- Deve começar com `https://`
- Deve terminar com `.supabase.co`

### Erro: "relation does not exist"
- O SQL não foi executado
- Volte ao Passo 3 e execute novamente

---

## 📞 PRECISA DE AJUDA?

Me avise:
1. Qual passo você está
2. Qual erro apareceu
3. Print da tela (se possível)

---

## 🎯 DEPOIS DE CONFIGURAR

**Me avise que terminou!**

Eu vou:
1. Terminar as implementações restantes
2. Criar as APIs de IA
3. Finalizar o sistema completo

**Tempo restante:** ~3 horas de implementação

---

**Boa sorte! É mais fácil do que parece! 🚀**
