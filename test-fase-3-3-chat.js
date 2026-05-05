/**
 * TESTES AUTOMATIZADOS - FASE 3.3
 * Chat IA Melhorado com Contexto DISC
 * 
 * Validações:
 * ✅ Envio e recebimento de mensagens
 * ✅ Persistência do histórico no banco
 * ✅ Uso correto do contexto do perfil DISC
 * ✅ Funcionamento do fallback da IA
 * ✅ Performance básica do endpoint
 * ✅ Carregamento de histórico
 * ✅ Geração de sugestões personalizadas
 */

const TEST_USER_ID = 'cfce857c-7d22-4450-abe6-fc234a13c75a';
const API_BASE = 'http://localhost:3001';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let testResults = {
  total: 0,
  passed: 0,
  failed: 0,
  details: [],
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function assert(condition, testName, details = '') {
  testResults.total++;
  if (condition) {
    testResults.passed++;
    testResults.details.push({ test: testName, status: 'PASS', details });
    log(`✅ ${testName}`, 'green');
    if (details) log(`   ${details}`, 'cyan');
  } else {
    testResults.failed++;
    testResults.details.push({ test: testName, status: 'FAIL', details });
    log(`❌ ${testName}`, 'red');
    if (details) log(`   ${details}`, 'yellow');
  }
}

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

// ============================================
// TESTE 1: Envio de Mensagem
// ============================================
async function testSendMessage() {
  log('\n📤 TESTE 1: Envio de Mensagem', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Olá, como você pode me ajudar?',
        userId: TEST_USER_ID,
      }),
    });

    const data = await response.json();

    assert(
      response.status === 200,
      'Status 200 retornado',
      `Status: ${response.status}`
    );

    assert(
      data.response && typeof data.response === 'string',
      'Resposta da IA recebida',
      `Resposta: "${data.response.substring(0, 50)}..."`
    );

    assert(
      data.response.length > 20,
      'Resposta tem conteúdo significativo',
      `Tamanho: ${data.response.length} caracteres`
    );

    assert(
      Array.isArray(data.suggestions),
      'Sugestões retornadas',
      `${data.suggestions?.length || 0} sugestões`
    );

    return data;
  } catch (error) {
    assert(false, 'Envio de mensagem', `Erro: ${error.message}`);
    return null;
  }
}

// ============================================
// TESTE 2: Contexto DISC
// ============================================
async function testDISCContext() {
  log('\n🎯 TESTE 2: Contexto DISC', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Qual é o meu perfil DISC?',
        userId: TEST_USER_ID,
      }),
    });

    const data = await response.json();

    assert(
      data.discContext !== undefined,
      'Contexto DISC retornado',
      data.discContext ? `Perfil: ${data.discContext.dominant_profile}` : 'Sem perfil'
    );

    if (data.discContext) {
      assert(
        ['D', 'I', 'S', 'C'].includes(data.discContext.dominant_profile),
        'Perfil dominante válido',
        `Perfil: ${data.discContext.dominant_profile}`
      );

      assert(
        data.discContext.scores &&
        typeof data.discContext.scores.D === 'number' &&
        typeof data.discContext.scores.I === 'number' &&
        typeof data.discContext.scores.S === 'number' &&
        typeof data.discContext.scores.C === 'number',
        'Scores DISC completos',
        `D:${data.discContext.scores.D} I:${data.discContext.scores.I} S:${data.discContext.scores.S} C:${data.discContext.scores.C}`
      );

      assert(
        data.response.includes(data.discContext.dominant_profile) ||
        data.response.toLowerCase().includes('perfil'),
        'Resposta menciona o perfil DISC',
        'Contexto usado na resposta'
      );
    }

    return data.discContext;
  } catch (error) {
    assert(false, 'Contexto DISC', `Erro: ${error.message}`);
    return null;
  }
}

