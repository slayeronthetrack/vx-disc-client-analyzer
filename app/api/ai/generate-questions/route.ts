/**
 * API: Generate Questions
 * Gera 20 perguntas DISC com IA (com fallback)
 */

import { NextResponse } from 'next/server';
import { questions as fallbackQuestions } from '@/data/questions';

export async function POST(request: Request) {
  try {
    const { userId } = await request.json();

    // TODO: Quando tiver OpenAI configurada, usar IA
    // Por enquanto, usar perguntas fallback
    const useAI = false; // Mudar para true quando configurar OpenAI

    if (useAI && process.env.OPENAI_API_KEY) {
      // Implementação com IA (futuro)
      // const response = await openai.chat.completions.create({...});
      // return NextResponse.json({ questions: aiQuestions });
    }

    // Fallback: usar perguntas fixas
    const formattedQuestions = fallbackQuestions.map((q) => ({
      id: q.id,
      question: q.text,
      options: q.options.map((opt) => ({
        text: opt.text,
        type: opt.discType,
      })),
    }));

    return NextResponse.json({
      questions: formattedQuestions,
      source: 'fallback',
    });
  } catch (error) {
    console.error('Error generating questions:', error);
    
    // Em caso de erro, sempre retornar fallback
    const formattedQuestions = fallbackQuestions.map((q) => ({
      id: q.id,
      question: q.text,
      options: q.options.map((opt) => ({
        text: opt.text,
        type: opt.discType,
      })),
    }));

    return NextResponse.json({
      questions: formattedQuestions,
      source: 'fallback',
    });
  }
}
