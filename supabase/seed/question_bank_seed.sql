-- Seed: Initial question_bank data
-- Description: Migrate 20 static questions from data/questions.ts to question_bank
-- Date: 2026-05-06

-- Insert 20 static questions with quality_score=75, source='static'
-- Each question includes context_tags based on content analysis

INSERT INTO question_bank (
  question_text,
  options,
  disc_type,
  value_types,
  psychological_traits,
  context_tags,
  profession_tags,
  seniority_tags,
  objective_tags,
  industry_tags,
  difficulty_level,
  quality_score,
  clarity_score,
  source,
  status
) VALUES
-- Question 1: Challenge handling
(
  'Quando enfrento um desafio, eu prefiro:',
  '[
    {"text": "Agir rapidamente e tomar decisões firmes", "type": "D"},
    {"text": "Conversar com outras pessoas e buscar apoio", "type": "I"},
    {"text": "Analisar calmamente antes de agir", "type": "S"},
    {"text": "Pesquisar dados e informações detalhadas", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['problem-solving', 'decision-making'],
  ARRAY['management', 'operations'],
  ARRAY['mid', 'senior'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'services'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 2: Work environment strengths
(
  'Em um ambiente de trabalho, eu me destaco por:',
  '[
    {"text": "Liderar projetos e alcançar resultados", "type": "D"},
    {"text": "Motivar e inspirar a equipe", "type": "I"},
    {"text": "Manter a harmonia e apoiar os colegas", "type": "S"},
    {"text": "Garantir precisão e qualidade", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['leadership', 'teamwork'],
  ARRAY['management', 'operations', 'support'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['self-knowledge', 'team-building', 'hiring'],
  ARRAY['technology', 'finance', 'services', 'retail'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 3: Decision-making criteria
(
  'Quando tomo decisões, eu considero principalmente:',
  '[
    {"text": "Resultados e eficiência", "type": "D"},
    {"text": "Impacto nas pessoas e relacionamentos", "type": "I"},
    {"text": "Estabilidade e segurança", "type": "S"},
    {"text": "Dados e análise lógica", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['decision-making', 'values'],
  ARRAY['management', 'engineering', 'finance'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['self-knowledge', 'hiring', 'development'],
  ARRAY['technology', 'finance', 'healthcare'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 4: Communication style
(
  'Meu estilo de comunicação é:',
  '[
    {"text": "Direto e objetivo", "type": "D"},
    {"text": "Entusiasta e expressivo", "type": "I"},
    {"text": "Calmo e paciente", "type": "S"},
    {"text": "Preciso e detalhado", "type": "C"}
  ]'::jsonb,
  'I',
  '{}',
  '{}',
  ARRAY['communication', 'interpersonal'],
  ARRAY['sales', 'management', 'support'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'team-building'],
  ARRAY['technology', 'services', 'retail'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 5: Behavior under pressure
(
  'Sob pressão, eu tendo a:',
  '[
    {"text": "Assumir o controle e agir", "type": "D"},
    {"text": "Buscar soluções criativas com outros", "type": "I"},
    {"text": "Manter a calma e seguir o plano", "type": "S"},
    {"text": "Analisar cuidadosamente as opções", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['stress-management', 'problem-solving'],
  ARRAY['management', 'operations', 'engineering'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['hiring', 'development'],
  ARRAY['technology', 'finance', 'healthcare'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 6: Work fears
(
  'Meu maior medo no trabalho é:',
  '[
    {"text": "Perder o controle ou ser ineficaz", "type": "D"},
    {"text": "Ser rejeitado ou ignorado", "type": "I"},
    {"text": "Mudanças repentinas ou conflitos", "type": "S"},
    {"text": "Cometer erros ou ser criticado", "type": "C"}
  ]'::jsonb,
  'S',
  '{}',
  '{}',
  ARRAY['motivation', 'values'],
  ARRAY['management', 'support', 'creative'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'services', 'education'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 7: Teamwork preference
(
  'Quando trabalho em equipe, eu prefiro:',
  '[
    {"text": "Liderar e definir a direção", "type": "D"},
    {"text": "Colaborar e compartilhar ideias", "type": "I"},
    {"text": "Apoiar e facilitar o trabalho dos outros", "type": "S"},
    {"text": "Garantir que tudo seja feito corretamente", "type": "C"}
  ]'::jsonb,
  'I',
  '{}',
  '{}',
  ARRAY['teamwork', 'collaboration'],
  ARRAY['management', 'operations', 'support'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'team-building'],
  ARRAY['technology', 'services', 'retail'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 8: Problem-solving approach
(
  'Minha abordagem para resolver problemas é:',
  '[
    {"text": "Rápida e decisiva", "type": "D"},
    {"text": "Criativa e colaborativa", "type": "I"},
    {"text": "Metódica e consistente", "type": "S"},
    {"text": "Analítica e baseada em fatos", "type": "C"}
  ]'::jsonb,
  'C',
  '{}',
  '{}',
  ARRAY['problem-solving', 'analytical'],
  ARRAY['engineering', 'management', 'finance'],
  ARRAY['mid', 'senior'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'healthcare'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 9: Motivation
(
  'O que mais me motiva é:',
  '[
    {"text": "Alcançar metas e vencer desafios", "type": "D"},
    {"text": "Reconhecimento e interação social", "type": "I"},
    {"text": "Estabilidade e ambiente harmonioso", "type": "S"},
    {"text": "Precisão e fazer as coisas certas", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['motivation', 'values'],
  ARRAY['sales', 'management', 'operations'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'finance', 'services'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 10: Work pace
(
  'Meu ritmo de trabalho é:',
  '[
    {"text": "Rápido e focado em resultados", "type": "D"},
    {"text": "Variado e energético", "type": "I"},
    {"text": "Constante e previsível", "type": "S"},
    {"text": "Cuidadoso e deliberado", "type": "C"}
  ]'::jsonb,
  'S',
  '{}',
  '{}',
  ARRAY['work-style', 'productivity'],
  ARRAY['operations', 'engineering', 'finance'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'manufacturing', 'services'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 11: Feedback preference
(
  'Quando recebo feedback, eu prefiro que seja:',
  '[
    {"text": "Direto e focado em resultados", "type": "D"},
    {"text": "Positivo e encorajador", "type": "I"},
    {"text": "Gentil e construtivo", "type": "S"},
    {"text": "Específico e baseado em fatos", "type": "C"}
  ]'::jsonb,
  'S',
  '{}',
  '{}',
  ARRAY['communication', 'feedback'],
  ARRAY['management', 'support', 'creative'],
  ARRAY['junior', 'mid'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'services', 'education'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 12: Greatest strength
(
  'Minha maior força é:',
  '[
    {"text": "Determinação e foco em objetivos", "type": "D"},
    {"text": "Entusiasmo e habilidade social", "type": "I"},
    {"text": "Paciência e lealdade", "type": "S"},
    {"text": "Atenção aos detalhes e precisão", "type": "C"}
  ]'::jsonb,
  'C',
  '{}',
  '{}',
  ARRAY['strengths', 'self-awareness'],
  ARRAY['engineering', 'finance', 'operations'],
  ARRAY['mid', 'senior'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'healthcare'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 13: Conflict handling
(
  'Em situações de conflito, eu:',
  '[
    {"text": "Enfrento diretamente", "type": "D"},
    {"text": "Tento mediar e encontrar acordo", "type": "I"},
    {"text": "Evito e busco manter a paz", "type": "S"},
    {"text": "Analiso os fatos antes de agir", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['conflict-resolution', 'interpersonal'],
  ARRAY['management', 'support', 'hr'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['self-knowledge', 'team-building', 'hiring'],
  ARRAY['technology', 'services', 'retail'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 14: Ideal work environment
(
  'Meu ambiente de trabalho ideal é:',
  '[
    {"text": "Desafiador e competitivo", "type": "D"},
    {"text": "Dinâmico e social", "type": "I"},
    {"text": "Estável e previsível", "type": "S"},
    {"text": "Organizado e estruturado", "type": "C"}
  ]'::jsonb,
  'S',
  '{}',
  '{}',
  ARRAY['work-environment', 'preferences'],
  ARRAY['operations', 'support', 'finance'],
  ARRAY['junior', 'mid', 'senior'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'manufacturing'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 15: Project initiation
(
  'Quando inicio um novo projeto, eu:',
  '[
    {"text": "Defino metas claras e começo imediatamente", "type": "D"},
    {"text": "Compartilho a visão e envolvo outros", "type": "I"},
    {"text": "Planejo cuidadosamente cada etapa", "type": "S"},
    {"text": "Pesquiso e analiso todas as variáveis", "type": "C"}
  ]'::jsonb,
  'C',
  '{}',
  '{}',
  ARRAY['planning', 'project-management'],
  ARRAY['management', 'engineering', 'operations'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'services'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 16: Attitude towards change
(
  'Minha atitude em relação a mudanças é:',
  '[
    {"text": "Abraço mudanças se trouxerem resultados", "type": "D"},
    {"text": "Fico animado com novas possibilidades", "type": "I"},
    {"text": "Prefiro mudanças graduais e planejadas", "type": "S"},
    {"text": "Avalio cuidadosamente antes de aceitar", "type": "C"}
  ]'::jsonb,
  'S',
  '{}',
  '{}',
  ARRAY['adaptability', 'change-management'],
  ARRAY['management', 'operations', 'engineering'],
  ARRAY['mid', 'senior'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'services', 'manufacturing'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 17: Leadership style
(
  'Como líder, eu sou:',
  '[
    {"text": "Autoritário e focado em resultados", "type": "D"},
    {"text": "Inspirador e motivador", "type": "I"},
    {"text": "Apoiador e facilitador", "type": "S"},
    {"text": "Metódico e orientado por processos", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['leadership', 'management-style'],
  ARRAY['management'],
  ARRAY['senior', 'executive'],
  ARRAY['self-knowledge', 'hiring', 'development'],
  ARRAY['technology', 'finance', 'services'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 18: Learning approach
(
  'Minha abordagem para aprender algo novo é:',
  '[
    {"text": "Aprender fazendo e experimentando", "type": "D"},
    {"text": "Aprender com outras pessoas", "type": "I"},
    {"text": "Seguir instruções passo a passo", "type": "S"},
    {"text": "Estudar teoria e conceitos primeiro", "type": "C"}
  ]'::jsonb,
  'C',
  '{}',
  '{}',
  ARRAY['learning-style', 'development'],
  ARRAY['engineering', 'creative', 'operations'],
  ARRAY['junior', 'mid'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'education', 'services'],
  'easy',
  75,
  75,
  'static',
  'active'
),

-- Question 19: Frustrations
(
  'O que me frustra mais é:',
  '[
    {"text": "Lentidão e falta de ação", "type": "D"},
    {"text": "Falta de reconhecimento ou isolamento", "type": "I"},
    {"text": "Mudanças constantes e imprevisibilidade", "type": "S"},
    {"text": "Falta de organização e erros", "type": "C"}
  ]'::jsonb,
  'D',
  '{}',
  '{}',
  ARRAY['frustrations', 'values'],
  ARRAY['management', 'sales', 'operations'],
  ARRAY['mid', 'senior'],
  ARRAY['self-knowledge', 'development'],
  ARRAY['technology', 'finance', 'services'],
  'medium',
  75,
  75,
  'static',
  'active'
),

-- Question 20: Negotiation style
(
  'Meu estilo de negociação é:',
  '[
    {"text": "Assertivo e focado em ganhar", "type": "D"},
    {"text": "Persuasivo e carismático", "type": "I"},
    {"text": "Cooperativo e busco consenso", "type": "S"},
    {"text": "Lógico e baseado em dados", "type": "C"}
  ]'::jsonb,
  'I',
  '{}',
  '{}',
  ARRAY['negotiation', 'communication'],
  ARRAY['sales', 'management'],
  ARRAY['mid', 'senior', 'executive'],
  ARRAY['self-knowledge', 'hiring'],
  ARRAY['technology', 'finance', 'services', 'retail'],
  'medium',
  75,
  75,
  'static',
  'active'
);

-- Verify insertion
SELECT COUNT(*) as total_questions FROM question_bank WHERE source = 'static';
