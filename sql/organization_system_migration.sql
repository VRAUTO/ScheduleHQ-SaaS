-- =============================================================================
-- Organization System Migration
-- =============================================================================
-- This migration creates the complete organization system with:
-- 1. Organizations table
-- 2. OrganizationMembers table (join table with roles)
-- 3. All necessary indexes, constraints, and security policies
-- 4. Helper functions and views

-- =============================================================================
-- Step 1: Create Organizations Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS organizations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- =============================================================================
-- Step 2: Create OrganizationMembers Table
-- =============================================================================

CREATE TABLE IF NOT EXISTS organization_members (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    org_id UUID NOT NULL REFERENCES organizations(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role VARCHAR(20) NOT NULL DEFAULT 'member' CHECK (
        role IN ('owner', 'admin', 'member')
    ),
    joined_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    invited_by UUID REFERENCES users(id) ON DELETE SET NULL,
    invitation_accepted_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    is_active BOOLEAN DEFAULT TRUE,
    left_at TIMESTAMP WITH TIME ZONE DEFAULT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(org_id, user_id)
);

-- =============================================================================
-- Step 3: Create Indexes
-- =============================================================================

-- Organizations indexes
CREATE INDEX IF NOT EXISTS idx_organizations_referral_code 
ON organizations(referral_code) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_created_by 
ON organizations(created_by) WHERE deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_organizations_name 
ON organizations USING gin(to_tsvector('english', name)) 
WHERE deleted_at IS NULL;

-- OrganizationMembers indexes
CREATE INDEX IF NOT EXISTS idx_organization_members_org_id 
ON organization_members(org_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_organization_members_user_id 
ON organization_members(user_id) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_organization_members_org_role 
ON organization_members(org_id, role) WHERE is_active = TRUE;

CREATE INDEX IF NOT EXISTS idx_organization_members_owners 
ON organization_members(org_id) WHERE role = 'owner' AND is_active = TRUE;

-- =============================================================================
-- Step 4: Create Functions
-- =============================================================================

-- Function to generate unique referral codes
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_length INTEGER := 6;
BEGIN
    FOR i IN 1..code_length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    WHILE EXISTS (SELECT 1 FROM organizations WHERE referral_code = result) LOOP
        result := '';
        FOR i IN 1..code_length LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Function to set referral code on insert
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to ensure organization has at least one owner
CREATE OR REPLACE FUNCTION ensure_organization_has_owner()
RETURNS TRIGGER AS $$
BEGIN
    IF (OLD.role = 'owner' AND OLD.is_active = TRUE) AND 
       (NEW.role != 'owner' OR NEW.is_active = FALSE) THEN
        
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

-- Function to set left_at timestamp
CREATE OR REPLACE FUNCTION set_left_at_timestamp()
RETURNS TRIGGER AS $$
BEGIN
    IF OLD.is_active = TRUE AND NEW.is_active = FALSE THEN
        NEW.left_at = NOW();
    END IF;
    
    IF OLD.is_active = FALSE AND NEW.is_active = TRUE THEN
        NEW.left_at = NULL;
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Function to auto-create owner membership
CREATE OR REPLACE FUNCTION auto_create_owner_membership()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.created_by IS NOT NULL THEN
        INSERT INTO organization_members (org_id, user_id, role, invited_by)
        VALUES (NEW.id, NEW.created_by, 'owner', NEW.created_by);
    END IF;
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Helper functions
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
-- Step 5: Create Triggers
-- =============================================================================

-- Auto-set referral code
CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_code();

-- Update timestamps
CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trigger_organization_members_updated_at
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- Ensure owner exists
CREATE TRIGGER trigger_ensure_organization_has_owner
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION ensure_organization_has_owner();

-- Set left_at timestamp
CREATE TRIGGER trigger_set_left_at_timestamp
    BEFORE UPDATE ON organization_members
    FOR EACH ROW
    EXECUTE FUNCTION set_left_at_timestamp();

-- Auto-create owner membership
CREATE TRIGGER trigger_auto_create_owner_membership
    AFTER INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION auto_create_owner_membership();

-- =============================================================================
-- Step 6: Enable Row Level Security
-- =============================================================================

-- Organizations RLS
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

CREATE POLICY "Organization owners and admins can update" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
            AND is_active = TRUE
        )
    );

CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- OrganizationMembers RLS
ALTER TABLE organization_members ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view memberships in their organizations" ON organization_members
    FOR SELECT USING (
        org_id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() AND is_active = TRUE
        )
    );

CREATE POLICY "Users can view their own memberships" ON organization_members
    FOR SELECT USING (user_id = auth.uid());

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

-- =============================================================================
-- Step 7: Create Utility Views
-- =============================================================================

CREATE OR REPLACE VIEW active_organization_memberships AS
SELECT 
    om.*,
    o.name as organization_name,
    o.referral_code,
    u.email as user_email
FROM organization_members om
JOIN organizations o ON om.org_id = o.id
JOIN users u ON om.user_id = u.id
WHERE om.is_active = TRUE AND o.deleted_at IS NULL;

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
-- Step 8: Sample Data (Optional - for testing)
-- =============================================================================

-- Uncomment the following to insert sample data:

/*
-- Insert a sample organization
INSERT INTO organizations (name, created_by) 
VALUES ('Sample Agency', auth.uid());

-- The trigger will automatically create the owner membership
*/

-- =============================================================================
-- Migration Complete
-- =============================================================================

-- Add comments for documentation
COMMENT ON TABLE organizations IS 'Stores organization/agency information with unique referral codes';
COMMENT ON TABLE organization_members IS 'Central join table for organization membership and role management';
COMMENT ON VIEW active_organization_memberships IS 'View showing all active memberships with organization and user details';
COMMENT ON VIEW organization_owners IS 'View showing all organization owners';
