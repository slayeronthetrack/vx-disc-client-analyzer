-- ============================================
-- CONSOLIDATED COMPANY MANAGEMENT SYSTEM MIGRATIONS
-- Apply this file in Supabase Dashboard SQL Editor
-- Date: 2026-05-08
-- ============================================

-- ============================================
-- MIGRATION 1: Create Companies Table
-- ============================================

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#F97316',
  secondary_color TEXT,
  font_family TEXT DEFAULT 'Inter',
  custom_welcome_message TEXT,
  background_image_url TEXT,
  email_template TEXT,
  
  -- Contact Information
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Configuration
  max_tests INTEGER DEFAULT 100 CHECK (max_tests >= 0),
  active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]{3,50}$'),
  CONSTRAINT slug_no_edge_hyphens CHECK (slug NOT LIKE '-%' AND slug NOT LIKE '%-'),
  CONSTRAINT valid_hex_color CHECK (
    primary_color IS NULL OR 
    primary_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  CONSTRAINT valid_email CHECK (contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_companies_slug ON companies(slug);
CREATE INDEX IF NOT EXISTS idx_companies_active ON companies(active, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_companies_created_at ON companies(created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for companies table
DROP TRIGGER IF EXISTS update_companies_updated_at ON companies;
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Client companies using the DISC test platform';
COMMENT ON COLUMN companies.slug IS 'Unique URL-safe identifier for company test portal (/test/[slug])';
COMMENT ON COLUMN companies.max_tests IS '0 = unlimited tests, >0 = specific limit';
COMMENT ON COLUMN companies.primary_color IS 'Hex color code for company branding (e.g., #F97316)';
COMMENT ON COLUMN companies.active IS 'Whether the company test portal is currently active';

-- ============================================
-- MIGRATION 2: Create Company Tests Table
-- ============================================

-- Create test_status enum
DO $$ BEGIN
  CREATE TYPE test_status AS ENUM ('PENDING', 'IN_PROGRESS', 'COMPLETED', 'EXPIRED', 'ABANDONED');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Create company_tests table
CREATE TABLE IF NOT EXISTS company_tests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Relationships
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  employee_id UUID, -- For linking multiple tests from same employee (Phase 2)
  invitation_id UUID, -- Links to invitation if applicable (Phase 2)
  previous_test_id UUID REFERENCES company_tests(id), -- For test history (Phase 2)
  
  -- Employee Data
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  position TEXT NOT NULL,
  department TEXT, -- Phase 2
  
  -- DISC Result
  disc_result JSONB NOT NULL,
  -- Structure: { dominant, secondary, scores: {D, I, S, C}, percentages: {D, I, S, C} }
  
  -- Test Data
  answers JSONB NOT NULL,
  -- Structure: [{ questionId, selectedOptions: [{type, valueType, psychTraits}] }]
  
  questions JSONB, -- Questions used in the test (for reference)
  
  -- Metadata
  status test_status DEFAULT 'COMPLETED',
  test_version TEXT DEFAULT '1.0',
  attempt_number INTEGER DEFAULT 1,
  
  -- AI Analysis
  ai_analysis TEXT,
  
  -- Timestamps
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT valid_email CHECK (email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_company_tests_company_id ON company_tests(company_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_tests_email ON company_tests(company_id, email);
CREATE INDEX IF NOT EXISTS idx_company_tests_employee_id ON company_tests(employee_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_company_tests_status ON company_tests(status);
CREATE INDEX IF NOT EXISTS idx_company_tests_department ON company_tests(department) WHERE department IS NOT NULL;

-- Create GIN index for JSONB search
CREATE INDEX IF NOT EXISTS idx_company_tests_disc_result ON company_tests USING GIN (disc_result);
CREATE INDEX IF NOT EXISTS idx_company_tests_answers ON company_tests USING GIN (answers);

-- Add comments for documentation
COMMENT ON TABLE company_tests IS 'DISC test results for company employees';
COMMENT ON COLUMN company_tests.employee_id IS 'UUID generated based on email to link multiple tests from same employee';
COMMENT ON COLUMN company_tests.disc_result IS 'Complete DISC result in JSON format';
COMMENT ON COLUMN company_tests.attempt_number IS 'Test attempt number (1, 2, 3...) for tracking retests';
COMMENT ON COLUMN company_tests.status IS 'Current status of the test';

-- ============================================
-- MIGRATION 3: Update Profiles Table
-- ============================================

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin', 'company_admin', 'manager', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column if it doesn't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Add company_id column for company-specific admins (Phase 3)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id) WHERE company_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN profiles.role IS 'User role in the system (user, admin, super_admin, company_admin, manager, viewer)';
COMMENT ON COLUMN profiles.company_id IS 'Company linked to user (for COMPANY_ADMIN, MANAGER, VIEWER roles)';

-- Update existing admin users to super_admin role (if any exist)
-- This is safe to run multiple times
UPDATE profiles 
SET role = 'super_admin' 
WHERE role = 'admin';

-- ============================================
-- MIGRATION 4: Create Views and Functions
-- ============================================

-- VIEW: company_stats
CREATE OR REPLACE VIEW company_stats AS
SELECT 
  c.id AS company_id,
  c.name AS company_name,
  c.slug,
  c.active,
  c.max_tests,
  
  -- Test counts
  COUNT(ct.id) AS total_tests,
  COUNT(ct.id) FILTER (WHERE ct.status = 'COMPLETED') AS completed_tests,
  COUNT(ct.id) FILTER (WHERE ct.status = 'ABANDONED') AS abandoned_tests,
  
  -- DISC distribution
  COUNT(ct.id) FILTER (WHERE ct.disc_result->>'dominant' = 'D') AS dominant_d_count,
  COUNT(ct.id) FILTER (WHERE ct.disc_result->>'dominant' = 'I') AS dominant_i_count,
  COUNT(ct.id) FILTER (WHERE ct.disc_result->>'dominant' = 'S') AS dominant_s_count,
  COUNT(ct.id) FILTER (WHERE ct.disc_result->>'dominant' = 'C') AS dominant_c_count,
  
  -- Predominant profile (most common)
  MODE() WITHIN GROUP (ORDER BY ct.disc_result->>'dominant') AS predominant_profile,
  
  -- Dates
  MIN(ct.created_at) AS first_test_date,
  MAX(ct.created_at) AS last_test_date,
  
  -- Usage percentage
  CASE 
    WHEN c.max_tests = 0 THEN 0 -- Unlimited
    ELSE ROUND((COUNT(ct.id)::NUMERIC / c.max_tests) * 100, 2)
  END AS usage_percentage

FROM companies c
LEFT JOIN company_tests ct ON c.id = ct.company_id
GROUP BY c.id, c.name, c.slug, c.active, c.max_tests;

COMMENT ON VIEW company_stats IS 'Aggregated statistics per company for dashboards';

-- FUNCTION: get_company_disc_averages
CREATE OR REPLACE FUNCTION get_company_disc_averages(p_company_id UUID)
RETURNS TABLE (
  avg_d NUMERIC,
  avg_i NUMERIC,
  avg_s NUMERIC,
  avg_c NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    ROUND(AVG((disc_result->'scores'->>'D')::NUMERIC), 2) AS avg_d,
    ROUND(AVG((disc_result->'scores'->>'I')::NUMERIC), 2) AS avg_i,
    ROUND(AVG((disc_result->'scores'->>'S')::NUMERIC), 2) AS avg_s,
    ROUND(AVG((disc_result->'scores'->>'C')::NUMERIC), 2) AS avg_c
  FROM company_tests
  WHERE company_id = p_company_id
    AND status = 'COMPLETED';
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_company_disc_averages IS 'Returns average DISC scores for a company';

-- FUNCTION: check_test_limit
CREATE OR REPLACE FUNCTION check_test_limit(p_company_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  v_max_tests INTEGER;
  v_current_tests INTEGER;
BEGIN
  -- Get max tests limit
  SELECT max_tests INTO v_max_tests
  FROM companies
  WHERE id = p_company_id AND active = true;
  
  -- If company doesn't exist or is inactive, return false
  IF v_max_tests IS NULL THEN
    RETURN FALSE;
  END IF;
  
  -- If unlimited (0), always allow
  IF v_max_tests = 0 THEN
    RETURN TRUE;
  END IF;
  
  -- Count completed tests
  SELECT COUNT(*) INTO v_current_tests
  FROM company_tests
  WHERE company_id = p_company_id
    AND status = 'COMPLETED';
  
  -- Return true if there's still space
  RETURN v_current_tests < v_max_tests;
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION check_test_limit IS 'Checks if a company can perform more tests';

-- FUNCTION: get_company_test_count
CREATE OR REPLACE FUNCTION get_company_test_count(p_company_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO v_count
  FROM company_tests
  WHERE company_id = p_company_id
    AND status = 'COMPLETED';
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql;

COMMENT ON FUNCTION get_company_test_count IS 'Returns the current test count for a company';

-- ============================================
-- MIGRATION 5: Create RLS Policies
-- ============================================

-- Enable RLS on companies
ALTER TABLE companies ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "super_admin_select_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_insert_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_update_companies" ON companies;
DROP POLICY IF EXISTS "super_admin_delete_companies" ON companies;
DROP POLICY IF EXISTS "company_admin_select_own_company" ON companies;
DROP POLICY IF EXISTS "public_select_company_for_test" ON companies;

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

-- Enable RLS on company_tests
ALTER TABLE company_tests ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "super_admin_select_tests" ON company_tests;
DROP POLICY IF EXISTS "company_admin_select_own_tests" ON company_tests;
DROP POLICY IF EXISTS "public_insert_test" ON company_tests;
DROP POLICY IF EXISTS "super_admin_delete_tests" ON company_tests;

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

-- FUNCTION: check_user_permission
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

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Check if tables exist
SELECT 'Tables created:' AS status, table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('companies', 'company_tests');

-- Check if views exist
SELECT 'Views created:' AS status, table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
AND table_name = 'company_stats';

-- Check if functions exist
SELECT 'Functions created:' AS status, routine_name 
FROM information_schema.routines 
WHERE routine_schema = 'public' 
AND routine_name IN ('check_test_limit', 'get_company_disc_averages', 'get_company_test_count', 'check_user_permission');

-- Check if RLS is enabled
SELECT 'RLS enabled:' AS status, tablename, rowsecurity 
FROM pg_tables 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_tests');

-- Check policies
SELECT 'Policies created:' AS status, tablename, COUNT(*) as policy_count
FROM pg_policies 
WHERE schemaname = 'public' 
AND tablename IN ('companies', 'company_tests')
GROUP BY tablename;
