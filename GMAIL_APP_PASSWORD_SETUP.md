# Gmail App Password Setup - Quick Guide

## ❌ Current Error
```
535-5.7.8 Username and Password not accepted
```

**Reason**: Gmail requires **App Passwords** for SMTP, not regular passwords.

## ✅ Fix Steps

### Step 1: Enable 2-Step Verification
1. Visit: https://myaccount.google.com/security
2. Click **"2-Step Verification"**
3. Enable it if not already enabled
4. You'll need your phone for verification

### Step 2: Generate App Password
1. Visit: https://myaccount.google.com/apppasswords
   - Or: Security → 2-Step Verification → App Passwords
2. Select:
   - **App**: Mail
   - **Device**: Other (Custom name)
   - **Name**: E-Commerce Server
3. Click **Generate**
4. **Copy the 16-character password** (looks like: `abcd efgh ijkl mnop`)

### Step 3: Update `.env` File

Open `server/.env` and update:

```env
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=jaya.cena199@gmail.com
SMTP_PASS=abcdefghijklmnop            # ← Paste App Password here (remove spaces)
```

**Important:**
- ✅ Remove spaces from the App Password
- ✅ Use App Password, NOT your regular Gmail password
- ✅ The App Password is 16 characters without spaces

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

## 🔒 Security Note

I've removed hardcoded credentials from the code. Now it **only uses environment variables** from `.env` file for security.

## 🧪 Test

After configuration, try:
- Placing an order (should send confirmation email)
- Resetting password (should send reset email)
- Submitting a claim (should send confirmation)

## ❓ Still Having Issues?

If you still get authentication errors:
1. Double-check App Password was copied correctly (no spaces)
2. Verify 2-Step Verification is enabled
3. Try generating a new App Password
4. Check `.env` file is in `server/` directory
5. Restart server after updating `.env`

Your email service is ready once App Password is configured! 🎊

