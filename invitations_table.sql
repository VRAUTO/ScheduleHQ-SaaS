-- Create invitations table for organization invites
CREATE TABLE public.invitations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  organization_id UUID REFERENCES public.organizations(id) ON DELETE CASCADE NOT NULL,
  invited_email TEXT NOT NULL,
  token TEXT UNIQUE NOT NULL,
  status TEXT DEFAULT 'pending' NOT NULL CHECK (status IN ('pending', 'accepted', 'expired')),
  expires_at TIMESTAMPTZ NOT NULL,
  invited_by UUID REFERENCES auth.users(id) NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now() NOT NULL
);

-- Add indexes for performance
CREATE INDEX idx_invitations_token ON public.invitations(token);
CREATE INDEX idx_invitations_email ON public.invitations(invited_email);
CREATE INDEX idx_invitations_org ON public.invitations(organization_id);

-- Enable Row Level Security
ALTER TABLE public.invitations ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view invitations for their organizations" ON public.invitations
  FOR SELECT USING (
    invited_by = auth.uid() OR 
    invited_email = auth.email()
  );

CREATE POLICY "Organization owners can create invitations" ON public.invitations
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.organization_members om 
      WHERE om.user_id = auth.uid() 
      AND om.org_id = invitations.organization_id 
      AND om.role IN ('owner', 'admin')
    )
  );

-- Function to get invitation details
CREATE OR REPLACE FUNCTION get_invitation_details(invitation_token TEXT)
RETURNS TABLE (
  organization_id UUID,
  organization_name TEXT,
  invited_email TEXT,
  user_exists BOOLEAN,
  is_valid BOOLEAN,
  expires_at TIMESTAMPTZ
)
AS $$
BEGIN
  RETURN QUERY
  SELECT
    i.organization_id,
    o.name AS organization_name,
    i.invited_email,
    EXISTS (SELECT 1 FROM auth.users u WHERE u.email = i.invited_email) AS user_exists,
    (i.status = 'pending' AND i.expires_at > now()) AS is_valid,
    i.expires_at
  FROM
    public.invitations i
  JOIN
    public.organizations o ON i.organization_id = o.id
  WHERE
    i.token = invitation_token;
END;
$$ LANGUAGE plpgsql;

-- Function to accept invitation
CREATE OR REPLACE FUNCTION accept_invitation(invitation_token TEXT)
RETURNS TEXT
AS $$
DECLARE
  invitation_record RECORD;
BEGIN
  -- Get invitation details
  SELECT i.*, o.name as org_name 
  INTO invitation_record
  FROM public.invitations i
  JOIN public.organizations o ON i.organization_id = o.id
  WHERE i.token = invitation_token
  AND i.status = 'pending'
  AND i.expires_at > now()
  AND i.invited_email = auth.email();

  -- Check if invitation exists and is valid
  IF invitation_record IS NULL THEN
    RAISE EXCEPTION 'Invalid or expired invitation';
  END IF;

  -- Check if user is already a member
  IF EXISTS (
    SELECT 1 FROM public.organization_members 
    WHERE user_id = auth.uid() 
    AND org_id = invitation_record.organization_id
  ) THEN
    RAISE EXCEPTION 'You are already a member of this organization';
  END IF;

  -- Add user to organization
  INSERT INTO public.organization_members (user_id, org_id, role)
  VALUES (auth.uid(), invitation_record.organization_id, 'member');

  -- Update invitation status
  UPDATE public.invitations 
  SET status = 'accepted' 
  WHERE token = invitation_token;

  RETURN invitation_record.org_name;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create an invitation (for organization owners)
CREATE OR REPLACE FUNCTION create_invitation(p_email TEXT, p_organization_id UUID)
RETURNS JSONB AS $$
DECLARE
    new_token TEXT;
    current_user_id UUID;
    org_record RECORD;
    sender_record RECORD;
    result JSONB;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if current user is the owner of the organization and get org details
    SELECT * INTO org_record 
    FROM public.organizations 
    WHERE id = p_organization_id AND created_by = current_user_id;

    IF org_record IS NULL THEN
        RAISE EXCEPTION 'You are not authorized to create invitations for this organization';
    END IF;

    -- Get sender details
    SELECT * INTO sender_record 
    FROM auth.users 
    WHERE id = current_user_id;
    
    -- Check if user with this email already exists in the organization
    IF EXISTS (
        SELECT 1 FROM public.organization_members om
        JOIN auth.users u ON om.user_id = u.id
        WHERE om.org_id = p_organization_id 
        AND u.email = p_email
    ) THEN
        RAISE EXCEPTION 'User with this email is already a member of this organization';
    END IF;
    
    -- Generate a unique token
    new_token := encode(gen_random_bytes(32), 'hex');
    
    -- Insert the invitation
    INSERT INTO public.invitations (organization_id, invited_email, token, expires_at, invited_by)
    VALUES (p_organization_id, p_email, new_token, now() + interval '7 days', current_user_id);
    
    -- Return structured data for email sending
    result := jsonb_build_object(
        'token', new_token,
        'organization_name', org_record.name,
        'sender_name', COALESCE(sender_record.raw_user_meta_data->>'full_name', sender_record.email),
        'sender_email', sender_record.email
    );

    RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
