# Apply Company Management System Migrations

## Overview
This document explains how to apply the Company Management System migrations to your Supabase database.

## Migrations Created

1. **20260508_create_companies_table.sql** - Creates companies table
2. **20260508_create_company_tests_table.sql** - Creates company_tests table
3. **20260508_update_profiles_table.sql** - Adds role and company_id to profiles
4. **20260508_create_views_and_functions.sql** - Creates helper views and functions
5. **20260508_create_rls_policies.sql** - Creates RLS policies for security

## How to Apply

### Option 1: Supabase CLI (Recommended)

```bash
# Make sure you're in the project root
cd /path/to/vx-disc-client-analyzer

# Apply all migrations
supabase db push

# Or apply specific migration
supabase db push --file supabase/migrations/20260508_create_companies_table.sql
```

### Option 2: Supabase Dashboard

1. Go to https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste each migration file in order
5. Click **Run** for each one

### Option 3: psql Command Line

```bash
# Connect to your Supabase database
psql "postgresql://postgres:[YOUR-PASSWORD]@[YOUR-PROJECT-REF].supabase.co:5432/postgres"

# Apply migrations in order
\i supabase/migrations/20260508_create_companies_table.sql
\i supabase/migrations/20260508_create_company_tests_table.sql
\i supabase/migrations/20260508_update_profiles_table.sql
\i supabase/migrations/20260508_create_views_and_functions.sql
\i supabase/migrations/20260508_create_rls_policies.sql
```

## Verification

After applying migrations, verify they were successful:

```sql
-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_tests');

-- Check if views exist
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'company_stats';

-- Check if functions exist
SELECT routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_test_limit', 'get_company_disc_averages', 'get_company_test_count');

-- Check if RLS is enabled
SELECT tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_tests');

-- Check policies
SELECT tablename, policyname 
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_tests');
```

## Test Data (Optional)

Create a test company to verify everything works:

```sql
-- Insert test company
INSERT INTO companies (name, slug, contact_person, contact_email, max_tests)
VALUES ('VX Comercial', 'vx-comercial', 'João Silva', 'joao@vxcomercial.com', 100);

-- Verify it was created
SELECT * FROM companies WHERE slug = 'vx-comercial';

-- Check company_stats view
SELECT * FROM company_stats WHERE slug = 'vx-comercial';

-- Test check_test_limit function
SELECT check_test_limit((SELECT id FROM companies WHERE slug = 'vx-comercial'));
-- Should return: true (company can perform tests)
```

## Rollback (If Needed)

If you need to rollback the migrations:

```sql
-- Drop in reverse order
DROP FUNCTION IF EXISTS check_user_permission(user_role, UUID);
DROP POLICY IF EXISTS "super_admin_delete_tests" ON company_tests;
DROP POLICY IF EXISTS "public_insert_test" ON company_tests;
DROP POLICY IF EXISTS "company_admin_select_own_tests" ON company_tests;
DROP POLICY IF EXISTS "super_admin_select_tests" ON company_tests;
DROP POLICY IF EXISTS "public_select_company_for_test" ON companies;
DROP POLICY IF EXISTS "company_admin_select_own_company" ON companies;
DROP POLICY IF EXISTS "super_admin_delete_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_update_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_insert_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_select_companies" ON companies;

DROP FUNCTION IF EXISTS get_company_test_count(UUID);
DROP FUNCTION IF EXISTS check_test_limit(UUID);
DROP FUNCTION IF EXISTS get_company_disc_averages(UUID);
DROP VIEW IF EXISTS company_stats;

ALTER TABLE profiles DROP COLUMN IF EXISTS company_id;
ALTER TABLE profiles DROP COLUMN IF EXISTS role;
DROP TYPE IF EXISTS user_role;

DROP TABLE IF EXISTS company_tests CASCADE;
DROP TYPE IF EXISTS test_status;

DROP TABLE IF EXISTS companies CASCADE;
DROP FUNCTION IF EXISTS update_updated_at_column();
```

## Next Steps

After applying migrations:

1. ✅ Update `.env.local` with Supabase credentials
2. ✅ Create TypeScript types (`types/company.ts`, `types/company-test.ts`)
3. ✅ Create services (`lib/services/companyService.ts`)
4. ✅ Create API routes (`app/api/companies/route.ts`)
5. ✅ Create admin pages (`app/admin/companies/page.tsx`)

## Troubleshooting

### Error: "relation already exists"
- The table already exists. You can either:
  - Drop the table first: `DROP TABLE IF EXISTS companies CASCADE;`
  - Or skip this migration

### Error: "permission denied"
- Make sure you're connected as a superuser or have sufficient privileges
- Check your Supabase project settings

### Error: "type already exists"
- The enum type already exists. The migration handles this with `DO $$ BEGIN ... EXCEPTION WHEN duplicate_object THEN null; END $$;`

## Support

If you encounter issues:
1. Check Supabase logs in the dashboard
2. Verify your database connection
3. Ensure you're applying migrations in the correct order
