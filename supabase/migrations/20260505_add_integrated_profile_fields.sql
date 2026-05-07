-- Migration: Add Integrated Profile Fields
-- Adiciona campos para Teoria dos Valores e Tipos Psicológicos
-- Mantém compatibilidade total com dados existentes

-- Adicionar campos de Valores
ALTER TABLE disc_tests
ADD COLUMN IF NOT EXISTS value_scores JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS dominant_values TEXT[] DEFAULT NULL,
ADD COLUMN IF NOT EXISTS value_percentages JSONB DEFAULT NULL;

-- Adicionar campos de Tipos Psicológicos
ALTER TABLE disc_tests
ADD COLUMN IF NOT EXISTS psychological_scores JSONB DEFAULT NULL,
ADD COLUMN IF NOT EXISTS psychological_profile JSONB DEFAULT NULL;

-- Adicionar campo de análise integrada
ALTER TABLE disc_tests
ADD COLUMN IF NOT EXISTS integrated_analysis TEXT DEFAULT NULL;

-- Comentários para documentação
COMMENT ON COLUMN disc_tests.value_scores IS 'Pontuação dos 6 valores: theoretical, economic, aesthetic, social, political, spiritual';
COMMENT ON COLUMN disc_tests.dominant_values IS 'Array com valores dominantes (1-3 valores)';
COMMENT ON COLUMN disc_tests.value_percentages IS 'Percentagens dos valores';
COMMENT ON COLUMN disc_tests.psychological_scores IS 'Pontuação dos 4 eixos psicológicos: energy, perception, decision, organization';
COMMENT ON COLUMN disc_tests.psychological_profile IS 'Perfil psicológico final com tipo dominante em cada eixo';
COMMENT ON COLUMN disc_tests.integrated_analysis IS 'Análise integrada da Marina cruzando DISC + Valores + Tipos Psicológicos';

-- Índices para melhorar performance de queries
CREATE INDEX IF NOT EXISTS idx_disc_tests_dominant_values ON disc_tests USING GIN (dominant_values);
CREATE INDEX IF NOT EXISTS idx_disc_tests_value_scores ON disc_tests USING GIN (value_scores);
CREATE INDEX IF NOT EXISTS idx_disc_tests_psychological_profile ON disc_tests USING GIN (psychological_profile);

-- Validação: garantir que dados antigos continuam funcionando
-- Testes antigos terão esses campos como NULL, o que é esperado e válido
DO $$
BEGIN
  -- Verificar se há testes existentes
  IF EXISTS (SELECT 1 FROM disc_tests LIMIT 1) THEN
    RAISE NOTICE 'Migration aplicada com sucesso. Testes existentes mantidos com novos campos NULL.';
  ELSE
    RAISE NOTICE 'Migration aplicada. Nenhum teste existente encontrado.';
  END IF;
END $$;
