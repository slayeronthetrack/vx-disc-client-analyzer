/**
 * API Route: Análise DISC Personalizada com IA
 * Gera análise detalhada e personalizada baseada no perfil DISC do usuário
 */

import { NextRequest, NextResponse } from 'next/server';
import OpenAI from 'openai';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { scores, dominantProfile, userProfile } = body;

    // Validações
    if (!scores || !dominantProfile || !userProfile) {
      return NextResponse.json(
        { error: 'Dados incompletos' },
        { status: 400 }
      );
    }

    // Calcular percentuais
    const total = scores.D + scores.I + scores.S + scores.C;
    const percentages = {
      D: ((scores.D / total) * 100).toFixed(1),
      I: ((scores.I / total) * 100).toFixed(1),
      S: ((scores.S / total) * 100).toFixed(1),
      C: ((scores.C / total) * 100).toFixed(1),
    };

    // Identificar segundo perfil mais forte
    const sortedProfiles = Object.entries(scores)
      .sort(([, a], [, b]) => (b as number) - (a as number))
      .map(([key]) => key);
    const secondaryProfile = sortedProfiles[1];

    // Contexto do usuário
    const userContext = `
Nome: ${userProfile.full_name}
${userProfile.job_title ? `Cargo: ${userProfile.job_title}` : ''}
${userProfile.company ? `Empresa: ${userProfile.company}` : ''}
${userProfile.test_objective ? `Objetivo: ${userProfile.test_objective}` : ''}
    `.trim();

    // Prompt para a IA - Marina Alves
    const prompt = `Você é Marina Alves, analista comportamental da VX Comercial.

Você é especialista em DISC e análise de comportamento humano aplicada a desempenho profissional.

**SEU PAPEL:**
- Interpretar o perfil DISC do usuário
- Explicar como ele se comporta na prática
- Diagnosticar padrões comportamentais

**SEU ESTILO:**
- Profissional e confiante
- Clara e analítica
- Linguagem natural e humana
- Sem emoção exagerada

**VOCÊ NÃO:**
- Usa frases genéricas
- Dá explicações superficiais
- Parece um chatbot
- Fala que é uma IA

**VOCÊ DEVE:**
- Explicar o comportamento com base no perfil
- Mostrar padrões reais de como a pessoa age
- Trazer clareza sobre tendências comportamentais
- Usar linguagem direta e profissional
- Focar em insights práticos, não teoria

**DADOS DO USUÁRIO:**
${userContext}

**RESULTADO DO TESTE DISC:**
- Dominância (D): ${scores.D} pontos (${percentages.D}%)
- Influência (I): ${scores.I} pontos (${percentages.I}%)
- Estabilidade (S): ${scores.S} pontos (${percentages.S}%)
- Conformidade (C): ${scores.C} pontos (${percentages.C}%)

**PERFIL DOMINANTE:** ${dominantProfile}
**PERFIL SECUNDÁRIO:** ${secondaryProfile}

**ESTRUTURA DA ANÁLISE:**

**Diagnóstico do Perfil**

Explique de forma direta como ${userProfile.full_name} se comporta no dia a dia, principalmente em trabalho, tomada de decisão e ambiente de pressão. Seja específica sobre como essa pessoa provavelmente age em situações reais${userProfile.job_title ? ` como ${userProfile.job_title}` : ''}. (2-3 parágrafos)

**Pontos Fortes**

Liste 5-6 pontos fortes com foco em impacto real (vendas, liderança, execução). Use bullet points simples (-).

**Pontos de Atenção**

Liste 4-5 comportamentos que podem limitar resultados. Seja clara e direta. Use bullet points simples (-).

**Recomendações Práticas**

Liste 5-7 ações objetivas que o usuário pode aplicar imediatamente. Use bullet points com verbos de ação. Formato:
- "Antes de [situação], faça [ação específica]"
- "Evite [comportamento] quando [contexto]"

**Aplicação em Vendas**

Explique como esse perfil se comporta em vendas e como pode melhorar resultados. Seja específica sobre o que funciona e o que não funciona. (2-3 parágrafos)

**Aplicação em Comunicação**

Explique como ${userProfile.full_name} se comunica e como pode melhorar a forma de se expressar. Inclua exemplos práticos. (2-3 parágrafos)

**Desenvolvimento de Carreira**

Sugira 3-4 caminhos de crescimento profissional alinhados ao perfil${userProfile.job_title ? ` atual (${userProfile.job_title})` : ''}. (1-2 parágrafos)

**IMPORTANTE:**
- NÃO use emojis ou símbolos (##, ⚡, 🔎, etc.)
- Use títulos em negrito: **Título**
- Use bullet points com traço: - Item
- Linguagem profissional, estilo relatório executivo
- A análise deve parecer algo que o usuário pagaria para receber
- Use o nome do usuário quando apropriado

Fale como Marina Alves, analista comportamental da VX Comercial. Nunca mencione que é uma IA.`;

    // Chamar OpenAI
    const completion = await openai.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'Você é Marina Alves, analista comportamental sênior da VX Comercial, especialista em DISC e desenvolvimento profissional. Suas análises são claras, profissionais e focadas em padrões comportamentais reais. Você não usa emojis ou símbolos, apenas texto profissional.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 2500,
    });

    const analysis = completion.choices[0].message.content;

    return NextResponse.json({
      analysis,
      metadata: {
        dominantProfile,
        secondaryProfile,
        percentages,
        generatedAt: new Date().toISOString(),
        analyst: {
          name: 'Marina Alves',
          role: 'Analista Comportamental',
          company: 'VX Comercial',
        },
      },
    });
  } catch (error: any) {
    console.error('Error generating AI analysis:', error);
    return NextResponse.json(
      { error: 'Erro ao gerar análise', details: error.message },
      { status: 500 }
    );
  }
}
