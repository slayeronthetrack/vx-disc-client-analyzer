-- Fix RLS Policies for disc_tests Table
-- Execute this in Supabase SQL Editor
-- Date: 2026-05-06

-- ============================================================================
-- STEP 1: Enable RLS (if not already enabled)
-- ============================================================================

ALTER TABLE disc_tests ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- STEP 2: Drop existing policies (if any)
-- ============================================================================

DROP POLICY IF EXISTS "Users can insert their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can view their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can update their own tests" ON disc_tests;
DROP POLICY IF EXISTS "Users can delete their own tests" ON disc_tests;

-- ============================================================================
-- STEP 3: Create new policies
-- ============================================================================

-- Policy: INSERT - Users can insert their own tests
CREATE POLICY "Users can insert their own tests"
ON disc_tests
FOR INSERT
TO authenticated
WITH CHECK (auth.uid() = user_id);

-- Policy: SELECT - Users can view their own tests
CREATE POLICY "Users can view their own tests"
ON disc_tests
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Policy: UPDATE - Users can update their own tests
CREATE POLICY "Users can update their own tests"
ON disc_tests
FOR UPDATE
TO authenticated
USING (auth.uid() = user_id)
WITH CHECK (auth.uid() = user_id);

-- Policy: DELETE - Users can delete their own tests (optional)
CREATE POLICY "Users can delete their own tests"
ON disc_tests
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

-- ============================================================================
-- STEP 4: Verify policies
-- ============================================================================

SELECT 
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'disc_tests'
ORDER BY policyname;

-- ============================================================================
-- STEP 5: Test INSERT (optional - replace with real user_id)
-- ============================================================================

-- This will fail if not authenticated:
-- INSERT INTO disc_tests (user_id, questions, answers, result, ai_analysis, dominant_profile, scores)
-- VALUES ('test-user-id', '[]'::jsonb, '[]'::jsonb, '{}'::jsonb, 'Test', 'D', '{"D":10,"I":5,"S":3,"C":2}'::jsonb);

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ RLS Policies configured successfully!';
  RAISE NOTICE '';
  RAISE NOTICE 'Policies created:';
  RAISE NOTICE '  1. INSERT - Users can insert their own tests (authenticated only)';
  RAISE NOTICE '  2. SELECT - Users can view their own tests (authenticated only)';
  RAISE NOTICE '  3. UPDATE - Users can update their own tests (authenticated only)';
  RAISE NOTICE '  4. DELETE - Users can delete their own tests (authenticated only)';
  RAISE NOTICE '';
  RAISE NOTICE 'Security:';
  RAISE NOTICE '  ✅ RLS enabled';
  RAISE NOTICE '  ✅ Only authenticated users can access';
  RAISE NOTICE '  ✅ Users can only access their own data (auth.uid() = user_id)';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test the application with authenticated user';
  RAISE NOTICE '  2. Verify INSERT works correctly';
  RAISE NOTICE '  3. Verify SELECT returns only user data';
END $$;

