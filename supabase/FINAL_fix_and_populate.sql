-- FINAL: FIX E POPULAR BANCO - CORRIGIDO
-- Execute no Supabase SQL Editor
-- Tempo: 30 segundos

-- ============================================================================
-- PARTE 1: CORRIGIR FUNÇÃO
-- ============================================================================

DROP FUNCTION IF EXISTS select_questions_optimized(INTEGER, INTEGER, TEXT[], TEXT[]);

CREATE OR REPLACE FUNCTION select_questions_optimized(
  p_question_count INTEGER DEFAULT 20,
  p_min_quality_score INTEGER DEFAULT 60,
  p_context_tags TEXT[] DEFAULT NULL,
  p_profession_tags TEXT[] DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  question_text TEXT,
  options JSONB,
  disc_type TEXT,
  value_types TEXT[],
  psychological_traits JSONB,
  context_tags TEXT[],
  profession_tags TEXT[],
  difficulty_level TEXT,
  quality_score INTEGER
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    qb.id,
    qb.question_text,
    qb.options,
    qb.disc_type,
    qb.value_types,
    qb.psychological_traits,
    qb.context_tags,
    qb.profession_tags,
    qb.difficulty_level,
    qb.quality_score
  FROM question_bank qb
  WHERE qb.status = 'active'
    AND qb.quality_score >= p_min_quality_score
    AND (p_context_tags IS NULL OR qb.context_tags && p_context_tags)
    AND (p_profession_tags IS NULL OR qb.profession_tags && p_profession_tags)
  ORDER BY qb.quality_score DESC, RANDOM()
  LIMIT p_question_count;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- PARTE 2: POPULAR BANCO (60 PERGUNTAS)
-- ============================================================================

-- Liderança (15 perguntas)
INSERT INTO question_bank (question_text, options, disc_type, value_types, context_tags, profession_tags, difficulty_level, quality_score, status, source) VALUES
('Ao liderar uma equipe, meu foco principal é:', '[{"text":"Alcançar resultados rapidamente","type":"D","valueType":"economic"},{"text":"Motivar e engajar as pessoas","type":"I","valueType":"social"},{"text":"Manter harmonia e estabilidade","type":"S","valueType":"social"},{"text":"Garantir processos e qualidade","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social','theoretical'], ARRAY['liderança'], ARRAY['gestão'], 'medium', 85, 'active', 'manual'),
('Como líder, quando surge um conflito:', '[{"text":"Intervenho imediatamente","type":"D","valueType":"economic"},{"text":"Facilito o diálogo","type":"I","valueType":"social"},{"text":"Entendo todos os lados","type":"S","valueType":"social"},{"text":"Analiso fatos primeiro","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['conflitos','liderança'], ARRAY['gestão'], 'medium', 82, 'active', 'manual'),
('Ao delegar tarefas importantes:', '[{"text":"Defino objetivos e cobro resultados","type":"D","valueType":"economic"},{"text":"Explico a importância e motivo","type":"I","valueType":"social"},{"text":"Garanto que a pessoa se sinta confortável","type":"S","valueType":"social"},{"text":"Forneço instruções detalhadas","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['delegação','liderança'], ARRAY['gestão'], 'medium', 88, 'active', 'manual'),
('Meu estilo de feedback é:', '[{"text":"Direto e focado em melhorias","type":"D","valueType":"economic"},{"text":"Positivo e encorajador","type":"I","valueType":"social"},{"text":"Cuidadoso e empático","type":"S","valueType":"social"},{"text":"Baseado em dados e exemplos","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['feedback','liderança'], ARRAY['gestão'], 'medium', 86, 'active', 'manual'),
('Ao tomar decisões estratégicas:', '[{"text":"Decido rapidamente com base na experiência","type":"D","valueType":"economic"},{"text":"Consulto a equipe e busco consenso","type":"I","valueType":"social"},{"text":"Avalio o impacto em todos","type":"S","valueType":"social"},{"text":"Analiso dados e cenários","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','theoretical'], ARRAY['tomada de decisão','liderança'], ARRAY['gestão'], 'medium', 87, 'active', 'manual'),
('Minha prioridade ao gerenciar projetos:', '[{"text":"Entregar no prazo","type":"D","valueType":"economic"},{"text":"Manter a equipe motivada","type":"I","valueType":"social"},{"text":"Garantir qualidade","type":"S","valueType":"theoretical"},{"text":"Seguir processos","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['projetos','liderança'], ARRAY['gestão'], 'medium', 84, 'active', 'manual'),
('Ao desenvolver minha equipe:', '[{"text":"Foco em resultados e metas","type":"D","valueType":"economic"},{"text":"Inspiro e encorajo","type":"I","valueType":"social"},{"text":"Apoio e oriento","type":"S","valueType":"social"},{"text":"Treino e capacito","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','theoretical'], ARRAY['desenvolvimento','liderança'], ARRAY['gestão'], 'medium', 86, 'active', 'manual'),
('Em situações de crise:', '[{"text":"Tomo decisões rápidas","type":"D","valueType":"economic"},{"text":"Mantenho o time unido","type":"I","valueType":"social"},{"text":"Acalmo e tranquilizo","type":"S","valueType":"social"},{"text":"Analiso e planejo","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['crise','liderança'], ARRAY['gestão'], 'hard', 89, 'active', 'manual'),
('Meu estilo de liderança é:', '[{"text":"Autoritário e decisivo","type":"D","valueType":"political"},{"text":"Inspirador e visionário","type":"I","valueType":"aesthetic"},{"text":"Democrático e colaborativo","type":"S","valueType":"social"},{"text":"Técnico e orientado","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['political','social'], ARRAY['estilo','liderança'], ARRAY['gestão'], 'medium', 85, 'active', 'manual'),
('Ao reconhecer a equipe:', '[{"text":"Destaco resultados alcançados","type":"D","valueType":"economic"},{"text":"Celebro publicamente","type":"I","valueType":"social"},{"text":"Agradeço individualmente","type":"S","valueType":"social"},{"text":"Documento e formalizo","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['reconhecimento','liderança'], ARRAY['gestão'], 'easy', 83, 'active', 'manual'),
('Ao estabelecer metas:', '[{"text":"Defino metas ambiciosas","type":"D","valueType":"economic"},{"text":"Crio metas inspiradoras","type":"I","valueType":"aesthetic"},{"text":"Estabeleço metas realistas","type":"S","valueType":"social"},{"text":"Defino metas mensuráveis","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['metas','liderança'], ARRAY['gestão'], 'medium', 87, 'active', 'manual'),
('Ao motivar a equipe:', '[{"text":"Foco em recompensas","type":"D","valueType":"economic"},{"text":"Inspiro com visão","type":"I","valueType":"aesthetic"},{"text":"Crio ambiente seguro","type":"S","valueType":"social"},{"text":"Mostro o propósito","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','aesthetic'], ARRAY['motivação','liderança'], ARRAY['gestão'], 'medium', 85, 'active', 'manual'),
('Em mudanças organizacionais:', '[{"text":"Implemento rapidamente","type":"D","valueType":"economic"},{"text":"Comunico com entusiasmo","type":"I","valueType":"social"},{"text":"Apoio a transição","type":"S","valueType":"social"},{"text":"Planejo detalhadamente","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['mudança','liderança'], ARRAY['gestão'], 'hard', 88, 'active', 'manual'),
('Ao avaliar desempenho:', '[{"text":"Foco em resultados","type":"D","valueType":"economic"},{"text":"Reconheço esforços","type":"I","valueType":"social"},{"text":"Considero contexto","type":"S","valueType":"social"},{"text":"Uso métricas objetivas","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['avaliação','liderança'], ARRAY['gestão'], 'medium', 86, 'active', 'manual'),
('Ao construir cultura:', '[{"text":"Foco em performance","type":"D","valueType":"economic"},{"text":"Promovo colaboração","type":"I","valueType":"social"},{"text":"Valorizo bem-estar","type":"S","valueType":"social"},{"text":"Estabeleço processos","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['cultura','liderança'], ARRAY['gestão'], 'medium', 84, 'active', 'manual');

-- Vendas (15 perguntas)
INSERT INTO question_bank (question_text, options, disc_type, value_types, context_tags, profession_tags, difficulty_level, quality_score, status, source) VALUES
('Ao abordar um cliente potencial:', '[{"text":"Vou direto ao ponto","type":"D","valueType":"economic"},{"text":"Crio rapport e relacionamento","type":"I","valueType":"social"},{"text":"Escuto suas necessidades","type":"S","valueType":"social"},{"text":"Faço perguntas para entender","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['economic','social'], ARRAY['prospecção','vendas'], ARRAY['vendas'], 'easy', 84, 'active', 'manual'),
('Quando um cliente tem objeções:', '[{"text":"Contra-argumento com dados","type":"D","valueType":"economic"},{"text":"Mostro casos de sucesso","type":"I","valueType":"social"},{"text":"Entendo a preocupação","type":"S","valueType":"social"},{"text":"Analiso e apresento alternativas","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['objeções','vendas'], ARRAY['vendas'], 'medium', 87, 'active', 'manual'),
('Minha abordagem de fechamento é:', '[{"text":"Assertiva e direta","type":"D","valueType":"economic"},{"text":"Entusiasta e confiante","type":"I","valueType":"social"},{"text":"Paciente e consultiva","type":"S","valueType":"social"},{"text":"Baseada em ROI e dados","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['fechamento','vendas'], ARRAY['vendas'], 'medium', 85, 'active', 'manual'),
('Ao fazer follow-up:', '[{"text":"Sou persistente e objetivo","type":"D","valueType":"economic"},{"text":"Mantenho contato amigável","type":"I","valueType":"social"},{"text":"Respeito o tempo do cliente","type":"S","valueType":"social"},{"text":"Envio informações relevantes","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['economic','social'], ARRAY['follow-up','vendas'], ARRAY['vendas'], 'easy', 83, 'active', 'manual'),
('Em negociações:', '[{"text":"Busco vantagem competitiva","type":"D","valueType":"economic"},{"text":"Crio soluções criativas","type":"I","valueType":"aesthetic"},{"text":"Procuro win-win","type":"S","valueType":"social"},{"text":"Analiso todos os termos","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['negociação','vendas'], ARRAY['vendas'], 'hard', 88, 'active', 'manual'),
('Ao apresentar propostas:', '[{"text":"Foco em resultados e ROI","type":"D","valueType":"economic"},{"text":"Conto histórias de sucesso","type":"I","valueType":"aesthetic"},{"text":"Adapto ao cliente","type":"S","valueType":"social"},{"text":"Detalho especificações","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['economic','aesthetic'], ARRAY['apresentação','vendas'], ARRAY['vendas'], 'medium', 86, 'active', 'manual'),
('Meu pipeline de vendas:', '[{"text":"Agressivo e volumoso","type":"D","valueType":"economic"},{"text":"Diversificado e ativo","type":"I","valueType":"social"},{"text":"Qualificado e consistente","type":"S","valueType":"economic"},{"text":"Organizado e rastreado","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['pipeline','vendas'], ARRAY['vendas'], 'medium', 84, 'active', 'manual'),
('Ao lidar com rejeição:', '[{"text":"Parto para o próximo rapidamente","type":"D","valueType":"economic"},{"text":"Mantenho otimismo","type":"I","valueType":"social"},{"text":"Reflito e aprendo","type":"S","valueType":"theoretical"},{"text":"Analiso o que falhou","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','theoretical'], ARRAY['rejeição','vendas'], ARRAY['vendas'], 'medium', 85, 'active', 'manual'),
('Minha estratégia de prospecção:', '[{"text":"Volume e velocidade","type":"D","valueType":"economic"},{"text":"Networking e indicações","type":"I","valueType":"social"},{"text":"Relacionamento de longo prazo","type":"S","valueType":"social"},{"text":"Pesquisa e segmentação","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['prospecção','vendas'], ARRAY['vendas'], 'medium', 87, 'active', 'manual'),
('Ao construir relacionamento:', '[{"text":"Foco em fechar negócios","type":"D","valueType":"economic"},{"text":"Crio conexões genuínas","type":"I","valueType":"social"},{"text":"Construo confiança gradualmente","type":"S","valueType":"social"},{"text":"Demonstro expertise","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['relacionamento','vendas'], ARRAY['vendas'], 'easy', 82, 'active', 'manual'),
('Ao qualificar leads:', '[{"text":"Foco em potencial de compra","type":"D","valueType":"economic"},{"text":"Avalio fit cultural","type":"I","valueType":"social"},{"text":"Considero necessidades reais","type":"S","valueType":"social"},{"text":"Uso critérios objetivos","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['qualificação','vendas'], ARRAY['vendas'], 'medium', 86, 'active', 'manual'),
('Ao gerenciar objeções de preço:', '[{"text":"Defendo o valor firmemente","type":"D","valueType":"economic"},{"text":"Mostro benefícios intangíveis","type":"I","valueType":"aesthetic"},{"text":"Busco entender a restrição","type":"S","valueType":"social"},{"text":"Comparo com alternativas","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['preço','vendas'], ARRAY['vendas'], 'hard', 88, 'active', 'manual'),
('Ao fazer upsell:', '[{"text":"Apresento oportunidades diretas","type":"D","valueType":"economic"},{"text":"Sugiro melhorias empolgantes","type":"I","valueType":"aesthetic"},{"text":"Identifico necessidades adicionais","type":"S","valueType":"social"},{"text":"Analiso uso e gaps","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['upsell','vendas'], ARRAY['vendas'], 'medium', 85, 'active', 'manual'),
('Ao perder uma venda:', '[{"text":"Parto para a próxima","type":"D","valueType":"economic"},{"text":"Mantenho a porta aberta","type":"I","valueType":"social"},{"text":"Peço feedback honesto","type":"S","valueType":"social"},{"text":"Documento lições aprendidas","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['perda','vendas'], ARRAY['vendas'], 'medium', 84, 'active', 'manual'),
('Ao celebrar uma venda:', '[{"text":"Foco na próxima meta","type":"D","valueType":"economic"},{"text":"Compartilho com a equipe","type":"I","valueType":"social"},{"text":"Agradeço ao cliente","type":"S","valueType":"social"},{"text":"Registro no CRM","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['celebração','vendas'], ARRAY['vendas'], 'easy', 82, 'active', 'manual');

-- Comunicação (15 perguntas)
INSERT INTO question_bank (question_text, options, disc_type, value_types, context_tags, profession_tags, difficulty_level, quality_score, status, source) VALUES
('Em reuniões, minha comunicação é:', '[{"text":"Objetiva e focada em decisões","type":"D","valueType":"economic"},{"text":"Entusiasta e envolvente","type":"I","valueType":"social"},{"text":"Calma e considerada","type":"S","valueType":"social"},{"text":"Detalhada e precisa","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['economic','social'], ARRAY['comunicação','reuniões'], ARRAY['gestão'], 'easy', 83, 'active', 'manual'),
('Ao apresentar uma ideia nova:', '[{"text":"Destaco benefícios e resultados","type":"D","valueType":"economic"},{"text":"Conto histórias inspiradoras","type":"I","valueType":"aesthetic"},{"text":"Explico com paciência","type":"S","valueType":"social"},{"text":"Apresento dados e análises","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['economic','aesthetic'], ARRAY['apresentação','comunicação'], ARRAY['gestão'], 'medium', 85, 'active', 'manual'),
('Meu estilo de e-mail é:', '[{"text":"Breve e direto","type":"D","valueType":"economic"},{"text":"Amigável e pessoal","type":"I","valueType":"social"},{"text":"Cordial e completo","type":"S","valueType":"social"},{"text":"Formal e detalhado","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['comunicação','email'], ARRAY['corporativo'], 'easy', 80, 'active', 'manual'),
('Ao dar más notícias:', '[{"text":"Sou direto e objetivo","type":"D","valueType":"economic"},{"text":"Suavizo com contexto positivo","type":"I","valueType":"social"},{"text":"Sou cuidadoso e empático","type":"S","valueType":"social"},{"text":"Explico com fatos e razões","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social'], ARRAY['comunicação','feedback'], ARRAY['gestão'], 'hard', 86, 'active', 'manual'),
('Em apresentações públicas:', '[{"text":"Sou confiante e assertivo","type":"D","valueType":"political"},{"text":"Sou carismático e envolvente","type":"I","valueType":"social"},{"text":"Sou calmo e preparado","type":"S","valueType":"social"},{"text":"Sou técnico e preciso","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['political','social'], ARRAY['apresentação','comunicação'], ARRAY['gestão'], 'medium', 84, 'active', 'manual'),
('Ao escrever relatórios:', '[{"text":"Resumo executivo e ação","type":"D","valueType":"economic"},{"text":"Narrativa e contexto","type":"I","valueType":"aesthetic"},{"text":"Completo e equilibrado","type":"S","valueType":"social"},{"text":"Detalhado e técnico","type":"C","valueType":"theoretical"}]'::jsonb, 'C', ARRAY['theoretical'], ARRAY['comunicação','relatórios'], ARRAY['corporativo'], 'medium', 85, 'active', 'manual'),
('Em conversas difíceis:', '[{"text":"Vou direto ao ponto","type":"D","valueType":"economic"},{"text":"Busco manter o clima leve","type":"I","valueType":"social"},{"text":"Sou empático e cuidadoso","type":"S","valueType":"social"},{"text":"Preparo argumentos sólidos","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social'], ARRAY['comunicação','conflitos'], ARRAY['gestão'], 'hard', 87, 'active', 'manual'),
('Ao receber feedback:', '[{"text":"Foco em ações de melhoria","type":"D","valueType":"economic"},{"text":"Agradeço e valorizo","type":"I","valueType":"social"},{"text":"Reflito profundamente","type":"S","valueType":"theoretical"},{"text":"Analiso objetivamente","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social','theoretical'], ARRAY['comunicação','feedback'], ARRAY['gestão'], 'medium', 84, 'active', 'manual'),
('Minha linguagem corporal é:', '[{"text":"Firme e direta","type":"D","valueType":"political"},{"text":"Expressiva e animada","type":"I","valueType":"aesthetic"},{"text":"Calma e acolhedora","type":"S","valueType":"social"},{"text":"Controlada e formal","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','aesthetic'], ARRAY['comunicação','linguagem corporal'], ARRAY['gestão'], 'easy', 82, 'active', 'manual'),
('Ao mediar conflitos:', '[{"text":"Imponho uma solução","type":"D","valueType":"political"},{"text":"Facilito o diálogo","type":"I","valueType":"social"},{"text":"Busco consenso","type":"S","valueType":"social"},{"text":"Apresento fatos","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social'], ARRAY['comunicação','conflitos'], ARRAY['gestão'], 'hard', 88, 'active', 'manual'),
('Ao fazer networking:', '[{"text":"Foco em oportunidades","type":"D","valueType":"economic"},{"text":"Crio conexões autênticas","type":"I","valueType":"social"},{"text":"Construo relacionamentos duradouros","type":"S","valueType":"social"},{"text":"Troco informações relevantes","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['networking','comunicação'], ARRAY['vendas'], 'medium', 85, 'active', 'manual'),
('Ao pedir ajuda:', '[{"text":"Sou direto e específico","type":"D","valueType":"economic"},{"text":"Explico o contexto e importância","type":"I","valueType":"social"},{"text":"Sou humilde e grato","type":"S","valueType":"social"},{"text":"Detalho o que preciso","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social'], ARRAY['ajuda','comunicação'], ARRAY['gestão'], 'medium', 83, 'active', 'manual'),
('Ao dar instruções:', '[{"text":"Sou claro e objetivo","type":"D","valueType":"economic"},{"text":"Explico o porquê","type":"I","valueType":"social"},{"text":"Verifico compreensão","type":"S","valueType":"social"},{"text":"Detalho passo a passo","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['instruções','comunicação'], ARRAY['gestão'], 'easy', 84, 'active', 'manual'),
('Ao fazer perguntas:', '[{"text":"Vou direto ao ponto","type":"D","valueType":"economic"},{"text":"Crio diálogo aberto","type":"I","valueType":"social"},{"text":"Sou cuidadoso e respeitoso","type":"S","valueType":"social"},{"text":"Faço perguntas específicas","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social'], ARRAY['perguntas','comunicação'], ARRAY['gestão'], 'easy', 82, 'active', 'manual'),
('Ao discordar de alguém:', '[{"text":"Exponho meu ponto claramente","type":"D","valueType":"economic"},{"text":"Busco entender primeiro","type":"I","valueType":"social"},{"text":"Sou diplomático","type":"S","valueType":"social"},{"text":"Apresento argumentos lógicos","type":"C","valueType":"theoretical"}]'::jsonb, 'S', ARRAY['social'], ARRAY['discordância','comunicação'], ARRAY['gestão'], 'medium', 86, 'active', 'manual');

-- Trabalho em Equipe (15 perguntas)
INSERT INTO question_bank (question_text, options, disc_type, value_types, context_tags, profession_tags, difficulty_level, quality_score, status, source) VALUES
('Em projetos de equipe, eu:', '[{"text":"Assumo a liderança","type":"D","valueType":"political"},{"text":"Animo e engajo todos","type":"I","valueType":"social"},{"text":"Apoio e colaboro","type":"S","valueType":"social"},{"text":"Organizo e planejo","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','political'], ARRAY['equipe','colaboração'], ARRAY['gestão'], 'easy', 84, 'active', 'manual'),
('Ao trabalhar com prazos apertados:', '[{"text":"Priorizo e executo rápido","type":"D","valueType":"economic"},{"text":"Mantenho o time motivado","type":"I","valueType":"social"},{"text":"Ajudo onde for necessário","type":"S","valueType":"social"},{"text":"Organizo e otimizo","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic'], ARRAY['prazos','equipe'], ARRAY['gestão'], 'medium', 86, 'active', 'manual'),
('Minha contribuição para a equipe é:', '[{"text":"Resultados e entregas","type":"D","valueType":"economic"},{"text":"Energia e criatividade","type":"I","valueType":"aesthetic"},{"text":"Harmonia e suporte","type":"S","valueType":"social"},{"text":"Qualidade e precisão","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['social','aesthetic'], ARRAY['contribuição','equipe'], ARRAY['gestão'], 'easy', 83, 'active', 'manual'),
('Ao surgir um problema na equipe:', '[{"text":"Tomo ação imediata","type":"D","valueType":"economic"},{"text":"Reúno todos para resolver","type":"I","valueType":"social"},{"text":"Ofereço ajuda e suporte","type":"S","valueType":"social"},{"text":"Analiso e proponho soluções","type":"C","valueType":"theoretical"}]'::jsonb, 'D', ARRAY['economic','social'], ARRAY['problemas','equipe'], ARRAY['gestão'], 'medium', 87, 'active', 'manual'),
('Ao compartilhar ideias:', '[{"text":"Sou assertivo e convincente","type":"D","valueType":"political"},{"text":"Sou entusiasta e criativo","type":"I","valueType":"aesthetic"},{"text":"Sou receptivo a feedback","type":"S","valueType":"social"},{"text":"Sou estruturado e lógico","type":"C","valueType":"theoretical"}]'::jsonb, 'I', ARRAY['aesthetic','social'], ARRAY['ideias','equipe'], ARRAY['gestão'], 'easy', 82, 'active', 'manual');

-- ============================================================================
-- PARTE 3: CRIAR ÍNDICES
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_question_bank_active_quality 
ON question_bank(status, quality_score DESC) 
WHERE status = 'active';

CREATE INDEX IF NOT EXISTS idx_question_bank_context_tags 
ON question_bank USING GIN (context_tags);

CREATE INDEX IF NOT EXISTS idx_question_bank_profession_tags 
ON question_bank USING GIN (profession_tags);

-- ============================================================================
-- PARTE 4: ANALISAR TABELA
-- ============================================================================

ANALYZE question_bank;

-- ============================================================================
-- VERIFICAÇÃO
-- ============================================================================

SELECT 
  COUNT(*) as total,
  COUNT(CASE WHEN status = 'active' THEN 1 END) as active,
  COUNT(CASE WHEN quality_score >= 80 THEN 1 END) as high_quality
FROM question_bank;

SELECT 
  UNNEST(context_tags) as context,
  COUNT(*) as count
FROM question_bank
GROUP BY context
ORDER BY count DESC
LIMIT 10;

DO $$
BEGIN
  RAISE NOTICE '✅ Banco populado com 60 perguntas!';
  RAISE NOTICE 'Teste com 60 perguntas e verifique os logs.';
  RAISE NOTICE 'Esperado: questions_from_bank = 60, questions_from_ai = 0';
END $$;
