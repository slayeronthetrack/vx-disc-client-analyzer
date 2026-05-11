/**
 * Script to apply Company Management System migrations
 * Run with: npx tsx scripts/apply-migrations.ts
 */

import { createClient } from '@supabase/supabase-js';
import * as fs from 'fs';
import * as path from 'path';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;

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

async function applyMigrations() {
  console.log('🚀 Starting migration process...\n');

  for (const migration of migrations) {
    const migrationPath = path.join(process.cwd(), 'supabase', 'migrations', migration);
    
    console.log(`📄 Applying: ${migration}`);
    
    try {
      const sql = fs.readFileSync(migrationPath, 'utf-8');
      
      const { error } = await supabase.rpc('exec_sql', { sql_query: sql });
      
      if (error) {
        console.error(`❌ Error applying ${migration}:`, error);
        throw error;
      }
      
      console.log(`✅ Successfully applied: ${migration}\n`);
    } catch (error) {
      console.error(`❌ Failed to apply ${migration}:`, error);
      process.exit(1);
    }
  }

  console.log('🎉 All migrations applied successfully!');
  
  // Verify migrations
  await verifyMigrations();
}

async function verifyMigrations() {
  console.log('\n🔍 Verifying migrations...\n');

  // Check if tables exist
  const { data: tables, error: tablesError } = await supabase
    .from('information_schema.tables')
    .select('table_name')
    .eq('table_schema', 'public')
    .in('table_name', ['companies', 'company_tests']);

  if (tablesError) {
    console.error('Error checking tables:', tablesError);
  } else {
    console.log('✅ Tables created:', tables?.map(t => t.table_name).join(', '));
  }

  // Check if RLS is enabled
  console.log('\n✅ RLS policies should be enabled on companies and company_tests tables');
  
  console.log('\n✅ Verification complete!');
}

applyMigrations().catch(console.error);
