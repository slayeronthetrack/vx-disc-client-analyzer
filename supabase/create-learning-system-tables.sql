-- Migration: Learning System Tables
-- Tabelas para sistema de aprendizado contínuo

-- ============================================
-- 1. TABELA: discovered_profiles
-- Armazena perfis profissionais descobertos automaticamente
-- ============================================

CREATE TABLE IF NOT EXISTS discovered_profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  job_title TEXT NOT NULL,
  normalized_title TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_titles TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_discovered_profiles_category 
  ON discovered_profiles(category);
CREATE INDEX IF NOT EXISTS idx_discovered_profiles_frequency 
  ON discovered_profiles(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_profiles_normalized 
  ON discovered_profiles(normalized_title);

-- Comentários
COMMENT ON TABLE discovered_profiles IS 'Perfis profissionais descobertos automaticamente pelo sistema';
COMMENT ON COLUMN discovered_profiles.job_title IS 'Título do cargo original';
COMMENT ON COLUMN discovered_profiles.normalized_title IS 'Título normalizado (lowercase, sem caracteres especiais)';
COMMENT ON COLUMN discovered_profiles.category IS 'Categoria do cargo (vendas, lideranca, tecnologia, etc)';
COMMENT ON COLUMN discovered_profiles.frequency IS 'Quantas vezes este perfil foi visto';
COMMENT ON COLUMN discovered_profiles.last_seen IS 'Última vez que este perfil foi usado';
COMMENT ON COLUMN discovered_profiles.related_titles IS 'Títulos relacionados/similares';

-- ============================================
-- 2. TABELA: discovered_objectives
-- Armazena objetivos de teste descobertos automaticamente
-- ============================================

CREATE TABLE IF NOT EXISTS discovered_objectives (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  objective TEXT NOT NULL,
  normalized_objective TEXT NOT NULL UNIQUE,
  category TEXT NOT NULL,
  frequency INTEGER DEFAULT 1,
  last_seen TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  related_objectives TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_discovered_objectives_category 
  ON discovered_objectives(category);
CREATE INDEX IF NOT EXISTS idx_discovered_objectives_frequency 
  ON discovered_objectives(frequency DESC);
CREATE INDEX IF NOT EXISTS idx_discovered_objectives_normalized 
  ON discovered_objectives(normalized_objective);

-- Comentários
COMMENT ON TABLE discovered_objectives IS 'Objetivos de teste descobertos automaticamente pelo sistema';
COMMENT ON COLUMN discovered_objectives.objective IS 'Objetivo original';
COMMENT ON COLUMN discovered_objectives.normalized_objective IS 'Objetivo normalizado';
COMMENT ON COLUMN discovered_objectives.category IS 'Categoria do objetivo (autoconhecimento, desenvolvimento, etc)';
COMMENT ON COLUMN discovered_objectives.frequency IS 'Quantas vezes este objetivo foi visto';
COMMENT ON COLUMN discovered_objectives.last_seen IS 'Última vez que este objetivo foi usado';
COMMENT ON COLUMN discovered_objectives.related_objectives IS 'Objetivos relacionados/similares';

-- ============================================
-- 3. TABELA: learning_insights
-- Armazena insights gerados pelo sistema de aprendizado
-- ============================================

CREATE TABLE IF NOT EXISTS learning_insights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  insight_type TEXT NOT NULL, -- 'new_profile', 'new_objective', 'question_pattern', 'performance_trend'
  title TEXT NOT NULL,
  description TEXT,
  data JSONB,
  confidence_score DECIMAL(3,2) DEFAULT 0.5, -- 0.0 a 1.0
  status TEXT DEFAULT 'pending', -- 'pending', 'reviewed', 'applied', 'rejected'
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  reviewed_at TIMESTAMP WITH TIME ZONE,
  reviewed_by UUID REFERENCES auth.users(id)
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_learning_insights_type 
  ON learning_insights(insight_type);
CREATE INDEX IF NOT EXISTS idx_learning_insights_status 
  ON learning_insights(status);
CREATE INDEX IF NOT EXISTS idx_learning_insights_confidence 
  ON learning_insights(confidence_score DESC);

-- Comentários
COMMENT ON TABLE learning_insights IS 'Insights gerados automaticamente pelo sistema de aprendizado';
COMMENT ON COLUMN learning_insights.insight_type IS 'Tipo de insight descoberto';
COMMENT ON COLUMN learning_insights.confidence_score IS 'Confiança no insight (0.0 a 1.0)';
COMMENT ON COLUMN learning_insights.status IS 'Status da revisão do insight';

-- ============================================
-- 4. TABELA: question_feedback
-- Armazena feedback detalhado de cada pergunta respondida
-- ============================================

CREATE TABLE IF NOT EXISTS question_feedback (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  test_id UUID REFERENCES disc_tests(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  question_id TEXT NOT NULL,
  question_text TEXT NOT NULL,
  response_time_ms INTEGER NOT NULL,
  was_changed BOOLEAN DEFAULT FALSE,
  final_answer TEXT[] NOT NULL,
  user_context JSONB, -- job_title, company, test_objective, etc
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Índices
CREATE INDEX IF NOT EXISTS idx_question_feedback_test 
  ON question_feedback(test_id);
CREATE INDEX IF NOT EXISTS idx_question_feedback_user 
  ON question_feedback(user_id);
CREATE INDEX IF NOT EXISTS idx_question_feedback_question 
  ON question_feedback(question_id);
CREATE INDEX IF NOT EXISTS idx_question_feedback_response_time 
  ON question_feedback(response_time_ms);

-- Comentários
COMMENT ON TABLE question_feedback IS 'Feedback detalhado de cada pergunta respondida';
COMMENT ON COLUMN question_feedback.response_time_ms IS 'Tempo de resposta em milissegundos';
COMMENT ON COLUMN question_feedback.was_changed IS 'Se o usuário mudou a resposta';
COMMENT ON COLUMN question_feedback.final_answer IS 'Resposta final do usuário';

-- ============================================
-- 5. RLS POLICIES
-- ============================================

-- discovered_profiles: Apenas admins podem ver
ALTER TABLE discovered_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discovered profiles"
  ON discovered_profiles
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- discovered_objectives: Apenas admins podem ver
ALTER TABLE discovered_objectives ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view discovered objectives"
  ON discovered_objectives
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- learning_insights: Apenas admins podem ver
ALTER TABLE learning_insights ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view learning insights"
  ON learning_insights
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM profiles
      WHERE profiles.user_id = auth.uid()
      AND profiles.role = 'admin'
    )
  );

-- question_feedback: Usuários veem apenas próprio feedback
ALTER TABLE question_feedback ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own feedback"
  ON question_feedback
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "System can insert feedback"
  ON question_feedback
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================
-- 6. FUNCTIONS
-- ============================================

-- Função para obter perfis mais frequentes
CREATE OR REPLACE FUNCTION get_top_profiles(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  job_title TEXT,
  category TEXT,
  frequency INTEGER,
  last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dp.job_title,
    dp.category,
    dp.frequency,
    dp.last_seen
  FROM discovered_profiles dp
  ORDER BY dp.frequency DESC, dp.last_seen DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para obter objetivos mais frequentes
CREATE OR REPLACE FUNCTION get_top_objectives(limit_count INTEGER DEFAULT 10)
RETURNS TABLE (
  objective TEXT,
  category TEXT,
  frequency INTEGER,
  last_seen TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    dobj.objective,
    dobj.category,
    dobj.frequency,
    dobj.last_seen
  FROM discovered_objectives dobj
  ORDER BY dobj.frequency DESC, dobj.last_seen DESC
  LIMIT limit_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Função para gerar insights automáticos
CREATE OR REPLACE FUNCTION generate_learning_insights()
RETURNS INTEGER AS $$
DECLARE
  insights_created INTEGER := 0;
  profile_record RECORD;
  objective_record RECORD;
BEGIN
  -- Detectar novos perfis com alta frequência
  FOR profile_record IN 
    SELECT * FROM discovered_profiles 
    WHERE frequency >= 5 
    AND category = 'outros'
    AND NOT EXISTS (
      SELECT 1 FROM learning_insights 
      WHERE insight_type = 'new_profile' 
      AND data->>'normalized_title' = profile_record.normalized_title
    )
  LOOP
    INSERT INTO learning_insights (
      insight_type,
      title,
      description,
      data,
      confidence_score
    ) VALUES (
      'new_profile',
      'Novo perfil profissional detectado: ' || profile_record.job_title,
      'Este perfil foi usado ' || profile_record.frequency || ' vezes. Considere criar personalização específica.',
      jsonb_build_object(
        'job_title', profile_record.job_title,
        'normalized_title', profile_record.normalized_title,
        'frequency', profile_record.frequency
      ),
      LEAST(1.0, profile_record.frequency / 10.0)
    );
    insights_created := insights_created + 1;
  END LOOP;

  -- Detectar novos objetivos com alta frequência
  FOR objective_record IN 
    SELECT * FROM discovered_objectives 
    WHERE frequency >= 5 
    AND category = 'outros'
    AND NOT EXISTS (
      SELECT 1 FROM learning_insights 
      WHERE insight_type = 'new_objective' 
      AND data->>'normalized_objective' = objective_record.normalized_objective
    )
  LOOP
    INSERT INTO learning_insights (
      insight_type,
      title,
      description,
      data,
      confidence_score
    ) VALUES (
      'new_objective',
      'Novo objetivo detectado: ' || objective_record.objective,
      'Este objetivo foi usado ' || objective_record.frequency || ' vezes. Considere criar personalização específica.',
      jsonb_build_object(
        'objective', objective_record.objective,
        'normalized_objective', objective_record.normalized_objective,
        'frequency', objective_record.frequency
      ),
      LEAST(1.0, objective_record.frequency / 10.0)
    );
    insights_created := insights_created + 1;
  END LOOP;

  RETURN insights_created;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================
-- 7. TRIGGERS
-- ============================================

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_discovered_profiles_updated_at
  BEFORE UPDATE ON discovered_profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_discovered_objectives_updated_at
  BEFORE UPDATE ON discovered_objectives
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 8. INITIAL DATA
-- ============================================

-- Inserir categorias iniciais conhecidas
INSERT INTO discovered_profiles (job_title, normalized_title, category, frequency)
VALUES 
  ('Gerente de Vendas', 'gerente-de-vendas', 'vendas', 0),
  ('Desenvolvedor', 'desenvolvedor', 'tecnologia', 0),
  ('Analista de Marketing', 'analista-de-marketing', 'marketing', 0),
  ('Coordenador de RH', 'coordenador-de-rh', 'rh', 0),
  ('Analista Financeiro', 'analista-financeiro', 'financeiro', 0)
ON CONFLICT (normalized_title) DO NOTHING;

INSERT INTO discovered_objectives (objective, normalized_objective, category, frequency)
VALUES 
  ('Autoconhecimento', 'autoconhecimento', 'autoconhecimento', 0),
  ('Desenvolvimento profissional', 'desenvolvimento-profissional', 'desenvolvimento', 0),
  ('Melhorar liderança', 'melhorar-lideranca', 'lideranca', 0),
  ('Melhorar comunicação', 'melhorar-comunicacao', 'comunicacao', 0),
  ('Crescimento de carreira', 'crescimento-de-carreira', 'carreira', 0)
ON CONFLICT (normalized_objective) DO NOTHING;

-- ============================================
-- MENSAGEM DE SUCESSO
-- ============================================

DO $$
BEGIN
  RAISE NOTICE '✅ Learning System tables created successfully!';
  RAISE NOTICE '📊 Tables: discovered_profiles, discovered_objectives, learning_insights, question_feedback';
  RAISE NOTICE '🔐 RLS policies configured';
  RAISE NOTICE '⚡ Functions: get_top_profiles(), get_top_objectives(), generate_learning_insights()';
  RAISE NOTICE '🎯 System ready to learn from user behavior!';
END $$;
