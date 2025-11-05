# Razorpay Setup Guide

## Where to Find Your Razorpay Keys

### 1. API Keys (Key ID & Secret)

1. **Log in to Razorpay Dashboard**
   - Go to: https://dashboard.razorpay.com/
   - Sign in with your Razorpay account

2. **Navigate to Settings > API Keys**
   - Click on "Settings" in the left sidebar
   - Click on "API Keys"
   - Or directly access: https://dashboard.razorpay.com/app/keys

3. **Generate/Locate Your Keys**
   - **Test Mode**: For development
     - Key ID: Starts with `rzp_test_`
     - Key Secret: Get by clicking "Reveal Test Key Secret"
   - **Live Mode**: For production
     - Key ID: Starts with `rzp_live_`
     - Key Secret: Get by clicking "Reveal Live Key Secret"

4. **Required Keys:**
   - `RAZORPAY_KEY_ID`: Your Key ID (e.g., `rzp_test_MXNUIAoVhG0iW2`)
   - `RAZORPAY_KEY_SECRET`: Your Key Secret

### 2. Webhook Secret

1. **Navigate to Settings > Webhooks**
   - Go to: https://dashboard.razorpay.com/app/webhooks

2. **Add Your Webhook URL** (if needed)
   - Example: `https://yourdomain.com/api/payment/webhook`
   - For local testing: Use a tool like ngrok to expose localhost

3. **Get Your Webhook Secret**
   - The secret is generated automatically when you create a webhook
   - Use this for: `RAZORPAY_WEBHOOK_SECRET`

## Setting Up Environment Variables

### Server (.env)

Create or update `server/.env`:

```env
# Razorpay Configuration (for payment integration)
RAZORPAY_KEY_ID=rzp_test_MXNUIAoVhG0iW2
RAZORPAY_KEY_SECRET=your-razorpay-key-secret-here

# Webhook Secret (get this from Settings > Webhooks in Razorpay dashboard)
RAZORPAY_WEBHOOK_SECRET=your-webhook-secret-here
```

### Client (.env)

Create or update `client/.env`:

```env
# Razorpay Configuration
VITE_RAZORPAY_KEY_ID=rzp_test_MXNUIAoVhG0iW2
```

**Note**: Only the Key ID is needed in the client-side code. The secret should NEVER be exposed to the client.

## Testing the Integration

### Test Mode (Development)

1. Use test keys that start with `rzp_test_`
2. Use Razorpay's test cards:
   - Success: `4111 1111 1111 1111`
   - Failure: `5555 5555 5555 5555`
3. Any CVV and future expiry date will work

### Test Cards

| Card Number | Scenario |
|------------|----------|
| 4111 1111 1111 1111 | Successful payment |
| 5555 5555 5555 5555 | Payment failure |
| 5104 0600 0000 0008 | Successful payment (Mastercard) |
| 5104 0600 0000 0005 | Payment failure (Mastercard) |

## Payment Verification Flow

1. **Client creates payment**: Opens Razorpay checkout
2. **Payment completed**: User completes payment on Razorpay
3. **Razorpay returns**: `razorpay_payment_id`, `razorpay_order_id`, `razorpay_signature`
4. **Client verifies**: Sends these to your server
5. **Server verifies**: Checks signature and updates order status

## Important Notes

- **Never expose** your Key Secret in client-side code
- Always verify signatures on the server side
- Use test keys for development, live keys for production
- Test mode signatures are more lenient for development
- In production, always verify signatures properly

## Common Issues

### Payment Verification Failing

If verification is failing, check:
1. All required fields are being sent: `order_id`, `payment_id`, `signature`
2. Environment variables are set correctly
3. The order exists in your database
4. The signature format matches Razorpay's requirements

### Signature Verification

The signature verification formula:
```
HMAC-SHA256(order_id|payment_id, key_secret)
```

Example:
```javascript
const crypto = require('crypto');
const signature = crypto
  .createHmac('sha256', key_secret)
  .update(`${order_id}|${payment_id}`)
  .digest('hex');
```

## Useful Links

- Razorpay Dashboard: https://dashboard.razorpay.com/
- API Documentation: https://razorpay.com/docs/api/
- Test Cards: https://razorpay.com/docs/payments/payment-gateway/test-cards/
- Webhook Events: https://razorpay.com/docs/payments/webhooks/

