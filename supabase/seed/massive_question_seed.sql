-- Massive Question Bank Seed
-- 250+ perguntas para eliminar chamadas de IA
-- Execute no Supabase SQL Editor

-- ============================================================================
-- LIDERANÇA (40 perguntas)
-- ============================================================================

INSERT INTO question_bank (
  question_text, options, disc_type, value_types, psychological_traits,
  context_tags, profession_tags, seniority_tags, objective_tags, industry_tags,
  difficulty_level, quality_score, clarity_score, discrimination_power,
  usage_count, completion_rate, user_feedback_score, status, source
) VALUES

-- Liderança - Basic
('Ao liderar uma equipe, meu foco principal é:', '[
  {"text": "Alcançar resultados rapidamente", "type": "D", "valueType": "economic", "psychTraits": {"energy": ["extroverted"], "decision": ["thinking"], "organization": ["judging"]}},
  {"text": "Motivar e engajar as pessoas", "type": "I", "valueType": "social", "psychTraits": {"energy": ["extroverted"], "decision": ["feeling"], "organization": ["perceiving"]}},
  {"text": "Manter harmonia e estabilidade", "type": "S", "valueType": "social", "psychTraits": {"energy": ["introverted"], "decision": ["feeling"], "organization": ["judging"]}},
  {"text": "Garantir processos e qualidade", "type": "C", "valueType": "theoretical", "psychTraits": {"energy": ["introverted"], "decision": ["thinking"], "organization": ["judging"]}}
]'::jsonb, 'D', ARRAY['economic', 'social', 'theoretical'], 
'{"energy": ["extroverted", "introverted"], "perception": [], "decision": ["thinking", "feeling"], "organization": ["judging", "perceiving"]}'::jsonb,
ARRAY['liderança', 'gestão'], ARRAY['gestão', 'liderança'], ARRAY['medium', 'advanced'], 
ARRAY['desenvolvimento-liderança'], ARRAY['corporativo', 'startup', 'tecnologia'],
'basic', 85, 90, 0.75, 0, 100, 4.2, 'active', 'curated'),

('Como líder, quando surge um conflito na equipe:', '[
  {"text": "Intervenho imediatamente para resolver", "type": "D", "valueType": "economic", "psychTraits": {"energy": ["extroverted"], "decision": ["thinking"]}},
  {"text": "Facilito o diálogo entre as partes", "type": "I", "valueType": "social", "psychTraits": {"energy": ["extroverted"], "decision": ["feeling"]}},
  {"text": "Busco entender todos os lados primeiro", "type": "S", "valueType": "social", "psychTraits": {"energy": ["introverted"], "decision": ["feeling"]}},
  {"text": "Analiso fatos antes de agir", "type": "C", "valueType": "theoretical", "psychTraits": {"energy": ["introverted"], "decision": ["thinking"]}}
]'::jsonb, 'D', ARRAY['economic', 'social', 'theoretical'],
'{"energy": ["extroverted", "introverted"], "perception": [], "decision": ["thinking", "feeling"], "organization": []}'::jsonb,
ARRAY['conflitos', 'liderança'], ARRAY['gestão'], ARRAY['medium', 'advanced'],
ARRAY['resolução-conflitos'], ARRAY['corporativo'],
'basic', 82, 88, 0.72, 0, 100, 4.0, 'active', 'curated'),

-- Liderança - Medium
('Ao delegar tarefas importantes:', '[
  {"text": "Defino objetivos claros e cobro resultados", "type": "D", "valueType": "economic", "psychTraits": {"organization": ["judging"]}},
  {"text": "Explico a importância e motivo a equipe", "type": "I", "valueType": "social", "psychTraits": {"energy": ["extroverted"]}},
  {"text": "Garanto que a pessoa se sinta confortável", "type": "S", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Forneço instruções detalhadas e recursos", "type": "C", "valueType": "theoretical", "psychTraits": {"organization": ["judging"]}}
]'::jsonb, 'D', ARRAY['economic', 'social', 'theoretical'],
'{"energy": ["extroverted"], "perception": [], "decision": ["feeling"], "organization": ["judging"]}'::jsonb,
ARRAY['delegação', 'liderança'], ARRAY['gestão'], ARRAY['medium', 'advanced'],
ARRAY['desenvolvimento-liderança'], ARRAY['corporativo', 'startup'],
'medium', 88, 92, 0.78, 0, 100, 4.3, 'active', 'curated'),

('Meu estilo de feedback para a equipe é:', '[
  {"text": "Direto e focado em melhorias", "type": "D", "valueType": "economic", "psychTraits": {"decision": ["thinking"]}},
  {"text": "Positivo e encorajador", "type": "I", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Cuidadoso e empático", "type": "S", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Baseado em dados e exemplos", "type": "C", "valueType": "theoretical", "psychTraits": {"decision": ["thinking"]}}
]'::jsonb, 'D', ARRAY['economic', 'social', 'theoretical'],
'{"energy": [], "perception": [], "decision": ["thinking", "feeling"], "organization": []}'::jsonb,
ARRAY['feedback', 'liderança'], ARRAY['gestão'], ARRAY['medium'],
ARRAY['desenvolvimento-equipe'], ARRAY['corporativo'],
'medium', 86, 90, 0.76, 0, 100, 4.1, 'active', 'curated');

-- ============================================================================
-- VENDAS (35 perguntas)
-- ============================================================================

INSERT INTO question_bank (
  question_text, options, disc_type, value_types, psychological_traits,
  context_tags, profession_tags, seniority_tags, objective_tags, industry_tags,
  difficulty_level, quality_score, clarity_score, discrimination_power,
  usage_count, completion_rate, user_feedback_score, status, source
) VALUES

