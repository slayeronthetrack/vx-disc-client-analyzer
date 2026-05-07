-- Migration: Create performance indexes
-- Description: Add indexes for optimized query performance on question_bank and question_performance tables
-- Date: 2026-05-06

-- ============================================================================
-- QUESTION_BANK INDEXES
-- ============================================================================

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

-- ============================================================================
-- QUESTION_PERFORMANCE INDEXES
-- ============================================================================

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
COMMENT ON INDEX idx_question_performance_metrics IS 'Optimizes metrics aggregation queries for performance tracking';
