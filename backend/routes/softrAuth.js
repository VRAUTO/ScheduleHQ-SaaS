const express = require('express');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

router.post("/auth/softr", async (req, res) => {
  try {
    const { email, name } = req.body;

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

    // 4. Generate a session token (sign in as this user)
    const { data: tokenData, error: tokenError } = await supabaseAdmin.auth.admin.generateLink({
      type: "magiclink",
      email,
    });

    if (tokenError) {
      console.error('Error generating token:', tokenError);
      throw tokenError;
    }

    res.json({
      success: true,
      message: "User authenticated",
      userId: userId,
      token_link: tokenData.properties.action_link, // send this to frontend to log in
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