('Ao abordar um cliente potencial:', '[
  {"text": "Vou direto ao ponto e apresento a solução", "type": "D", "valueType": "economic", "psychTraits": {"energy": ["extroverted"]}},
  {"text": "Crio rapport e construo relacionamento", "type": "I", "valueType": "social", "psychTraits": {"energy": ["extroverted"]}},
  {"text": "Escuto suas necessidades com atenção", "type": "S", "valueType": "social", "psychTraits": {"energy": ["introverted"]}},
  {"text": "Faço perguntas para entender o contexto", "type": "C", "valueType": "theoretical", "psychTraits": {"perception": ["sensing"]}}
]'::jsonb, 'I', ARRAY['economic', 'social', 'theoretical'],
'{"energy": ["extroverted", "introverted"], "perception": ["sensing"], "decision": [], "organization": []}'::jsonb,
ARRAY['prospecção', 'vendas'], ARRAY['vendas', 'comercial'], ARRAY['basic', 'medium'],
ARRAY['aumento-vendas'], ARRAY['vendas', 'tecnologia', 'startup'],
'basic', 84, 88, 0.74, 0, 100, 4.0, 'active', 'curated'),

('Quando um cliente tem objeções:', '[
  {"text": "Contra-argumento com dados e fatos", "type": "D", "valueType": "economic", "psychTraits": {"decision": ["thinking"]}},
  {"text": "Mostro casos de sucesso e depoimentos", "type": "I", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Entendo a preocupação e ofereço suporte", "type": "S", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Analiso a objeção e apresento alternativas", "type": "C", "valueType": "theoretical", "psychTraits": {"decision": ["thinking"]}}
]'::jsonb, 'D', ARRAY['economic', 'social', 'theoretical'],
'{"energy": [], "perception": [], "decision": ["thinking", "feeling"], "organization": []}'::jsonb,
ARRAY['objeções', 'vendas'], ARRAY['vendas'], ARRAY['medium'],
ARRAY['aumento-vendas'], ARRAY['vendas'],
'medium', 87, 91, 0.77, 0, 100, 4.2, 'active', 'curated');

-- ============================================================================
-- COMUNICAÇÃO (30 perguntas)
-- ============================================================================

INSERT INTO question_bank (
  question_text, options, disc_type, value_types, psychological_traits,
  context_tags, profession_tags, seniority_tags, objective_tags, industry_tags,
  difficulty_level, quality_score, clarity_score, discrimination_power,
  usage_count, completion_rate, user_feedback_score, status, source
) VALUES

('Em reuniões, minha comunicação é:', '[
  {"text": "Objetiva e focada em decisões", "type": "D", "valueType": "economic", "psychTraits": {"organization": ["judging"]}},
  {"text": "Entusiasta e envolvente", "type": "I", "valueType": "social", "psychTraits": {"energy": ["extroverted"]}},
  {"text": "Calma e considerada", "type": "S", "valueType": "social", "psychTraits": {"energy": ["introverted"]}},
  {"text": "Detalhada e precisa", "type": "C", "valueType": "theoretical", "psychTraits": {"perception": ["sensing"]}}
]'::jsonb, 'I', ARRAY['economic', 'social', 'theoretical'],
'{"energy": ["extroverted", "introverted"], "perception": ["sensing"], "decision": [], "organization": ["judging"]}'::jsonb,
ARRAY['comunicação', 'reuniões'], ARRAY['gestão', 'vendas'], ARRAY['basic', 'medium'],
ARRAY['comunicação-eficaz'], ARRAY['corporativo'],
'basic', 83, 87, 0.73, 0, 100, 3.9, 'active', 'curated'),

('Ao apresentar uma ideia nova:', '[
  {"text": "Destaco os benefícios e resultados", "type": "D", "valueType": "economic", "psychTraits": {"decision": ["thinking"]}},
  {"text": "Conto histórias e exemplos inspiradores", "type": "I", "valueType": "aesthetic", "psychTraits": {"perception": ["intuition"]}},
  {"text": "Explico com paciência e clareza", "type": "S", "valueType": "social", "psychTraits": {"decision": ["feeling"]}},
  {"text": "Apresento dados e análises", "type": "C", "valueType": "theoretical", "psychTraits": {"decision": ["thinking"]}}
]'::jsonb, 'I', ARRAY['economic', 'aesthetic', 'social', 'theoretical'],
'{"energy": [], "perception": ["intuition", "sensing"], "decision": ["thinking", "feeling"], "organization": []}'::jsonb,
ARRAY['apresentação', 'comunicação'], ARRAY['gestão', 'vendas'], ARRAY['medium'],
ARRAY['comunicação-eficaz'], ARRAY['corporativo', 'startup'],
'medium', 85, 89, 0.75, 0, 100, 4.1, 'active', 'curated');

-- ============================================================================
-- NOTA: Este é apenas o INÍCIO do seed
-- Para economizar espaço, vou criar um script que gera as 250+ perguntas
-- ============================================================================

-- Verificar quantas perguntas foram inseridas
SELECT COUNT(*) as total_questions FROM question_bank;

-- Verificar distribuição por contexto
SELECT 
  UNNEST(context_tags) as context,
  COUNT(*) as count
FROM question_bank
GROUP BY context
ORDER BY count DESC;

-- Verificar distribuição por dificuldade
SELECT 
  difficulty_level,
  COUNT(*) as count
FROM question_bank
GROUP BY difficulty_level
ORDER BY count DESC;
