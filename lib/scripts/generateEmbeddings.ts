/**
 * Script: Generate Embeddings for Existing Questions
 * Run this script to generate embeddings for questions that don't have them yet
 * 
 * Usage: npx tsx lib/scripts/generateEmbeddings.ts
 */

import { createClient } from '@supabase/supabase-js';
import { antiDuplicationSystem } from '../services/antiDuplicationSystem';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function generateEmbeddings() {
  console.log('🚀 Starting embedding generation...\n');

  try {
    // Get all questions without embeddings
    const { data: questions, error } = await supabase
      .from('question_bank')
      .select('id, question_text, embedding_vector')
      .is('embedding_vector', null);

    if (error) {
      throw error;
    }

    if (!questions || questions.length === 0) {
      console.log('✅ All questions already have embeddings!');
      return;
    }

    console.log(`📊 Found ${questions.length} questions without embeddings\n`);

    // Generate embeddings in batches
    const questionsToProcess = questions.map((q) => ({
      id: q.id,
      text: q.question_text,
    }));

    console.log('⏳ Generating embeddings...');
    const embeddings = await antiDuplicationSystem.batchGenerateEmbeddings(
      questionsToProcess
    );

    console.log(`\n✅ Successfully generated ${embeddings.size} embeddings!`);
    console.log('\n📈 Summary:');
    console.log(`   - Total questions processed: ${questions.length}`);
    console.log(`   - Embeddings generated: ${embeddings.size}`);
    console.log(`   - Cache size: ${antiDuplicationSystem.getCacheStats().size}`);
  } catch (error) {
    console.error('❌ Error generating embeddings:', error);
    throw error;
  }
}

// Run the script
generateEmbeddings()
  .then(() => {
    console.log('\n✨ Done!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('\n💥 Script failed:', error);
    process.exit(1);
  });
