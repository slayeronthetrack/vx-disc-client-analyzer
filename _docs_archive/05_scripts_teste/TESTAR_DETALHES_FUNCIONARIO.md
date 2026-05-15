# 🧪 Como Testar a Página de Detalhes do Funcionário

## 🎯 Pré-requisitos:

1. ✅ Servidor rodando (`npm run dev`)
2. ✅ Pelo menos 1 empresa criada
3. ✅ Pelo menos 1 teste DISC submetido
4. ✅ Login como admin ou super_admin

---

## 📋 Passo a Passo:

### 1. **Submeter um Teste (se ainda não tiver):**

```
1. Acesse: http://localhost:3000/test/vxx
2. Preencha os dados:
   - Nome: João Silva
   - Email: joao@teste.com
   - Telefone: (11) 99999-9999
   - Cargo: Gerente de Vendas
3. Responda todas as 20 perguntas
4. Clique em "Finalizar Teste"
5. Aguarde a confirmação
```

### 2. **Acessar Lista de Funcionários:**

```
1. Login: http://localhost:3000/login
2. Use: teste@vx.com ou juliopppimentel@gmail.com
3. Vá para: /admin/companies
4. Clique em "Funcionários" no card da empresa VX
5. Veja a lista de testes submetidos
```

### 3. **Abrir Detalhes do Funcionário:**

```
1. Na lista de funcionários
2. Clique em "Ver Detalhes" em qualquer funcionário
3. Aguarde carregar
4. Veja a análise completa!
```

---

## ✅ O que Verificar:

### Header:
- [ ] Nome do funcionário aparece
- [ ] Badge do perfil DISC (D, I, S ou C)
- [ ] Nome da empresa
- [ ] Botão "Exportar Relatório"

### Cards de Contato:
- [ ] Email correto
- [ ] Telefone (se fornecido)
- [ ] Cargo correto
- [ ] Data do teste formatada

### Pontuação DISC:
- [ ] 4 cards grandes (D, I, S, C)
- [ ] Percentuais corretos
- [ ] Barras de progresso animadas
- [ ] Perfil dominante destacado com "DOMINANTE"
- [ ] Cores corretas (D=vermelho, I=amarelo, S=verde, C=azul)

### Análise de Perfil:
- [ ] Características principais listadas
- [ ] Pontos fortes listados
- [ ] Áreas de desenvolvimento listadas
- [ ] Funções ideais descritas

### Análise por IA:
- [ ] Card com gradiente aparece
- [ ] Texto da análise está legível
- [ ] Formatação preservada

### Navegação:
- [ ] Botão "Voltar" funciona
- [ ] Retorna para lista de funcionários
- [ ] Breadcrumb correto

---

## 🐛 Possíveis Problemas:

### Problema 1: "Test not found"
**Causa:** ID do teste inválido ou teste não existe  
**Solução:** Verifique se o teste foi realmente submetido

### Problema 2: Página em branco
**Causa:** Erro de carregamento  
**Solução:** Abra o console (F12) e veja o erro

### Problema 3: 401 Unauthorized
**Causa:** Não está logado ou sessão expirou  
**Solução:** Faça logout e login novamente

### Problema 4: Análise IA não aparece
**Causa:** Erro na geração da análise durante submissão  
**Solução:** Normal, o fallback text deve aparecer

---

## 🎨 Teste de Responsividade:

### Desktop (1920x1080):
- [ ] Layout em 2 colunas
- [ ] Cards lado a lado
- [ ] Espaçamento adequado

### Tablet (768x1024):
- [ ] Layout adaptado
- [ ] Cards empilhados
- [ ] Texto legível

### Mobile (375x667):
- [ ] Layout em coluna única
- [ ] Botões acessíveis
- [ ] Scroll suave

---

## 📸 Screenshots Esperados:

### Perfil D (Dominância):
- Badge vermelho
- Características: Direto, Decisivo, Competitivo
- Ideal para: Liderança, vendas

### Perfil I (Influência):
- Badge amarelo
- Características: Comunicativo, Entusiasta
- Ideal para: Marketing, vendas

### Perfil S (Estabilidade):
- Badge verde
- Características: Paciente, Leal
- Ideal para: Suporte, RH

### Perfil C (Conformidade):
- Badge azul
- Características: Analítico, Preciso
- Ideal para: Análise, contabilidade

---

## 🚀 Teste Completo:

### Cenário 1: Funcionário com Perfil D
```
1. Submeta teste respondendo mais opções "Firme e focado"
2. Veja detalhes
3. Verifique se badge é vermelho
4. Confirme características de Dominância
```

### Cenário 2: Funcionário com Telefone
```
1. Submeta teste COM telefone
2. Veja detalhes
3. Verifique se card de telefone aparece
```

### Cenário 3: Funcionário SEM Telefone
```
1. Submeta teste SEM telefone
2. Veja detalhes
3. Verifique se card de telefone NÃO aparece
```

### Cenário 4: Reteste (Tentativa 2+)
```
1. Submeta teste com mesmo email 2x
2. Veja detalhes do segundo teste
3. Verifique se mostra "Teste #2"
4. Verifique se mostra histórico
```

---

## ✅ Checklist Final:

- [ ] Página carrega em menos de 2 segundos
- [ ] Todos os dados estão corretos
- [ ] Cores e ícones apropriados
- [ ] Navegação funciona perfeitamente
- [ ] Responsivo em todos os tamanhos
- [ ] Sem erros no console
- [ ] Análise faz sentido para o perfil
- [ ] UX intuitiva e agradável

---

## 🎉 Sucesso!

Se todos os itens acima estão funcionando, a implementação está completa e pronta para uso!

**Próximo passo:** Commitar e fazer push para o GitHub! 🚀
