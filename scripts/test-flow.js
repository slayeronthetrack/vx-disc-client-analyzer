/**
 * Script de Teste do Fluxo Completo
 * Testa o fluxo: Registro → Login → Perfil → Teste → Resultado
 */

const baseUrl = 'http://localhost:3001';

async function testFlow() {
  console.log('🚀 Iniciando teste do fluxo completo...\n');

  // 1. Testar página inicial
  console.log('1️⃣ Testando página inicial...');
  try {
    const response = await fetch(baseUrl);
    if (response.ok) {
      console.log('✅ Página inicial carrega corretamente\n');
    } else {
      console.log(`❌ Erro ao carregar página inicial: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 2. Testar página de registro
  console.log('2️⃣ Testando página de registro...');
  try {
    const response = await fetch(`${baseUrl}/register`);
    if (response.ok) {
      console.log('✅ Página de registro carrega corretamente\n');
    } else {
      console.log(`❌ Erro ao carregar página de registro: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 3. Testar página de login
  console.log('3️⃣ Testando página de login...');
  try {
    const response = await fetch(`${baseUrl}/login`);
    if (response.ok) {
      console.log('✅ Página de login carrega corretamente\n');
    } else {
      console.log(`❌ Erro ao carregar página de login: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 4. Testar página de perfil (requer autenticação)
  console.log('4️⃣ Testando página de perfil...');
  try {
    const response = await fetch(`${baseUrl}/profile`);
    if (response.ok || response.status === 401 || response.status === 302) {
      console.log('✅ Página de perfil responde (redirecionamento esperado se não autenticado)\n');
    } else {
      console.log(`❌ Erro ao carregar página de perfil: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 5. Testar página de teste
  console.log('5️⃣ Testando página de teste...');
  try {
    const response = await fetch(`${baseUrl}/test`);
    if (response.ok || response.status === 401 || response.status === 302) {
      console.log('✅ Página de teste responde (redirecionamento esperado se não autenticado)\n');
    } else {
      console.log(`❌ Erro ao carregar página de teste: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 6. Testar página de resultado
  console.log('6️⃣ Testando página de resultado...');
  try {
    const response = await fetch(`${baseUrl}/result`);
    if (response.ok || response.status === 401 || response.status === 302) {
      console.log('✅ Página de resultado responde (redirecionamento esperado se não autenticado)\n');
    } else {
      console.log(`❌ Erro ao carregar página de resultado: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  // 7. Testar dashboard admin
  console.log('7️⃣ Testando dashboard admin...');
  try {
    const response = await fetch(`${baseUrl}/dashboard`);
    if (response.ok || response.status === 401 || response.status === 302) {
      console.log('✅ Dashboard responde (redirecionamento esperado se não admin)\n');
    } else {
      console.log(`❌ Erro ao carregar dashboard: ${response.status}\n`);
    }
  } catch (error) {
    console.log(`❌ Erro ao conectar: ${error.message}\n`);
  }

  console.log('✨ Teste de rotas concluído!\n');
  console.log('📋 Próximos passos:');
  console.log('   1. Abra http://localhost:3001 no navegador');
  console.log('   2. Teste o fluxo completo manualmente:');
  console.log('      - Criar conta em /register');
  console.log('      - Fazer login em /login');
  console.log('      - Completar perfil em /profile');
  console.log('      - Fazer teste DISC em /test');
  console.log('      - Ver resultado em /result');
}

testFlow().catch(console.error);
