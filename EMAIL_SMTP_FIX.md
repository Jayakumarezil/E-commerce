# Gmail SMTP Authentication Fix

## ❌ Error
```
535-5.7.8 Username and Password not accepted
Error code: EAUTH
```

This means Gmail rejected your login credentials because you're using a regular password instead of an **App Password**.

## ✅ Solution: Use Gmail App Password

### Step 1: Enable 2-Step Verification
1. Go to [Google Account Security](https://myaccount.google.com/security)
2. Click **2-Step Verification**
3. Follow the steps to enable it (if not already enabled)

### Step 2: Generate App Password
1. Go to [App Passwords](https://myaccount.google.com/apppasswords)
   - Or: Security → 2-Step Verification → App Passwords
2. Select **"Mail"** as the app
3. Select **"Other (Custom name)"** as the device
4. Enter name: **"E-Commerce App"**
5. Click **Generate**
6. **Copy the 16-character password** (format: `xxxx xxxx xxxx xxxx`)

### Step 3: Update `.env` File

Edit `server/.env` and update:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com          # Your Gmail address
SMTP_PASS=xxxx xxxx xxxx xxxx            # The 16-char App Password (no spaces or with spaces, both work)
```

**Important Notes:**
- ✅ Use **App Password** (16 characters), NOT your regular Gmail password
- ✅ Remove spaces if present: `xxxx xxxx xxxx xxxx` → `xxxxxxxxxxxxxxxx`
- ✅ Keep the App Password secure - never commit it to git

### Step 4: Restart Server

After updating `.env`:
```powershell
cd server
npm run dev
```

You should see:
```
✅ SMTP connection verified successfully
```

## 🧪 Test Email Sending

Try placing an order or resetting a password to test email delivery.

## 🔒 Security Reminders

1. **Never use your regular Gmail password** - it won't work!
2. **App Passwords are required** for Gmail SMTP
3. **Keep `.env` out of git** - add to `.gitignore`
4. **Use separate email for production** - don't use personal Gmail

## 🔄 Alternative: Use Different Email Service

If Gmail is causing issues, consider:

### Option 1: SendGrid (Free Tier: 100 emails/day)
```env
SMTP_HOST=smtp.sendgrid.net
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=apikey
SMTP_PASS=your-sendgrid-api-key
```

### Option 2: Outlook/Hotmail
```env
SMTP_HOST=smtp-mail.outlook.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@outlook.com
SMTP_PASS=your-password
```

### Option 3: Mailtrap (For Testing Only)
```env
SMTP_HOST=sandbox.smtp.mailtrap.io
SMTP_PORT=2525
SMTP_SECURE=false
SMTP_USER=your-mailtrap-user
SMTP_PASS=your-mailtrap-password
```

## ✅ After Fix

Your email service should:
- ✅ Connect to SMTP successfully
- ✅ Send order confirmations
- ✅ Send password reset emails
- ✅ Send warranty notifications
- ✅ Send claim updates

The error should be resolved once you use the App Password! 🎊

