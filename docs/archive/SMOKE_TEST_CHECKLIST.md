# Smoke Test Checklist - Auth & Pro Paywalls

## Prerequisites

- ✅ All dependencies installed
- ✅ Database configured and migrated
- ✅ Environment variables set
- ✅ OAuth providers configured
- ✅ Stripe configured with test mode
- ✅ Dev server running: `npm run dev`
- ✅ Stripe CLI listening (for webhook testing)

## Quick Smoke Tests (2-3 minutes)

### Test 1: Google Sign-In → Settings Shows role=free

```bash
# Manual steps:
1. Navigate to http://localhost:3000
2. Click "Continue with Google"
3. Complete Google OAuth flow
4. Verify redirect to /settings
5. Check that page shows:
   - Your email address
   - Role badge: "Free"
   - "Upgrade to Pro" button visible

# Expected result:
✅ User signed in successfully
✅ /settings shows email and role=free
✅ No "Manage Billing" button (free user)
```

### Test 2: Stripe Test Checkout → role=pro → Manage Billing

```bash
# Manual steps:
1. While signed in, click "Upgrade to Pro"
2. On /go-pro page, click "Start Checkout"
3. Verify redirect to Stripe Checkout
4. Use test card: 4242 4242 4242 4242 (any future date, any CVC)
5. Complete payment
6. Wait for webhook processing (~2-3 seconds)
7. Verify redirect to /settings
8. Check that page now shows:
   - Role badge: "Pro"
   - "Manage Billing" button visible

# Expected result:
✅ Checkout completed successfully
✅ Webhook fired and processed
✅ User role updated to 'pro'
✅ /settings shows "Manage Billing" button

# Verify in logs:
Look for: "User {email} upgraded to Pro (customer: cus_...)"
```

### Test 3: Pro Route Access Control

```bash
# Manual steps (while signed in as FREE user):
1. Navigate to http://localhost:3000/pro
2. Verify automatic redirect to /go-pro
3. Check that page shows upgrade prompt

# Then as PRO user:
1. Navigate to http://localhost:3000/pro
2. Verify page loads (no redirect)

# Expected result:
✅ Free users redirected to /go-pro
✅ Pro users can access /pro route
```

## Comprehensive Tests (5-10 minutes)

### Authentication Flow

```bash
# Test: Sign in with each provider
✅ Google OAuth works
✅ Twitter OAuth works (optional)
✅ Facebook OAuth works (optional)

# Test: Session persistence
✅ Refresh page → still signed in
✅ Close browser → reopen → still signed in

# Test: Sign out
✅ Click "Sign Out" → redirected to home
✅ Session cleared
✅ Can't access /settings without auth
```

### Settings Page

```bash
# Test: Free user view
✅ Email displayed correctly
✅ Name displayed (if provided)
✅ Role badge shows "Free"
✅ "Upgrade to Pro" button visible
✅ No "Manage Billing" button
✅ "Sign Out" button works

# Test: Pro user view
✅ Role badge shows "Pro"
✅ "Manage Billing" button visible
✅ Clicking "Manage Billing" redirects to Stripe portal
✅ Stripe portal allows subscription management
```

### Go Pro Page

```bash
# Test: Page content
✅ Title: "Upgrade to Pro"
✅ Features list displayed
✅ Pricing card shows $19.99/season
✅ Benefits list visible
✅ "Start Checkout" button active

# Test: Checkout flow
✅ Button click creates Stripe session
✅ Redirects to Stripe Checkout
✅ Test card accepted: 4242 4242 4242 4242
✅ Success URL redirects to /settings
✅ Cancel URL redirects to /go-pro
```

### Stripe Webhook

```bash
# Test: Webhook events
✅ checkout.session.completed upgrades user
✅ customer.subscription.created confirms Pro status
✅ customer.subscription.deleted downgrades to free

# Verify in database:
npx prisma studio
# Check User table:
✅ role = 'pro'
✅ stripeCustomerId populated
```

### Middleware Protection

```bash
# Test: Route protection
✅ /pro route requires Pro subscription
✅ Unauthenticated users redirect to home
✅ Free users redirect to /go-pro
✅ Pro users can access protected routes

# Test: Public routes
✅ / (home) accessible without auth
✅ /projections accessible without auth
✅ /api/health accessible without auth
```

### ProLock Component

