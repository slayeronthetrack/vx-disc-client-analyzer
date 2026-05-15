# 📦 Instalar Node.js no Windows

## 🎯 Problema

O comando `npm` não é reconhecido porque o Node.js não está instalado ou não está no PATH do sistema.

---

## ✅ Solução: Instalar Node.js

### Opção 1: Download Direto (Recomendado)

1. **Acesse**: https://nodejs.org/
2. **Baixe**: Versão LTS (Long Term Support) - botão verde
3. **Execute** o instalador `.msi`
4. **Siga o wizard**:
   - ✅ Aceite os termos
   - ✅ Deixe o caminho padrão
   - ✅ Marque "Automatically install necessary tools"
   - ✅ Clique "Install"
5. **Aguarde** a instalação (2-5 minutos)
6. **Reinicie** o PowerShell (feche e abra novamente)

---

### Opção 2: Usando Winget (Windows 11)

```powershell
winget install OpenJS.NodeJS.LTS
```

Depois reinicie o PowerShell.

---

### Opção 3: Usando Chocolatey

Se você tem Chocolatey instalado:

```powershell
choco install nodejs-lts
```

Depois reinicie o PowerShell.

---

## 🔍 Verificar Instalação

Após instalar, **feche e abra novamente o PowerShell**, depois execute:

```powershell
node --version
npm --version
```

**Deve mostrar**:
```
v20.x.x  (ou v18.x.x)
10.x.x   (ou 9.x.x)
```

---

## 🚀 Depois de Instalar

### 1. Instalar Dependências do Projeto

```powershell
cd "C:\Users\Julio\Downloads\Projeto Kiro\VX Teste DISC"
npm install
```

Aguarde 2-5 minutos (vai baixar ~500MB de dependências).

---

### 2. Iniciar o Servidor

```powershell
npm run dev
```

**Deve mostrar**:
```
▲ Next.js 14.x.x
- Local:        http://localhost:3000
- Ready in 3.2s
```

---

### 3. Acessar o Sistema

1. Abra o navegador
2. Acesse: http://localhost:3000
3. Faça login
4. Acesse: http://localhost:3000/admin

---

## ❌ Troubleshooting

### Erro: "npm não é reconhecido" (ainda)

**Causa**: PowerShell não recarregou o PATH

**Solução**:
1. Feche TODAS as janelas do PowerShell
2. Abra uma NOVA janela do PowerShell
3. Tente novamente: `npm --version`

---

### Erro: "EACCES: permission denied"

**Causa**: Permissões de pasta

**Solução**:
```powershell
# Execute como Administrador
npm cache clean --force
npm install
```

---

### Erro: "Cannot find module"

**Causa**: Dependências não instaladas

**Solução**:
```powershell
rm -r node_modules
rm package-lock.json
npm install
```

---

## 📝 Checklist

- [ ] Node.js instalado
- [ ] PowerShell reiniciado
- [ ] `node --version` funciona
- [ ] `npm --version` funciona
- [ ] `npm install` executado
- [ ] `npm run dev` rodando
- [ ] http://localhost:3000 acessível

---

## 🎯 Próximos Passos

Depois que o servidor estiver rodando:

1. ✅ Executar SQL no Supabase (`SOLUCAO_COMPLETA_RLS.sql`)
2. ✅ Limpar cache do navegador
3. ✅ Fazer login
4. ✅ Testar criar empresa

---

## 🆘 Precisa de Ajuda?

Se ainda não funcionar, me avise:

1. Qual versão do Windows você tem? (Windows 10 ou 11)
2. Você tem permissões de administrador?
3. Qual erro aparece ao tentar instalar?

**Vou ajudar!** 💪
