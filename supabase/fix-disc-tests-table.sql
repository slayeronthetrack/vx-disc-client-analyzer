-- Fix disc_tests Table - Add Missing Columns
-- Execute this in Supabase SQL Editor to fix BUG 2
-- Date: 2026-05-06

-- ============================================================================
-- STEP 1: Add Dynamic Test Fields
-- ============================================================================

ALTER TABLE disc_tests
  ADD COLUMN IF NOT EXISTS question_count INTEGER DEFAULT 20 NOT NULL,
  ADD COLUMN IF NOT EXISTS question_source TEXT DEFAULT 'legacy' NOT NULL CHECK (question_source IN ('ai', 'fallback', 'legacy')),
  ADD COLUMN IF NOT EXISTS generated_questions JSONB DEFAULT NULL;

COMMENT ON COLUMN disc_tests.question_count IS 'Number of questions in the test (10-100)';
COMMENT ON COLUMN disc_tests.question_source IS 'Source of questions: ai (OpenAI generated), fallback (local variations), legacy (original 20 questions)';
COMMENT ON COLUMN disc_tests.generated_questions IS 'Full question set with metadata for audit trail (optional)';

-- ============================================================================
-- STEP 2: Add Integrated Profile Fields
-- ============================================================================

ALTER TABLE disc_tests
  ADD COLUMN IF NOT EXISTS value_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS dominant_values TEXT[] DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS value_percentages JSONB DEFAULT NULL;

ALTER TABLE disc_tests
  ADD COLUMN IF NOT EXISTS psychological_scores JSONB DEFAULT NULL,
  ADD COLUMN IF NOT EXISTS psychological_profile JSONB DEFAULT NULL;

ALTER TABLE disc_tests
  ADD COLUMN IF NOT EXISTS integrated_analysis TEXT DEFAULT NULL;

COMMENT ON COLUMN disc_tests.value_scores IS 'Pontuação dos 6 valores: theoretical, economic, aesthetic, social, political, spiritual';
COMMENT ON COLUMN disc_tests.dominant_values IS 'Array com valores dominantes (1-3 valores)';
COMMENT ON COLUMN disc_tests.value_percentages IS 'Percentagens dos valores';
COMMENT ON COLUMN disc_tests.psychological_scores IS 'Pontuação dos 4 eixos psicológicos: energy, perception, decision, organization';
COMMENT ON COLUMN disc_tests.psychological_profile IS 'Perfil psicológico final com tipo dominante em cada eixo';
COMMENT ON COLUMN disc_tests.integrated_analysis IS 'Análise integrada da Marina cruzando DISC + Valores + Tipos Psicológicos';

-- ============================================================================
-- STEP 3: Create Indexes for Performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_disc_tests_question_source ON disc_tests(question_source);
CREATE INDEX IF NOT EXISTS idx_disc_tests_question_count ON disc_tests(question_count);
CREATE INDEX IF NOT EXISTS idx_disc_tests_dominant_values ON disc_tests USING GIN (dominant_values);
CREATE INDEX IF NOT EXISTS idx_disc_tests_value_scores ON disc_tests USING GIN (value_scores);
CREATE INDEX IF NOT EXISTS idx_disc_tests_psychological_profile ON disc_tests USING GIN (psychological_profile);

-- ============================================================================
-- STEP 4: Update Existing Records
-- ============================================================================

UPDATE disc_tests
SET 
  question_count = 20,
  question_source = 'legacy'
WHERE question_count IS NULL OR question_source IS NULL;

-- ============================================================================
-- STEP 5: Verification
-- ============================================================================

-- Show all columns
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'disc_tests'
ORDER BY ordinal_position;

-- Show indexes
SELECT 
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'disc_tests'
ORDER BY indexname;

-- Show sample data
SELECT 
  id,
  user_id,
  question_count,
  question_source,
  dominant_profile,
  created_at
FROM disc_tests
ORDER BY created_at DESC
LIMIT 5;

-- Count records by source
SELECT 
  question_source,
  COUNT(*) as count
FROM disc_tests
GROUP BY question_source;

-- ============================================================================
-- SUCCESS MESSAGE
-- ============================================================================

DO $$
BEGIN
  RAISE NOTICE '✅ Migration completed successfully!';
  RAISE NOTICE 'Table disc_tests now has all required columns for:';
  RAISE NOTICE '  - Dynamic test support (question_count, question_source, generated_questions)';
  RAISE NOTICE '  - Integrated profile (value_scores, dominant_values, psychological_scores, etc.)';
  RAISE NOTICE '  - Performance indexes created';
  RAISE NOTICE '';
  RAISE NOTICE 'Next steps:';
  RAISE NOTICE '  1. Test the application by completing a DISC test';
  RAISE NOTICE '  2. Verify the test saves successfully';
  RAISE NOTICE '  3. Check the result page displays correctly';
END $$;
