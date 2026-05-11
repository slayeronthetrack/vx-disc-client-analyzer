/**
 * Script to apply Company Management System migrations
 * Run with: node scripts/apply-migrations.js
 */

const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('❌ Missing Supabase credentials in .env.local');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

const migrations = [
  '20260508_create_companies_table.sql',
  '20260508_create_company_tests_table.sql',
  '20260508_update_profiles_table.sql',
  '20260508_create_views_and_functions.sql',
  '20260508_create_rls_policies.sql'
];

async function executeSql(sql) {
  // Split SQL into individual statements
  const statements = sql
    .split(';')
    .map(s => s.trim())
    .filter(s => s.length > 0 && !s.startsWith('--'));

  for (const statement of statements) {
    if (statement.trim()) {
      const { error } = await supabase.rpc('exec_sql', { sql_query: statement + ';' });
      if (error) {
        throw error;
      }
    }
  }
}

async function applyMigrations() {
  console.log('🚀 Starting migration process...\n');

  for (const migration of migrations) {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migration);
    
    console.log(`📄 Applying: ${migration}`);
    
    try {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      // Use Supabase SQL editor endpoint
      const response = await fetch(`${supabaseUrl}/rest/v1/rpc/exec_sql`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'apikey': supabaseServiceKey,
          'Authorization': `Bearer ${supabaseServiceKey}`
        },
        body: JSON.stringify({ query: sql })
      });

      if (!response.ok) {
        const error = await response.text();
        console.error(`❌ Error applying ${migration}:`, error);
        throw new Error(error);
      }
      
      console.log(`✅ Successfully applied: ${migration}\n`);
    } catch (error) {
      console.error(`❌ Failed to apply ${migration}:`, error.message);
      console.log('\n⚠️  You may need to apply this migration manually through the Supabase Dashboard SQL Editor');
      console.log(`   Go to: ${supabaseUrl.replace('https://', 'https://supabase.com/dashboard/project/')}/sql/new\n`);
    }
  }

  console.log('🎉 Migration process complete!');
  console.log('\n📋 Next steps:');
  console.log('   1. Verify migrations in Supabase Dashboard');
  console.log('   2. Check that tables exist: companies, company_tests');
  console.log('   3. Verify RLS policies are enabled');
}

applyMigrations().catch(console.error);
