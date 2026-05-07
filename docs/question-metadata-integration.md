# Question Metadata Integration

Documentação para futura integração de metadata de perguntas com Marina e Lucas.

## Visão Geral

Quando as perguntas vierem do **Question Bank Inteligente**, cada teste terá metadata rica sobre as perguntas usadas. Essa metadata pode ser usada por Marina (Analista Comportamental) e Lucas (Consultor Comercial) para gerar análises e conselhos ainda mais contextualizados.

## Metadata Disponível

Cada teste terá a seguinte metadata:

```typescript
interface QuestionMetadata {
  question_ids: string[];           // IDs das perguntas usadas
  context_tags: string[];           // Tags gerais de contexto
  profession_tags: ProfessionTag[]; // Profissões focadas
  seniority_tags: SeniorityTag[];   // Níveis de senioridade
  objective_tags: ObjectiveTag[];   // Objetivos do teste
  industry_tags: IndustryTag[];     // Indústrias abordadas
}
```

### Profession Tags
- `sales` - Vendas
- `engineering` - Engenharia
- `management` - Gestão/Liderança
- `operations` - Operações
- `creative` - Criativo/Marketing
- `support` - Suporte/Atendimento
- `finance` - Financeiro
- `hr` - Recursos Humanos

### Seniority Tags
- `junior` - Júnior/Trainee
- `mid` - Pleno/Especialista
- `senior` - Sênior/Lead
- `executive` - Executivo/C-Level

### Objective Tags
- `hiring` - Recrutamento/Seleção
- `self-knowledge` - Autoconhecimento
- `team-building` - Formação de Equipes
- `development` - Desenvolvimento Profissional

### Industry Tags
- `technology` - Tecnologia/Software
- `finance` - Financeiro/Bancário
- `healthcare` - Saúde
- `retail` - Varejo/E-commerce
- `services` - Serviços/Consultoria
- `manufacturing` - Manufatura/Industrial
- `education` - Educação

## Como Usar na Marina (Analista Comportamental)

### Exemplo 1: Análise Contextualizada por Profissão

```typescript
// Se profession_tags inclui 'sales'
"Seu perfil D alto é uma vantagem competitiva em vendas. 
As perguntas do teste focaram em cenários comerciais, e ficou 
claro que você tem a assertividade necessária para fechar negócios. 
No entanto, em vendas consultivas B2B, você precisará desenvolver 
mais paciência para construir relacionamento antes de apresentar 
soluções."
```

### Exemplo 2: Análise Contextualizada por Senioridade

```typescript
// Se seniority_tags inclui 'executive'
"Como executivo com perfil C alto, sua atenção a detalhes e 
análise criteriosa são essenciais para decisões estratégicas. 
As perguntas abordaram cenários de liderança sênior, e seu 
perfil indica que você toma decisões baseadas em dados sólidos. 
Porém, em nível C-Level, você também precisará desenvolver 
agilidade decisória, pois nem sempre terá todas as informações."
```

### Exemplo 3: Análise Contextualizada por Objetivo

```typescript
// Se objective_tags inclui 'hiring'
"Para processos de recrutamento, seu perfil S alto é ideal para 
avaliar fit cultural e estabilidade de candidatos. As perguntas 
focaram em cenários de seleção, e ficou evidente que você valoriza 
consistência e confiabilidade. Use isso para identificar candidatos 
que trarão estabilidade para a equipe."
```

## Como Usar no Lucas (Consultor Comercial)

### Exemplo 1: Conselho Contextualizado por Profissão

```typescript
// Se profession_tags inclui 'engineering' e user pergunta sobre vendas
"Vi que você é da área de engenharia. Seu perfil C alto + valor 
teórico é comum em tech. O desafio em vendas técnicas é que você 
provavelmente está dando informação demais muito cedo. Clientes 
não precisam entender toda a arquitetura. Teste começar com o 
problema deles, não com sua solução."
```

### Exemplo 2: Conselho Contextualizado por Indústria

```typescript
// Se industry_tags inclui 'technology' e user pergunta sobre negociação
"No mercado de tech, seu perfil I alto + valor econômico é uma 
combinação poderosa. Você consegue criar rapport rápido e focar 
em ROI. Mas em vendas SaaS enterprise, você precisa de follow-up 
estruturado. Ciclos de venda são longos. Crie um checklist de 
3 pontos para cada reunião: próximo passo, registro no CRM, 
material prometido."
```

