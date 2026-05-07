/**
 * Cron Job: Update Question Scores
 * Executa diariamente para atualizar quality scores baseado em métricas
 * 
 * Configurar em vercel.json:
 * {
 *   "crons": [{
 *     "path": "/api/cron/update-scores",
 *     "schedule": "0 2 * * *"
 *   }]
 * }
 */

import { NextResponse } from 'next/server';
import { updateQuestionScores } from '@/lib/scripts/updateQuestionScores';

export async function GET(request: Request) {
  try {
    // Verificar token de autorização (Vercel Cron envia automaticamente)
    const authHeader = request.headers.get('authorization');
    
    // Em produção, Vercel adiciona automaticamente o header
    // Em desenvolvimento, pode usar CRON_SECRET do .env
    if (process.env.NODE_ENV === 'production') {
      // Vercel Cron Jobs são autenticados automaticamente
      // Não precisa verificar token
    } else if (process.env.CRON_SECRET) {
      if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
        return NextResponse.json(
          { error: 'Unauthorized' },
          { status: 401 }
        );
      }
    }

    console.log('[Cron] Starting question score update...');
    
    await updateQuestionScores();
    
    console.log('[Cron] Question score update completed successfully');
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Question score update failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}

// Permitir execução manual via POST (para testes)
export async function POST(request: Request) {
  try {
    // Verificar token de autorização
    const authHeader = request.headers.get('authorization');
    
    if (!process.env.CRON_SECRET || authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log('[Cron] Manual execution started...');
    
    await updateQuestionScores();
    
    console.log('[Cron] Manual execution completed successfully');
    
    return NextResponse.json({
      success: true,
      manual: true,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('[Cron] Manual execution failed:', error);
    
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
