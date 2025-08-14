# 🔧 Email Testing Guide

## 🎯 **Now Test Your Email Setup**

### Step 1: Test Email Configuration
Open your browser and go to: `http://localhost:5000/test` or use the email-test.html file I created.

Or test via terminal:
```bash
curl -X POST http://localhost:5000/api/email/test-email \
  -H "Content-Type: application/json" \
  -d '{"email":"your-test-email@example.com"}'
```

### Step 2: Check Server Logs
Look for these messages in your backend console:

✅ **Success indicators:**
```
🔧 Creating email transporter...
EMAIL_USER: Set ✅
EMAIL_PASS: Set ✅
🔗 Testing email connection...
✅ Connection verified!
✅ Test email sent: <message-id>
```

❌ **Error indicators:**
```
❌ EMAIL_USER: Missing ❌
❌ Email transporter verification failed
❌ Email test failed
```

### Step 3: Check Your Inbox
- Check your main inbox
- **Important**: Check your spam/junk folder
- Look for email from "Calendar Pro Test"

### Step 4: Common Issues & Solutions

#### Issue 1: "Invalid login" or "Application-specific password required"
**Solution**: You need a Gmail App Password
1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Security → 2-Step Verification 
3. App passwords → Mail → Other (Calendar Pro)
4. Use the 16-character password in EMAIL_PASS

#### Issue 2: "Connection timeout"
**Solution**: 
- Check firewall settings
- Ensure ports 587/465 are not blocked
- Try different network (mobile hotspot)

#### Issue 3: Email goes to spam
**Solution**: 
- Check spam folder
- Add sender to contacts
- This is normal for new sending addresses

#### Issue 4: Environment variables not loading
**Solution**:
- Restart your backend server
- Check .env file is in backend/ folder
- Ensure no extra spaces in .env file

### Step 5: Test Invitation Email
Once basic email works, test the full invitation:
```bash
curl -X POST http://localhost:5000/api/email/send-invitation \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "organizationId": "your-org-id",
    "organizationName": "Test Org",
    "inviterName": "Your Name"
  }'
```

## 🚀 **What I Fixed:**

1. ✅ **Removed hardcoded credentials** - Now uses environment variables
2. ✅ **Added debug logging** - See exactly what's happening
3. ✅ **Added connection verification** - Test email config before sending
4. ✅ **Added test endpoint** - Easy way to test email setup
5. ✅ **Better error handling** - More helpful error messages
6. ✅ **Environment variable validation** - Checks if credentials are set

## 📧 **Your Current Configuration:**
- Email: bailwalshivam5@gmail.com
- Password: Set ✅ (App password)
- Service: Gmail
- Frontend URL: https://softrcalendar.netlify.app

The most likely issue is that your Gmail account needs 2FA enabled with an App Password. Regular Gmail passwords don't work with SMTP.
