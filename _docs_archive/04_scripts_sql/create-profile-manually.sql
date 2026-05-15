-- CRIAR PERFIL MANUALMENTE PARA SEU USUÁRIO
-- IMPORTANTE: Substitua os valores abaixo pelos seus dados

INSERT INTO profiles (user_id, email, full_name, profile_completed)
VALUES (
  'cfce857c-7d22-4450-abe6-fc234a13c75a',  -- Seu user_id (já está correto)
  'seu@email.com',                          -- MUDE AQUI: Coloque seu email
  'Seu Nome Completo',                      -- MUDE AQUI: Coloque seu nome
  false
)
ON CONFLICT (user_id) DO UPDATE SET
  email = EXCLUDED.email,
  full_name = EXCLUDED.full_name;