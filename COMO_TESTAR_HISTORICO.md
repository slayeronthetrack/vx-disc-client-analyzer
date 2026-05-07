# 🧪 Como Testar o Histórico de Testes

## ⚠️ ANTES DE COMEÇAR

### 1. Executar Migration SQL (OBRIGATÓRIO)
```sql
-- Abrir Supabase Dashboard
-- Ir em: SQL Editor
-- Copiar e executar: supabase/ensure-history-fields.sql
-- Aguardar mensagem de sucesso
```

**Por que?** A migration cria índices e garante que todos os campos necessários existem.

---

## 🎯 Cenários de Teste

### Cenário 1: Acessar Histórico pela Primeira Vez

**Passos:**
1. Fazer login: `juliopppimentel@gmail.com` / `teste123`
2. Ir para `/history`
3. **Resultado Esperado:**
   - Se você já fez testes: lista de cards com seus testes
   - Se nunca fez teste: mensagem "Você ainda não realizou nenhum teste" + botão "Fazer Novo Teste"

**O que verificar:**
- [ ] Página carrega sem erros
- [ ] Visual premium VX (fundo escuro, laranja)
- [ ] Header com ícone de histórico
- [ ] Filtros visíveis no topo

---

### Cenário 2: Visualizar Testes no Histórico

**Passos:**
1. Login → `/history`
2. Observar os cards de testes

**O que verificar em cada card:**
- [ ] Data e hora formatadas (ex: "6 de maio de 2026 às 14:30")
- [ ] Badge circular com letra do perfil (D, I, S, C)
- [ ] Nome do perfil (Dominância, Influência, etc)
- [ ] Quantidade de perguntas (ex: "20 perguntas respondidas")
- [ ] Valor dominante (se disponível)
- [ ] Tipo psicológico (se disponível)
- [ ] Objetivo do teste (se disponível)
- [ ] Botão "Ver Resultado" (laranja)
- [ ] Botão "PDF" (cinza)

**Cores dos perfis:**
- D = Vermelho
- I = Amarelo
- S = Verde
- C = Azul

---

### Cenário 3: Filtrar Testes

**Passos:**
1. Login → `/history`
2. Clicar em "Últimos 7 dias"
3. Verificar que apenas testes dos últimos 7 dias aparecem
4. Clicar em "Últimos 30 dias"
5. Verificar que apenas testes dos últimos 30 dias aparecem
6. Selecionar um perfil no dropdown (ex: "Dominância (D)")
7. Verificar que apenas testes com perfil D aparecem
8. Clicar em "Todos"
9. Verificar que todos os testes voltam

**O que verificar:**
- [ ] Filtros aplicam instantaneamente
- [ ] Contador de testes atualiza (ex: "5 testes encontrados")
- [ ] Botão ativo fica laranja
- [ ] Botões inativos ficam cinza
- [ ] Dropdown funciona corretamente

---

### Cenário 4: Ver Resultado Antigo

**Passos:**
1. Login → `/history`
2. Clicar "Ver Resultado" em qualquer teste
3. Aguardar redirecionamento

**O que verificar:**
- [ ] Redireciona para `/result?id=TEST_ID`
- [ ] URL contém o ID do teste
- [ ] Página de resultado carrega normalmente
- [ ] Mostra dados do teste selecionado
- [ ] Botão "Ver Histórico" está visível
- [ ] Todas as seções aparecem:
  - Perfil DISC
  - Distribuição DISC (barras)
  - Valores (se disponível)
  - Tipos Psicológicos (se disponível)
  - Análise IA (se disponível)

---

### Cenário 5: Baixar PDF de Teste Antigo

**Passos:**
1. Login → `/history`
2. Clicar "PDF" em qualquer teste
3. Aguardar geração

**O que verificar:**
- [ ] Botão mostra loading (spinner)
- [ ] Console mostra logs:
  ```
  [PDF] Starting PDF generation...
  [PDFService] Starting report generation
  [PDFService] Blob generated successfully
  [downloadPDF] Download completed successfully
  ```
- [ ] PDF é baixado automaticamente
- [ ] Nome do arquivo: `VX-DISC-[Nome]-[Data].pdf`
- [ ] PDF contém 5 páginas:
  1. Capa
  2. Informações do usuário
  3. Resultado DISC
  4. Análise IA
  5. Recomendações

---

### Cenário 6: Histórico no Perfil

**Passos:**
1. Login → `/profile`
2. Rolar até a seção "Histórico de Testes"

**O que verificar:**
- [ ] Seção aparece abaixo do formulário
- [ ] Mostra até 3 testes mais recentes
- [ ] Cada teste tem:
  - Badge circular com perfil
  - Nome do perfil + quantidade de perguntas
  - Data formatada
  - Botão "Ver"
- [ ] Link "Ver todos →" no canto superior direito
- [ ] Se não há testes: mensagem + botão "Fazer Primeiro Teste"

**Testar navegação:**
1. Clicar "Ver" em um teste
   - [ ] Redireciona para `/result?id=TEST_ID`
2. Voltar e clicar "Ver todos"
   - [ ] Redireciona para `/history`

---

### Cenário 7: Botão "Ver Histórico" no Resultado

**Passos:**
1. Login → `/result`
2. Localizar botões de ação

**O que verificar:**
- [ ] Botão "Ver Histórico" está visível
- [ ] Fica entre "Voltar para Home" e "Baixar Relatório PDF"
- [ ] Tem ícone de relógio
- [ ] Ao clicar, redireciona para `/history`

---

### Cenário 8: Estados de Loading

**Passos:**
1. Login → `/history`
2. Observar durante carregamento

