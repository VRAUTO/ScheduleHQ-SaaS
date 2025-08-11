-- Add user_id column to invitations table
ALTER TABLE invitations 
ADD COLUMN user_id UUID REFERENCES auth.users(id);

-- Create index for better performance
CREATE INDEX idx_invitations_user_id ON invitations(user_id);

-- Drop existing functions first to avoid return type conflicts
DROP FUNCTION IF EXISTS create_invitation(text, uuid);
DROP FUNCTION IF EXISTS accept_invitation(text);

-- Update the create_invitation function to handle user lookup/creation
CREATE OR REPLACE FUNCTION create_invitation(
  p_email TEXT,
  p_organization_id UUID
) RETURNS TEXT AS $$
DECLARE
  v_token TEXT;
  v_user_id UUID;
  v_existing_invitation UUID;
BEGIN
  -- Check if user already exists
  SELECT id INTO v_user_id 
  FROM auth.users 
  WHERE email = p_email;
  
  -- If user doesn't exist, we'll store null for now
  -- The invitation will be linked to user_id when they sign up
  
  -- Check if invitation already exists for this email and organization
  SELECT id INTO v_existing_invitation
  FROM invitations 
  WHERE email = p_email 
    AND organization_id = p_organization_id 
    AND status = 'pending';
  
  IF v_existing_invitation IS NOT NULL THEN
    RAISE EXCEPTION 'An invitation already exists for this email';
  END IF;
  
  -- Generate unique token
  v_token := encode(gen_random_bytes(32), 'base64');
  
  -- Insert invitation
  INSERT INTO invitations (
    email, 
    organization_id, 
    user_id,
    token, 
    status, 
    created_at, 
    expires_at
  ) VALUES (
    p_email, 
    p_organization_id, 
    v_user_id, -- Will be NULL if user doesn't exist
    v_token, 
    'pending', 
    NOW(), 
    NOW() + INTERVAL '7 days'
  );
  
  RETURN v_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Update accept_invitation function to handle user_id linking
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token TEXT) 
RETURNS TEXT AS $$
DECLARE
  v_invitation_id UUID;
  v_organization_id UUID;
  v_user_id UUID;
  v_current_user_id UUID;
  v_email TEXT;
BEGIN
  -- Get current user
  v_current_user_id := auth.uid();
  
  IF v_current_user_id IS NULL THEN
    RAISE EXCEPTION 'User must be authenticated';
  END IF;
  
  -- Find the invitation
  SELECT id, organization_id, user_id, email
  INTO v_invitation_id, v_organization_id, v_user_id, v_email
  FROM invitations 
  WHERE token = invitation_token 
    AND status = 'pending' 
    AND expires_at > NOW();
  
  IF v_invitation_id IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation token';
  END IF;
  
  -- Check if the current user's email matches the invitation email
  IF NOT EXISTS (
    SELECT 1 FROM auth.users 
    WHERE id = v_current_user_id 
      AND email = v_email
  ) THEN
    RAISE EXCEPTION 'This invitation is for a different email address';
  END IF;
  
  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM organization_members 
    WHERE user_id = v_current_user_id 
      AND org_id = v_organization_id
  ) THEN
    RAISE EXCEPTION 'User is already a member of this organization';
  END IF;
  
  -- Add user to organization
  INSERT INTO organization_members (user_id, org_id, role, joined_at)
  VALUES (v_current_user_id, v_organization_id, 'member', NOW());
  
  -- Update invitation status and link to user if not already linked
  UPDATE invitations 
  SET status = 'accepted',
      user_id = v_current_user_id,
      accepted_at = NOW()
  WHERE id = v_invitation_id;
  
  RETURN 'Successfully joined organization';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
