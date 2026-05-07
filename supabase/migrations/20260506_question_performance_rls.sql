-- Migration: RLS policies for question_performance
-- Description: Row Level Security policies for question_performance table
-- Date: 2026-05-06

-- Enable RLS on question_performance
ALTER TABLE question_performance ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES (Read Access)
-- ============================================================================

-- Policy: Users can read their own performance data
CREATE POLICY "Users can read own performance"
  ON question_performance
  FOR SELECT
  USING (user_id = auth.uid());

-- Policy: Admins can read all performance data
CREATE POLICY "Admins can read all performance"
  ON question_performance
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- INSERT POLICIES (Create Access)
-- ============================================================================

-- Policy: System can insert performance data
-- This allows the API to track performance for any user
-- Uses service role key to bypass RLS
CREATE POLICY "System can insert performance"
  ON question_performance
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can insert their own performance data
CREATE POLICY "Users can insert own performance"
  ON question_performance
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- ============================================================================
-- UPDATE POLICIES (Modify Access)
-- ============================================================================

-- Policy: Users can update their own performance data
-- Allows users to update feedback ratings and completion status
CREATE POLICY "Users can update own performance"
  ON question_performance
  FOR UPDATE
  USING (user_id = auth.uid())
  WITH CHECK (user_id = auth.uid());

-- Policy: Admins can update all performance data
CREATE POLICY "Admins can update all performance"
  ON question_performance
  FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- ============================================================================
-- DELETE POLICIES (Delete Access)
-- ============================================================================

-- Policy: Only admins can delete performance data
CREATE POLICY "Only admins can delete performance"
  ON question_performance
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Users can read own performance" ON question_performance IS 'Allows users to view their own question performance history';
COMMENT ON POLICY "Admins can read all performance" ON question_performance IS 'Allows admins to view all performance data for analytics';
COMMENT ON POLICY "System can insert performance" ON question_performance IS 'Allows system to track performance for any user via service role';
COMMENT ON POLICY "Users can insert own performance" ON question_performance IS 'Allows users to record their own performance data';
COMMENT ON POLICY "Users can update own performance" ON question_performance IS 'Allows users to update their feedback ratings';
COMMENT ON POLICY "Admins can update all performance" ON question_performance IS 'Allows admins to modify any performance data';
COMMENT ON POLICY "Only admins can delete performance" ON question_performance IS 'Restricts performance data deletion to admins only';
