-- Restore original create_invitation function
DROP FUNCTION IF EXISTS create_invitation(TEXT, UUID);

CREATE OR REPLACE FUNCTION create_invitation(p_email TEXT, p_organization_id UUID)
RETURNS TEXT AS $$
DECLARE
    new_token TEXT;
    current_user_id UUID;
BEGIN
    -- Get current user ID
    current_user_id := auth.uid();
    
    -- Check if current user is the owner of the organization
    IF NOT EXISTS (
        SELECT 1 FROM public.organizations 
        WHERE id = p_organization_id AND created_by = current_user_id
    ) THEN
        RAISE EXCEPTION 'You are not authorized to create invitations for this organization';
    END IF;
    
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
    
    RETURN new_token;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
