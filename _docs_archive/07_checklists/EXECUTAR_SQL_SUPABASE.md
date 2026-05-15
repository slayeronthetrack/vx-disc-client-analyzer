# 🚀 Como Executar o SQL no Supabase (2 minutos)

## ✅ Suas Credenciais Já Estão Configuradas!

O arquivo `.env.local` já está configurado com:
- **URL**: `https://eolvvdmzeifbeugkhkyg.supabase.co`
- **Anon Key**: Configurada ✅

---

## 📝 Passo a Passo para Executar o SQL

### 1. Acesse o SQL Editor do Supabase
Abra no navegador:
```
https://supabase.com/dashboard/project/eolvvdmzeifbeugkhkyg/sql/new
```

### 2. Copie TODO o conteúdo do arquivo `lib/supabase/schema.sql`

Abra o arquivo `lib/supabase/schema.sql` neste projeto e copie TODO o conteúdo (Ctrl+A, Ctrl+C).

### 3. Cole no SQL Editor

Cole o conteúdo no editor SQL do Supabase.

### 4. Execute o SQL

Clique no botão **"Run"** (ou pressione Ctrl+Enter).

### 5. Aguarde a Confirmação

Você verá mensagens de sucesso para cada comando executado. Alguns avisos como "already exists" são normais.

---

## ✅ Pronto! Agora você pode:

1. **Reiniciar o servidor**:
   ```bash
   # Pressione Ctrl+C para parar o servidor
   npm run dev
   ```

2. **Criar sua primeira conta**:
   - Acesse: http://localhost:3001/register
   - Crie uma conta de teste

3. **Configurar perfil e fazer o teste DISC**:
   - Configure seu perfil em /profile
   - Faça o teste em /test
   - Veja o resultado em /result

---

## 🔧 Próximas Melhorias (Após Testar)

Depois de testar o sistema, vamos implementar:

1. **Atualizar página /test**: Checkbox para selecionar 2 opções (não radio)
2. **Atualizar página /result**: Buscar dados do Supabase (não localStorage)
3. **Atualizar página /admin**: Mostrar dados reais do banco
4. **Ativar proteção de rotas**: Descomentar middleware

---

## 🆘 Problemas?

Se encontrar erros ao executar o SQL:
- Verifique se você está logado no projeto correto
- Alguns avisos "already exists" são normais
- Se algum comando falhar, me avise qual foi o erro
