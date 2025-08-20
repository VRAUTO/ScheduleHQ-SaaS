const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

router.post('/agency', async (req, res) => {
  const { agencyName, description, website, industry, userId } = req.body;
  const authHeader = req.headers.authorization;

  // Check authorization header
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return res.status(401).json({ error: 'Unauthorized: No token provided' });
  }

  const token = authHeader.split(' ')[1];

  try {
    // Validate token with Supabase to get user session
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user || user.id !== userId) {
      return res.status(401).json({ error: 'Unauthorized: Invalid user session' });
    }

    if (!agencyName || !userId) {
      return res.status(400).json({ error: 'Agency name and user ID are required' });
    }

    // Create organization
    const { data: organization, error: orgError } = await supabase
      .from('organizations')
      .insert([{ name: agencyName, description: description || null, created_by: userId }])
      .select()
      .single();

    if (orgError) {
      console.error('Organization creation error:', orgError);
      return res.status(500).json({ error: 'Failed to create organization', details: orgError.message });
    }

    // Add owner to organization_members
    const { data: membership, error: memberError } = await supabase
      .from('organization_members')
      .insert([{ org_id: organization.id, user_id: userId, role: 'owner' }])
      .select()
      .single();

    if (memberError) {
      console.error('Membership creation error:', memberError);

      // Rollback
      await supabase.from('organizations').delete().eq('id', organization.id);

      return res.status(500).json({ error: 'Failed to create organization membership', details: memberError.message });
    }

    // Update user
    const { error: userUpdateError } = await supabase
      .from('users')
      .update({ complete_role: true })
      .eq('id', userId);

    if (userUpdateError) {
      console.warn('User update warning:', userUpdateError.message);
    }

    return res.status(201).json({
      success: true,
      message: 'Organization created successfully',
      organization,
      membership,
      referral_code: organization.referral_code
    });

  } catch (error) {
    console.error('Unexpected error:', error);
    return res.status(500).json({ error: 'Internal server error', details: error.message });
  }
});

module.exports = router;
