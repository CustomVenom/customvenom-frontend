# 💳 Stripe Preview Setup - Happy Path Testing

**Goal:** Test Stripe checkout in Preview environment without touching production or database.

**Time:** 15 minutes  
**Risk:** Zero (test mode only, no DB writes)

---

## 📋 **What You'll Need:**

1. ✅ Stripe account (free at https://stripe.com)
2. ✅ Test API keys (from Stripe dashboard)
3. ✅ Test price ID (create one product in Stripe)
4. ✅ Stripe CLI (for local webhook testing)

---

## 🎯 **Step-by-Step Setup:**

### **Step 1: Get Stripe Test Keys (5 minutes)**

1. Go to: https://dashboard.stripe.com/test/apikeys
2. Copy these values:

**Publishable Key:**

```
pk_test_51XXXXXXXXXXXXXXX...
```

**Secret Key:**

```
sk_test_51XXXXXXXXXXXXXXX...
```

---

### **Step 2: Create a Test Product (3 minutes)**

1. Go to: https://dashboard.stripe.com/test/products
2. Click **"Add Product"**
3. Fill in:
   - **Name:** "CustomVenom Pro - Season Pass"
   - **Description:** "Pro features for one season"
   - **Price:** $19.99 USD
   - **Billing:** Recurring, Monthly (or Season)
4. Click **Save**
5. Copy the **Price ID** (starts with `price_`)

Example: `price_1XXXXXXXXXX`

---

### **Step 3: Add to Vercel Preview Environment**

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

**Add these 4 variables (Preview environment ONLY):**

| Key                                  | Value                       | Environment |
| ------------------------------------ | --------------------------- | ----------- |
| `STRIPE_SECRET_KEY`                  | `sk_test_XXX` (from Step 1) | ✅ Preview  |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `pk_test_XXX` (from Step 1) | ✅ Preview  |
| `NEXT_PUBLIC_CHECKOUT_PRICE`         | `price_XXX` (from Step 2)   | ✅ Preview  |
| `NEXT_PUBLIC_ENTITLEMENT_PLAN`       | `pro`                       | ✅ Preview  |

**Leave STRIPE_WEBHOOK_SECRET empty for now** (we'll get it in Step 5)

---

### **Step 4: Redeploy Preview**

After adding env vars:

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
2. Find latest Preview deployment
3. Click "..." → **"Redeploy"**
4. Wait 1-2 minutes for build to complete

---

### **Step 5: Setup Stripe CLI for Webhooks (Optional - Local Testing)**

**Install Stripe CLI:**

- Windows: https://github.com/stripe/stripe-cli/releases
- Or via scoop: `scoop install stripe`

**Login and Forward Webhooks:**

```bash
# Login
stripe login

# Forward webhooks to your local dev server
stripe listen --events checkout.session.completed --forward-to http://localhost:3000/api/checkout/session

# CLI will output a webhook secret like:
# whsec_XXXXXXXXXXXXXXX
```

**Add webhook secret to .env.local:**

```bash
STRIPE_WEBHOOK_SECRET=whsec_XXXXXXXXXXXXXXX
```

---

### **Step 6: Test the Happy Path (Preview)**

**Visit Preview URL:**

```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/go-pro
```

**Click "Start Checkout"**

**You'll be redirected to Stripe checkout page:**

- Use test card: `4242 4242 4242 4242`
- Expiry: Any future date (e.g., 12/34)
- CVC: Any 3 digits (e.g., 123)
- ZIP: Any 5 digits (e.g., 12345)

**Complete Checkout:**

- Click "Subscribe"
- Should redirect to `/settings?pro=1`

**Check Webhook Logs:**

- In Stripe Dashboard → Developers → Webhooks
- Or in Stripe CLI output (if running locally)
- Should see: `entitlement_toggle_preview` log entry

---

## ✅ **Success Criteria:**

**You're done when:**

- ✅ `/go-pro` page loads without errors
- ✅ "Start Checkout" button redirects to Stripe
- ✅ Test checkout completes successfully
- ✅ Redirects to `/settings?pro=1` after payment
- ✅ Webhook receives `checkout.session.completed` event
- ✅ Logs show `entitlement_toggle_preview` (no DB errors)

---

## 🔧 **Troubleshooting:**

### **"price_missing" error:**

- Check `NEXT_PUBLIC_CHECKOUT_PRICE` is set in Vercel Preview
- Verify it starts with `price_`
- Redeploy after adding

### **"Failed to create checkout session":**

- Check `STRIPE_SECRET_KEY` is valid (starts with `sk_test_`)
- Check Stripe dashboard for API errors
- Verify keys are for TEST mode, not LIVE

### **Webhook not receiving events:**

- For Preview: Stripe can't reach Vercel webhooks directly (need Stripe CLI locally)
- For local testing: Use `stripe listen --forward-to http://localhost:3000/api/stripe/webhook-preview`
- Or skip webhook testing in Preview (test locally instead)

### **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY error:**

- Check env var name matches exactly (with NEXT*PUBLIC* prefix)
- Verify it's set for Preview environment
- Redeploy after adding

---

## 📁 **Files Created:**

```
✅ src/app/api/checkout/session/route.ts       - Simple checkout (no DB)
✅ src/app/api/stripe/webhook-preview/route.ts - Preview webhook (logs only)
✅ src/app/go-pro/page.tsx                     - Updated to use /checkout/session
```

**Existing files (keep for production):**

- `src/app/api/stripe/webhook/route.ts` - Production webhook (with Prisma)
- `src/app/api/stripe/checkout/route.ts` - Production checkout (if exists)

---

## 🎯 **Preview vs Production:**

| Feature      | Preview                     | Production              |
| ------------ | --------------------------- | ----------------------- |
| **Keys**     | sk*test* / pk*test*         | sk*live* / pk*live*     |
| **Checkout** | /api/checkout/session       | /api/stripe/checkout    |
| **Webhook**  | /api/stripe/webhook-preview | /api/stripe/webhook     |
| **Database** | No writes                   | Full Prisma integration |
| **Purpose**  | Test flow only              | Real subscriptions      |

---

## 📊 **Quick Test Commands:**

**Test checkout session creation:**

```bash
curl -X POST https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/checkout/session
```

**Expected response:**

```json
{
  "id": "cs_test_XXXXXXX",
  "url": "https://checkout.stripe.com/c/pay/cs_test_XXXXXXX"
}
```

---

## 🚀 **Next Steps After Preview Works:**

Once you've tested the happy path:

1. **Add Stripe keys to Production** (when ready for real payments)
2. **Switch to production webhook** (/api/stripe/webhook)
3. **Enable database writes** (upgrade user.role to 'pro')
4. **Setup Stripe billing portal** (for users to manage subscription)
5. **Add webhook endpoint to Stripe dashboard**

---

## 💡 **Pro Tips:**

1. **Always test in Preview first** - Never risk production
2. **Use test cards** - https://stripe.com/docs/testing
3. **Check Stripe logs** - Dashboard → Developers → Events
4. **Monitor webhook deliveries** - Dashboard → Developers → Webhooks
5. **Keep test and live keys separate** - Never mix them!

---

**Status:** ✅ Preview-friendly Stripe checkout ready  
**Database:** Safe (no writes in Preview)  
**Risk:** Zero (test mode only)  
**Ready to test:** After adding env vars and redeploying Preview
