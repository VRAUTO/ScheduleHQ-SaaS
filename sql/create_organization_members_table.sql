-- =============================================================================
-- OrganizationMembers Table
-- =============================================================================
-- This is the central join table that handles organization membership and roles
-- It replaces direct ownership fields and provides flexible role-based access

CREATE TABLE IF NOT EXISTS organization_members (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Foreign key relationships
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    
    -- Role-based access control
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (
        role IN ('owner', 'admin', 'member')
    ),
    
    -- Membership metadata
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invitation_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Status tracking
    is_active BOOLEAN DEFAULT TRUE,
    left_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Constraints
    UNIQUE(org_id, user_id) -- One membership per user per organization
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Index on org_id for finding all members of an organization
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id 
ON organization_members(org_id) WHERE is_active = TRUE;

-- Index on user_id for finding all organizations a user belongs to
CREATE INDEX IF NOT EXISTS idx_organization_members_user_id 
ON organization_members(user_id) WHERE is_active = TRUE;

-- Composite index for role-based queries
CREATE INDEX IF NOT EXISTS idx_organization_members_org_role 
ON organization_members(org_id, role) WHERE is_active = TRUE;

-- Index for finding owners of organizations
CREATE INDEX IF NOT EXISTS idx_organization_members_owners 
ON organization_members(org_id) WHERE role = 'owner' AND is_active = TRUE;

-- Index for invitation tracking
CREATE INDEX IF NOT EXISTS idx_organization_members_invited_by 
ON organization_members(invited_by, invitation_accepted_at);

-- Index for membership timeline queries
CREATE INDEX IF NOT EXISTS idx_organization_members_joined_at 
ON organization_members(org_id, joined_at) WHERE is_active = TRUE;

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on the organization_members table
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see memberships in organizations they belong to
CREATE POLICY "Users can view memberships in their organizations" ON organization_members
    FOR SELECT USING (
        org_id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

-- Policy: Users can see their own memberships
CREATE POLICY "Users can view their own memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

-- Policy: Only owners and admins can add new members
CREATE POLICY "Owners and admins can add members" ON organization_members
    FOR INSERT WITH CHECK (
        org_id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = TRUE
        )
    );

-- Policy: Owners and admins can update member roles (except changing owner role)
CREATE POLICY "Owners and admins can update member roles" ON organization_members
    FOR UPDATE USING (
        org_id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = TRUE
        )
        -- Prevent non-owners from changing owner roles
        AND (role != 'owner' OR EXISTS (
            SELECT 1 FROM organization_members 
            WHERE org_id = organization_members.org_id 
            AND user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = TRUE
        ))
    );

-- Policy: Users can leave organizations (update their own membership to inactive)
CREATE POLICY "Users can leave organizations" ON organization_members
    FOR UPDATE USING (
        user_id = auth.uid() 
        AND is_active = TRUE
    ) WITH CHECK (
        user_id = auth.uid()
        -- Prevent the last owner from leaving
        AND NOT (
            role = 'owner' 
            AND (SELECT COUNT(*) FROM organization_members 
                 WHERE org_id = organization_members.org_id 
                 AND role = 'owner' 
                 AND is_active = TRUE) = 1
        )
    );

-- Policy: Only owners can remove members
CREATE POLICY "Only owners can remove members" ON organization_members
    FOR DELETE USING (
        org_id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
            AND is_active = TRUE
        )
        -- Prevent removing the last owner
        AND NOT (
            role = 'owner' 
            AND (SELECT COUNT(*) FROM organization_members 
                 WHERE org_id = organization_members.org_id 
                 AND role = 'owner' 
                 AND is_active = TRUE) = 1
        )
    );

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to ensure at least one owner exists
CREATE OR REPLACE FUNCTION ensure_organization_has_owner()
RETURNS TRIGGER AS $$
BEGIN
    -- Check if this would remove the last owner
    IF (OLD.role = 'owner' AND OLD.is_active = TRUE) AND 
       (NEW.role != 'owner' OR NEW.is_active = FALSE) THEN
        
        -- Count remaining active owners
        IF (SELECT COUNT(*) 
            FROM organization_members 
            WHERE org_id = OLD.org_id 
            AND role = 'owner' 
            AND is_active = TRUE 
            AND id != OLD.id) = 0 THEN
            
            RAISE EXCEPTION 'Cannot remove the last owner of an organization';
        END IF;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_ensure_organization_has_owner
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_organization_has_owner();

