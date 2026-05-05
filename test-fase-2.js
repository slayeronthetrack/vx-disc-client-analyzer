/**
 * Script de Teste Automatizado - FASE 2
 * Valida funcionalidades principais do sistema VX DISC
 */

const https = require('https');

const BASE_URL = 'http://localhost:3001';
const colors = {
  reset: '\x1b[0m',
  green: '\x1b[32m',
  red: '\x1b[31m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
};

let passedTests = 0;
let failedTests = 0;

function log(message, color = 'reset') {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function testPassed(testName) {
  passedTests++;
  log(`✓ ${testName}`, 'green');
}

function testFailed(testName, error) {
  failedTests++;
  log(`✗ ${testName}`, 'red');
  if (error) {
    log(`  Erro: ${error}`, 'red');
  }
}

async function testEndpoint(path, expectedStatus = 200) {
  return new Promise((resolve) => {
    const url = `${BASE_URL}${path}`;
    
    // Usar http em vez de https
    const http = require('http');
    
    http.get(url, (res) => {
      if (res.statusCode === expectedStatus) {
        resolve({ success: true, status: res.statusCode });
      } else {
        resolve({ success: false, status: res.statusCode, expected: expectedStatus });
      }
    }).on('error', (err) => {
      resolve({ success: false, error: err.message });
    });
  });
}

async function runTests() {
  log('\n🚀 INICIANDO TESTES - FASE 2\n', 'cyan');
  log('═══════════════════════════════════════════════════\n', 'blue');

  // TESTE 1: Servidor está rodando
  log('📡 TESTE 1: Verificando servidor...', 'yellow');
  const serverTest = await testEndpoint('/');
  if (serverTest.success) {
    testPassed('Servidor está rodando');
  } else {
    testFailed('Servidor está rodando', serverTest.error || `Status ${serverTest.status}`);
  }

  // TESTE 2: Página de login
  log('\n🔐 TESTE 2: Verificando página de login...', 'yellow');
  const loginTest = await testEndpoint('/login');
  if (loginTest.success) {
    testPassed('Página de login acessível');
  } else {
    testFailed('Página de login acessível', `Status ${loginTest.status}`);
  }

  // TESTE 3: Página de registro
  log('\n📝 TESTE 3: Verificando página de registro...', 'yellow');
  const registerTest = await testEndpoint('/register');
  if (registerTest.success) {
    testPassed('Página de registro acessível');
  } else {
    testFailed('Página de registro acessível', `Status ${registerTest.status}`);
  }

  // TESTE 4: Página de perfil
  log('\n👤 TESTE 4: Verificando página de perfil...', 'yellow');
  const profileTest = await testEndpoint('/profile');
  if (profileTest.success) {
    testPassed('Página de perfil acessível');
  } else {
    testFailed('Página de perfil acessível', `Status ${profileTest.status}`);
  }

  // TESTE 5: Página de teste
  log('\n📋 TESTE 5: Verificando página de teste...', 'yellow');
  const testPageTest = await testEndpoint('/test');
  if (testPageTest.success) {
    testPassed('Página de teste acessível');
  } else {
    testFailed('Página de teste acessível', `Status ${testPageTest.status}`);
  }

  // TESTE 6: Página de resultado
  log('\n📊 TESTE 6: Verificando página de resultado...', 'yellow');
  const resultTest = await testEndpoint('/result');
  if (resultTest.success) {
    testPassed('Página de resultado acessível');
  } else {
    testFailed('Página de resultado acessível', `Status ${resultTest.status}`);
  }

  // TESTE 7: Página de dashboard
  log('\n📈 TESTE 7: Verificando página de dashboard...', 'yellow');
  const dashboardTest = await testEndpoint('/dashboard');
  if (dashboardTest.success) {
    testPassed('Página de dashboard acessível');
  } else {
    testFailed('Página de dashboard acessível', `Status ${dashboardTest.status}`);
  }

  // TESTE 8: API de chat IA (deve retornar 405 para GET)
  log('\n🤖 TESTE 8: Verificando API de chat IA...', 'yellow');
  const chatApiTest = await testEndpoint('/api/ai/chat', 405);
  if (chatApiTest.success) {
    testPassed('API de chat IA está configurada');
  } else {
    testFailed('API de chat IA está configurada', `Status ${chatApiTest.status}`);
  }

  // TESTE 9: API de cálculo de resultado (deve retornar 405 para GET)
  log('\n🧮 TESTE 9: Verificando API de cálculo...', 'yellow');
  const calcApiTest = await testEndpoint('/api/ai/calculate-result', 405);
  if (calcApiTest.success) {
    testPassed('API de cálculo está configurada');
  } else {
    testFailed('API de cálculo está configurada', `Status ${calcApiTest.status}`);
  }

  // TESTE 10: API de geração de perguntas (deve retornar 405 para GET)
  log('\n❓ TESTE 10: Verificando API de perguntas...', 'yellow');
  const questionsApiTest = await testEndpoint('/api/ai/generate-questions', 405);
  if (questionsApiTest.success) {
    testPassed('API de perguntas está configurada');
  } else {
    testFailed('API de perguntas está configurada', `Status ${questionsApiTest.status}`);
  }

  // RESUMO
  log('\n═══════════════════════════════════════════════════', 'blue');
  log('\n📊 RESUMO DOS TESTES\n', 'cyan');
  log(`Total de testes: ${passedTests + failedTests}`, 'blue');
  log(`✓ Passaram: ${passedTests}`, 'green');
  log(`✗ Falharam: ${failedTests}`, 'red');
  
  const percentage = Math.round((passedTests / (passedTests + failedTests)) * 100);
  log(`\n📈 Taxa de sucesso: ${percentage}%`, percentage === 100 ? 'green' : 'yellow');

  if (failedTests === 0) {
    log('\n🎉 TODOS OS TESTES PASSARAM!', 'green');
    log('✅ Sistema está funcionando corretamente', 'green');
    log('\n🚀 Próximo passo: Teste manual no navegador', 'cyan');
    log('   Abra: http://localhost:3001', 'cyan');
  } else {
    log('\n⚠️  ALGUNS TESTES FALHARAM', 'yellow');
    log('   Verifique os erros acima', 'yellow');
  }

  log('\n═══════════════════════════════════════════════════\n', 'blue');
}

// Executar testes
runTests().catch((error) => {
  log(`\n❌ Erro ao executar testes: ${error.message}`, 'red');
  process.exit(1);
});