### Exemplo 3: Conselho Contextualizado por Objetivo

```typescript
// Se objective_tags inclui 'team-building' e user pergunta sobre liderança
"Vi que você está focando em formação de equipe. Seu perfil D alto 
+ organização estruturada é ótimo para definir metas e processos. 
Mas para construir equipe de alta performance, você precisa equilibrar 
resultados com desenvolvimento de pessoas. Reserve 30min semanais 
para 1-on-1s focados em crescimento, não só em status de tarefas."
```

## Implementação Técnica

### 1. Atualizar calculateIntegratedProfile

```typescript
// utils/calculateIntegratedProfile.ts

export function calculateIntegratedProfile(
  answers: ExtendedAnswer[],
  questionMetadata?: QuestionMetadata // Novo parâmetro opcional
): IntegratedProfileResult {
  // ... cálculos existentes ...

  return {
    disc: { ... },
    values: { ... },
    psychological: { ... },
    metadata: {
      hasValues: values !== null,
      hasPsychological: psychological !== null,
      questionCount: answers.length,
      calculatedAt: new Date(),
      questionMetadata, // Incluir metadata
    },
  };
}
```

### 2. Passar Metadata para Marina

```typescript
// lib/agents/MarinaBehaviorAnalystAgent.ts

protected async executeAgent(
  input: MarinaInput,
  context: VXAgentContext
): Promise<MarinaOutput> {
  let userMessage = `...`;

  // Adicionar metadata se disponível
  if (context.questionMetadata) {
    userMessage += `

Metadata das Perguntas:
- Profissões focadas: ${context.questionMetadata.profession_tags.join(', ')}
- Senioridade: ${context.questionMetadata.seniority_tags.join(', ')}
- Objetivos: ${context.questionMetadata.objective_tags.join(', ')}
- Indústrias: ${context.questionMetadata.industry_tags.join(', ')}

Use essa metadata para contextualizar sua análise. Por exemplo:
- Se focou em vendas, enfatize aspectos comerciais
- Se focou em liderança sênior, aborde desafios executivos
- Se focou em tech, use exemplos de tecnologia`;
  }

  // ... resto do código ...
}
```

### 3. Passar Metadata para Lucas

```typescript
// lib/agents/LucasCommercialConsultantAgent.ts

protected async executeAgent(
  input: LucasInput,
  context: VXAgentContext
): Promise<LucasOutput> {
  let contextMessage = `...`;

  // Adicionar metadata se disponível
  if (context.questionMetadata) {
    contextMessage += `

Metadata das Perguntas do Teste:
- Profissões: ${context.questionMetadata.profession_tags.join(', ')}
- Senioridade: ${context.questionMetadata.seniority_tags.join(', ')}
- Objetivos: ${context.questionMetadata.objective_tags.join(', ')}
- Indústrias: ${context.questionMetadata.industry_tags.join(', ')}

Use essa metadata para personalizar seus conselhos. Adapte exemplos 
e recomendações ao contexto profissional do usuário.`;
  }

  // ... resto do código ...
}
```

### 4. Coletar Metadata no Endpoint

```typescript
// app/api/ai/generate-questions/route.ts

// Após selecionar perguntas do banco
const questionMetadata: QuestionMetadata = {
  question_ids: searchResult.questions.map(q => q.id),
  context_tags: Array.from(new Set(
    searchResult.questions.flatMap(q => q.context_tags)
  )),
  profession_tags: Array.from(new Set(
    searchResult.questions.flatMap(q => q.profession_tags)
  )),
  seniority_tags: Array.from(new Set(
    searchResult.questions.flatMap(q => q.seniority_tags)
  )),
  objective_tags: Array.from(new Set(
    searchResult.questions.flatMap(q => q.objective_tags)
  )),
  industry_tags: Array.from(new Set(
    searchResult.questions.flatMap(q => q.industry_tags)
  )),
};

// Incluir na resposta
return NextResponse.json({
  questions: formattedQuestions,
  questionMetadata, // Novo campo
  source: 'bank',
  metadata: { ... },
});
```

### 5. Salvar Metadata no Resultado do Teste

