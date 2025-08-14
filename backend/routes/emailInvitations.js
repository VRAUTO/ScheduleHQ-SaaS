const express = require('express');
const nodemailer = require('nodemailer');
const { createClient } = require('@supabase/supabase-js');

const router = express.Router();

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Create email transporter
const createTransporter = () => {
  // You can use different email services here
  console.log('🔧 Creating email transporter...');
  console.log('EMAIL_USER:', process.env.EMAIL_USER ? 'Set ✅' : 'Missing ❌');
  console.log('EMAIL_PASS:', process.env.EMAIL_PASS ? 'Set ✅' : 'Missing ❌');
  return nodemailer.createTransport({
    service: 'gmail', // or 'outlook', 'yahoo', etc.
    auth: {
      user: 'bailwalshivam5@gmail.com', // Your email
      pass: 'holouryqluxwjlsh'  // Your email password or app password
    }
  });

  // Alternative: Using SMTP settings
  // return nodemailer.createTransporter({
  //   host: process.env.SMTP_HOST,
  //   port: process.env.SMTP_PORT,
  //   secure: process.env.SMTP_SECURE === 'true',
  //   auth: {
  //     user: process.env.SMTP_USER,
  //     pass: process.env.SMTP_PASS
  //   }
  // });
};

// Send team invitation
router.post('/send-invitation', async (req, res) => {
  try {
    const { email, organizationId, organizationName, inviterName } = req.body;

    // Validate input
    if (!email || !organizationId) {
      return res.status(400).json({
        error: 'Email and organization ID are required'
      });
    }

    // Check if user is already a member
    const { data: existingMember, error: memberCheckError } = await supabaseAdmin
      .from('organization_members')
      .select('id')
      .eq('org_id', organizationId)
      .eq('user_id', (
        await supabaseAdmin
          .from('users')
          .select('id')
          .eq('email', email)
          .single()
      )?.data?.id)
      .single();

    if (existingMember) {
      return res.status(400).json({
        error: 'User is already a member of this organization'
      });
    }

    // Create invitation token using Supabase RPC
    const { data: invitationToken, error: invitationError } = await supabaseAdmin
      .rpc('create_invitation', {
        p_email: email,
        p_organization_id: organizationId
      });

    if (invitationError) {
      console.error('Error creating invitation:', invitationError);
      throw invitationError;
    }

    // Create email content
    const invitationLink = `${process.env.FRONTEND_URL || 'https://softrcalendar.netlify.app'}/join?token=${invitationToken}`;

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .button:hover { background: #5a67d8; }
          .footer { text-align: center; margin-top: 20px; color: #666; font-size: 14px; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📅 Team Invitation</h1>
            <p>You've been invited to join ${organizationName || 'our organization'}!</p>
          </div>
          
          <div class="content">
            <h2>Hi there! 👋</h2>
            
            <p><strong>${inviterName || 'Someone'}</strong> has invited you to join their team on <strong>Calendar Pro</strong>.</p>
            
            <p>Calendar Pro is a powerful scheduling platform that helps teams manage appointments, availability, and bookings seamlessly.</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">🚀 Accept Invitation</a>
            </div>
            
            <p><strong>What you'll get:</strong></p>
            <ul>
              <li>📅 Professional calendar management</li>
              <li>👥 Team collaboration tools</li>
              <li>📊 Booking analytics and insights</li>
              <li>🔗 Easy scheduling integrations</li>
            </ul>
            
            <p>If the button doesn't work, you can copy and paste this link into your browser:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${invitationLink}
            </p>
            
            <p><em>This invitation will expire in 7 days.</em></p>
          </div>
          
          <div class="footer">
            <p>Best regards,<br>The Calendar Pro Team</p>
            <p>If you didn't expect this invitation, you can safely ignore this email.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    // Send email
    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Calendar Pro',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: `🎉 You're invited to join ${organizationName || 'our team'} on Calendar Pro`,
      html: emailTemplate,
      // Plain text fallback
      text: `
        Hi there!
        
        ${inviterName || 'Someone'} has invited you to join their team on Calendar Pro.
        
        Click here to accept: ${invitationLink}
        
        This invitation will expire in 7 days.
        
        Best regards,
        The Calendar Pro Team
      `
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Invitation sent successfully',
      invitationToken,
      sentTo: email
    });

  } catch (error) {
    console.error('Error sending invitation:', error);
    res.status(500).json({
      error: 'Failed to send invitation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// Resend invitation
router.post('/resend-invitation', async (req, res) => {
  try {
    const { email, organizationId } = req.body;

    if (!email || !organizationId) {
      return res.status(400).json({
        error: 'Email and organization ID are required'
      });
    }

    // Check if invitation exists and is still valid
    const { data: invitation, error: invitationError } = await supabaseAdmin
      .from('invitations')
      .select('*')
      .eq('email', email)
      .eq('organization_id', organizationId)
      .eq('used', false)
      .gt('expires_at', new Date().toISOString())
      .single();

    if (invitationError || !invitation) {
      return res.status(404).json({
        error: 'No valid invitation found'
      });
    }

    // Get organization details
    const { data: organization } = await supabaseAdmin
      .from('organizations')
      .select('name, created_by')
      .eq('id', organizationId)
      .single();

    // Get inviter details
    const { data: inviter } = await supabaseAdmin
      .from('users')
      .select('name, email')
      .eq('id', organization?.created_by)
      .single();

    // Resend the same invitation
    const invitationLink = `${process.env.FRONTEND_URL || 'https://softrcalendar.netlify.app'}/join?token=${invitation.token}`;

    const emailTemplate = `
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <style>
          body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0; }
          .content { background: #f8f9fa; padding: 30px; border-radius: 0 0 10px 10px; }
          .button { display: inline-block; background: #667eea; color: white; padding: 15px 30px; text-decoration: none; border-radius: 8px; font-weight: bold; margin: 20px 0; }
          .reminder { background: #fff3cd; border: 1px solid #ffeaa7; padding: 15px; border-radius: 5px; margin: 20px 0; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>📧 Invitation Reminder</h1>
            <p>Don't forget to join ${organization?.name || 'our organization'}!</p>
          </div>
          
          <div class="content">
            <div class="reminder">
              <strong>⏰ Reminder:</strong> You still have a pending invitation to join the team.
            </div>
            
            <p>Hi there! 👋</p>
            
            <p>This is a friendly reminder that <strong>${inviter?.name || 'someone'}</strong> invited you to join their team on Calendar Pro.</p>
            
            <div style="text-align: center;">
              <a href="${invitationLink}" class="button">🚀 Accept Invitation</a>
            </div>
            
            <p>If the button doesn't work, you can copy and paste this link:</p>
            <p style="word-break: break-all; background: #e9ecef; padding: 10px; border-radius: 5px; font-family: monospace;">
              ${invitationLink}
            </p>
            
            <p><em>This invitation expires on ${new Date(invitation.expires_at).toLocaleDateString()}.</em></p>
          </div>
          
          <div style="text-align: center; margin-top: 20px; color: #666; font-size: 14px;">
            <p>Best regards,<br>The Calendar Pro Team</p>
          </div>
        </div>
      </body>
      </html>
    `;

    const transporter = createTransporter();

    const mailOptions = {
      from: {
        name: 'Calendar Pro',
        address: process.env.EMAIL_USER
      },
      to: email,
      subject: `⏰ Reminder: Join ${organization?.name || 'the team'} on Calendar Pro`,
      html: emailTemplate
    };

    await transporter.sendMail(mailOptions);

    res.json({
      success: true,
      message: 'Invitation reminder sent successfully',
      sentTo: email
    });

  } catch (error) {
    console.error('Error resending invitation:', error);
    res.status(500).json({
      error: 'Failed to resend invitation',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

module.exports = router;
