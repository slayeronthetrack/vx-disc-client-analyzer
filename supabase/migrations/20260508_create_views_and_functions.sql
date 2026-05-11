-- ============================================
-- MIGRATION: Create Views and Functions
-- Description: Creates helper views and functions for company statistics and test limits
-- Date: 2026-05-08
-- ============================================

-- ============================================
-- VIEW: company_stats
-- Aggregated statistics per company for dashboards
-- ============================================

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

-- ============================================
-- FUNCTION: get_company_disc_averages
-- Calculates average DISC scores for a company
-- ============================================

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

-- ============================================
-- FUNCTION: check_test_limit
-- Checks if a company has reached its test limit
-- ============================================

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

-- ============================================
-- FUNCTION: get_company_test_count
-- Gets current test count for a company
-- ============================================

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
