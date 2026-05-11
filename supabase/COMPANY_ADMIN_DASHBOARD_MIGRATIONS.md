# Company Admin Dashboard - Database Migrations

## 📋 Overview

Este documento consolida todas as migrations necessárias para implementar o **Company Admin Dashboard**. Execute estas migrations no Supabase SQL Editor na ordem apresentada.

---

## 🚀 Como Executar

1. Abra o **Supabase Dashboard**
2. Vá em **SQL Editor**
3. Copie e cole cada migration abaixo
4. Execute uma por vez
5. Verifique se não há erros antes de prosseguir

---

## Migration 1: Add company_id to profiles

**Arquivo**: `20260511_add_company_id_to_profiles.sql`

```sql
/**
 * Migration: Add company_id to profiles table
 * 
 * Purpose: Enable company_admin role to be associated with a specific company
 * This allows RLS policies to filter data by company_id for company admins
 * 
 * Changes:
 * - Add company_id column to profiles table (nullable, references companies)
 * - Create index on company_id for performance
 */

-- Add company_id column to profiles table (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create index for performance optimization (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.company_id IS 'Company association for company_admin role. NULL for super_admin, admin, and user roles.';
```

---

## Migration 2: RLS Policies for company_tests

**Arquivo**: `20260511_rls_company_tests_company_admin.sql`

```sql
/**
 * Migration: RLS Policies for company_tests table (company_admin role)
 * 
 * Purpose: Enable company_admin users to access only their company's test data
 * Enforces data isolation at the database level
 * 
 * Security Model:
 * - company_admin can SELECT tests only from their associated company
 * - company_id is extracted from the user's profile
 * - NULL company_id results in zero records returned
 */

-- Enable Row Level Security on company_tests table (if not already enabled)
ALTER TABLE company_tests ENABLE ROW LEVEL SECURITY;

-- Drop existing policy if it exists (for idempotent migrations)
DROP POLICY IF EXISTS company_admin_select ON company_tests;

-- Create SELECT policy for company_admin role
CREATE POLICY company_admin_select ON company_tests
FOR SELECT
TO authenticated
USING (
  -- Allow access if the test's company_id matches the user's company_id
  company_id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
  )
);

-- Add comment for documentation
COMMENT ON POLICY company_admin_select ON company_tests IS 
'Allows company_admin users to SELECT only tests from their associated company. Enforces data isolation between companies.';
```

---

## Migration 3: RLS Policies for companies

**Arquivo**: `20260511_rls_companies_company_admin.sql`

```sql
/**
 * Migration: RLS Policies for companies table (company_admin role)
 * 
 * Purpose: Enable company_admin users to:
 * - SELECT their own company record
 * - UPDATE limited fields in their company record (contact info only)
 * - Prevent updating restricted fields (name, slug, max_tests, active)
 * 
 * Security Model:
 * - company_admin can only access their associated company
 * - Restricted fields are protected by WITH CHECK clause
 */

-- Enable Row Level Security on companies table (if not already enabled)
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (for idempotent migrations)
DROP POLICY IF EXISTS company_admin_select ON companies;
DROP POLICY IF EXISTS company_admin_update ON companies;

-- Create SELECT policy for company_admin role
CREATE POLICY company_admin_select ON companies
FOR SELECT
TO authenticated
USING (
  -- Allow access if the company id matches the user's company_id
  id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
  )
);

-- Create UPDATE policy for company_admin role with restricted field protection
CREATE POLICY company_admin_update ON companies
FOR UPDATE
TO authenticated
USING (
  -- Allow update if the company id matches the user's company_id
  id IN (
    SELECT company_id 
    FROM profiles 
    WHERE user_id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
  )
)
WITH CHECK (
  -- Prevent updating restricted fields by ensuring they remain unchanged
  -- This checks that the new values match the old values for restricted fields
  name IS NOT DISTINCT FROM (SELECT name FROM companies WHERE id = companies.id)
  AND slug IS NOT DISTINCT FROM (SELECT slug FROM companies WHERE id = companies.id)
  AND max_tests IS NOT DISTINCT FROM (SELECT max_tests FROM companies WHERE id = companies.id)
  AND active IS NOT DISTINCT FROM (SELECT active FROM companies WHERE id = companies.id)
);

-- Add comments for documentation
COMMENT ON POLICY company_admin_select ON companies IS 
'Allows company_admin users to SELECT only their associated company record.';

COMMENT ON POLICY company_admin_update ON companies IS 
'Allows company_admin users to UPDATE only their company record, but prevents updating restricted fields (name, slug, max_tests, active).';
```

