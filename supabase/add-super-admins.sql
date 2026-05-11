/**
 * Add Super Admin Access
 * Grants super_admin role to specific email addresses
 * 
 * INSTRUCTIONS:
 * 1. Open Supabase Dashboard
 * 2. Go to SQL Editor
 * 3. Paste and run this script
 */

-- Add super_admin role to marcosrodriguesmwrf@gmail.com
UPDATE profiles
SET role = 'super_admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'marcosrodriguesmwrf@gmail.com'
);

-- Add super_admin role to gestao.vx1@gmail.com
UPDATE profiles
SET role = 'super_admin'
WHERE user_id = (
  SELECT id 
  FROM auth.users 
  WHERE email = 'gestao.vx1@gmail.com'
);

-- Verify the changes
SELECT 
  u.email,
  p.role,
  p.created_at,
  p.updated_at
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE p.role = 'super_admin'
ORDER BY p.created_at;

-- Expected result: Should show both emails with role 'super_admin'