```typescript
// Ao salvar resultado do teste no Supabase
const testResult = {
  user_id: userId,
  disc_scores: { ... },
  value_scores: { ... },
  psychological_scores: { ... },
  question_metadata: questionMetadata, // Novo campo JSONB
  created_at: new Date(),
};

await supabase.from('test_results').insert(testResult);
```

## Benefícios da Integração

### Para Marina (Analista Comportamental)
1. **Análises mais precisas**: Sabe exatamente qual contexto foi avaliado
2. **Exemplos relevantes**: Usa exemplos da profissão/indústria do usuário
3. **Recomendações específicas**: Sugere ações aplicáveis ao contexto real
4. **Validação de insights**: Confirma padrões observados com o contexto das perguntas

### Para Lucas (Consultor Comercial)
1. **Conselhos contextualizados**: Adapta orientações ao setor/profissão
2. **Exemplos práticos**: Usa casos reais da indústria do usuário
3. **Identificação de gaps**: Detecta áreas não cobertas pelas perguntas
4. **Follow-up inteligente**: Faz perguntas mais relevantes baseadas no contexto

## Cronograma de Implementação

### Fase 1: Preparação (Atual)
- ✅ Adicionar comentários TODO nos arquivos
- ✅ Documentar estrutura de metadata
- ✅ Definir interfaces TypeScript

### Fase 2: Coleta de Metadata
- [ ] Atualizar endpoint de geração de perguntas
- [ ] Coletar metadata das perguntas selecionadas
- [ ] Incluir metadata na resposta da API

### Fase 3: Persistência
- [ ] Adicionar campo question_metadata em test_results
- [ ] Salvar metadata ao salvar resultado do teste
- [ ] Criar migration para adicionar campo

### Fase 4: Integração com Marina
- [ ] Atualizar MarinaBehaviorAnalystAgent
- [ ] Passar metadata no contexto
- [ ] Ajustar system prompt para usar metadata
- [ ] Testar análises contextualizadas

### Fase 5: Integração com Lucas
- [ ] Atualizar LucasCommercialConsultantAgent
- [ ] Passar metadata no contexto
- [ ] Ajustar system prompt para usar metadata
- [ ] Testar conselhos contextualizados

### Fase 6: Validação
- [ ] Testar com diferentes combinações de metadata
- [ ] Validar qualidade das análises
- [ ] Ajustar prompts baseado em feedback
- [ ] Documentar melhores práticas

## Exemplos de Uso Real

### Cenário 1: Vendedor B2B Tech
```
Metadata: profession=sales, industry=technology, objective=development
Perfil: D alto, valor econômico, racional

Marina: "Seu perfil D + econômico é ideal para vendas tech B2B. 
As perguntas focaram em cenários de desenvolvimento comercial, e 
ficou claro que você é orientado a resultados e toma decisões 
baseadas em ROI. Em tech, isso é uma vantagem competitiva."

Lucas: "Vi que você está em vendas tech. Com seu perfil D alto, 
você provavelmente está fechando rápido demais. Em SaaS enterprise, 
ciclos são longos. Teste fazer 3 reuniões de discovery antes de 
apresentar solução. Foque em entender arquitetura atual deles."
```

### Cenário 2: Líder de Engenharia
```
Metadata: profession=engineering, seniority=senior, objective=team-building
Perfil: C alto, valor teórico, introvertido

Marina: "Como líder técnico sênior com perfil C + teórico, você 
traz excelência técnica e foco em qualidade. As perguntas abordaram 
formação de equipe, e seu perfil indica que você lidera pelo exemplo 
técnico. Para construir equipe de alta performance, você precisará 
equilibrar excelência técnica com desenvolvimento de pessoas."

Lucas: "Você é líder de engenharia. Seu perfil C alto + introvertido 
é comum em tech leads. O desafio é que você provavelmente está 
fazendo code review detalhado demais. Equipe precisa de autonomia. 
Teste definir guidelines claras e fazer reviews focados em arquitetura, 
não em cada linha de código."
```

## Conclusão

A integração de metadata de perguntas com Marina e Lucas permitirá análises e conselhos significativamente mais personalizados e relevantes. A implementação será gradual, começando pela coleta de metadata e evoluindo para uso completo nos agents.
