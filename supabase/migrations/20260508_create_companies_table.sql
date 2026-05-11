-- ============================================
-- MIGRATION: Create Companies Table
-- Description: Creates the companies table for multi-tenant company management
-- Date: 2026-05-08
-- ============================================

-- Create companies table
CREATE TABLE IF NOT EXISTS companies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  
  -- Basic Information
  name TEXT NOT NULL,
  slug TEXT UNIQUE NOT NULL,
  
  -- Branding
  logo_url TEXT,
  primary_color TEXT DEFAULT '#F97316',
  secondary_color TEXT,
  font_family TEXT DEFAULT 'Inter',
  custom_welcome_message TEXT,
  background_image_url TEXT,
  email_template TEXT,
  
  -- Contact Information
  contact_person TEXT NOT NULL,
  contact_email TEXT NOT NULL,
  
  -- Configuration
  max_tests INTEGER DEFAULT 100 CHECK (max_tests >= 0),
  active BOOLEAN DEFAULT true,
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  
  -- Constraints
  CONSTRAINT slug_format CHECK (slug ~ '^[a-z0-9-]{3,50}$'),
  CONSTRAINT slug_no_edge_hyphens CHECK (slug NOT LIKE '-%' AND slug NOT LIKE '%-'),
  CONSTRAINT valid_hex_color CHECK (
    primary_color IS NULL OR 
    primary_color ~ '^#[0-9A-Fa-f]{6}$'
  ),
  CONSTRAINT valid_email CHECK (contact_email ~ '^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}$')
);

-- Create indexes for performance
CREATE INDEX idx_companies_slug ON companies(slug);
CREATE INDEX idx_companies_active ON companies(active, created_at DESC);
CREATE INDEX idx_companies_created_at ON companies(created_at DESC);

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for companies table
CREATE TRIGGER update_companies_updated_at
  BEFORE UPDATE ON companies
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Add comments for documentation
COMMENT ON TABLE companies IS 'Client companies using the DISC test platform';
COMMENT ON COLUMN companies.slug IS 'Unique URL-safe identifier for company test portal (/test/[slug])';
COMMENT ON COLUMN companies.max_tests IS '0 = unlimited tests, >0 = specific limit';
COMMENT ON COLUMN companies.primary_color IS 'Hex color code for company branding (e.g., #F97316)';
COMMENT ON COLUMN companies.active IS 'Whether the company test portal is currently active';
