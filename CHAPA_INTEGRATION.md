# Chapa Payment Gateway Integration Guide

## Overview

ScoreBook now integrates with **Chapa**, Ethiopia's leading payment gateway, to accept payments for subscription plans.

## Setup Instructions

### 1. Create a Chapa Account

1. Go to https://chapa.co
2. Sign up for a merchant account
3. Complete verification (KYC process)
4. Once approved, access your dashboard

### 2. Get Your API Keys

1. Login to [Chapa Dashboard](https://dashboard.chapa.co)
2. Navigate to **Settings > API Keys**
3. Copy your **Secret Key** (API Key)
4. Keep this secure and never share it publicly

### 3. Configure Environment Variables

1. Open `.env.local` file in the project root
2. Add your Chapa API key:

```env
VITE_CHAPA_API_KEY=your_secret_key_here
```

3. Save the file

### 4. Testing Payments

#### Test Card Details
- Card Number: `4200000000000000`
- Expiry: Any future date (e.g., 12/25)
- CVV: Any 3 digits (e.g., 123)
- Name: Any name

#### Test Process
1. Go to Pricing page
2. Click "Choose Plan" button on any paid plan
3. Fill in your details
4. Use test card details
5. You'll be redirected to Chapa checkout
6. Complete the payment flow
7. You'll be redirected back to payment success page

### 5. Payment Flow

```
User clicks "Choose Plan"
    ↓
PaymentDialog Opens
    ↓
User enters details (name, email, phone)
    ↓
User clicks "Pay [Amount] ETB via Chapa"
    ↓
chapaService.initializePayment() called
    ↓
Redirected to Chapa Checkout
    ↓
User completes payment
    ↓
Redirected to /payment-success
    ↓
chapaService.verifyPayment() called
    ↓
Payment Status Displayed

```

## File Structure

```
src/
├── services/
│   └── chapaService.ts          # Chapa API integration
├── components/
│   └── PaymentDialog.tsx        # Payment form component
└── pages/
    ├── Pricing.tsx              # Updated with payment integration
    └── PaymentSuccess.tsx       # Payment verification page
```

## Implementation Details

### chapaService.ts
- `initializePayment()`: Initiates a payment transaction
- `verifyPayment()`: Verifies payment status
- `generateTxRef()`: Generates unique transaction reference
- `createPlanPaymentPayload()`: Creates payment payload from plan data

### PaymentDialog Component
- Opens when user clicks plan CTA button
- Collects: Full Name, Email, Phone Number
- Integrates with Chapa API
- Handles errors and loading states

### PaymentSuccess Page
- Handles return from Chapa checkout
- Verifies payment transaction
- Shows success or failure status
- Stores payment info in localStorage

## API Endpoints Used

### Initialize Payment
```
POST https://api.chapa.co/v1/transaction/initialize
Headers:
  Authorization: Bearer {CHAPA_API_KEY}
  Content-Type: application/json

Body:
{
  "amount": 50,
  "currency": "ETB",
  "email": "user@example.com",
  "first_name": "John",
  "last_name": "Doe",
  "phone_number": "+251 9 XX XXX XXXX",
  "tx_ref": "unique_reference",
  "return_url": "https://yourdomain.com/payment-success",
  "customization": {
    "title": "ScoreBook Payment",
    "description": "Plan subscription"
  }
}

Response:
{
  "status": "success",
  "message": "Charge created",
  "data": {
    "checkout_url": "https://checkout.chapa.co/..."
  }
}
```

### Verify Payment
```
GET https://api.chapa.co/v1/transaction/verify/{reference}
Headers:
  Authorization: Bearer {CHAPA_API_KEY}

Response:
{
  "status": "success",
  "message": "Payment verified",
  "data": {
    "status": "completed",
    "reference": "tx_..."
  }
}
```

## Handling Webhook Events (Optional)

For production, you may want to verify payments via webhooks:

1. Set Webhook URL in Chapa Dashboard: `https://yourdomain.com/api/webhooks/chapa`
2. Verify webhook signature
3. Update subscription status
4. Send confirmation email to user

## Troubleshooting

### "Repository not found" Error
- Ensure `VITE_CHAPA_API_KEY` is set correctly
- Check API key has proper permissions
- Verify environment file is loaded

### Payment Not Verifying
- Check transaction reference is correct
- Verify payment status at Chapa Dashboard
- Ensure return_url matches configuration

### CORS Issues
- CORS is handled on Chapa's backend
- No additional configuration needed
- If issues persist, contact Chapa support

## Security Best Practices

1. **Never commit .env.local** - Add to `.gitignore` ✅
2. **Use HTTPS in production** - Redirect all HTTP to HTTPS
3. **Validate amounts on backend** - Don't trust client-side amounts
4. **Store payment references** - Keep transaction records for audit trail
5. **Implement rate limiting** - Prevent payment spam
6. **Handle sensitive data carefully** - Never log full API keys or card details

## Future Enhancements

- [ ] Webhook payment verification
- [ ] Invoice generation and email
- [ ] Payment history/receipts
- [ ] Subscription renewal automation
- [ ] Multiple payment methods
- [ ] Refund handling
- [ ] Payment analytics dashboard

## Support

For Chapa API support:
- Email: support@chapa.co
- Documentation: https://chapa.co/docs
- Dashboard: https://dashboard.chapa.co

For ScoreBook support:
- Email: support@scorebook.com
