-- Apply all migrations for Intelligent Question Bank
-- Execute this file in Supabase SQL Editor
-- Date: 2026-05-06

-- ============================================================================
-- MIGRATION 1: Enable pgvector extension
-- ============================================================================

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

COMMENT ON EXTENSION vector IS 'pgvector extension for storing and querying vector embeddings';

-- ============================================================================
-- MIGRATION 2: Create question_bank table
-- ============================================================================

-- Enable UUID extension if not already enabled
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create question_bank table
CREATE TABLE IF NOT EXISTS question_bank (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Question Content
  question_text TEXT NOT NULL,
  options JSONB NOT NULL, -- Array of QuestionOption with text, type, value_type, psych_traits
  
  -- DISC Classification
  disc_type VARCHAR(1) NOT NULL CHECK (disc_type IN ('D', 'I', 'S', 'C')),
  
  -- Integrated Profile Metadata
  value_types TEXT[] DEFAULT '{}', -- Array of ValueType
  psychological_traits JSONB DEFAULT '{}', -- PsychologicalTraits coverage
  
  -- Context Tags
  context_tags TEXT[] DEFAULT '{}', -- General context tags
  profession_tags TEXT[] DEFAULT '{}', -- e.g., ['sales', 'engineering']
  seniority_tags TEXT[] DEFAULT '{}', -- e.g., ['junior', 'mid', 'senior']
  objective_tags TEXT[] DEFAULT '{}', -- e.g., ['hiring', 'self-knowledge']
  industry_tags TEXT[] DEFAULT '{}', -- e.g., ['technology', 'finance']
  
  -- Difficulty
  difficulty_level VARCHAR(10) DEFAULT 'medium' CHECK (difficulty_level IN ('easy', 'medium', 'hard')),
  
  -- Quality Metrics
  quality_score INTEGER DEFAULT 70 CHECK (quality_score >= 0 AND quality_score <= 100),
  clarity_score INTEGER DEFAULT 70 CHECK (clarity_score >= 0 AND clarity_score <= 100),
  discrimination_power DECIMAL(3,2) DEFAULT 0.50 CHECK (discrimination_power >= 0 AND discrimination_power <= 1),
  
  -- Usage Metrics
  usage_count INTEGER DEFAULT 0,
  completion_rate DECIMAL(5,2) DEFAULT 100.00 CHECK (completion_rate >= 0 AND completion_rate <= 100),
  user_feedback_score DECIMAL(3,2) DEFAULT 3.00 CHECK (user_feedback_score >= 0 AND user_feedback_score <= 5),
  
  -- Timestamps
  created_at TIMESTAMPTZ DEFAULT NOW(),
  last_used_at TIMESTAMPTZ,
  last_updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  -- Status
  status VARCHAR(20) DEFAULT 'active' CHECK (status IN ('active', 'flagged', 'archived')),
  source VARCHAR(20) DEFAULT 'static' CHECK (source IN ('static', 'ai-generated', 'manual')),
  
  -- Metadata
  created_by UUID REFERENCES auth.users(id),
  embedding_vector VECTOR(1536), -- For semantic similarity (requires pgvector extension)
  
  -- Constraints
  CONSTRAINT question_text_not_empty CHECK (LENGTH(question_text) > 10)
);

-- Add comment to table
COMMENT ON TABLE question_bank IS 'Centralized database storing pre-approved, validated behavioral assessment questions with metadata';

-- Add comments to important columns
COMMENT ON COLUMN question_bank.options IS 'JSONB array of question options with text, type, value_type, and psych_traits';
COMMENT ON COLUMN question_bank.quality_score IS 'Calculated quality score (0-100) based on clarity, discrimination, completion rate, and feedback';
COMMENT ON COLUMN question_bank.discrimination_power IS 'Statistical measure (0-1) of how well question differentiates between behavioral profiles';
COMMENT ON COLUMN question_bank.embedding_vector IS 'OpenAI embedding vector (1536 dimensions) for semantic similarity matching';

-- ============================================================================
-- MIGRATION 3: Create question_performance table
-- ============================================================================