// ============================================
// TESTE 3: Sugestões Personalizadas
// ============================================
async function testPersonalizedSuggestions(discContext) {
  log('\n💡 TESTE 3: Sugestões Personalizadas', 'blue');
  
  try {
    const response = await fetch(`${API_BASE}/api/ai/chat?userId=${TEST_USER_ID}`);
    const data = await response.json();

    assert(
      Array.isArray(data.suggestions),
      'Sugestões são um array',
      `${data.suggestions.length} sugestões`
    );

    assert(
      data.suggestions.length >= 3,
      'Pelo menos 3 sugestões retornadas',
      `${data.suggestions.length} sugestões`
    );

    assert(
      data.suggestions.every(s => typeof s === 'string' && s.length > 10),
      'Todas as sugestões são strings válidas',
      'Sugestões têm conteúdo'
    );

    if (discContext) {
      // Verificar se sugestões são específicas do perfil
      const profileKeywords = {
        D: ['eficiente', 'resultado', 'decisão', 'meta', 'liderar'],
        I: ['networking', 'inspirar', 'motivar', 'relacionamento', 'comunicação'],
        S: ['mudança', 'harmonia', 'conforto', 'estabilidade', 'paciência'],
        C: ['analítico', 'qualidade', 'detalhes', 'precisão', 'flexível'],
      };

      const keywords = profileKeywords[discContext.dominant_profile] || [];
      const hasProfileKeyword = data.suggestions.some(s =>
        keywords.some(k => s.toLowerCase().includes(k))
      );

      assert(
        hasProfileKeyword,
        'Sugestões personalizadas para o perfil',
        `Perfil ${discContext.dominant_profile} detectado nas sugestões`
      );
    }

    return data.suggestions;
  } catch (error) {
    assert(false, 'Sugestões personalizadas', `Erro: ${error.message}`);
    return [];
  }
}

// ============================================
// TESTE 4: Histórico de Mensagens
// ============================================
async function testMessageHistory() {
  log('\n📜 TESTE 4: Histórico de Mensagens', 'blue');
  
  try {
    // Enviar algumas mensagens
    await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Mensagem de teste 1',
        userId: TEST_USER_ID,
      }),
    });

    await sleep(500);

    await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Mensagem de teste 2',
        userId: TEST_USER_ID,
      }),
    });

    await sleep(500);

    // Buscar histórico
    const response = await fetch(`${API_BASE}/api/ai/chat?userId=${TEST_USER_ID}`);
    const data = await response.json();

    assert(
      Array.isArray(data.history),
      'Histórico é um array',
      `${data.history.length} mensagens`
    );

    assert(
      data.history.length >= 4,
      'Histórico contém mensagens enviadas',
      `${data.history.length} mensagens no histórico`
    );

    const hasUserMessages = data.history.some(m => m.role === 'user');
    const hasAssistantMessages = data.history.some(m => m.role === 'assistant');

    assert(
      hasUserMessages,
      'Histórico contém mensagens do usuário',
      'Mensagens do usuário encontradas'
    );

    assert(
      hasAssistantMessages,
      'Histórico contém mensagens do assistente',
      'Mensagens do assistente encontradas'
    );

    // Verificar estrutura das mensagens
    const firstMessage = data.history[0];
    assert(
      firstMessage.role && firstMessage.content && firstMessage.user_id,
      'Mensagens têm estrutura correta',
      `Campos: role, content, user_id`
    );

    return data.history;
  } catch (error) {
    assert(false, 'Histórico de mensagens', `Erro: ${error.message}`);
    return [];
  }
}

// ============================================
// TESTE 5: Fallback da IA
// ============================================
async function testAIFallback() {
  log('\n🔄 TESTE 5: Fallback da IA', 'blue');
  
  try {
    // Testar diferentes tipos de perguntas
    const testQuestions = [
      { q: 'O que é DISC?', keyword: 'disc' },
      { q: 'Como melhorar minha comunicação?', keyword: 'comunicação' },
      { q: 'Quais são meus pontos fortes?', keyword: 'pontos fortes' },
      { q: 'Como posso me desenvolver?', keyword: 'desenvolv' },
    ];

    let allPassed = true;

    for (const test of testQuestions) {
      const response = await fetch(`${API_BASE}/api/ai/chat`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message: test.q,
          userId: TEST_USER_ID,
        }),
      });

      const data = await response.json();

      const hasRelevantResponse = 
        data.response.toLowerCase().includes(test.keyword) ||
        data.response.length > 50;

      if (!hasRelevantResponse) {
        allPassed = false;
      }

      await sleep(300);
    }

    assert(
      allPassed,
      'Fallback responde a diferentes tipos de perguntas',
      'Todas as perguntas receberam respostas relevantes'
    );

    // Testar pergunta genérica
    const genericResponse = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'xyz123 teste aleatório',
        userId: TEST_USER_ID,
      }),
    });

    const genericData = await genericResponse.json();

    assert(
      genericData.response && genericData.response.length > 20,
      'Fallback responde a perguntas genéricas',
      'Resposta padrão gerada'
    );

    return true;
  } catch (error) {
    assert(false, 'Fallback da IA', `Erro: ${error.message}`);
    return false;
  }
}

