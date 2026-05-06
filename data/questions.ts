import type { Question } from '@/types';

export const questions: Question[] = [
  {
    id: 1,
    text: 'Quando enfrento um desafio, eu prefiro:',
    options: [
      { 
        text: 'Agir rapidamente e tomar decisões firmes', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Conversar com outras pessoas e buscar apoio', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', perception: 'intuitive', decision: 'emotional' }
      },
      { 
        text: 'Analisar calmamente antes de agir', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { energy: 'introvert', perception: 'sensory', organization: 'flexible' }
      },
      { 
        text: 'Pesquisar dados e informações detalhadas', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { energy: 'introvert', perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 2,
    text: 'Em um ambiente de trabalho, eu me destaco por:',
    options: [
      { 
        text: 'Liderar projetos e alcançar resultados', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Motivar e inspirar a equipe', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', perception: 'intuitive', decision: 'emotional' }
      },
      { 
        text: 'Manter a harmonia e apoiar os colegas', 
        discType: 'S',
        valueType: 'social',
        psychTraits: { energy: 'introvert', decision: 'emotional', organization: 'flexible' }
      },
      { 
        text: 'Garantir precisão e qualidade', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { energy: 'introvert', perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 3,
    text: 'Quando tomo decisões, eu considero principalmente:',
    options: [
      { 
        text: 'Resultados e eficiência', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Impacto nas pessoas e relacionamentos', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { decision: 'emotional', perception: 'intuitive' }
      },
      { 
        text: 'Estabilidade e segurança', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Dados e análise lógica', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 4,
    text: 'Meu estilo de comunicação é:',
    options: [
      { 
        text: 'Direto e objetivo', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { energy: 'extrovert', decision: 'rational' }
      },
      { 
        text: 'Entusiasta e expressivo', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { energy: 'extrovert', perception: 'intuitive' }
      },
      { 
        text: 'Calmo e paciente', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { energy: 'introvert', organization: 'flexible' }
      },
      { 
        text: 'Preciso e detalhado', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { energy: 'introvert', perception: 'sensory' }
      },
    ],
  },
  {
    id: 5,
    text: 'Sob pressão, eu tendo a:',
    options: [
      { 
        text: 'Assumir o controle e agir', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Buscar soluções criativas com outros', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { energy: 'extrovert', perception: 'intuitive', organization: 'flexible' }
      },
      { 
        text: 'Manter a calma e seguir o plano', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { energy: 'introvert', organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Analisar cuidadosamente as opções', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { energy: 'introvert', decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 6,
    text: 'Meu maior medo no trabalho é:',
    options: [
      { 
        text: 'Perder o controle ou ser ineficaz', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Ser rejeitado ou ignorado', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Mudanças repentinas ou conflitos', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Cometer erros ou ser criticado', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 7,
    text: 'Quando trabalho em equipe, eu prefiro:',
    options: [
      { 
        text: 'Liderar e definir a direção', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Colaborar e compartilhar ideias', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', perception: 'intuitive', decision: 'emotional' }
      },
      { 
        text: 'Apoiar e facilitar o trabalho dos outros', 
        discType: 'S',
        valueType: 'social',
        psychTraits: { energy: 'introvert', decision: 'emotional', organization: 'flexible' }
      },
      { 
        text: 'Garantir que tudo seja feito corretamente', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { energy: 'introvert', decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 8,
    text: 'Minha abordagem para resolver problemas é:',
    options: [
      { 
        text: 'Rápida e decisiva', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Criativa e colaborativa', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { perception: 'intuitive', energy: 'extrovert' }
      },
      { 
        text: 'Metódica e consistente', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Analítica e baseada em fatos', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 9,
    text: 'O que mais me motiva é:',
    options: [
      { 
        text: 'Alcançar metas e vencer desafios', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Reconhecimento e interação social', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Estabilidade e ambiente harmonioso', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', decision: 'emotional' }
      },
      { 
        text: 'Precisão e fazer as coisas certas', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 10,
    text: 'Meu ritmo de trabalho é:',
    options: [
      { 
        text: 'Rápido e focado em resultados', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { energy: 'extrovert', organization: 'structured' }
      },
      { 
        text: 'Variado e energético', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { energy: 'extrovert', organization: 'flexible' }
      },
      { 
        text: 'Constante e previsível', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Cuidadoso e meticuloso', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 11,
    text: 'Quando recebo feedback, eu prefiro que seja:',
    options: [
      { 
        text: 'Direto e focado em resultados', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { decision: 'rational', energy: 'extrovert' }
      },
      { 
        text: 'Positivo e encorajador', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { decision: 'emotional', energy: 'extrovert' }
      },
      { 
        text: 'Gentil e respeitoso', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { decision: 'emotional', energy: 'introvert' }
      },
      { 
        text: 'Detalhado e baseado em fatos', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 12,
    text: 'Minha maior força é:',
    options: [
      { 
        text: 'Determinação e foco em objetivos', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Entusiasmo e habilidade social', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Paciência e lealdade', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { energy: 'introvert', decision: 'emotional' }
      },
      { 
        text: 'Precisão e atenção aos detalhes', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 13,
    text: 'Em situações de conflito, eu:',
    options: [
      { 
        text: 'Enfrento diretamente e busco resolver', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational' }
      },
      { 
        text: 'Tento mediar e encontrar um meio-termo', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { decision: 'emotional', perception: 'intuitive' }
      },
      { 
        text: 'Evito confrontos e busco harmonia', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { energy: 'introvert', decision: 'emotional' }
      },
      { 
        text: 'Analiso os fatos antes de agir', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 14,
    text: 'Meu ambiente de trabalho ideal é:',
    options: [
      { 
        text: 'Desafiador e competitivo', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', organization: 'structured' }
      },
      { 
        text: 'Colaborativo e dinâmico', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', organization: 'flexible' }
      },
      { 
        text: 'Estável e harmonioso', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', energy: 'introvert' }
      },
      { 
        text: 'Organizado e estruturado', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
    ],
  },
  {
    id: 15,
    text: 'Quando inicio um novo projeto, eu:',
    options: [
      { 
        text: 'Defino metas claras e começo imediatamente', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Busco ideias criativas e envolvo outras pessoas', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { perception: 'intuitive', energy: 'extrovert' }
      },
      { 
        text: 'Planejo cuidadosamente cada etapa', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Pesquiso e analiso todas as informações disponíveis', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 16,
    text: 'Minha atitude em relação a mudanças é:',
    options: [
      { 
        text: 'Abraço mudanças como oportunidades', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { organization: 'flexible', perception: 'intuitive' }
      },
      { 
        text: 'Fico animado com novas possibilidades', 
        discType: 'I',
        valueType: 'aesthetic',
        psychTraits: { energy: 'extrovert', organization: 'flexible' }
      },
      { 
        text: 'Prefiro estabilidade, mas me adapto quando necessário', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Avalio cuidadosamente antes de aceitar', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 17,
    text: 'Como líder, eu sou:',
    options: [
      { 
        text: 'Assertivo e orientado para resultados', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { energy: 'extrovert', decision: 'rational' }
      },
      { 
        text: 'Inspirador e motivador', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Apoiador e facilitador', 
        discType: 'S',
        valueType: 'social',
        psychTraits: { decision: 'emotional', energy: 'introvert' }
      },
      { 
        text: 'Sistemático e focado em qualidade', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
    ],
  },
  {
    id: 18,
    text: 'Minha abordagem para aprender algo novo é:',
    options: [
      { 
        text: 'Experimentar e aprender fazendo', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { perception: 'sensory', organization: 'flexible' }
      },
      { 
        text: 'Discutir e compartilhar com outros', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', perception: 'intuitive' }
      },
      { 
        text: 'Seguir um método passo a passo', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { organization: 'structured', perception: 'sensory' }
      },
      { 
        text: 'Estudar profundamente a teoria', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { perception: 'sensory', decision: 'rational' }
      },
    ],
  },
  {
    id: 19,
    text: 'O que me frustra mais é:',
    options: [
      { 
        text: 'Ineficiência e falta de progresso', 
        discType: 'D',
        valueType: 'economic',
        psychTraits: { decision: 'rational', organization: 'structured' }
      },
      { 
        text: 'Falta de reconhecimento ou isolamento', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Conflitos e mudanças abruptas', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { decision: 'emotional', organization: 'structured' }
      },
      { 
        text: 'Erros e falta de precisão', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
  {
    id: 20,
    text: 'Meu estilo de negociação é:',
    options: [
      { 
        text: 'Firme e focado em ganhar', 
        discType: 'D',
        valueType: 'political',
        psychTraits: { decision: 'rational', energy: 'extrovert' }
      },
      { 
        text: 'Persuasivo e amigável', 
        discType: 'I',
        valueType: 'social',
        psychTraits: { energy: 'extrovert', decision: 'emotional' }
      },
      { 
        text: 'Cooperativo e busco consenso', 
        discType: 'S',
        valueType: 'spiritual',
        psychTraits: { decision: 'emotional', organization: 'flexible' }
      },
      { 
        text: 'Lógico e baseado em dados', 
        discType: 'C',
        valueType: 'theoretical',
        psychTraits: { decision: 'rational', perception: 'sensory' }
      },
    ],
  },
];
