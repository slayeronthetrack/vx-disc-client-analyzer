-- Migration: Create test invitations system
-- Description: Allows companies to invite employees via email with unique links

-- Create invitations table
CREATE TABLE IF NOT EXISTS test_invitations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  company_id UUID NOT NULL REFERENCES companies(id) ON DELETE CASCADE,
  
  -- Employee information
  employee_name VARCHAR(255) NOT NULL,
  employee_email VARCHAR(255) NOT NULL,
  employee_position VARCHAR(255),
  employee_department VARCHAR(255),
  
  -- Invitation details
  invitation_token VARCHAR(255) UNIQUE NOT NULL,
  status VARCHAR(50) NOT NULL DEFAULT 'pending',
  -- Status: 'pending', 'sent', 'opened', 'started', 'completed', 'expired'
  
  -- Tracking
  sent_at TIMESTAMP WITH TIME ZONE,
  opened_at TIMESTAMP WITH TIME ZONE,
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  expires_at TIMESTAMP WITH TIME ZONE NOT NULL,
  
  -- Related test
  test_id UUID REFERENCES company_tests(id) ON DELETE SET NULL,
  
  -- Metadata
  sent_by UUID REFERENCES profiles(id) ON DELETE SET NULL,
  reminder_count INTEGER DEFAULT 0,
  last_reminder_at TIMESTAMP WITH TIME ZONE,
  
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_invitations_company_id ON test_invitations(company_id);
CREATE INDEX IF NOT EXISTS idx_invitations_token ON test_invitations(invitation_token);
CREATE INDEX IF NOT EXISTS idx_invitations_email ON test_invitations(employee_email);
CREATE INDEX IF NOT EXISTS idx_invitations_status ON test_invitations(status);
CREATE INDEX IF NOT EXISTS idx_invitations_expires_at ON test_invitations(expires_at);

-- Create composite indexes
CREATE INDEX IF NOT EXISTS idx_invitations_company_status ON test_invitations(company_id, status);
CREATE INDEX IF NOT EXISTS idx_invitations_company_email ON test_invitations(company_id, employee_email);

-- Add RLS policies
ALTER TABLE test_invitations ENABLE ROW LEVEL SECURITY;

-- Policy: Company admins can view their company's invitations
CREATE POLICY company_admin_select_invitations ON test_invitations
  FOR SELECT
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
    )
  );

-- Policy: Company admins can insert invitations for their company
CREATE POLICY company_admin_insert_invitations ON test_invitations
  FOR INSERT
  TO authenticated
  WITH CHECK (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
    )
  );

-- Policy: Company admins can update their company's invitations
CREATE POLICY company_admin_update_invitations ON test_invitations
  FOR UPDATE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
    )
  );

-- Policy: Company admins can delete their company's invitations
CREATE POLICY company_admin_delete_invitations ON test_invitations
  FOR DELETE
  TO authenticated
  USING (
    company_id IN (
      SELECT company_id 
      FROM profiles 
      WHERE id = auth.uid() 
      AND role = 'company_admin'
      AND company_id IS NOT NULL
    )
  );

-- Policy: Public can view invitation by token (for test page)
CREATE POLICY public_select_invitation_by_token ON test_invitations
  FOR SELECT
  TO anon, authenticated
  USING (
    invitation_token IS NOT NULL
    AND status NOT IN ('expired', 'completed')
    AND expires_at > NOW()
  );

-- Function to generate unique invitation token
CREATE OR REPLACE FUNCTION generate_invitation_token()
RETURNS VARCHAR(255) AS $$
DECLARE
  token VARCHAR(255);
  exists BOOLEAN;
BEGIN
  LOOP
    -- Generate random token (32 characters)
    token := encode(gen_random_bytes(24), 'base64');
    token := replace(token, '/', '_');
    token := replace(token, '+', '-');
    token := replace(token, '=', '');
    
    -- Check if token already exists
    SELECT EXISTS(SELECT 1 FROM test_invitations WHERE invitation_token = token) INTO exists;
    
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN token;
END;
$$ LANGUAGE plpgsql;

-- Function to update invitation status
CREATE OR REPLACE FUNCTION update_invitation_status()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  
  -- Auto-set timestamps based on status
  IF NEW.status = 'sent' AND OLD.status = 'pending' THEN
    NEW.sent_at = NOW();
  ELSIF NEW.status = 'opened' AND OLD.status IN ('pending', 'sent') THEN
    NEW.opened_at = NOW();
  ELSIF NEW.status = 'started' AND OLD.status IN ('pending', 'sent', 'opened') THEN
    NEW.started_at = NOW();
  ELSIF NEW.status = 'completed' AND OLD.status != 'completed' THEN
    NEW.completed_at = NOW();
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for status updates
CREATE TRIGGER trigger_update_invitation_status
  BEFORE UPDATE ON test_invitations
  FOR EACH ROW
  EXECUTE FUNCTION update_invitation_status();

-- Function to expire old invitations
CREATE OR REPLACE FUNCTION expire_old_invitations()
RETURNS INTEGER AS $$
DECLARE
  expired_count INTEGER;
BEGIN
  UPDATE test_invitations
  SET status = 'expired'
  WHERE status NOT IN ('completed', 'expired')
    AND expires_at < NOW();
  
  GET DIAGNOSTICS expired_count = ROW_COUNT;
  RETURN expired_count;
END;
$$ LANGUAGE plpgsql;

-- Add comments
COMMENT ON TABLE test_invitations IS 'Stores test invitations sent to employees';
COMMENT ON COLUMN test_invitations.invitation_token IS 'Unique token for accessing the test';
COMMENT ON COLUMN test_invitations.status IS 'Current status: pending, sent, opened, started, completed, expired';
COMMENT ON COLUMN test_invitations.expires_at IS 'Expiration date for the invitation (default: 30 days)';
