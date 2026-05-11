-- ============================================
-- MIGRATION: Update Profiles Table
-- Description: Adds role and company_id columns to profiles for multi-tenant access control
-- Date: 2026-05-08
-- ============================================

-- Create user_role enum if it doesn't exist
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('user', 'admin', 'super_admin', 'company_admin', 'manager', 'viewer');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

-- Add role column if it doesn't exist
ALTER TABLE profiles 
  ADD COLUMN IF NOT EXISTS role user_role DEFAULT 'user';

-- Add company_id column for company-specific admins (Phase 3)
ALTER TABLE profiles
  ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_profiles_role ON profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id) WHERE company_id IS NOT NULL;

-- Add comments
COMMENT ON COLUMN profiles.role IS 'User role in the system (user, admin, super_admin, company_admin, manager, viewer)';
COMMENT ON COLUMN profiles.company_id IS 'Company linked to user (for COMPANY_ADMIN, MANAGER, VIEWER roles)';

-- Update existing admin users to super_admin role (if any exist)
-- This is safe to run multiple times
UPDATE profiles 
SET role = 'super_admin' 
WHERE role = 'admin';
