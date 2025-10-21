# Stripe Quick Test (5 minutes)

**Preview Domain:** `https://customvenom-frontend-git-main-customvenom.vercel.app`

---

## Step 1: Add Environment Variables to Vercel

**Vercel → Project Settings → Environment Variables → Preview**

```env
# Get from: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_YOUR_KEY_HERE
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_KEY_HERE

# Will add after webhook setup
STRIPE_WEBHOOK_SECRET=whsec_YOUR_SECRET_HERE

# Set after creating product (Step 2)
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_YOUR_PRICE_ID
```

**Redeploy Preview** after adding env vars

---

## Step 2: Create Test Product

**Stripe Dashboard → Products → Add Product** (Test Mode)

```
Product name: Custom Venom Pro (Test)
Description: Full access to projections and analytics

Pricing:
  Type: Recurring
  Price: $19.99 USD
  Billing period: Monthly

Copy the Price ID: price_xxxxxxxxxxxxx
```

**Add to Vercel:**
```env
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=price_xxxxxxxxxxxxx
```

**Redeploy Preview**

---

## Step 3: Configure Webhook

**Stripe Dashboard → Developers → Webhooks → Add Endpoint** (Test Mode)

```
Endpoint URL: 
https://customvenom-frontend-git-main-customvenom.vercel.app/api/stripe/webhook

Events to send:
✅ checkout.session.completed
✅ customer.subscription.created
✅ customer.subscription.updated
✅ customer.subscription.deleted

Click "Add endpoint"
```

**Copy Signing Secret:**
- Click on the webhook you just created
- Click "Reveal" under "Signing secret"
- Copy: `whsec_xxxxxxxxxxxxx`

**Add to Vercel:**
```env
STRIPE_WEBHOOK_SECRET=whsec_xxxxxxxxxxxxx
```

**Redeploy Preview** (final time)

---

## Step 4: Run Full Test

### A. Start Checkout
1. Visit: `https://customvenom-frontend-git-main-customvenom.vercel.app/go-pro`
2. Click **"Start Checkout"**
3. Should redirect to Stripe Checkout page

### B. Complete Test Payment
```
Test Card: 4242 4242 4242 4242
Expiry: Any future date (e.g., 12/25)
CVC: Any 3 digits (e.g., 123)
ZIP: Any 5 digits (e.g., 90210)
Email: Use your real email to see receipt
```

### C. Verify Success
1. After payment, redirects to: `/checkout/success?session_id=cs_test_xxx`
2. Message: "Welcome to Pro! Your subscription is being activated..."

### D. Check Webhook (60 seconds)
**Vercel → Deployments → [Latest] → Functions → /api/stripe/webhook → Logs**

Look for:
```
[Stripe Webhook] Event: checkout.session.completed, ID: evt_xxx
[Stripe] Granted pro to your@email.com
```

### E. Verify Pro Access
1. Visit: `https://customvenom-frontend-git-main-customvenom.vercel.app/settings`
2. Should show: **"Role: Pro"** or **"Pro Features Enabled"**
3. No paywall on `/projections` or other Pro routes

---

## Verification Checklist

- [ ] Env vars added to Vercel Preview
- [ ] Test product/price created
- [ ] Price ID added to env vars
- [ ] Webhook endpoint created
- [ ] Webhook secret added to env vars
- [ ] Preview redeployed (3x total)
- [ ] Checkout flow works (redirects to Stripe)
- [ ] Test payment succeeds
- [ ] Redirects to success page
- [ ] Webhook logs show `checkout.session.completed`
- [ ] User granted Pro role in database
- [ ] Pro features accessible

---

## Troubleshooting

### "Price ID required" error
- Check `NEXT_PUBLIC_STRIPE_PRO_PRICE_ID` is set
- Redeploy Preview after adding
- Verify starts with `price_`

### Checkout redirects but no payment form
- Check `STRIPE_SECRET_KEY` is set correctly
- Must start with `sk_test_`
- Verify in Test Mode (not Live)

### Payment succeeds but no Pro access
- Check webhook logs in Vercel
- Verify `STRIPE_WEBHOOK_SECRET` is set
- Check webhook events include `checkout.session.completed`
- Verify user email matches signed-in email

### Webhook returns 400/500
- Check signing secret is correct
- Verify endpoint URL is exact
- Check Vercel logs for error details
- Ensure database is accessible

---

## Quick Test Script

```bash
# Test checkout session creation (requires auth)
curl -X POST https://customvenom-frontend-git-main-customvenom.vercel.app/api/checkout/session \
  -H "Cookie: your-session-cookie" \
  -H "Content-Type: application/json" \
  -d '{"priceId": "price_xxxxxxxxxxxxx"}'

# Expected response:
# {"url": "https://checkout.stripe.com/c/pay/cs_test_xxx..."}
```

---

## Stripe Dashboard Quick Links

- **Test API Keys:** https://dashboard.stripe.com/test/apikeys
- **Products:** https://dashboard.stripe.com/test/products
- **Webhooks:** https://dashboard.stripe.com/test/webhooks
- **Customers:** https://dashboard.stripe.com/test/customers
- **Subscriptions:** https://dashboard.stripe.com/test/subscriptions
- **Test Cards:** https://stripe.com/docs/testing#cards

---

## After Successful Test

### Cleanup (Optional)
- Delete test customer in Stripe Dashboard
- Cancel test subscription
- Keep webhook endpoint for future tests

### Next Steps
1. ✅ Stripe test flow working
2. Set up production keys (when ready)
3. Create real product/prices
4. Configure production webhook
5. Test with real card (will charge)

---

## Production Setup (Later)

**Same process, but:**
- Use Live Mode keys: `sk_live_xxx` and `pk_live_xxx`
- Create production products
- Use production webhook URL
- Test with real payment method
- Monitor real transactions

---

**Estimated Time:** 5-7 minutes
**Cost:** $0 (test mode, no charges)


