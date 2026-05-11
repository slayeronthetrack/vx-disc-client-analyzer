-- ============================================
-- MIGRATION: Create RLS Policies
-- Description: Creates Row Level Security policies for multi-tenant isolation
-- Date: 2026-05-08
-- ============================================

-- ============================================
-- COMPANIES TABLE - RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Policy: SUPER_ADMIN can view all companies
CREATE POLICY "super_admin_select_companies"
ON companies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: SUPER_ADMIN can insert companies
CREATE POLICY "super_admin_insert_companies"
ON companies FOR INSERT
TO authenticated
WITH CHECK (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: SUPER_ADMIN can update companies
CREATE POLICY "super_admin_update_companies"
ON companies FOR UPDATE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: SUPER_ADMIN can delete companies
CREATE POLICY "super_admin_delete_companies"
ON companies FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: COMPANY_ADMIN can view only their company (Phase 3)
CREATE POLICY "company_admin_select_own_company"
ON companies FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role = 'company_admin'
    AND profiles.company_id = companies.id
  )
);

-- Policy: Public access for test portal validation (anonymous users)
CREATE POLICY "public_select_company_for_test"
ON companies FOR SELECT
TO anon
USING (active = true);

-- ============================================
-- COMPANY_TESTS TABLE - RLS POLICIES
-- ============================================

-- Enable RLS
ALTER TABLE company_tests ENABLE ROW LEVEL SECURITY;

-- Policy: SUPER_ADMIN can view all tests
CREATE POLICY "super_admin_select_tests"
ON company_tests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Policy: COMPANY_ADMIN can view tests from their company (Phase 3)
CREATE POLICY "company_admin_select_own_tests"
ON company_tests FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('company_admin', 'manager', 'viewer')
    AND profiles.company_id = company_tests.company_id
  )
);

-- Policy: Anyone can insert test (employees are anonymous)
CREATE POLICY "public_insert_test"
ON company_tests FOR INSERT
TO anon, authenticated
WITH CHECK (true);

-- Policy: SUPER_ADMIN can delete tests
CREATE POLICY "super_admin_delete_tests"
ON company_tests FOR DELETE
TO authenticated
USING (
  EXISTS (
    SELECT 1 FROM profiles
    WHERE profiles.user_id = auth.uid()
    AND profiles.role IN ('admin', 'super_admin')
  )
);

-- Note: No UPDATE policy = tests are immutable after creation

-- ============================================
-- HELPER FUNCTION: check_user_permission
-- Verifies if user has specific permission
-- ============================================

CREATE OR REPLACE FUNCTION check_user_permission(
  p_required_role user_role,
  p_company_id UUID DEFAULT NULL
)
RETURNS BOOLEAN AS $$
DECLARE
  v_user_role user_role;
  v_user_company_id UUID;
BEGIN
  -- Get user role and company_id
  SELECT role, company_id INTO v_user_role, v_user_company_id
  FROM profiles
  WHERE user_id = auth.uid();
  
  -- If user not found, no permission
  IF v_user_role IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- SUPER_ADMIN has access to everything
  IF v_user_role IN ('admin', 'super_admin') THEN
    RETURN TRUE;
  END IF;
  
  -- Check if user has required role
  IF v_user_role = p_required_role THEN
    -- If company_id is required, verify it matches
    IF p_company_id IS NOT NULL THEN
      RETURN v_user_company_id = p_company_id;
    END IF;
    RETURN TRUE;
  END IF;
  
  RETURN FALSE;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

COMMENT ON FUNCTION check_user_permission IS 'Verifies if user has specific permission for a company';
