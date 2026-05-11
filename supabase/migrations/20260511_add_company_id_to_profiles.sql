/**
 * Migration: Add company_id to profiles table
 * 
 * Purpose: Enable company_admin role to be associated with a specific company
 * This allows RLS policies to filter data by company_id for company admins
 * 
 * Changes:
 * - Add company_id column to profiles table (nullable, references companies)
 * - Create index on company_id for performance
 */

-- Add company_id column to profiles table (if not exists)
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS company_id UUID REFERENCES companies(id) ON DELETE SET NULL;

-- Create index for performance optimization (if not exists)
CREATE INDEX IF NOT EXISTS idx_profiles_company_id ON profiles(company_id);

-- Add comment for documentation
COMMENT ON COLUMN profiles.company_id IS 'Company association for company_admin role. NULL for super_admin, admin, and user roles.';
