const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

// Initialize Supabase client
const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Signup Route
router.post("/signup", async (req, res) => {
  try {
    const { email, password, name } = req.body;

    if (!email || !password || !name) {
      return res.status(400).json({
        error: "Email, password, and name are required"
      });
    }

    // Check if user already exists in custom users table
    const { data: existingUser, error: checkError } = await supabase
      .from('users')
      .select('email')
      .eq('email', email)
      .single();

    if (checkError && checkError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error checking existing user:', checkError);
      return res.status(500).json({
        error: "Database error occurred"
      });
    }

    if (existingUser) {
      return res.status(400).json({
        error: "User already exists with this email"
      });
    }

    // Create user in Supabase Auth
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: name
        }
      }
    });

    if (error) {
      console.log('Signup error:', error);
      return res.status(400).json({
        error: error.message
      });
    }

    // Store user in custom users table
    if (data.user) {
      const { error: dbError } = await supabase
        .from('users')
        .insert([
          {
            id: data.user.id,
            email: data.user.email,
            name: name,
            profile_complete: false,
            created_at: new Date().toISOString()
          }
        ]);

      if (dbError) {
        console.error('Error storing user in database:', dbError);
        // Don't fail the request if user creation was successful
      }
    }

    res.json({
      success: true,
      message: "Account created successfully",
      user: {
        id: data.user.id,
        email: data.user.email,
        name: name
      }
    });

  } catch (err) {
    console.error('Signup error:', err);
    res.status(500).json({
      error: "An unexpected error occurred"
    });
  }
});

// Signin Route
router.post("/signin", async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        error: "Email and password are required"
      });
    }

    // Sign in with Supabase
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) {
      return res.status(400).json({
        error: error.message
      });
    }

    // Check if user exists in custom users table
    const { data: customUser, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('email', email)
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
      message: "Signed in successfully",
      session: data.session,
      user: data.user,
      needsProfileCompletion: needsProfileCompletion,
      customUser: customUser || null
    });

  } catch (err) {
    console.error('Signin error:', err);
    res.status(500).json({
      error: "An unexpected error occurred"
    });
  }
});

module.exports = router;