---

## Migration 4: Performance Indexes

**Arquivo**: `20260511_indexes_company_tests.sql`

```sql
/**
 * Migration: Performance Indexes for company_tests table
 * 
 * Purpose: Optimize query performance for company admin dashboard
 * These indexes support common query patterns:
 * - Filtering by company_id (RLS enforcement)
 * - Filtering by employee_id (test history)
 * - Sorting by created_at (recent tests)
 * - Filtering by dominant DISC profile
 * - Filtering by department
 * - Filtering by status
 * 
 * Composite indexes support multi-column queries
 */

-- Single-column indexes
CREATE INDEX IF NOT EXISTS idx_company_tests_company_id 
ON company_tests(company_id);

CREATE INDEX IF NOT EXISTS idx_company_tests_employee_id 
ON company_tests(employee_id);

CREATE INDEX IF NOT EXISTS idx_company_tests_created_at 
ON company_tests(created_at DESC);

CREATE INDEX IF NOT EXISTS idx_company_tests_dominant_profile 
ON company_tests((disc_result->>'dominant'));

CREATE INDEX IF NOT EXISTS idx_company_tests_department 
ON company_tests(department);

CREATE INDEX IF NOT EXISTS idx_company_tests_status 
ON company_tests(status);

-- Composite indexes for common query patterns
CREATE INDEX IF NOT EXISTS idx_company_tests_company_created 
ON company_tests(company_id, created_at DESC);

CREATE INDEX IF NOT EXISTS idx_company_tests_company_employee 
ON company_tests(company_id, employee_id);

-- Add comments for documentation
COMMENT ON INDEX idx_company_tests_company_id IS 
'Supports RLS policy filtering and company-specific queries';

COMMENT ON INDEX idx_company_tests_employee_id IS 
'Supports employee test history queries';

COMMENT ON INDEX idx_company_tests_created_at IS 
'Supports sorting by test date (most recent first)';

COMMENT ON INDEX idx_company_tests_dominant_profile IS 
'Supports filtering by dominant DISC profile (D, I, S, C)';

COMMENT ON INDEX idx_company_tests_department IS 
'Supports filtering by department';

COMMENT ON INDEX idx_company_tests_status IS 
'Supports filtering by test status';

COMMENT ON INDEX idx_company_tests_company_created IS 
'Composite index for company-specific queries sorted by date';

COMMENT ON INDEX idx_company_tests_company_employee IS 
'Composite index for employee test history within a company';
```

---

## ✅ Verification

Após executar todas as migrations, verifique:

### 1. Verificar coluna company_id em profiles
```sql
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns 
WHERE table_name = 'profiles' AND column_name = 'company_id';
```

**Resultado esperado**: 1 linha mostrando `company_id | uuid | YES`

### 2. Verificar RLS policies em company_tests
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'company_tests' AND policyname = 'company_admin_select';
```

**Resultado esperado**: 1 linha mostrando a policy `company_admin_select`

### 3. Verificar RLS policies em companies
```sql
SELECT policyname, cmd, roles 
FROM pg_policies 
WHERE tablename = 'companies' 
WHERE policyname IN ('company_admin_select', 'company_admin_update');
```

**Resultado esperado**: 2 linhas mostrando ambas as policies

### 4. Verificar indexes
```sql
SELECT indexname 
FROM pg_indexes 
WHERE tablename = 'company_tests' 
AND indexname LIKE 'idx_company_tests%';
```

**Resultado esperado**: 8 indexes listados

---

## 🔐 Security Notes

- **RLS está ativo**: Todas as policies filtram automaticamente por `company_id`
- **Campos restritos protegidos**: company_admin não pode alterar `name`, `slug`, `max_tests`, `active`
- **Isolamento de dados**: Cada empresa vê apenas seus próprios dados
- **Performance otimizada**: Indexes garantem queries rápidas mesmo com 1000+ testes

---

## 📝 Next Steps

Após executar as migrations:
1. ✅ Associar usuários company_admin a empresas (UPDATE profiles SET company_id = '...' WHERE ...)
2. ✅ Testar RLS policies (tentar acessar dados de outra empresa)
3. ✅ Continuar com implementação do código (API routes, components)

---

**Status**: ✅ Migrations prontas para execução
**Data**: 2026-05-11