// ============================================
// TESTE 6: Performance do Endpoint
// ============================================
async function testEndpointPerformance() {
  log('\n⚡ TESTE 6: Performance do Endpoint', 'blue');
  
  try {
    const startTime = Date.now();

    const response = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Teste de performance',
        userId: TEST_USER_ID,
      }),
    });

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    await response.json();

    assert(
      responseTime < 5000,
      'Resposta em menos de 5 segundos',
      `Tempo: ${responseTime}ms`
    );

    assert(
      responseTime < 3000,
      'Resposta em menos de 3 segundos (ideal)',
      `Tempo: ${responseTime}ms`
    );

    // Testar múltiplas requisições
    const promises = [];
    const multiStartTime = Date.now();

    for (let i = 0; i < 3; i++) {
      promises.push(
        fetch(`${API_BASE}/api/ai/chat`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message: `Teste concorrente ${i}`,
            userId: TEST_USER_ID,
          }),
        })
      );
    }

    await Promise.all(promises);
    const multiEndTime = Date.now();
    const multiResponseTime = multiEndTime - multiStartTime;

    assert(
      multiResponseTime < 10000,
      'Múltiplas requisições em menos de 10 segundos',
      `Tempo: ${multiResponseTime}ms para 3 requisições`
    );

    return { responseTime, multiResponseTime };
  } catch (error) {
    assert(false, 'Performance do endpoint', `Erro: ${error.message}`);
    return null;
  }
}

// ============================================
// TESTE 7: Validação de Erros
// ============================================
async function testErrorHandling() {
  log('\n🛡️ TESTE 7: Validação de Erros', 'blue');
  
  try {
    // Teste 1: Sem mensagem
    const noMessageResponse = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        userId: TEST_USER_ID,
      }),
    });

    assert(
      noMessageResponse.status === 400,
      'Retorna erro 400 sem mensagem',
      `Status: ${noMessageResponse.status}`
    );

    // Teste 2: Sem userId
    const noUserIdResponse = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Teste',
      }),
    });

    assert(
      noUserIdResponse.status === 400,
      'Retorna erro 400 sem userId',
      `Status: ${noUserIdResponse.status}`
    );

    // Teste 3: GET sem userId
    const getNoUserIdResponse = await fetch(`${API_BASE}/api/ai/chat`);

    assert(
      getNoUserIdResponse.status === 400,
      'GET retorna erro 400 sem userId',
      `Status: ${getNoUserIdResponse.status}`
    );

    // Teste 4: Mensagem vazia
    const emptyMessageResponse = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: '',
        userId: TEST_USER_ID,
      }),
    });

    assert(
      emptyMessageResponse.status === 400,
      'Retorna erro 400 com mensagem vazia',
      `Status: ${emptyMessageResponse.status}`
    );

    return true;
  } catch (error) {
    assert(false, 'Validação de erros', `Erro: ${error.message}`);
    return false;
  }
}

