-- Migration: Create question_performance table
-- Description: Track question usage metrics and performance data for continuous learning
-- Date: 2026-05-06

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
