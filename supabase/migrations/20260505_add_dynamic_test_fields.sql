-- Migration: Add Dynamic Test Fields to disc_tests
-- Date: 2026-05-05
-- Description: Adds support for AI-generated dynamic DISC tests with configurable question counts

-- Add new columns to disc_tests table
ALTER TABLE disc_tests
  ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 20 NOT NULL,
  ADD COLUMN IF NOT EXISTS question_source TEXT DEFAULT 'legacy' NOT NULL CHECK (question_source IN ('ai', 'fallback', 'legacy')),
  ADD COLUMN IF NOT EXISTS generated_questions JSONB;

-- Add comments for documentation
COMMENT ON COLUMN disc_tests.question_count IS 'Number of questions in the test (10-100)';
COMMENT ON COLUMN disc_tests.question_source IS 'Source of questions: ai (OpenAI generated), fallback (local variations), legacy (original 20 questions)';
COMMENT ON COLUMN disc_tests.generated_questions IS 'Full question set with metadata for audit trail (optional)';

-- Update existing records with default values
UPDATE disc_tests
SET 
  question_count = 20,
  question_source = 'legacy'
WHERE question_count IS NULL OR question_source IS NULL;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_disc_tests_question_source ON disc_tests(question_source);
CREATE INDEX IF NOT EXISTS idx_disc_tests_question_count ON disc_tests(question_count);

-- Verify migration
DO $$
BEGIN
  -- Check if columns exist
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'question_count'
  ) THEN
    RAISE EXCEPTION 'Migration failed: question_count column not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'question_source'
  ) THEN
    RAISE EXCEPTION 'Migration failed: question_source column not created';
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'disc_tests' AND column_name = 'generated_questions'
  ) THEN
    RAISE EXCEPTION 'Migration failed: generated_questions column not created';
  END IF;

  RAISE NOTICE 'Migration completed successfully!';
END $$;

-- Display summary
SELECT 
  'disc_tests' as table_name,
  COUNT(*) as total_records,
  COUNT(CASE WHEN question_source = 'legacy' THEN 1 END) as legacy_tests,
  COUNT(CASE WHEN question_source = 'ai' THEN 1 END) as ai_tests,
  COUNT(CASE WHEN question_source = 'fallback' THEN 1 END) as fallback_tests
FROM disc_tests;