// ============================================
// TESTE 8: Integração Completa
// ============================================
async function testFullIntegration() {
  log('\n🔗 TESTE 8: Integração Completa', 'blue');
  
  try {
    // Fluxo completo: GET histórico -> POST mensagem -> GET histórico atualizado
    
    // 1. Buscar histórico inicial
    const initialResponse = await fetch(`${API_BASE}/api/ai/chat?userId=${TEST_USER_ID}`);
    const initialData = await initialResponse.json();
    const initialCount = initialData.history.length;

    assert(
      initialResponse.status === 200,
      'GET histórico inicial bem-sucedido',
      `${initialCount} mensagens iniciais`
    );

    await sleep(500);

    // 2. Enviar nova mensagem
    const sendResponse = await fetch(`${API_BASE}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        message: 'Teste de integração completa',
        userId: TEST_USER_ID,
      }),
    });

    const sendData = await sendResponse.json();

    assert(
      sendResponse.status === 200 && sendData.response,
      'POST mensagem bem-sucedido',
      'Resposta recebida'
    );

    await sleep(500);

    // 3. Buscar histórico atualizado
    const updatedResponse = await fetch(`${API_BASE}/api/ai/chat?userId=${TEST_USER_ID}`);
    const updatedData = await updatedResponse.json();
    const updatedCount = updatedData.history.length;

    assert(
      updatedCount > initialCount,
      'Histórico atualizado após envio',
      `${initialCount} -> ${updatedCount} mensagens`
    );

    assert(
      updatedCount >= initialCount + 2,
      'Histórico contém mensagem do usuário e resposta',
      `+${updatedCount - initialCount} mensagens`
    );

    // 4. Verificar última mensagem
    const lastMessage = updatedData.history[updatedData.history.length - 1];

    assert(
      lastMessage.role === 'assistant',
      'Última mensagem é do assistente',
      'Fluxo completo validado'
    );

    return true;
  } catch (error) {
    assert(false, 'Integração completa', `Erro: ${error.message}`);
    return false;
  }
}

// ============================================
// EXECUTAR TODOS OS TESTES
// ============================================
async function runAllTests() {
  log('\n' + '='.repeat(60), 'cyan');
  log('🧪 TESTES AUTOMATIZADOS - FASE 3.3', 'cyan');
  log('Chat IA Melhorado com Contexto DISC', 'cyan');
  log('='.repeat(60), 'cyan');

  log('\n⏳ Iniciando testes...', 'yellow');
  log(`📍 API Base: ${API_BASE}`, 'yellow');
  log(`👤 User ID: ${TEST_USER_ID}`, 'yellow');

  try {
    // Executar testes em sequência
    await testSendMessage();
    await sleep(1000);

    const discContext = await testDISCContext();
    await sleep(1000);

    await testPersonalizedSuggestions(discContext);
    await sleep(1000);

    await testMessageHistory();
    await sleep(1000);

    await testAIFallback();
    await sleep(1000);

    await testEndpointPerformance();
    await sleep(1000);

    await testErrorHandling();
    await sleep(1000);

    await testFullIntegration();

    // Resultados finais
    log('\n' + '='.repeat(60), 'cyan');
    log('📊 RESULTADOS FINAIS', 'cyan');
    log('='.repeat(60), 'cyan');

    log(`\n✅ Testes Passados: ${testResults.passed}/${testResults.total}`, 'green');
    log(`❌ Testes Falhos: ${testResults.failed}/${testResults.total}`, testResults.failed > 0 ? 'red' : 'green');

    const successRate = ((testResults.passed / testResults.total) * 100).toFixed(1);
    log(`📈 Taxa de Sucesso: ${successRate}%`, successRate === '100.0' ? 'green' : 'yellow');

    if (testResults.failed > 0) {
      log('\n❌ Testes que falharam:', 'red');
      testResults.details
        .filter(t => t.status === 'FAIL')
        .forEach(t => {
          log(`   • ${t.test}`, 'red');
          if (t.details) log(`     ${t.details}`, 'yellow');
        });
    }

    log('\n' + '='.repeat(60), 'cyan');

    if (successRate === '100.0') {
      log('🎉 FASE 3.3 VALIDADA COM SUCESSO!', 'green');
      log('✅ Chat IA Melhorado está 100% funcional', 'green');
    } else {
      log('⚠️  Alguns testes falharam. Revise os erros acima.', 'yellow');
    }

    log('='.repeat(60) + '\n', 'cyan');

  } catch (error) {
    log(`\n❌ Erro fatal durante os testes: ${error.message}`, 'red');
    console.error(error);
  }
}

// Executar testes
runAllTests();
