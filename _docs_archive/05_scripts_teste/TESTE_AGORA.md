# ⚡ TESTE AGORA - Guia Rápido

## 🎯 Passo 1: Verificar se o Servidor Está Rodando

Abra o navegador e acesse:

```
http://localhost:3000
```

---

## ✅ Se a Página CARREGAR

**Servidor está rodando!** Você só precisa:

### 1. Executar SQL no Supabase (2 minutos)

1. Abra: https://supabase.com/dashboard → SQL Editor
2. Copie: `supabase/SOLUCAO_COMPLETA_RLS.sql` (TODO)
3. Cole e clique "Run"
4. Veja: `✅ SUCESSO! Você é super admin!`

### 2. Limpar Cache (1 minuto)

1. Feche TODAS as abas do localhost:3000
2. `Ctrl + Shift + Delete` → Limpar tudo
3. Feche o navegador
4. Abra novamente

### 3. Testar (1 minuto)

1. http://localhost:3000/login → Faça login
2. http://localhost:3000/admin/companies/new
3. Preencha e clique "Criar Empresa"

**Deve funcionar!** ✅

---

## ❌ Se a Página NÃO CARREGAR

**Servidor não está rodando!** Você precisa:

### 1. Instalar Node.js

1. Acesse: https://nodejs.org/
2. Baixe: Versão LTS (botão verde)
3. Execute o instalador
4. Siga o wizard (deixe tudo padrão)
5. Aguarde a instalação

### 2. Reiniciar PowerShell

1. Feche TODAS as janelas do PowerShell
2. Abra uma NOVA janela
3. Navegue até a pasta do projeto:

```powershell
cd "C:\Users\Julio\Downloads\Projeto Kiro\VX Teste DISC"
```

### 3. Instalar Dependências

```powershell
npm install
```

Aguarde 2-5 minutos.

### 4. Iniciar Servidor

```powershell
npm run dev
```

Aguarde aparecer:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
```

### 5. Voltar para "Se a Página CARREGAR" acima

---

## 📋 Checklist Rápido

- [ ] http://localhost:3000 carrega?
  - ✅ SIM → Execute SQL e teste
  - ❌ NÃO → Instale Node.js

- [ ] SQL executado no Supabase?
  - Viu "✅ SUCESSO! Você é super admin!"?

- [ ] Cache limpo?
  - Ctrl + Shift + Delete → Limpar tudo

- [ ] Login feito novamente?

- [ ] Tentou criar empresa?

---

## 🆘 Precisa de Ajuda?

Me avise:

1. http://localhost:3000 carrega ou não?
2. Se não carrega, Node.js está instalado?
3. Qual erro aparece?

**Vou ajudar!** 💪
