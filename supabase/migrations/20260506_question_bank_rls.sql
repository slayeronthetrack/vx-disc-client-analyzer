-- Migration: RLS policies for question_bank
-- Description: Row Level Security policies for question_bank table
-- Date: 2026-05-06

-- Enable RLS on question_bank
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- SELECT POLICIES (Read Access)
-- ============================================================================

-- Policy: Anyone can read active questions
-- Allows public read access to questions with status='active'
CREATE POLICY "Anyone can read active questions"
  ON question_bank
  FOR SELECT
  USING (status = 'active');

-- Policy: Admins can read all questions (including flagged and archived)
CREATE POLICY "Admins can read all questions"
  ON question_bank
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

-- Policy: Only admins can insert questions
CREATE POLICY "Only admins can insert questions"
  ON question_bank
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Policy: System can insert AI-generated questions
-- This allows the API to insert questions without admin role
-- by using service role key (bypasses RLS)
-- Note: In production, use service role key for AI-generated questions

-- ============================================================================
-- UPDATE POLICIES (Modify Access)
-- ============================================================================

-- Policy: Only admins can update questions
CREATE POLICY "Only admins can update questions"
  ON question_bank
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

-- Policy: Only admins can delete questions
CREATE POLICY "Only admins can delete questions"
  ON question_bank
  FOR DELETE
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- Add comments
COMMENT ON POLICY "Anyone can read active questions" ON question_bank IS 'Allows public read access to active questions for test generation';
COMMENT ON POLICY "Admins can read all questions" ON question_bank IS 'Allows admins to view all questions including flagged and archived';
COMMENT ON POLICY "Only admins can insert questions" ON question_bank IS 'Restricts question creation to admin users only';
COMMENT ON POLICY "Only admins can update questions" ON question_bank IS 'Restricts question updates to admin users only';
COMMENT ON POLICY "Only admins can delete questions" ON question_bank IS 'Restricts question deletion to admin users only';
