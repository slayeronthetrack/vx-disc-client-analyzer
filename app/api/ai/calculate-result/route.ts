/**
 * API: Calculate Result
 * Calcula resultado DISC e gera análise com IA (com fallback)
 */

import { NextResponse } from 'next/server';
import { discTestService } from '@/lib/services/discTestService';
import type { DISCType } from '@/types/database';

const profileDescriptions = {
  D: {
    name: 'Dominância',
    description: 'Você é orientado para resultados, direto e gosta de desafios. Tende a ser assertivo e focado em alcançar objetivos.',
    strengths: [
      'Decisivo e orientado para resultados',
      'Gosta de desafios e competição',
      'Comunicação direta e objetiva',
      'Assume riscos calculados',
      'Foco em eficiência e produtividade',
    ],
    attention: [
      'Pode ser percebido como impaciente',
      'Tendência a ser muito direto',
      'Pode ignorar detalhes importantes',
    ],
    communication: 'Prefere comunicação direta, objetiva e focada em resultados. Valoriza eficiência e não gosta de rodeios.',
    suggestions: [
      'Pratique a paciência com processos mais lentos',
      'Desenvolva habilidades de escuta ativa',
      'Considere o impacto emocional de suas decisões',
      'Delegue mais e confie na equipe',
    ],
  },
  I: {
    name: 'Influência',
    description: 'Você é entusiasta, sociável e gosta de interagir com pessoas. Tende a ser otimista e persuasivo.',
    strengths: [
      'Comunicativo e expressivo',
      'Entusiasta e otimista',
      'Gosta de trabalhar em equipe',
      'Persuasivo e inspirador',
      'Foco em relacionamentos',
    ],
    attention: [
      'Pode ser desorganizado',
      'Tendência a prometer demais',
      'Pode evitar conflitos necessários',
    ],
    communication: 'Prefere comunicação calorosa, entusiasta e pessoal. Valoriza relacionamentos e conexões emocionais.',
    suggestions: [
      'Desenvolva habilidades de organização',
      'Pratique o foco em tarefas específicas',
      'Aprenda a lidar com conflitos de forma construtiva',
      'Estabeleça limites claros',
    ],
  },
  S: {
    name: 'Estabilidade',
    description: 'Você é paciente, leal e busca harmonia. Tende a ser consistente e confiável.',
    strengths: [
      'Paciente e calmo',
      'Leal e confiável',
      'Busca harmonia e estabilidade',
      'Bom ouvinte',
      'Trabalha bem em equipe',
    ],
    attention: [
      'Pode resistir a mudanças',
      'Tendência a evitar confrontos',
      'Pode ter dificuldade em dizer não',
    ],
    communication: 'Prefere comunicação calma, respeitosa e harmoniosa. Valoriza estabilidade e previsibilidade.',
    suggestions: [
      'Pratique a adaptabilidade a mudanças',
      'Desenvolva assertividade',
      'Aprenda a expressar desacordos de forma saudável',
      'Saia da zona de conforto gradualmente',
    ],
  },
  C: {
    name: 'Conformidade',
    description: 'Você é analítico, preciso e focado em qualidade. Tende a ser sistemático e detalhista.',
    strengths: [
      'Analítico e preciso',
      'Focado em qualidade',
      'Sistemático e organizado',
      'Atenção aos detalhes',
      'Baseado em fatos e dados',
    ],
    attention: [
      'Pode ser perfeccionista demais',
      'Tendência a análise excessiva',
      'Pode ter dificuldade com ambiguidade',
    ],
    communication: 'Prefere comunicação precisa, detalhada e baseada em fatos. Valoriza qualidade e exatidão.',
    suggestions: [
      'Pratique a tomada de decisões com informações incompletas',
      'Desenvolva flexibilidade',
      'Aprenda a aceitar "bom o suficiente"',
      'Trabalhe habilidades interpessoais',
    ],
  },
};

export async function POST(request: Request) {
  try {
    const { userId, questions, answers } = await request.json();

    // Validações
    if (!userId || !answers || !Array.isArray(answers)) {
      return NextResponse.json(
        { error: 'Dados inválidos' },
        { status: 400 }
      );
    }

    // Calcular pontuação
    const scores = discTestService.calculateScores(answers);
    const percentages = discTestService.calculatePercentages(scores);
    const dominantProfile = discTestService.getDominantProfile(scores);

    // Gerar análise
    const profileInfo = profileDescriptions[dominantProfile];
    
    const analysis = `
# Seu Perfil DISC: ${profileInfo.name}

${profileInfo.description}

## Pontos Fortes
${profileInfo.strengths.map(s => `• ${s}`).join('\n')}

## Pontos de Atenção
${profileInfo.attention.map(a => `• ${a}`).join('\n')}

## Estilo de Comunicação
${profileInfo.communication}

## Sugestões de Desenvolvimento
${profileInfo.suggestions.map(s => `• ${s}`).join('\n')}

## Seus Percentuais
• Dominância (D): ${percentages.D}%
• Influência (I): ${percentages.I}%
• Estabilidade (S): ${percentages.S}%
• Conformidade (C): ${percentages.C}%

## Conclusão
Seu perfil predominante é ${profileInfo.name}, o que significa que você tende a demonstrar características como ${profileInfo.strengths[0].toLowerCase()} e ${profileInfo.strengths[1].toLowerCase()}. Continue desenvolvendo seus pontos fortes enquanto trabalha nas áreas de atenção para um crescimento equilibrado.
    `.trim();

    // Salvar no banco de dados
    await discTestService.saveTest({
      user_id: userId,
      questions,
      answers,
      result: {
        scores,
        percentages,
        dominantProfile,
        analysis,
      },
      ai_analysis: analysis,
      dominant_profile: dominantProfile,
      scores,
    });

    return NextResponse.json({
      success: true,
      result: {
        scores,
        percentages,
        dominantProfile,
        analysis,
      },
    });
  } catch (error) {
    console.error('Error calculating result:', error);
    return NextResponse.json(
      { error: 'Erro ao calcular resultado' },
      { status: 500 }
    );
  }
}
