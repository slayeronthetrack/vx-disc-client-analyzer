-- ============================================
-- MIGRATION: Create Company Tests Table
-- Description: Creates the company_tests table to store DISC test results for company employees
-- Date: 2026-05-08
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
CREATE INDEX idx_company_tests_company_id ON company_tests(company_id, created_at DESC);
CREATE INDEX idx_company_tests_email ON company_tests(company_id, email);
CREATE INDEX idx_company_tests_employee_id ON company_tests(employee_id, created_at DESC);
CREATE INDEX idx_company_tests_status ON company_tests(status);
CREATE INDEX idx_company_tests_department ON company_tests(department) WHERE department IS NOT NULL;

-- Create GIN index for JSONB search
CREATE INDEX idx_company_tests_disc_result ON company_tests USING GIN (disc_result);
CREATE INDEX idx_company_tests_answers ON company_tests USING GIN (answers);

-- Add comments for documentation
COMMENT ON TABLE company_tests IS 'DISC test results for company employees';
COMMENT ON COLUMN company_tests.employee_id IS 'UUID generated based on email to link multiple tests from same employee';
COMMENT ON COLUMN company_tests.disc_result IS 'Complete DISC result in JSON format';
COMMENT ON COLUMN company_tests.attempt_number IS 'Test attempt number (1, 2, 3...) for tracking retests';
COMMENT ON COLUMN company_tests.status IS 'Current status of the test';
