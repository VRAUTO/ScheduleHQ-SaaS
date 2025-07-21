const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Profile Status Route
router.get("/profile-status", async (req, res) => {
  try {
    // Get user session from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header required"
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }

    // Check if user exists in custom users table
    const { data: customUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', user.email)
      .single();

    let needsProfileCompletion = false;

    if (userError && userError.code === 'PGRST116') {
      // User not found in custom table, needs profile completion
      needsProfileCompletion = true;
    } else if (userError) {
      console.error('Error checking user in custom table:', userError);
      return res.status(500).json({
        error: "Database error occurred"
      });
    } else if (!customUser.profile_complete) {
      // User exists but profile is not complete
      needsProfileCompletion = true;
    }

    res.json({
      success: true,
      user: user,
      customUser: customUser || null,
      needsProfileCompletion: needsProfileCompletion
    });

  } catch (err) {
    console.error('Profile status error:', err);
    res.status(500).json({
      error: "An unexpected error occurred"
    });
  }
});

// Complete Profile Route
router.post("/complete-profile", async (req, res) => {
  try {
    const { userId, name, phone, company, bio } = req.body;

    if (!userId || !name) {
      return res.status(400).json({
        error: "User ID and name are required"
      });
    }

    // Get user session from auth header
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      return res.status(401).json({
        error: "Authorization header required"
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabase.auth.getUser(token);

    if (authError || !user) {
      return res.status(401).json({
        error: "Invalid token"
      });
    }

    // Update user profile
    const { error: updateError } = await supabase
      .from('users')
      .upsert([
        {
          id: userId,
          email: user.email,
          name: name,
          phone: phone || null,
          company: company || null,
          bio: bio || null,
          profile_complete: true,
          created_at: new Date().toISOString()
        }
      ]);

    if (updateError) {
      console.error('Profile update error:', updateError);
      return res.status(500).json({
        error: "Failed to update profile"
      });
    }

    res.json({
      success: true,
      message: "Profile completed successfully"
    });

  } catch (err) {
    console.error('Complete profile error:', err);
    res.status(500).json({
      error: "An unexpected error occurred"
    });
  }
});

module.exports = router;
