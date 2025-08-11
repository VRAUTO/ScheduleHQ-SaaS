-- =============================================================================
-- Organizations Table
-- =============================================================================
-- This table stores organization/agency information
-- Each organization has a unique referral code for invitations
-- The actual ownership/roles are handled via the OrganizationMembers table

CREATE TABLE IF NOT EXISTS organizations (
    -- Primary identifier
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    
    -- Organization details
    name VARCHAR(255) NOT NULL CHECK (LENGTH(TRIM(name)) > 0),
    
    -- Unique referral code for invitations (6-8 characters, alphanumeric)
    referral_code VARCHAR(8) UNIQUE NOT NULL,
    
    -- Optional: Track who initially created the organization
    -- This is informational only - actual ownership is in OrganizationMembers
    created_by UUID REFERENCES users(id) ON DELETE SET NULL,
    
    -- Timestamps
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    
    -- Soft delete support
    deleted_at TIMESTAMP WITH TIME ZONE DEFAULT NULL
);

-- =============================================================================
-- Indexes for Performance
-- =============================================================================

-- Index on referral_code for fast lookups during join operations
CREATE INDEX IF NOT EXISTS idx_organizations_referral_code 
ON organizations(referral_code) WHERE deleted_at IS NULL;

-- Index on created_by for tracking user's created organizations
CREATE INDEX IF NOT EXISTS idx_organizations_created_by 
ON organizations(created_by) WHERE deleted_at IS NULL;

-- Index on name for search functionality
CREATE INDEX IF NOT EXISTS idx_organizations_name 
ON organizations USING gin(to_tsvector('english', name)) 
WHERE deleted_at IS NULL;

-- Partial index for active organizations only
CREATE INDEX IF NOT EXISTS idx_organizations_active 
ON organizations(created_at) WHERE deleted_at IS NULL;

-- =============================================================================
-- Row Level Security (RLS)
-- =============================================================================

-- Enable RLS on the organizations table
ALTER TABLE organizations ENABLE ROW LEVEL SECURITY;

-- Policy: Users can see organizations they are members of
CREATE POLICY "Users can view organizations they belong to" ON organizations
    FOR SELECT USING (
        id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid()
        )
    );

-- Policy: Only organization owners/admins can update organization details
CREATE POLICY "Organization owners and admins can update" ON organizations
    FOR UPDATE USING (
        id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role IN ('owner', 'admin')
        )
    );

-- Policy: Any authenticated user can create organizations
CREATE POLICY "Authenticated users can create organizations" ON organizations
    FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

-- Policy: Only organization owners can delete organizations
CREATE POLICY "Only owners can delete organizations" ON organizations
    FOR DELETE USING (
        id IN (
            SELECT org_id 
            FROM organization_members 
            WHERE user_id = auth.uid() 
            AND role = 'owner'
        )
    );

-- =============================================================================
-- Functions and Triggers
-- =============================================================================

-- Function to generate a unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS TEXT AS $$
DECLARE
    chars TEXT := 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    result TEXT := '';
    i INTEGER;
    code_length INTEGER := 6;
BEGIN
    -- Generate a random 6-character code
    FOR i IN 1..code_length LOOP
        result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
    END LOOP;
    
    -- Check if code already exists, if so, try again
    WHILE EXISTS (SELECT 1 FROM organizations WHERE referral_code = result) LOOP
        result := '';
        FOR i IN 1..code_length LOOP
            result := result || substr(chars, floor(random() * length(chars) + 1)::INTEGER, 1);
        END LOOP;
    END LOOP;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Trigger to auto-generate referral code if not provided
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
    IF NEW.referral_code IS NULL OR NEW.referral_code = '' THEN
        NEW.referral_code := generate_referral_code();
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_set_referral_code
    BEFORE INSERT ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION set_referral_code();

-- Trigger to update the updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_organizations_updated_at
    BEFORE UPDATE ON organizations
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- =============================================================================
-- Comments for Documentation
-- =============================================================================

COMMENT ON TABLE organizations IS 'Stores organization/agency information with unique referral codes';
COMMENT ON COLUMN organizations.id IS 'Primary identifier for the organization';
COMMENT ON COLUMN organizations.name IS 'Organization name, must not be empty';
COMMENT ON COLUMN organizations.referral_code IS 'Unique 6-character code for invitations';
COMMENT ON COLUMN organizations.created_by IS 'User who initially created the organization (informational only)';
COMMENT ON COLUMN organizations.created_at IS 'Timestamp when organization was created';
COMMENT ON COLUMN organizations.updated_at IS 'Timestamp when organization was last updated';
COMMENT ON COLUMN organizations.deleted_at IS 'Soft delete timestamp, NULL means active';