-- Create question_performance table
CREATE TABLE IF NOT EXISTS question_performance (
  -- Primary Key
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Foreign Keys
  question_id UUID NOT NULL REFERENCES question_bank(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  test_id UUID REFERENCES disc_tests(id) ON DELETE SET NULL,
  
  -- Usage Context
  user_context JSONB NOT NULL, -- { job_title, company, test_objective, seniority, industry }
  
  -- Performance Metrics
  selected_at TIMESTAMPTZ DEFAULT NOW(),
  completed BOOLEAN DEFAULT FALSE,
  time_to_answer INTEGER, -- seconds
  user_feedback_rating INTEGER CHECK (user_feedback_rating >= 1 AND user_feedback_rating <= 5),
  
  -- Result Context
  selected_option_disc_type VARCHAR(1) CHECK (selected_option_disc_type IN ('D', 'I', 'S', 'C')),
  resulting_dominant_profile VARCHAR(1) CHECK (resulting_dominant_profile IN ('D', 'I', 'S', 'C')),
  
  -- Metadata
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add comment to table
COMMENT ON TABLE question_performance IS 'Tracks question usage metrics and performance data for continuous learning and quality score updates';

-- Add comments to important columns
COMMENT ON COLUMN question_performance.user_context IS 'JSONB object containing user context: job_title, company, test_objective, seniority, industry';
COMMENT ON COLUMN question_performance.time_to_answer IS 'Time taken to answer the question in seconds';
COMMENT ON COLUMN question_performance.selected_option_disc_type IS 'DISC type of the option selected by the user';
COMMENT ON COLUMN question_performance.resulting_dominant_profile IS 'User''s dominant DISC profile after completing the test';

-- ============================================================================
-- MIGRATION 4: Create indexes
-- ============================================================================

-- QUESTION_BANK INDEXES

-- Index for quality score (DESC for high-quality questions first)
CREATE INDEX IF NOT EXISTS idx_question_bank_quality_score 
  ON question_bank(quality_score DESC);

-- Index for DISC type filtering
CREATE INDEX IF NOT EXISTS idx_question_bank_disc_type 
  ON question_bank(disc_type);

-- Index for status filtering
CREATE INDEX IF NOT EXISTS idx_question_bank_status 
  ON question_bank(status);

-- Index for last_used_at (DESC NULLS LAST for recency prioritization)
CREATE INDEX IF NOT EXISTS idx_question_bank_last_used 
  ON question_bank(last_used_at DESC NULLS LAST);

-- GIN indexes for array fields (context tags)
CREATE INDEX IF NOT EXISTS idx_question_bank_context_tags 
  ON question_bank USING GIN(context_tags);

CREATE INDEX IF NOT EXISTS idx_question_bank_profession_tags 
  ON question_bank USING GIN(profession_tags);

CREATE INDEX IF NOT EXISTS idx_question_bank_seniority_tags 
  ON question_bank USING GIN(seniority_tags);

CREATE INDEX IF NOT EXISTS idx_question_bank_objective_tags 
  ON question_bank USING GIN(objective_tags);

CREATE INDEX IF NOT EXISTS idx_question_bank_industry_tags 
  ON question_bank USING GIN(industry_tags);

-- Composite index for common search queries (status + quality_score + disc_type)
CREATE INDEX IF NOT EXISTS idx_question_bank_search 
  ON question_bank(status, quality_score DESC, disc_type);

-- Index for created_at (for sorting by newest)
CREATE INDEX IF NOT EXISTS idx_question_bank_created_at 
  ON question_bank(created_at DESC);

-- Vector similarity index (will be created after data is loaded)
CREATE INDEX IF NOT EXISTS idx_question_bank_embedding 
  ON question_bank 
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- QUESTION_PERFORMANCE INDEXES

-- Index for question_id (frequent lookups for metrics aggregation)
CREATE INDEX IF NOT EXISTS idx_question_performance_question_id 
  ON question_performance(question_id);

-- Index for user_id (user-specific performance queries)
CREATE INDEX IF NOT EXISTS idx_question_performance_user_id 
  ON question_performance(user_id);

-- Index for test_id (test-specific performance queries)
CREATE INDEX IF NOT EXISTS idx_question_performance_test_id 
  ON question_performance(test_id);

-- Index for selected_at (time-based queries and trends)
CREATE INDEX IF NOT EXISTS idx_question_performance_selected_at 
  ON question_performance(selected_at DESC);

-- Index for completed (filtering completed vs abandoned questions)
CREATE INDEX IF NOT EXISTS idx_question_performance_completed 
  ON question_performance(completed);

-- Composite index for question metrics aggregation (question_id + completed + selected_at)
CREATE INDEX IF NOT EXISTS idx_question_performance_metrics 
  ON question_performance(question_id, completed, selected_at DESC);

-- Add comments
COMMENT ON INDEX idx_question_bank_quality_score IS 'Optimizes queries filtering by quality score';
COMMENT ON INDEX idx_question_bank_search IS 'Optimizes common search queries combining status, quality, and DISC type';
COMMENT ON INDEX idx_question_bank_context_tags IS 'GIN index for fast array containment queries on context tags';
COMMENT ON INDEX idx_question_bank_embedding IS 'IVFFlat index for fast cosine similarity search on question embeddings (OpenAI text-embedding-3-small, 1536 dimensions)';
COMMENT ON INDEX idx_question_performance_metrics IS 'Optimizes metrics aggregation queries for performance tracking';

-- ============================================================================
-- MIGRATION 5: RLS policies for question_bank
-- ============================================================================

-- Enable RLS on question_bank
ALTER TABLE question_bank ENABLE ROW LEVEL SECURITY;

-- SELECT POLICIES (Read Access)

-- Policy: Anyone can read active questions
CREATE POLICY "Anyone can read active questions"
  ON question_bank
  FOR SELECT
  USING (status = 'active');

-- Policy: Admins can read all questions
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

-- INSERT POLICIES (Create Access)

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

-- UPDATE POLICIES (Modify Access)

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

-- DELETE POLICIES (Delete Access)

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

-- ============================================================================
-- MIGRATION 6: RLS policies for question_performance
-- ============================================================================

-- Enable RLS on question_performance
ALTER TABLE question_performance ENABLE ROW LEVEL SECURITY;

-- SELECT POLICIES (Read Access)

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

-- INSERT POLICIES (Create Access)

-- Policy: System can insert performance data
CREATE POLICY "System can insert performance"
  ON question_performance
  FOR INSERT
  WITH CHECK (true);

-- Policy: Users can insert their own performance data
CREATE POLICY "Users can insert own performance"
  ON question_performance
  FOR INSERT
  WITH CHECK (user_id = auth.uid());

-- UPDATE POLICIES (Modify Access)

-- Policy: Users can update their own performance data
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

-- DELETE POLICIES (Delete Access)

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

-- ============================================================================
-- VERIFICATION
-- ============================================================================

-- Verify tables were created
SELECT 
  'question_bank' as table_name,
  COUNT(*) as row_count
FROM question_bank
UNION ALL
SELECT 
  'question_performance' as table_name,
  COUNT(*) as row_count
FROM question_performance;

-- Show all indexes
SELECT 
  schemaname,
  tablename,
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename IN ('question_bank', 'question_performance')
ORDER BY tablename, indexname;

-- Show all RLS policies
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
WHERE tablename IN ('question_bank', 'question_performance')
ORDER BY tablename, policyname;
