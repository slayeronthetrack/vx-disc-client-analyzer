/**
 * Gerador de 1000 Perguntas DISC
 * Cria perguntas variadas para popular o banco
 */

const fs = require('fs');

// Templates de perguntas por categoria
const templates = {
  trabalho: [
    'Em situações de {situacao}, você prefere:',
    'Quando precisa {acao}, você tende a:',
    'Ao lidar com {contexto}, sua abordagem é:',
    'Durante {momento}, você costuma:',
    'Frente a {desafio}, você geralmente:',
  ],
  comunicacao: [
    'Ao se comunicar com {pessoa}, você:',
    'Em reuniões sobre {assunto}, você prefere:',
    'Quando precisa expressar {sentimento}, você:',
    'Ao receber {feedback}, sua reação é:',
    'Durante conversas sobre {tema}, você tende a:',
  ],
  decisao: [
    'Ao tomar decisões sobre {area}, você:',
    'Quando enfrenta {dilema}, você prefere:',
    'Diante de {escolha}, sua tendência é:',
    'Ao avaliar {opcao}, você considera:',
    'Para resolver {problema}, você costuma:',
  ],
  relacionamento: [
    'No relacionamento com {grupo}, você:',
    'Ao trabalhar com {tipo_pessoa}, você prefere:',
    'Em conflitos com {parte}, sua abordagem é:',
    'Ao colaborar em {projeto}, você tende a:',
    'Com {stakeholder}, você costuma:',
  ],
};

// Variáveis para preencher os templates
const variaveis = {
  situacao: ['pressão', 'mudança', 'crise', 'incerteza', 'urgência', 'conflito', 'desafio', 'oportunidade'],
  acao: ['liderar', 'decidir', 'planejar', 'executar', 'negociar', 'apresentar', 'resolver', 'inovar'],
  contexto: ['prazos apertados', 'recursos limitados', 'alta complexidade', 'múltiplas prioridades', 'ambiguidade'],
  momento: ['reuniões importantes', 'apresentações', 'negociações', 'crises', 'mudanças organizacionais'],
  desafio: ['problemas complexos', 'conflitos de equipe', 'metas ambiciosas', 'resistência à mudança'],
  pessoa: ['superiores', 'colegas', 'subordinados', 'clientes', 'parceiros', 'stakeholders'],
  assunto: ['estratégia', 'resultados', 'processos', 'pessoas', 'inovação', 'qualidade'],
  sentimento: ['discordância', 'preocupação', 'entusiasmo', 'frustração', 'satisfação'],
  feedback: ['críticas', 'elogios', 'sugestões', 'cobranças', 'reconhecimento'],
  tema: ['mudanças', 'problemas', 'oportunidades', 'riscos', 'inovações'],
  area: ['estratégia', 'pessoas', 'processos', 'investimentos', 'prioridades'],
  dilema: ['dilemas éticos', 'trade-offs', 'riscos calculados', 'escolhas difíceis'],
  escolha: ['múltiplas opções', 'informações incompletas', 'pressão de tempo', 'alto impacto'],
  opcao: ['alternativas', 'propostas', 'soluções', 'estratégias', 'abordagens'],
  problema: ['problemas técnicos', 'conflitos interpessoais', 'desafios estratégicos', 'questões operacionais'],
  grupo: ['equipe', 'liderança', 'clientes', 'fornecedores', 'parceiros'],
  tipo_pessoa: ['pessoas analíticas', 'pessoas criativas', 'pessoas práticas', 'pessoas relacionais'],
  parte: ['colegas', 'superiores', 'clientes', 'parceiros', 'fornecedores'],
  projeto: ['projetos complexos', 'iniciativas estratégicas', 'mudanças organizacionais', 'inovações'],
  stakeholder: ['executivos', 'clientes', 'equipe', 'parceiros', 'investidores'],
};

// Opções de resposta por tipo DISC
const opcoes = {
  D: [
    'Tomar decisões rápidas e assumir o controle',
    'Focar em resultados e agir com determinação',
    'Ser direto e objetivo na comunicação',
    'Assumir riscos calculados para alcançar metas',
    'Liderar com autoridade e confiança',
    'Priorizar eficiência e produtividade',
    'Desafiar o status quo e buscar melhorias',
    'Tomar a iniciativa e resolver problemas rapidamente',
  ],
  I: [
    'Buscar consenso e envolver todos',
    'Comunicar com entusiasmo e otimismo',
    'Criar um ambiente colaborativo e positivo',
    'Inspirar e motivar as pessoas',
    'Valorizar relacionamentos e networking',
    'Expressar ideias de forma criativa',
    'Celebrar conquistas e reconhecer esforços',
    'Promover inovação através da colaboração',
  ],
  S: [
    'Manter a estabilidade e harmonia',
    'Ouvir atentamente e apoiar os outros',
    'Trabalhar de forma consistente e confiável',
    'Evitar conflitos e buscar cooperação',
    'Ser paciente e compreensivo',
    'Seguir processos estabelecidos',
    'Construir relacionamentos de longo prazo',
    'Garantir que todos se sintam incluídos',
  ],
  C: [
    'Analisar dados e informações detalhadamente',
    'Seguir procedimentos e padrões de qualidade',
    'Buscar precisão e excelência',
    'Planejar cuidadosamente antes de agir',
    'Questionar e validar informações',
    'Documentar processos e decisões',
    'Minimizar riscos através de análise',
    'Garantir conformidade e qualidade',
  ],
};

