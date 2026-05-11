/**
 * Divide o SQL de 1000 perguntas em 10 batches de 100
 */

const fs = require('fs');

console.log('📦 Dividindo SQL em batches...\n');

// Ler arquivo original
const content = fs.readFileSync('supabase/seed/1000_questions_seed.sql', 'utf8');

// Extrair apenas os INSERTs
const lines = content.split('\n');
const inserts = [];
let currentInsert = '';

for (const line of lines) {
  if (line.trim().startsWith('INSERT INTO')) {
    if (currentInsert) {
      inserts.push(currentInsert.trim());
    }
    currentInsert = line;
  } else if (currentInsert) {
    currentInsert += '\n' + line;
    if (line.trim().endsWith(');')) {
      inserts.push(currentInsert.trim());
      currentInsert = '';
    }
  }
}

console.log(`✅ Total de INSERTs encontrados: ${inserts.length}\n`);

// Dividir em batches de 100
const batchSize = 100;
const totalBatches = Math.ceil(inserts.length / batchSize);

for (let i = 0; i < inserts.length; i += batchSize) {
  const batch = inserts.slice(i, i + batchSize);
  const batchNum = Math.floor(i / batchSize) + 1;
  const filename = `supabase/seed/questions_batch_${batchNum}.sql`;
  
  const header = `-- Batch ${batchNum} de ${totalBatches}
-- Perguntas ${i + 1} a ${Math.min(i + batchSize, inserts.length)}
-- Gerado em ${new Date().toISOString()}

`;
  
  const content = header + batch.join('\n\n') + '\n';
  fs.writeFileSync(filename, content);
  
  console.log(`✅ Criado: ${filename} (${batch.length} perguntas)`);
}

console.log(`\n🎉 ${totalBatches} batches criados com sucesso!`);
console.log('\n📋 COMO EXECUTAR:');
console.log('1. Vá no Supabase SQL Editor');
console.log('2. Execute os batches na ordem:');
for (let i = 1; i <= totalBatches; i++) {
  console.log(`   - questions_batch_${i}.sql`);
}
console.log('\n⚡ Cada batch tem ~100 perguntas e executa rápido!\n');
