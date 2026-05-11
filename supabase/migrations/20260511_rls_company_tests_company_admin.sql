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
