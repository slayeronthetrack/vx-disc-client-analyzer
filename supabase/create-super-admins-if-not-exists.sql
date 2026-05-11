/**
 * Create Super Admin Profiles (If Users Don't Exist Yet)
 * 
 * IMPORTANT: This script only works if the users have already signed up!
 * If they haven't signed up yet, they need to:
 * 1. Go to the app and register
 * 2. Then run the add-super-admins.sql script
 * 
 * This script checks if profiles exist and creates/updates them
 */

-- Check if users exist in auth.users
SELECT 
  email,
  id,
  created_at,
  CASE 
    WHEN email IN ('marcosrodriguesmwrf@gmail.com', 'gestao.vx1@gmail.com') 
    THEN '✅ User exists'
    ELSE '❌ User not found'
  END as status
FROM auth.users
WHERE email IN ('marcosrodriguesmwrf@gmail.com', 'gestao.vx1@gmail.com');

-- If users exist, update their profiles to super_admin
-- For marcosrodriguesmwrf@gmail.com
INSERT INTO profiles (user_id, role, created_at, updated_at)
SELECT 
  id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'marcosrodriguesmwrf@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = NOW();

-- For gestao.vx1@gmail.com
INSERT INTO profiles (user_id, role, created_at, updated_at)
SELECT 
  id,
  'super_admin',
  NOW(),
  NOW()
FROM auth.users
WHERE email = 'gestao.vx1@gmail.com'
ON CONFLICT (user_id) 
DO UPDATE SET 
  role = 'super_admin',
  updated_at = NOW();

-- Verify the final result
SELECT 
  u.email,
  p.role,
  p.created_at as profile_created,
  p.updated_at as profile_updated
FROM profiles p
JOIN auth.users u ON u.id = p.user_id
WHERE u.email IN ('marcosrodriguesmwrf@gmail.com', 'gestao.vx1@gmail.com')
ORDER BY u.email;
