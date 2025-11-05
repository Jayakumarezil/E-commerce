# Email Service Integration Guide

## 📧 Overview

The email service is already integrated in the server using **Nodemailer** with SMTP support. This guide explains how to configure and use it.

## ✅ What's Already Implemented

### Email Service Features:
1. ✅ Order confirmation emails
2. ✅ Order shipped notifications
3. ✅ Warranty registration confirmations
4. ✅ Password reset emails
5. ✅ Password change confirmations
6. ✅ Claim submission confirmations
7. ✅ Claim status updates

### Email Templates:
- Professional HTML templates
- Responsive design
- Brand colors (Blue theme)
- Product images support
- Order details tables

## 🔧 Setup Instructions

### Step 1: Configure .env File

The `.env` file has been created from `env.example`. Update it with your SMTP credentials:

```env
# Email Configuration (SMTP)
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_SECURE=false
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
ADMIN_EMAIL=admin@ecommerce.com
```

### Step 2: Get Gmail App Password

If using Gmail:

1. Go to [Google Account Settings](https://myaccount.google.com/)
2. Click **Security** → **2-Step Verification** (enable if not enabled)
3. Click **App Passwords**
4. Generate a new app password for "Mail"
5. Copy the 16-character password
6. Paste it in `.env` as `SMTP_PASS`

### Step 3: Test Email Service

The email service should automatically verify the SMTP connection on server start. Check the console for:
```
SMTP connection verified successfully
```

## 📧 Email Types

### 1. Order Confirmation
**Trigger**: When customer places an order
**Sent To**: Customer email
**Includes**: Order details, items, total, shipping address

### 2. Order Shipped
**Trigger**: When order status changes to "shipped"
**Sent To**: Customer email
**Includes**: Tracking info, estimated delivery

### 3. Warranty Registration
**Trigger**: When warranty is auto-created after purchase
**Sent To**: Customer email
**Includes**: Product details, warranty period, serial number

### 4. Password Reset
**Trigger**: When user requests password reset
**Sent To**: User email
**Includes**: Reset token/link

### 5. Claim Submission
**Trigger**: When user submits a claim
**Sent To**: Customer email
**Includes**: Claim details, submission confirmation

### 6. Claim Status Update
**Trigger**: When admin updates claim status
**Sent To**: Customer email
**Includes**: Updated status, admin notes

## 🚀 Usage Examples

### Already Integrated in Controllers:

**1. Payment Controller (Order Confirmation):**
```typescript
await emailService.sendOrderConfirmationEmail(
  user.email,
  user.name,
  order.order_id,
  order.total_price,
  order,
  orderItems
);
```

**2. Warranty Controller:**
```typescript
await emailService.sendWarrantyRegistrationEmail(
  user.email,
  user.name,
  warranty,
  product
);
```

**3. Auth Controller (Password Reset):**
```typescript
await emailService.sendPasswordResetEmail(
  user.email,
  user.name,
  resetToken
);
```

## 📝 Environment Variables

| Variable | Description | Default | Required |
|----------|-------------|---------|----------|
| `SMTP_HOST` | SMTP server hostname | smtp.gmail.com | ✅ |
| `SMTP_PORT` | SMTP server port | 587 | ✅ |
| `SMTP_SECURE` | Use TLS (true/false) | false | ✅ |
| `SMTP_USER` | SMTP username | - | ✅ |
| `SMTP_PASS` | SMTP app password | - | ✅ |
| `ADMIN_EMAIL` | Admin notification email | admin@ecommerce.com | ❌ |
| `FRONTEND_URL` | Frontend URL for links | http://localhost:3000 | ❌ |

## 🔒 Security Best Practices

1. **Never commit `.env` file** to version control
2. **Use App Passwords** for Gmail (not regular password)
3. **Store credentials securely** in production
4. **Use environment-specific configs** for dev/prod

## 🧪 Testing Email

### Test SMTP Connection:
The server will automatically verify SMTP connection on startup.

### Test Email Sending:
1. Place a test order
2. Reset a password
3. Submit a claim
4. Check email inbox

### Development Testing:
Use a service like [Mailtrap](https://mailtrap.io/) or [Ethereal Email](https://ethereal.email/) for testing without sending real emails.

## 🐛 Troubleshooting

### Error: "Invalid login credentials"
**Solution**: Use App Password, not regular password

### Error: "Connection timeout"
**Solution**: Check firewall settings, verify SMTP_PORT (587 for Gmail)

### Error: "Missing credentials"
**Solution**: Ensure `.env` file has all SMTP variables set

### Emails not sending:
1. Check server logs for errors
2. Verify SMTP credentials
3. Check spam folder
4. Test SMTP connection manually

## 📦 Production Setup

For production, use a professional email service:
- **SendGrid** (recommended)
- **Amazon SES**
- **Mailgun**
- **Postmark**

Update `.env` with production SMTP credentials.

## ✅ Next Steps

1. ✅ `.env` file created
2. ⏳ Configure SMTP credentials in `.env`
3. ⏳ Restart server to load new credentials
4. ⏳ Test by placing an order or resetting password
5. ✅ Email service is ready to use!

The email service is **fully integrated** and ready to use once SMTP credentials are configured! 🎊

