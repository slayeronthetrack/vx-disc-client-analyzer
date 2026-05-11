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
