# Email Configuration Guide

## 📧 Nodemailer Email Setup

### 1. Install Dependencies
```bash
cd backend
npm install nodemailer
```

### 2. Environment Variables Setup

Add the following to your `backend/.env` file:

#### For Gmail:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-app-password
```

#### For Other Providers:
```env
SMTP_HOST=smtp.your-provider.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-smtp-username
SMTP_PASS=your-smtp-password
```

### 3. Gmail App Password Setup

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Navigate to **Security** → **2-Step Verification**
3. Scroll down to **App passwords**
4. Select app: **Mail**
5. Select device: **Other (custom name)** → Enter "Calendar Pro"
6. Use the generated 16-character password as `EMAIL_PASS`

### 4. Popular Email Provider Settings

#### Gmail:
```env
EMAIL_USER=your-email@gmail.com
EMAIL_PASS=your-16-character-app-password
```

#### Outlook/Hotmail:
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

#### Yahoo:
```env
SMTP_HOST=smtp.mail.yahoo.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@yahoo.com
SMTP_PASS=your-app-password
```

#### Custom SMTP:
```env
SMTP_HOST=mail.your-domain.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@your-domain.com
SMTP_PASS=your-password
```

### 5. Testing Email Configuration

You can test your email setup by calling the API endpoint:

```bash
curl -X POST https://your-backend-url.com/api/email/send-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "organizationId": "your-org-id",
    "organizationName": "Test Organization",
    "inviterName": "Your Name"
  }'
```

### 6. Email Features

#### Send Invitation:
- **Endpoint**: `POST /api/email/send-invitation`
- **Purpose**: Send a beautifully formatted invitation email
- **Features**: HTML template, expiration notice, professional design

#### Resend Invitation:
- **Endpoint**: `POST /api/email/resend-invitation`
- **Purpose**: Send a reminder for existing invitations
- **Features**: Reminder template, expiration check, professional design

### 7. Email Template Features

✅ **Responsive HTML Design**
✅ **Professional Branding**
✅ **Clear Call-to-Action Buttons**
✅ **Fallback Plain Text**
✅ **Security Information**
✅ **Expiration Notices**

### 8. Security Considerations

- Use App Passwords instead of regular passwords
- Keep email credentials in environment variables
- Use HTTPS for production
- Validate email addresses before sending
- Implement rate limiting for email sending

### 9. Troubleshooting

#### Common Issues:

1. **"Invalid login"**: Check if 2FA is enabled and you're using an app password
2. **"Connection timeout"**: Verify SMTP settings and firewall rules
3. **"Email not sent"**: Check spam folder and email logs
4. **"Rate limited"**: Implement delays between emails

#### Debug Mode:
Add this to your Nodemailer transporter for debugging:
```javascript
const transporter = nodemailer.createTransporter({
  // ... your config
  debug: true,
  logger: true
});
```

### 10. Production Deployment

For production, consider:
- Using a dedicated email service (SendGrid, Mailgun, AWS SES)
- Implementing email queues for better performance
- Adding email delivery tracking
- Setting up email analytics

### 11. Environment Variables Checklist

Make sure these are set in your production environment:
- ✅ `EMAIL_USER`
- ✅ `EMAIL_PASS`
- ✅ `FRONTEND_URL`
- ✅ `SUPABASE_URL`
- ✅ `SUPABASE_SERVICE_ROLE_KEY`
