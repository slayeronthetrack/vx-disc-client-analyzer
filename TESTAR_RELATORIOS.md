# 🧪 Como Testar o Sistema de Relatórios

## 🎯 Pré-requisitos:

1. ✅ Dependências instaladas (`npm install` já executado)
2. ✅ Servidor rodando (`npm run dev`)
3. ✅ Pelo menos 1 empresa com testes submetidos
4. ✅ Login como admin

---

## 📋 Teste 1: Relatório Individual (PDF)

### Passo a Passo:
```
1. Login: http://localhost:3000/login
2. Vá para: /admin/companies
3. Clique em "Funcionários" na empresa
4. Clique em "Ver Detalhes" em qualquer funcionário
5. Clique no botão "Exportar Relatório" (laranja)
6. PDF será baixado automaticamente
```

### O que Verificar:
- [ ] PDF abre sem erros
- [ ] Header laranja com nome da empresa
- [ ] Nome do funcionário correto
- [ ] Badge do perfil (D, I, S ou C) com cor certa
- [ ] Tabela com 4 perfis e percentuais
- [ ] Descrição do perfil dominante
- [ ] Análise por IA (se houver)
- [ ] Footer com "Página X de Y"
- [ ] Nome do arquivo: `relatorio-disc-nome-funcionario.pdf`

---

## 📋 Teste 2: Exportar Lista CSV

### Passo a Passo:
```
1. Acesse: /admin/companies/[id]/employees
2. (Opcional) Aplique filtros:
   - Busque por nome
   - Filtre por perfil DISC
3. Clique em "Exportar CSV" (botão verde)
4. CSV será baixado automaticamente
5. Abra no Excel ou Google Sheets
```

### O que Verificar:
- [ ] CSV é baixado
- [ ] Abre corretamente no Excel
- [ ] Acentos estão corretos (João, não JoÃ£o)
- [ ] 12 colunas presentes
- [ ] Dados correspondem à lista filtrada
- [ ] Percentuais DISC corretos
- [ ] Nome do arquivo: `funcionarios-slug-2026-05-11.csv`

### Colunas Esperadas:
1. Nome
2. Email
3. Telefone
4. Cargo
5. Departamento
6. Perfil Dominante
7. D (%)
8. I (%)
9. S (%)
10. C (%)
11. Data do Teste
12. Tentativa

---

## 📋 Teste 3: Relatório Consolidado (PDF)

### Passo a Passo:
```
1. Acesse: /admin/companies/[id]/employees
2. Clique em "Relatório Consolidado" (botão roxo)
3. Aguarde alguns segundos (busca estatísticas)
4. PDF será baixado automaticamente
```

### O que Verificar:
- [ ] PDF multi-página gerado
- [ ] Header com nome da empresa
- [ ] Tabela de estatísticas gerais:
  - Total de testes
  - Perfil predominante
  - Médias D, I, S, C
- [ ] Tabela de distribuição de perfis:
  - Quantidade por perfil
  - Percentual calculado
- [ ] Lista de funcionários (até 15)
- [ ] Footer em todas as páginas
- [ ] Nome do arquivo: `relatorio-consolidado-slug-2026-05-11.pdf`

---

## 🐛 Possíveis Problemas e Soluções:

### Problema 1: "Cannot find module 'jspdf'"
**Causa:** Dependências não instaladas  
**Solução:**
```bash
npm install jspdf jspdf-autotable papaparse --legacy-peer-deps
```

### Problema 2: PDF não baixa
**Causa:** Popup blocker do navegador  
**Solução:** Permitir downloads automáticos do localhost

### Problema 3: CSV com caracteres estranhos
**Causa:** Encoding incorreto  
**Solução:** Já corrigido com BOM UTF-8, recarregue a página

### Problema 4: Botão desabilitado
**Causa:** Não há dados para exportar  
**Solução:** Submeta pelo menos 1 teste primeiro

### Problema 5: Erro ao gerar relatório consolidado
**Causa:** API de stats não retornou dados  
**Solução:** Verifique se a empresa tem testes submetidos

---

## 📸 Screenshots Esperados:

### Relatório Individual (PDF):
```
┌─────────────────────────────────────┐
│  [HEADER LARANJA]                   │
│  Relatório DISC                     │
│  Nome da Empresa                    │
├─────────────────────────────────────┤
│  João Silva              [Badge D]  │
│  Email: joao@teste.com              │
│  Cargo: Gerente                     │
├─────────────────────────────────────┤
│  Pontuação DISC                     │
│  ┌─────────────────────────────┐   │
│  │ Perfil │ Pontuação │ %      │   │
│  │ D      │ 45        │ 35%    │   │
│  │ I      │ 30        │ 23%    │   │
│  │ S      │ 28        │ 22%    │   │
│  │ C      │ 25        │ 20%    │   │
│  └─────────────────────────────┘   │
├─────────────────────────────────────┤
│  Perfil D - Dominância              │
│  Descrição detalhada...             │
└─────────────────────────────────────┘
```

### Lista CSV (Excel):
```
Nome       | Email          | Perfil | D%  | I%  | S%  | C%
-----------|----------------|--------|-----|-----|-----|-----
João Silva | joao@teste.com | D      | 35% | 23% | 22% | 20%
Maria Lima | maria@test.com | I      | 20% | 40% | 25% | 15%
```

### Relatório Consolidado (PDF):
```
┌─────────────────────────────────────┐
│  [HEADER LARANJA]                   │
│  Relatório Consolidado              │
│  Nome da Empresa                    │
├─────────────────────────────────────┤
│  Estatísticas Gerais                │
│  Total de Testes: 25                │
│  Perfil Predominante: D             │
│  Média D: 28.5%                     │
├─────────────────────────────────────┤
│  Distribuição de Perfis             │
│  D: 10 (40%)                        │
│  I: 8 (32%)                         │
│  S: 5 (20%)                         │
│  C: 2 (8%)                          │
└─────────────────────────────────────┘
```

---

## ✅ Checklist Completo:

### Funcionalidades:
- [ ] Botão "Exportar Relatório" funciona
- [ ] Botão "Exportar CSV" funciona
- [ ] Botão "Relatório Consolidado" funciona
- [ ] Botões desabilitam quando não há dados
- [ ] Downloads automáticos funcionam
- [ ] Nomes de arquivo corretos

### Qualidade dos Relatórios:
- [ ] PDFs abrem sem erros
- [ ] Formatação profissional
- [ ] Cores corretas por perfil
- [ ] Tabelas bem formatadas
- [ ] Textos legíveis
- [ ] Sem erros de português

### Dados:
- [ ] Informações corretas
- [ ] Cálculos precisos
- [ ] Percentuais somam 100%
- [ ] Datas formatadas (DD/MM/AAAA)
- [ ] Acentos preservados

---

## 🎉 Sucesso!

Se todos os testes passaram, o sistema de relatórios está funcionando perfeitamente!

**Próximo passo:** Commitar e fazer push para o GitHub! 🚀

```bash
git add .
git commit -m "feat: add complete reporting system with PDF and CSV export"
git push origin master
```