**O que verificar:**
- [ ] Spinner laranja aparece
- [ ] Mensagem "Carregando histórico..."
- [ ] Após carregar, spinner desaparece
- [ ] Cards aparecem suavemente

**Ao baixar PDF:**
- [ ] Botão "PDF" mostra spinner
- [ ] Botão fica desabilitado
- [ ] Após download, botão volta ao normal

---

### Cenário 9: Estados Vazios

**Teste A: Sem testes**
1. Login com usuário novo (sem testes)
2. Ir para `/history`

**O que verificar:**
- [ ] Ícone de documento cinza
- [ ] Título "Nenhum teste encontrado"
- [ ] Mensagem explicativa
- [ ] Botão "Fazer Novo Teste" (laranja)
- [ ] Ao clicar, redireciona para `/test`

**Teste B: Filtro sem resultados**
1. Login → `/history`
2. Aplicar filtro que não retorna resultados (ex: "Últimos 7 dias" se não há testes recentes)

**O que verificar:**
- [ ] Mensagem "Nenhum teste encontrado com os filtros selecionados"
- [ ] Sugestão para ajustar filtros
- [ ] Botão "Fazer Novo Teste" ainda aparece

---

### Cenário 10: Segurança (RLS)

**Teste A: Tentar acessar teste de outro usuário**
1. Login → `/history`
2. Copiar ID de um teste
3. Fazer logout
4. Login com outro usuário
5. Ir para `/result?id=ID_COPIADO`

**O que verificar:**
- [ ] Não mostra o teste
- [ ] Redireciona ou mostra erro
- [ ] Console não mostra dados do outro usuário

**Teste B: Query direta no banco**
```sql
-- No Supabase Dashboard > SQL Editor
SELECT * FROM disc_tests WHERE user_id != auth.uid();
```

**O que verificar:**
- [ ] Query retorna vazio (RLS bloqueando)

---

### Cenário 11: Responsividade

**Mobile (< 768px):**
1. Abrir DevTools (F12)
2. Ativar modo mobile (Ctrl+Shift+M)
3. Ir para `/history`

**O que verificar:**
- [ ] Cards empilham em 1 coluna
- [ ] Filtros empilham verticalmente
- [ ] Botões ficam full-width
- [ ] Texto legível
- [ ] Touch funciona nos botões

**Tablet (768px - 1024px):**
- [ ] Cards em 2 colunas
- [ ] Filtros em grid 2x2

**Desktop (> 1024px):**
- [ ] Cards em 2 colunas
- [ ] Filtros em linha (4 colunas)
- [ ] Espaçamento adequado

---

### Cenário 12: Performance

**Teste A: Listagem rápida**
1. Login → `/history`
2. Abrir DevTools > Network
3. Recarregar página

**O que verificar:**
- [ ] Query retorna em < 500ms
- [ ] Payload pequeno (apenas campos resumidos)
- [ ] Sem queries N+1

**Teste B: Filtros instantâneos**
1. Login → `/history`
2. Alternar entre filtros rapidamente

**O que verificar:**
- [ ] Filtros aplicam sem delay perceptível
- [ ] Sem flickering
- [ ] Contador atualiza instantaneamente

---

## 🐛 Erros Comuns e Soluções

### Erro: "Nenhum teste encontrado" (mas você tem testes)
**Causa:** RLS bloqueando ou migration não executada
**Solução:**
1. Executar `supabase/ensure-history-fields.sql`
2. Verificar RLS policies no Supabase Dashboard
3. Verificar se `auth.uid()` está correto

### Erro: "Cannot read property 'id' of null"
**Causa:** Teste não encontrado ou sem permissão
**Solução:**
1. Verificar se ID na URL é válido
2. Verificar se teste pertence ao usuário logado
3. Verificar RLS policies

### PDF não baixa
**Causa:** Erro no pdfService ou dados incompletos
**Solução:**
1. Abrir console (F12)
2. Procurar por erros em `[PDF]` ou `[PDFService]`
3. Verificar se teste tem todos os campos necessários

### Filtros não funcionam
**Causa:** Índices não criados ou queries incorretas
**Solução:**
1. Executar migration SQL
2. Verificar console por erros
3. Verificar formato de datas

---

## ✅ Checklist Final

### Funcionalidade
- [ ] Listar todos os testes
- [ ] Filtrar por data (7 dias, 30 dias)
- [ ] Filtrar por perfil DISC
- [ ] Ver resultado antigo
- [ ] Baixar PDF antigo
- [ ] Histórico no perfil (3 mais recentes)
- [ ] Botão "Ver Histórico" no resultado

### Segurança
- [ ] RLS impede acesso a testes de outros
- [ ] Redirect para login se não autenticado
- [ ] Download de PDF valida ownership

### UI/UX
- [ ] Visual premium VX
- [ ] Responsivo (mobile, tablet, desktop)
- [ ] Estados vazios elegantes
- [ ] Loading states claros
- [ ] Cores consistentes

### Performance
- [ ] Listagem < 1s
- [ ] Filtros instantâneos
- [ ] PDF < 5s
- [ ] Sem queries N+1

---

## 📞 Suporte

### Logs Úteis (Console do Navegador)
```javascript
[Result] Loading test for user: USER_ID testId: TEST_ID
[PDF] Starting PDF generation...
[PDFService] Blob generated successfully: { size: XXXXX }
[downloadPDF] Download completed successfully
```

### Credenciais de Teste
```
Email: juliopppimentel@gmail.com
Senha: teste123
```

---

## ✅ Tudo Funcionando?

Se todos os cenários passaram, o sistema está **100% funcional**! 🎉

**Próximo passo:** Usar em produção e coletar feedback dos usuários.
