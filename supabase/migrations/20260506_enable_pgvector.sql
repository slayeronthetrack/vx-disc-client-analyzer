-- Migration: Enable pgvector extension
-- Description: Enable pgvector extension for semantic similarity matching using embeddings
-- Date: 2026-05-06

-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create vector similarity index on question_bank.embedding_vector
-- Using ivfflat index with cosine distance for efficient similarity search
-- Note: This index will be created after initial data is loaded
-- Lists parameter (100) is suitable for up to 10,000 vectors
CREATE INDEX IF NOT EXISTS idx_question_bank_embedding 
  ON question_bank 
  USING ivfflat (embedding_vector vector_cosine_ops)
  WITH (lists = 100);

-- Add comment
COMMENT ON EXTENSION vector IS 'pgvector extension for storing and querying vector embeddings';
COMMENT ON INDEX idx_question_bank_embedding IS 'IVFFlat index for fast cosine similarity search on question embeddings (OpenAI text-embedding-3-small, 1536 dimensions)';

-- Note: For optimal performance with ivfflat index:
-- 1. The index should be created AFTER loading initial data
-- 2. The 'lists' parameter should be adjusted based on data size:
--    - lists = sqrt(total_rows) is a good starting point
--    - For 10,000 questions: lists = 100
--    - For 100,000 questions: lists = 316
-- 3. Query performance: set ivfflat.probes = lists/10 for good recall
