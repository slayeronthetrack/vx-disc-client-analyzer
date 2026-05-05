import type { ProfileDescription, DiscType } from '@/types/disc';

export const profileDescriptions: Record<DiscType, ProfileDescription> = {
  D: {
    name: 'Dominância',
    description: 'Você é orientado para resultados, direto e focado em alcançar objetivos. Toma decisões rápidas e gosta de estar no controle.',
    strengths: [
      'Orientado para resultados e metas',
      'Toma decisões rápidas e assertivas',
      'Enfrenta desafios com confiança',
      'Líder natural e direto',
      'Foco em eficiência e produtividade',
    ],
    communicationStyle: [
      'Seja direto e objetivo',
      'Foque em resultados e benefícios práticos',
      'Evite rodeios e detalhes desnecessários',
      'Apresente soluções, não apenas problemas',
      'Respeite seu tempo e seja eficiente',
    ],
    salesApproach: [
      'Destaque resultados mensuráveis e ROI',
      'Mostre como sua solução economiza tempo',
      'Seja confiante e assertivo na apresentação',
      'Ofereça opções de decisão rápida',
      'Enfatize controle e poder de decisão',
    ],
  },
  I: {
    name: 'Influência',
    description: 'Você é comunicativo, entusiasta e gosta de interagir com pessoas. É motivado por reconhecimento e conexões sociais.',
    strengths: [
      'Excelente comunicador e persuasivo',
      'Entusiasta e motivador natural',
      'Cria conexões facilmente com pessoas',
      'Criativo e inovador',
      'Otimista e energético',
    ],
    communicationStyle: [
      'Seja amigável e entusiasta',
      'Use histórias e exemplos pessoais',
      'Permita tempo para socialização',
      'Reconheça suas ideias e contribuições',
      'Mantenha o tom positivo e inspirador',
    ],
    salesApproach: [
      'Construa relacionamento antes de vender',
      'Use depoimentos e casos de sucesso',
      'Destaque reconhecimento e status social',
      'Crie experiências envolventes e interativas',
      'Mostre como a solução impressiona outros',
    ],
  },
  S: {
    name: 'Estabilidade',
    description: 'Você é confiável, paciente e valoriza harmonia. Prefere ambientes estáveis e trabalha bem em equipe.',
    strengths: [
      'Confiável e consistente',
      'Excelente ouvinte e apoiador',
      'Paciente e calmo sob pressão',
      'Leal e comprometido',
      'Trabalha bem em equipe',
    ],
    communicationStyle: [
      'Seja gentil e respeitoso',
      'Dê tempo para processar informações',
      'Explique mudanças com antecedência',
      'Mostre apreciação e reconhecimento',
      'Crie ambiente seguro e sem pressão',
    ],
    salesApproach: [
      'Construa confiança ao longo do tempo',
      'Destaque segurança e confiabilidade',
      'Mostre suporte contínuo e garantias',
      'Evite pressão ou urgência excessiva',
      'Apresente processo passo a passo',
    ],
  },
  C: {
    name: 'Conformidade',
    description: 'Você é analítico, preciso e orientado por dados. Valoriza qualidade e atenção aos detalhes.',
    strengths: [
      'Analítico e orientado por dados',
      'Atenção excepcional aos detalhes',
      'Alto padrão de qualidade',
      'Sistemático e organizado',
      'Pensamento crítico e lógico',
    ],
    communicationStyle: [
      'Seja preciso e baseado em fatos',
      'Forneça dados e documentação',
      'Respeite a necessidade de análise',
      'Evite exageros ou generalizações',
      'Dê tempo para pesquisa e validação',
    ],
    salesApproach: [
      'Apresente dados detalhados e evidências',
      'Destaque qualidade e precisão',
      'Forneça documentação completa',
      'Mostre processos e metodologias',
      'Permita tempo para análise e comparação',
    ],
  },
};
