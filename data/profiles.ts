import type { ProfileDescription, DiscType } from '@/types';

export const profileDescriptions: Record<DiscType, ProfileDescription> = {
  D: {
    name: 'Dominância',
    strengths: [
      'Orientado para resultados e metas',
      'Toma decisões rápidas e assertivas',
      'Enfrenta desafios com confiança',
      'Líder natural e direto',
      'Foco em eficiência e produtividade',
    ],
    attentionPoints: [
      'Pode ser percebido como agressivo ou impaciente',
      'Tende a ignorar detalhes em favor da velocidade',
      'Pode ter dificuldade em ouvir opiniões contrárias',
      'Precisa desenvolver mais empatia e paciência',
    ],
    communication: [
      'Seja direto e objetivo',
      'Foque em resultados e benefícios práticos',
      'Evite rodeios e detalhes desnecessários',
      'Apresente soluções, não apenas problemas',
      'Respeite seu tempo e seja eficiente',
    ],
    salesStrategy: [
      'Destaque resultados mensuráveis e ROI',
      'Mostre como sua solução economiza tempo',
      'Seja confiante e assertivo na apresentação',
      'Ofereça opções de decisão rápida',
      'Enfatize controle e poder de decisão',
    ],
  },
  I: {
    name: 'Influência',
    strengths: [
      'Excelente comunicador e persuasivo',
      'Entusiasta e motivador natural',
      'Cria conexões facilmente com pessoas',
      'Criativo e inovador',
      'Otimista e energético',
    ],
    attentionPoints: [
      'Pode ser desorganizado ou perder foco',
      'Tende a evitar conflitos e detalhes',
      'Pode prometer mais do que consegue entregar',
      'Precisa desenvolver mais disciplina e follow-through',
    ],
    communication: [
      'Seja amigável e entusiasta',
      'Use histórias e exemplos pessoais',
      'Permita tempo para socialização',
      'Reconheça suas ideias e contribuições',
      'Mantenha o tom positivo e inspirador',
    ],
    salesStrategy: [
      'Construa relacionamento antes de vender',
      'Use depoimentos e casos de sucesso',
      'Destaque reconhecimento e status social',
      'Crie experiências envolventes e interativas',
      'Mostre como a solução impressiona outros',
    ],
  },
  S: {
    name: 'Estabilidade',
    strengths: [
      'Confiável e consistente',
      'Excelente ouvinte e apoiador',
      'Paciente e calmo sob pressão',
      'Leal e comprometido',
      'Trabalha bem em equipe',
    ],
    attentionPoints: [
      'Pode resistir a mudanças',
      'Tende a evitar confrontos necessários',
      'Pode ter dificuldade em dizer não',
      'Precisa desenvolver mais assertividade',
    ],
    communication: [
      'Seja gentil e respeitoso',
      'Dê tempo para processar informações',
      'Explique mudanças com antecedência',
      'Mostre apreciação e reconhecimento',
      'Crie ambiente seguro e sem pressão',
    ],
    salesStrategy: [
      'Construa confiança ao longo do tempo',
      'Destaque segurança e confiabilidade',
      'Mostre suporte contínuo e garantias',
      'Evite pressão ou urgência excessiva',
      'Apresente processo passo a passo',
    ],
  },
  C: {
    name: 'Conformidade',
    strengths: [
      'Analítico e orientado por dados',
      'Atenção excepcional aos detalhes',
      'Alto padrão de qualidade',
      'Sistemático e organizado',
      'Pensamento crítico e lógico',
    ],
    attentionPoints: [
      'Pode ser perfeccionista em excesso',
      'Tende a ser crítico demais',
      'Pode ter dificuldade com ambiguidade',
      'Precisa desenvolver mais flexibilidade',
    ],
    communication: [
      'Seja preciso e baseado em fatos',
      'Forneça dados e documentação',
      'Respeite a necessidade de análise',
      'Evite exageros ou generalizações',
      'Dê tempo para pesquisa e validação',
    ],
    salesStrategy: [
      'Apresente dados detalhados e evidências',
      'Destaque qualidade e precisão',
      'Forneça documentação completa',
      'Mostre processos e metodologias',
      'Permita tempo para análise e comparação',
    ],
  },
};
