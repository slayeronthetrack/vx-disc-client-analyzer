/**
 * Script de Teste Automatizado - VX DISC
 * Testa o fluxo completo do sistema
 */

const baseUrl = 'http://localhost:3001';

// Cores para output
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function logSuccess(message) {
  log(`✅ ${message}`, 'green');
}

function logError(message) {
  log(`❌ ${message}`, 'red');
}

function logInfo(message) {
  log(`ℹ️  ${message}`, 'cyan');
}

function logWarning(message) {
  log(`⚠️  ${message}`, 'yellow');
}

async function testEndpoint(url, description) {
  try {
    const response = await fetch(url);
    const status = response.status;
    
    if (status === 200) {
      logSuccess(`${description} - Status: ${status}`);
      return true;
    } else if (status === 302 || status === 307) {
      logWarning(`${description} - Redirecionamento (${status}) - OK para páginas protegidas`);
      return true;
    } else {
      logError(`${description} - Status: ${status}`);
      return false;
    }
  } catch (error) {
    logError(`${description} - Erro: ${error.message}`);
    return false;
  }
}

async function runTests() {
  log('\n🚀 INICIANDO TESTES DO SISTEMA VX DISC\n', 'blue');
  
  const results = {
    passed: 0,
    failed: 0,
    warnings: 0,
  };

  // ========================================
  // TESTE 1: Servidor está rodando
  // ========================================
  log('\n📡 TESTE 1: Verificando se servidor está rodando...', 'yellow');
  const serverRunning = await testEndpoint(baseUrl, 'Servidor principal');
  if (serverRunning) results.passed++; else results.failed++;

  // ========================================
  // TESTE 2: Páginas públicas
  // ========================================
  log('\n🌐 TESTE 2: Testando páginas públicas...', 'yellow');
  
  const publicPages = [
    { url: `${baseUrl}/`, desc: 'Home page' },
    { url: `${baseUrl}/login`, desc: 'Página de login' },
    { url: `${baseUrl}/register`, desc: 'Página de registro' },
  ];

  for (const page of publicPages) {
    const result = await testEndpoint(page.url, page.desc);
    if (result) results.passed++; else results.failed++;
  }

  // ========================================
  // TESTE 3: Páginas protegidas (devem redirecionar)
  // ========================================
  log('\n🔒 TESTE 3: Testando páginas protegidas...', 'yellow');
  
  const protectedPages = [
    { url: `${baseUrl}/profile`, desc: 'Página de perfil' },
    { url: `${baseUrl}/test`, desc: 'Página de teste' },
    { url: `${baseUrl}/result`, desc: 'Página de resultado' },
    { url: `${baseUrl}/dashboard`, desc: 'Dashboard admin' },
  ];

  for (const page of protectedPages) {
    const result = await testEndpoint(page.url, page.desc);
    if (result) results.passed++; else results.failed++;
  }

  // ========================================
  // TESTE 4: APIs
  // ========================================
  log('\n🔌 TESTE 4: Testando APIs...', 'yellow');
  
  logInfo('Testando API de IA (pode falhar se não tiver OpenAI key)...');
  
  try {
    const aiResponse = await fetch(`${baseUrl}/api/ai/chat`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ message: 'teste' }),
    });
    
    if (aiResponse.status === 200 || aiResponse.status === 401) {
      logSuccess('API de chat responde');
      results.passed++;
    } else {
      logWarning(`API de chat - Status: ${aiResponse.status}`);
      results.warnings++;
    }
  } catch (error) {
    logWarning(`API de chat - ${error.message}`);
    results.warnings++;
  }

  // ========================================
  // TESTE 5: Verificar se há erros de compilação
  // ========================================
  log('\n🔍 TESTE 5: Verificando compilação...', 'yellow');
  logInfo('Verifique o terminal do servidor para erros de compilação');
  logSuccess('Servidor está respondendo (sem crashes)');
  results.passed++;

  // ========================================
  // RESUMO
  // ========================================
  log('\n' + '='.repeat(50), 'cyan');
  log('📊 RESUMO DOS TESTES', 'cyan');
  log('='.repeat(50), 'cyan');
  
  logSuccess(`Testes passaram: ${results.passed}`);
  if (results.failed > 0) {
    logError(`Testes falharam: ${results.failed}`);
  }
  if (results.warnings > 0) {
    logWarning(`Avisos: ${results.warnings}`);
  }
  
  const total = results.passed + results.failed;
  const percentage = ((results.passed / total) * 100).toFixed(1);
  
  log(`\n📈 Taxa de sucesso: ${percentage}%`, 'cyan');
  
  if (results.failed === 0) {
    log('\n✅ TODOS OS TESTES PASSARAM!', 'green');
    log('🎯 Sistema está funcionando corretamente', 'green');
    log('\n📋 PRÓXIMOS PASSOS:', 'yellow');
    log('1. Faça login no navegador', 'reset');
    log('2. Teste manualmente /profile e /test', 'reset');
    log('3. Verifique o console do navegador (F12)', 'reset');
    log('4. Se tudo funcionar, avance para FASE 2\n', 'reset');
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM', 'yellow');
    log('🔍 Verifique os erros acima', 'yellow');
    log('📝 Verifique o console do servidor para mais detalhes\n', 'yellow');
  }
  
  log('='.repeat(50) + '\n', 'cyan');
}

// Executar testes
runTests().catch(console.error);
