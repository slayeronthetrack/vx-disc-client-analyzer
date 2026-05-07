-- Migration: Create question_bank table
-- Description: Centralized database for storing pre-approved, validated behavioral assessment questions
-- Date: 2026-05-06

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
