# 🚀 Guia Rápido - Sistema de Navegação VX DISC

## ✅ Sistema Iniciado com Sucesso!

O servidor está rodando em: **http://localhost:3000**

## 🗺️ Páginas Disponíveis

### 1. **Home** - http://localhost:3000
- Página inicial com apresentação do teste DISC
- Botões para "Fazer Teste" e "Configurar Perfil"
- Explicação dos 4 pilares DISC

### 2. **Fazer Teste** - http://localhost:3000/test
- 20 perguntas do teste DISC
- Barra de progresso visual
- Navegação entre perguntas
- Ao finalizar, redireciona para o resultado

### 3. **Configurar Perfil** - http://localhost:3000/profile
- Formulário para dados pessoais
- Campos: Nome, E-mail, Cargo, Empresa, Objetivo
- Salva no localStorage

### 4. **Resultado** - http://localhost:3000/result
- Mostra o perfil DISC predominante
- Gráficos dos 4 pilares
- Características do perfil
- Botões para refazer teste ou voltar

### 5. **Admin** - http://localhost:3000/admin
- Dashboard administrativo
- **Senha:** `admin123`
- Lista de clientes e estatísticas
- Dados mockados (demo)

## 🎯 Fluxo Recomendado de Teste

1. **Acesse a Home**
   - http://localhost:3000

2. **Configure seu Perfil** (opcional)
   - Clique em "Configurar Perfil"
   - Preencha seus dados
   - Clique em "Salvar Perfil"

3. **Faça o Teste**
   - Clique em "Fazer Teste"
   - Responda as 20 perguntas
   - Acompanhe o progresso na barra
   - Clique em "Finalizar Teste"

4. **Veja seu Resultado**
   - Será redirecionado automaticamente
   - Veja seu perfil predominante
   - Analise os gráficos

5. **Acesse o Admin** (opcional)
   - Clique em "Admin" na navbar
   - Digite a senha: `admin123`
   - Veja o dashboard com estatísticas

## 🎨 Recursos Visuais

### Navbar
- Sempre visível no topo
- Links para todas as páginas
- Link ativo destacado em laranja

### Identidade Visual
- Fundo escuro profissional
- Gradiente laranja/amarelo nos destaques
- Animações suaves
- Design responsivo

## 💾 Dados Salvos

O sistema salva dados no **localStorage**:

- `vx_disc_profile` - Dados do perfil
- `vx_disc_result` - Resultado do teste
- `vx_admin_auth` - Autorização admin

### Limpar Dados
Para recomeçar do zero, abra o Console do navegador (F12) e execute:
```javascript
localStorage.clear();
location.reload();
```

## 🔑 Senha do Admin

**Senha:** `admin123`

Para alterar a senha, edite o arquivo:
`app/admin/page.tsx` (linha 42)

## 📱 Responsividade

O sistema funciona em:
- ✅ Desktop
- ✅ Tablet
- ✅ Mobile

## 🎯 Teste Rápido (5 minutos)

1. Abra http://localhost:3000
2. Clique em "Fazer Teste"
3. Responda as 20 perguntas
4. Veja seu resultado
5. Acesse /admin (senha: admin123)

## 🛠️ Comandos Úteis

### Parar o Servidor
```bash
Ctrl + C
```

### Reiniciar o Servidor
```bash
npm run dev
```

### Build para Produção
```bash
npm run build
npm start
```

## 📊 Perfis DISC

### D - Dominância (Vermelho)
- Orientado para resultados
- Direto e assertivo
- Gosta de desafios

### I - Influência (Amarelo)
- Sociável e entusiasta
- Persuasivo
- Foco em relacionamentos

### S - Estabilidade (Verde)
- Paciente e leal
- Busca harmonia
- Consistente

### C - Conformidade (Azul)
- Analítico e preciso
- Focado em qualidade
- Sistemático

## 🚀 Próximos Passos

### Para Desenvolvimento
1. Integrar com banco de dados (Supabase)
2. Implementar autenticação real (NextAuth)
3. Adicionar exportação de PDF
4. Criar sistema de e-mail

### Para Produção
1. Deploy na Vercel
2. Configurar domínio
3. Adicionar analytics
4. Implementar backup de dados

## 📝 Notas Importantes

- ⚠️ Dados salvos apenas no navegador (localStorage)
- ⚠️ Admin usa senha simples (demo)
- ⚠️ Dados mockados no dashboard admin
- ✅ Preparado para integração com banco
- ✅ Código TypeScript completo
- ✅ Responsivo e profissional

## 🎉 Pronto para Usar!

O sistema está 100% funcional e pronto para testes!

Acesse: **http://localhost:3000**

---

**Desenvolvido para VX Consultoria** 🧡
