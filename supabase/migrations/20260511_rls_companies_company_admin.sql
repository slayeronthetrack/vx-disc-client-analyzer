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
