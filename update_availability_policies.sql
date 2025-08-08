-- Add policy to allow organization owners to view their members' availability
CREATE POLICY "Organization owners can view members availability" ON user_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om
      JOIN organizations o ON o.id = om.org_id
      WHERE om.user_id = user_availability.user_id
      AND (
        o.created_by = auth.uid()  -- User owns the organization
        OR 
        EXISTS (
          SELECT 1 FROM organization_members om2 
          WHERE om2.org_id = o.id 
          AND om2.user_id = auth.uid() 
          AND om2.role = 'owner'
        ) -- User is an owner in organization_members table
      )
    )
  );

-- Add policy to allow organization members to view each other's availability within same org
CREATE POLICY "Organization members can view each others availability" ON user_availability
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM organization_members om1, organization_members om2
      WHERE om1.user_id = user_availability.user_id
      AND om2.user_id = auth.uid()
      AND om1.org_id = om2.org_id
    )
  );