-- Function to set left_at timestamp when deactivating membership
CREATE OR REPLACE FUNCTION set_left_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    -- If membership is being deactivated, set left_at timestamp
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        NEW.left_at = NOW();
    END IF;
    
    -- If membership is being reactivated, clear left_at timestamp
    IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
        NEW.left_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_left_at_timestamp
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION set_left_at_timestamp();

-- Function to update the updated_at timestamp
CREATE TRIGGER trigger_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Function to auto-create owner membership when creating organization
CREATE OR REPLACE FUNCTION auto_create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    -- Auto-add the creator as owner if created_by is set
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO organization_members (org_id, user_id, role, invited_by)
        VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_auto_create_owner_membership
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_owner_membership();

-- =============================================================================
-- Utility Views
-- =============================================================================

-- View for active organization memberships
CREATE OR REPLACE VIEW active_organization_memberships AS
SELECT 
    om.*,
    o.name as organization_name,
    o.referral_code,
    u.email as user_email,
    invited_by_user.email as invited_by_email
FROM organization_members om
JOIN organizations o ON om.org_id = o.id
JOIN users u ON om.user_id = u.id
LEFT JOIN users invited_by_user ON om.invited_by = invited_by_user.id
WHERE om.is_active = TRUE AND o.deleted_at IS NULL;

-- View for organization owners
CREATE OR REPLACE VIEW organization_owners AS
SELECT 
    om.org_id,
    om.user_id,
    o.name as organization_name,
    u.email as owner_email,
    om.joined_at
FROM organization_members om
JOIN organizations o ON om.org_id = o.id
JOIN users u ON om.user_id = u.id
WHERE om.role = 'owner' 
AND om.is_active = TRUE 
AND o.deleted_at IS NULL;

-- =============================================================================
-- Helper Functions
-- =============================================================================

-- Function to check if user is owner of organization
CREATE OR REPLACE FUNCTION is_organization_owner(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members 
        WHERE user_id = user_uuid 
        AND org_id = org_uuid 
        AND role = 'owner' 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to check if user is admin or owner of organization
CREATE OR REPLACE FUNCTION is_organization_admin_or_owner(user_uuid UUID, org_uuid UUID)
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM organization_members 
        WHERE user_id = user_uuid 
        AND org_id = org_uuid 
        AND role IN ('owner', 'admin') 
        AND is_active = TRUE
    );
END;
$$ LANGUAGE plpgsql;

-- Function to get user's role in organization
CREATE OR REPLACE FUNCTION get_user_organization_role(user_uuid UUID, org_uuid UUID)
RETURNS TEXT AS $$
DECLARE
    user_role TEXT;
BEGIN
    SELECT role INTO user_role
    FROM organization_members 
    WHERE user_id = user_uuid 
    AND org_id = org_uuid 
    AND is_active = TRUE;
    
    RETURN COALESCE(user_role, 'none');
END;
$$ LANGUAGE plpgsql;

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE organization_members IS 'Central join table for organization membership and role management';
COMMENT ON COLUMN organization_members.id IS 'Primary identifier for the membership record';
COMMENT ON COLUMN organization_members.org_id IS 'Foreign key to organizations table';
COMMENT ON COLUMN organization_members.user_id IS 'Foreign key to users table';
COMMENT ON COLUMN organization_members.role IS 'User role: owner, admin, or member';
COMMENT ON COLUMN organization_members.joined_at IS 'Timestamp when user joined the organization';
COMMENT ON COLUMN organization_members.invited_by IS 'User who invited this member';
COMMENT ON COLUMN organization_members.invitation_accepted_at IS 'When the invitation was accepted';
COMMENT ON COLUMN organization_members.is_active IS 'Whether the membership is currently active';
COMMENT ON COLUMN organization_members.left_at IS 'Timestamp when user left the organization';

COMMENT ON VIEW active_organization_memberships IS 'View showing all active memberships with organization and user details';
COMMENT ON VIEW organization_owners IS 'View showing all organization owners';

COMMENT ON FUNCTION is_organization_owner(UUID, UUID) IS 'Check if user is owner of specific organization';
COMMENT ON FUNCTION is_organization_admin_or_owner(UUID, UUID) IS 'Check if user is admin or owner of specific organization';
COMMENT ON FUNCTION get_user_organization_role(UUID, UUID) IS 'Get user role in specific organization';
