/**
 * Script para verificar se o teste tem dados de Valores e Tipos Psicológicos
 */

const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

async function verificarDadosTeste() {
  try {
    console.log('🔍 Verificando dados do teste...\n');

    // Buscar último teste do usuário
    const { data: tests, error } = await supabase
      .from('disc_tests')
      .select('*')
      .eq('user_id', 'SEU_USER_ID_AQUI') // Substituir com seu user_id
      .order('created_at', { ascending: false })
      .limit(1);

    if (error) {
      console.error('❌ Erro ao buscar teste:', error.message);
      return;
    }

    if (!tests || tests.length === 0) {
      console.log('❌ Nenhum teste encontrado');
      return;
    }

    const test = tests[0];

    console.log('✅ Teste encontrado!');
    console.log('📅 Data:', new Date(test.created_at).toLocaleString('pt-BR'));
    console.log('📊 Perguntas:', test.question_count || 'N/A');
    console.log('\n📋 Campos disponíveis:\n');

    // Verificar DISC
    console.log('🎯 DISC:');
    console.log('  - scores:', test.scores ? '✅' : '❌');
    console.log('  - dominant_profile:', test.dominant_profile ? '✅' : '❌');
    console.log('  - ai_analysis:', test.ai_analysis ? '✅' : '❌');

    // Verificar Valores
    console.log('\n💎 VALORES (Teoria dos Valores):');
    console.log('  - value_scores:', test.value_scores ? '✅' : '❌');
    console.log('  - dominant_values:', test.dominant_values ? '✅' : '❌');
    console.log('  - value_percentages:', test.value_percentages ? '✅' : '❌');

    if (test.value_scores) {
      console.log('  - Dados:', JSON.stringify(test.value_scores, null, 2));
    } else {
      console.log('  ⚠️  VALORES NÃO FORAM SALVOS!');
    }

    // Verificar Tipos Psicológicos
    console.log('\n🧠 TIPOS PSICOLÓGICOS:');
    console.log('  - psychological_scores:', test.psychological_scores ? '✅' : '❌');
    console.log('  - psychological_profile:', test.psychological_profile ? '✅' : '❌');

    if (test.psychological_profile) {
      console.log('  - Dados:', JSON.stringify(test.psychological_profile, null, 2));
    } else {
      console.log('  ⚠️  TIPOS PSICOLÓGICOS NÃO FORAM SALVOS!');
    }

    // Verificar análise integrada
    console.log('\n📝 ANÁLISE:');
    console.log('  - integrated_analysis:', test.integrated_analysis ? '✅' : '❌');

    console.log('\n' + '='.repeat(60));
    console.log('DIAGNÓSTICO:');
    console.log('='.repeat(60));

    if (!test.value_scores && !test.psychological_profile) {
      console.log('❌ PROBLEMA: Valores e Tipos Psicológicos NÃO foram salvos!');
      console.log('\nPossíveis causas:');
      console.log('1. Tabela disc_tests não tem essas colunas');
      console.log('2. Teste foi feito antes da implementação');
      console.log('3. Erro no salvamento');
      console.log('\nSOLUÇÃO: Refazer o teste para gerar dados completos');
    } else if (!test.value_scores) {
      console.log('⚠️  PARCIAL: Valores não foram salvos');
    } else if (!test.psychological_profile) {
      console.log('⚠️  PARCIAL: Tipos Psicológicos não foram salvos');
    } else {
      console.log('✅ COMPLETO: Todos os dados foram salvos!');
    }

  } catch (error) {
    console.error('❌ Erro:', error.message);
  }
}

verificarDadosTeste();
