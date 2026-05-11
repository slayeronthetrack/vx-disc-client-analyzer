-- EXECUTAR TODOS OS BATCHES DE PERGUNTAS
-- Este arquivo combina todos os 10 batches em transações menores
-- Execute este arquivo INTEIRO no Supabase SQL Editor

-- Batch 1 (100 perguntas)
\i questions_batch_1.sql

-- Batch 2 (100 perguntas)
\i questions_batch_2.sql

-- Batch 3 (100 perguntas)
\i questions_batch_3.sql

-- Batch 4 (100 perguntas)
\i questions_batch_4.sql

-- Batch 5 (100 perguntas)
\i questions_batch_5.sql

-- Batch 6 (100 perguntas)
\i questions_batch_6.sql

-- Batch 7 (100 perguntas)
\i questions_batch_7.sql

-- Batch 8 (100 perguntas)
\i questions_batch_8.sql

-- Batch 9 (100 perguntas)
\i questions_batch_9.sql

-- Batch 10 (100 perguntas)
\i questions_batch_10.sql

-- Verificar total inserido
SELECT COUNT(*) as total_perguntas FROM question_bank;
