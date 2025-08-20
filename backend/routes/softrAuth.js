const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

router.post("/auth/softr", async (req, res) => {
  try {
    const { email, name, redirect_url } = req.body;

    if (!email) {
      return res.status(400).json({ error: "Email is required" });
    }

    // 1. Check if user exists in the users table
    const { data: existingUser, error: getUserError } = await supabaseAdmin
      .from('users')
      .select('id, email')
      .eq('email', email)
      .single();

    let userId;

    if (!existingUser) {
      // 2. Create the auth user first
      const { data: newAuthUser, error: createAuthError } = await supabaseAdmin.auth.admin.createUser({
        email,
        email_confirm: true, // skip email verification
        user_metadata: { name: name || email.split('@')[0] },
      });

      if (createAuthError) {
        console.error('Error creating auth user:', createAuthError);
        throw createAuthError;
      }

      userId = newAuthUser.user.id;

      // 3. Insert user into users table
      const { data: newUser, error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert({
          id: userId,
          email,
          name: name || email.split('@')[0],
          role: 'freelancer' // default role for softr users
        })
        .select()
        .single();

      if (insertUserError) {
        console.error('Error inserting user into users table:', insertUserError);
        // If user table insert fails, we should clean up the auth user
        await supabaseAdmin.auth.admin.deleteUser(userId);
        throw insertUserError;
      }
    } else {
      userId = existingUser.id;
    }

    // 4. Generate a magic link that will automatically sign in the user
    const frontendUrl = redirect_url || 'https://softrcalendar.netlify.app';
    const { data: linkData, error: linkError } = await supabaseAdmin.auth.admin.generateLink({
      type: 'magiclink',
      email,
      options: {
        redirectTo: `${frontendUrl}/auth/callback`
      }
    });

    if (linkError) {
      console.error('Error generating magic link:', linkError);
      throw linkError;
    }

    // 5. Return the magic link URL so the iframe can be redirected to it
    res.json({
      success: true,
      message: "User authenticated",
      userId: userId,
      magic_link: linkData.properties.action_link,
      callback_url: `${frontendUrl}/auth/callback`
    });

  } catch (err) {
    console.error("Error in /auth/softr:", err);
    res.status(500).json({
      error: err.message,
      details: process.env.NODE_ENV === 'development' ? err : undefined
    });
  }
});

module.exports = router;
