-- ============================================
-- Script para atualizar role do usuário para admin
-- Execute no SQL Editor do Supabase Dashboard
-- ============================================

-- Atualizar o usuário teste@vx.com para admin
UPDATE profiles 
SET role = 'admin'
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'teste@vx.com'
);

-- Verificar se a atualização funcionou
SELECT 
  p.user_id,
  u.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email = 'teste@vx.com';

-- Listar todos os admins do sistema
SELECT 
  p.user_id,
  u.email,
  p.role,
  p.created_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role IN ('admin', 'super_admin', 'company_admin')
ORDER BY p.created_at DESC;