```bash
# Test: Content gating (if implemented)
✅ Free users see blurred content
✅ Unlock CTA displayed
✅ "Upgrade to Pro" button works
✅ Pro users see unblurred content
```

## Database Verification

```bash
# Open Prisma Studio
npx prisma studio

# Verify User record:
✅ id exists
✅ email correct
✅ role = 'pro' (after upgrade)
✅ stripeCustomerId populated (after payment)

# Verify Account record (OAuth):
✅ provider = 'google' (or twitter/facebook)
✅ providerAccountId populated
✅ access_token stored

# Verify Session record:
✅ sessionToken exists
✅ expires set to future date
✅ userId matches User.id
```

## API Route Tests

### Auth API

```bash
# Test: NextAuth endpoints
curl http://localhost:3000/api/auth/providers
# Expected: List of configured providers

curl http://localhost:3000/api/auth/csrf
# Expected: CSRF token
```

### Stripe API

```bash
# Test: Checkout (requires auth)
curl -X POST http://localhost:3000/api/stripe/checkout \
  -H "Content-Type: application/json" \
  -d '{"priceId":"price_test123"}' \
  -b "next-auth.session-token=..."
# Expected: sessionId and URL

# Test: Webhook (requires signature)
# Use Stripe CLI:
stripe trigger checkout.session.completed
# Expected: Log shows "User {email} upgraded to Pro"
```

## Error Scenarios

### Invalid Scenarios to Test

```bash
# Test: Unauthenticated checkout
✅ POST /api/stripe/checkout → 401 Unauthorized

# Test: Free user tries billing portal
✅ POST /api/stripe/portal → 403 Forbidden

# Test: Invalid Stripe price ID
✅ Checkout with bad priceId → 500 Error

# Test: Missing OAuth credentials
✅ Sign in fails gracefully
✅ Error message displayed
```

## Performance Checks

```bash
# Test: Page load times
✅ /settings loads < 1s
✅ /go-pro loads < 1s
✅ Stripe redirect < 2s

# Test: Webhook processing
✅ Role update < 5s after payment
✅ No duplicate webhook processing
```

## Final Verification

```bash
# Complete flow (end-to-end):
1. ✅ Sign in with Google
2. ✅ View /settings (role=free)
3. ✅ Click "Upgrade to Pro"
4. ✅ Complete Stripe checkout
5. ✅ Webhook processes successfully
6. ✅ Return to /settings (role=pro)
7. ✅ Click "Manage Billing"
8. ✅ View Stripe portal
9. ✅ Return to /settings
10. ✅ Sign out successfully

# All tests passing? ✅
```

## Deployment Verification (Production)

```bash
# After deploying to Vercel:

# Test 1: Production OAuth
✅ Google sign-in works with production callback URL
✅ Session persists across requests

# Test 2: Production Stripe
✅ Checkout creates session with prod keys
✅ Production webhook endpoint working
✅ Role updates after real payment

# Test 3: Production database
✅ User records created
✅ Sessions stored
✅ No connection errors

# Verify Vercel environment variables:
✅ NEXTAUTH_URL set to production domain
✅ DATABASE_URL points to prod database
✅ STRIPE_SECRET_KEY is production key
✅ OAuth credentials are production keys
```

## Common Issues & Fixes

### Issue: "Adapter is not assignable"

```bash
Fix: Cast adapter in auth.ts
adapter: PrismaAdapter(prisma) as any
```

### Issue: Webhook signature failed

```bash
Fix: Verify STRIPE_WEBHOOK_SECRET matches Stripe CLI output
stripe listen --print-secret
```

### Issue: OAuth redirect mismatch

```bash
Fix: Add callback URL to provider:
{NEXTAUTH_URL}/api/auth/callback/{provider}
```

### Issue: Session not persisting

```bash
Fix: Check database connection
npx prisma studio
Verify Session table exists
```

---

## Quick Command Reference

```bash
# Start dev server
npm run dev

# Open Prisma Studio
npx prisma studio

# Generate Prisma client
npx prisma generate

# Push schema changes
npx prisma db push

# Listen to Stripe webhooks
stripe listen --forward-to localhost:3000/api/stripe/webhook

# Trigger test webhook
stripe trigger checkout.session.completed
```

---

**All tests passing?** ✅ Ready for production!
**Issues found?** 📝 Check troubleshooting section in AUTH_IMPLEMENTATION.md