// Valores e traits psicológicos
const valores = ['poder', 'social', 'conhecimento', 'estetica', 'tradicao', 'seguranca'];
const traits = {
  energy: ['extrovert', 'introvert'],
  perception: ['sensory', 'intuitive'],
  decision: ['rational', 'emotional'],
  organization: ['structured', 'flexible'],
};

// Função para gerar uma pergunta
function gerarPergunta(id) {
  // Escolher categoria aleatória
  const categorias = Object.keys(templates);
  const categoria = categorias[Math.floor(Math.random() * categorias.length)];
  
  // Escolher template aleatório
  const templateList = templates[categoria];
  let template = templateList[Math.floor(Math.random() * templateList.length)];
  
  // Substituir variáveis no template
  const regex = /{(\w+)}/g;
  template = template.replace(regex, (match, key) => {
    const options = variaveis[key];
    if (options) {
      return options[Math.floor(Math.random() * options.length)];
    }
    return match;
  });
  
  // Gerar 4 opções (uma de cada tipo DISC)
  const tipos = ['D', 'I', 'S', 'C'];
  const opcoesUsadas = new Set();
  const perguntaOpcoes = [];
  
  tipos.forEach(tipo => {
    const opcoesDisponiveis = opcoes[tipo].filter(o => !opcoesUsadas.has(o));
    const opcao = opcoesDisponiveis[Math.floor(Math.random() * opcoesDisponiveis.length)];
    opcoesUsadas.add(opcao);
    
    // Escolher valor e traits aleatórios
    const valor = valores[Math.floor(Math.random() * valores.length)];
    const trait = {
      energy: traits.energy[Math.floor(Math.random() * 2)],
      perception: traits.perception[Math.floor(Math.random() * 2)],
      decision: traits.decision[Math.floor(Math.random() * 2)],
      organization: traits.organization[Math.floor(Math.random() * 2)],
    };
    
    perguntaOpcoes.push({
      text: opcao,
      type: tipo,
      valueType: valor,
      psychTraits: trait,
    });
  });
  
  // Embaralhar opções
  perguntaOpcoes.sort(() => Math.random() - 0.5);
  
  return {
    id: id,
    text: template,
    options: perguntaOpcoes,
  };
}

// Gerar 1000 perguntas
console.log('🎯 Gerando 1000 perguntas DISC...\n');

const perguntas = [];
for (let i = 1; i <= 1000; i++) {
  perguntas.push(gerarPergunta(i));
  if (i % 100 === 0) {
    console.log(`✅ ${i} perguntas geradas...`);
  }
}

console.log('\n✅ 1000 perguntas geradas com sucesso!\n');

// Gerar SQL para inserir no banco
console.log('📝 Gerando SQL...\n');

let sql = `-- Inserir 1000 perguntas DISC no banco
-- Gerado automaticamente em ${new Date().toISOString()}

`;

perguntas.forEach((pergunta, index) => {
  const optionsJson = JSON.stringify(pergunta.options).replace(/'/g, "''");
  const questionText = pergunta.text.replace(/'/g, "''");
  
  // Determinar tipo DISC dominante (primeiro tipo das opções)
  const discType = pergunta.options[0].type;
  
  // Extrair value_types únicos
  const valueTypes = [...new Set(pergunta.options.map(o => o.valueType))];
  
  // Extrair psychological_traits
  const psychTraits = {
    energy: [...new Set(pergunta.options.map(o => o.psychTraits.energy))],
    perception: [...new Set(pergunta.options.map(o => o.psychTraits.perception))],
    decision: [...new Set(pergunta.options.map(o => o.psychTraits.decision))],
    organization: [...new Set(pergunta.options.map(o => o.psychTraits.organization))],
  };
  
  sql += `INSERT INTO question_bank (
  question_text,
  options,
  disc_type,
  value_types,
  psychological_traits,
  context_tags,
  profession_tags,
  seniority_tags,
  objective_tags,
  industry_tags,
  difficulty_level,
  quality_score,
  clarity_score,
  discrimination_power,
  usage_count,
  completion_rate,
  user_feedback_score,
  status,
  source,
  created_by
) VALUES (
  '${questionText}',
  '${optionsJson}'::jsonb,
  '${discType}',
  ARRAY['${valueTypes.join("','")}']::text[],
  '${JSON.stringify(psychTraits)}'::jsonb,
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  ARRAY[]::text[],
  'medium',
  75.0,
  75.0,
  0.5,
  0,
  100.0,
  3.0,
  'active',
  'static',
  NULL
);\n\n`;
});

sql += `-- Total: ${perguntas.length} perguntas inseridas\n`;

// Salvar SQL em arquivo
const sqlFilename = 'supabase/seed/1000_questions_seed.sql';
fs.writeFileSync(sqlFilename, sql);
console.log(`✅ SQL salvo em: ${sqlFilename}\n`);

// Salvar JSON para referência
const jsonFilename = 'supabase/seed/1000_questions.json';
fs.writeFileSync(jsonFilename, JSON.stringify(perguntas, null, 2));
console.log(`✅ JSON salvo em: ${jsonFilename}\n`);

// Estatísticas
console.log('📊 ESTATÍSTICAS:');
console.log(`   Total de perguntas: ${perguntas.length}`);
console.log(`   Categorias: ${Object.keys(templates).length}`);
console.log(`   Templates: ${Object.values(templates).flat().length}`);
console.log(`   Variáveis: ${Object.keys(variaveis).length}`);
console.log(`   Opções por tipo: ${Object.keys(opcoes).map(k => `${k}=${opcoes[k].length}`).join(', ')}`);
console.log('\n🎉 Pronto! Execute o SQL no Supabase para popular o banco.\n');
