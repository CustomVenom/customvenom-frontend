# 🚀 Go-Live Checklist - Production Ready

**Date:** October 18, 2025
**Status:** Pre-Production Verification
**Owner:** jdewett81@gmail.com

---

## ⚡ Immediate Verifications (5-10 minutes)

### 1. Admin Access ✅

**Objective:** Verify RBAC system works

```bash
# Action Items:
- [ ] Sign out completely (if logged in)
- [ ] Sign in with jdewett81@gmail.com (Google OAuth)
- [ ] Verify "Admin" badge appears in UI
- [ ] Navigate to /ops/metrics
- [ ] Confirm full dashboard visible (not paywall)
- [ ] Check browser console for errors
- [ ] Open Prisma Studio: npx prisma studio
- [ ] Verify User table shows role: "admin" for your email
```

**Expected Result:**

- ✅ Admin role assigned automatically
- ✅ No paywall on /ops/metrics
- ✅ Full access to all features

**If Fails:** See `ADMIN_SETUP_GUIDE.md` troubleshooting

---

### 2. Database Environment Variables 🔐

**Objective:** Ensure database connection in all environments

**DATABASE_URL:**

```
postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require
```

**Vercel Setup:**

```bash
# Action Items:
- [ ] Go to Vercel Dashboard → customvenom-frontend → Settings → Environment Variables
- [ ] Add DATABASE_URL (paste value above)
- [ ] Select environments: ✅ Preview ✅ Production
- [ ] Click "Save"
- [ ] Trigger redeploy: Deployments → Latest → "Redeploy"
- [ ] Wait for build to complete
- [ ] Check build logs for Prisma connection success
```

**Verification Commands:**

```bash
# After redeployment
curl -s https://your-preview.vercel.app/api/analytics/track \
  -X POST \
  -H "Content-Type: application/json" \
  -d '{"event_type":"test","session_id":"test","timestamp":"2025-10-18T12:00:00Z"}'

# Should return: {"ok":true,"event_id":"..."}
```

**Expected Result:**

- ✅ Prisma generates successfully
- ✅ App boots without database errors
- ✅ Analytics endpoints return 200

---

### 3. Ops Page Verification 📊

**Objective:** Confirm metrics dashboard works with real data

```bash
# Action Items:
- [ ] Navigate to /ops/metrics (as admin)
- [ ] Verify Cache Performance tile renders
  - Status indicator (🟢 Fresh / 🟡 Stale / 🔴 Expired)
  - Cache Age in minutes
  - Size in KB
  - Week (2025-06)
  - Hit Rate percentage
- [ ] Verify Analytics tiles render
  - Total Events count
  - Tool Uses count
  - Event Types count
- [ ] Check Events by Type grid populates
- [ ] Verify Recent Events list shows timestamped events
- [ ] Click "Refresh" button
- [ ] Verify no console errors
- [ ] Check Network tab shows successful API calls
```

**Expected Result:**

- ✅ All tiles render with data
- ✅ No layout shift (CLS < 0.1)
- ✅ Refresh updates data
- ✅ No JavaScript errors

---

### 4. API Headers and Contracts 🔍

**Objective:** Validate API responses meet contract

**Test /health endpoint:**

```bash
# Run this command:
curl -si https://your-api.workers.dev/health

# Check for:
- [ ] HTTP 200 OK
- [ ] cache-control: no-store
- [ ] x-request-id: <uuid>
- [ ] x-duration-ms: <number>

# Check JSON body:
curl -s https://your-api.workers.dev/health | jq .

# Should have:
- [ ] ok: true
- [ ] schema_version: "v1"
- [ ] last_refresh: "<iso-date>"
```

**Test /projections endpoint:**

```bash
# Get headers
curl -si https://your-api.workers.dev/projections?week=2025-06 | head -30

# Check for:
- [ ] HTTP 200 OK
- [ ] x-schema-version: v1
- [ ] x-last-refresh: <iso-date>
- [ ] x-key: <r2-key>
- [ ] cache-control: public, max-age=..., stale-if-error=86400

# If stale fallback:
- [ ] x-stale: true
- [ ] x-stale-age: <seconds>

# Check JSON body
curl -s https://your-api.workers.dev/projections?week=2025-06 | jq '.[0]'

# Should have:
- [ ] schema_version: "v1"
- [ ] last_refresh: "<iso-date>"
- [ ] range: { p10, p50, p90 }
- [ ] explanations: (array, max 2 visible after filtering)
```

**Expected Result:**

- ✅ All required headers present
- ✅ Contract fields intact
- ✅ Stale headers appear when using fallback

---

### 5. Lint and Type Checks ✨

**Objective:** Ensure CI/CD pipeline is clean

**Local Checks:**

```bash
cd customvenom-frontend

# Check ESLint
- [ ] npm run lint
      ✅ Should show 0 errors (warnings OK)

# Check TypeScript
- [ ] npm run type-check
      ✅ Should complete with no errors

# Check for 'any' types
- [ ] grep -r ": any" src/ --include="*.ts" --include="*.tsx" | grep -v "eslint-disable"
      ✅ Should find 0 instances in your code
```

**GitHub Actions Check:**

```bash
# Action Items:
- [ ] Go to GitHub → customvenom-frontend → Actions
- [ ] Check latest "Lint and Type Check" workflow
- [ ] Verify all steps pass ✅
- [ ] Check for any warnings to address
```

**Expected Result:**

- ✅ Local lint passes
- ✅ Local type check passes
- ✅ GitHub Actions passes
- ✅ No `any` types in source code

---

## 🔐 Stripe and Auth Hardening (Pre-Production)

### 6. Stripe Configuration 💳

**Test Mode (Preview):**

```bash
# Vercel Preview Environment Variables:
- [ ] STRIPE_SECRET_KEY=sk_test_...
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
- [ ] STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe test webhook)
```

**Live Mode (Production):**

```bash
# Vercel Production Environment Variables:
- [ ] STRIPE_SECRET_KEY=sk_live_...
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...
- [ ] STRIPE_WEBHOOK_SECRET=whsec_... (from Stripe live webhook)
```

**Webhook Setup:**

```bash
# Stripe Dashboard → Webhooks → Add endpoint

Preview endpoint:
- [ ] URL: https://your-preview.vercel.app/api/stripe/webhook
- [ ] Events: checkout.session.completed, customer.subscription.updated,
              customer.subscription.deleted, invoice.payment_failed
- [ ] Copy signing secret → Set as STRIPE_WEBHOOK_SECRET (Preview)

Production endpoint:
- [ ] URL: https://www.customvenom.com/api/stripe/webhook
- [ ] Same events as above
- [ ] Copy signing secret → Set as STRIPE_WEBHOOK_SECRET (Production)
```

**Test Subscription Flow:**

```bash
# Action Items:
- [ ] Go to /go-pro page
- [ ] Click "Upgrade to Pro"
- [ ] Use Stripe test card: 4242 4242 4242 4242
- [ ] Complete checkout
- [ ] Verify webhook fires (check Stripe Dashboard → Webhooks → Events)
- [ ] Check database: User role updated to 'pro'
- [ ] Verify Pro features unlock
- [ ] Test /ops/metrics access as Pro user
```

**Expected Result:**

- ✅ Checkout completes successfully
- ✅ Webhook received and processed
- ✅ User role updated in database
- ✅ Pro features accessible

---

### 7. OAuth Redirect URIs 🔑

**Google OAuth Console:**

```bash
# https://console.cloud.google.com/apis/credentials

Authorized redirect URIs:
- [ ] http://localhost:3000/api/auth/callback/google  (Local)
- [ ] https://your-preview.vercel.app/api/auth/callback/google  (Preview)
- [ ] https://www.customvenom.com/api/auth/callback/google  (Production)

Authorized JavaScript origins:
- [ ] http://localhost:3000  (Local)
- [ ] https://your-preview.vercel.app  (Preview)
- [ ] https://www.customvenom.com  (Production)
```

**Yahoo OAuth (If Configured):**

```bash
# https://developer.yahoo.com/apps/

Redirect URIs:
- [ ] http://localhost:3000/api/auth/callback/yahoo
- [ ] https://your-preview.vercel.app/api/auth/callback/yahoo
- [ ] https://www.customvenom.com/api/auth/callback/yahoo
```

**Verification:**

```bash
# Test each environment:
- [ ] Local: Sign in at localhost:3000
- [ ] Preview: Sign in at preview URL
- [ ] Production: Sign in at customvenom.com

# All should succeed without "redirect_uri_mismatch" error
```

---

### 8. Secrets Management 🔒

**Critical: Use Secrets, Not Variables**

**Vercel Environment Variables Setup:**

**Type: Secret (Encrypted):**

```bash
- [ ] DATABASE_URL
- [ ] AUTH_SECRET
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_SECRET
- [ ] YAHOO_CLIENT_SECRET (if using)
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET
- [ ] SENTRY_DSN (when ready)
```

**Type: Plain Text (Public):**

```bash
- [ ] NEXTAUTH_URL (https://www.customvenom.com for prod)
- [ ] NEXT_PUBLIC_API_BASE
- [ ] API_BASE
- [ ] GOOGLE_CLIENT_ID
- [ ] YAHOO_CLIENT_ID (if using)
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

**Verification:**

```bash
# Ensure secrets are NOT visible in:
- [ ] Deployment logs
- [ ] Browser network tab
- [ ] Client-side code
- [ ] Git history
```

---

## 🧪 Smoke Test Sequence (Copy-Paste Ready)

### API Smoke Tests

**Set your API base:**

```bash
# For local testing
export API_BASE="http://localhost:8787"

# For preview
export API_BASE="https://your-staging-api.workers.dev"

# For production
export API_BASE="https://api.customvenom.com"
```

**Run smoke tests:**

```bash
# 1. Health endpoint
echo "Testing /health..."
curl -s "$API_BASE/health" | jq '{ok, schema_version, last_refresh}'
# Expected: All three fields present

# 2. Health headers
echo -e "\nTesting /health headers..."
curl -si "$API_BASE/health" | grep -iE '^(cache-control|x-request-id|x-duration-ms):'
# Expected: cache-control: no-store, x-request-id, x-duration-ms

# 3. Projections data
echo -e "\nTesting /projections data..."
curl -s "$API_BASE/projections?week=2025-06" | jq '.[0] | {schema_version, last_refresh, range, chips_count: (.explanations | length)}'
# Expected: schema_version, last_refresh, range object, chips_count present

# 4. Projections headers
echo -e "\nTesting /projections headers..."
curl -si "$API_BASE/projections?week=2025-06" | grep -iE '^(x-key|x-schema-version|x-last-refresh|cache-control):'
# Expected: All headers present

# 5. Rate limiting (optional)
echo -e "\nTesting rate limiting..."
for i in {1..110}; do
  curl -s -o /dev/null -w "%{http_code}\n" "$API_BASE/health"
done | tail -10
# Expected: Last few should be 429 (rate limited)
```

---

### Frontend Smoke Tests

**Set your frontend base:**

```bash
# For local
export FRONTEND_BASE="http://localhost:3000"

# For preview
export FRONTEND_BASE="https://your-preview.vercel.app"

# For production
export FRONTEND_BASE="https://www.customvenom.com"
```

**Manual Browser Tests:**

```bash
# 1. Projections Page
- [ ] Visit $FRONTEND_BASE/projections
- [ ] Verify player ribbons render
- [ ] Count chips per row (max 2 visible)
- [ ] Check TrustSnapshot component
  - Version badge visible
  - Last refresh timestamp
  - Stale badge only if x-stale header present
- [ ] Verify no layout shift when page loads
- [ ] Open DevTools → Network → Check headers
- [ ] Verify no console errors

# 2. Tools Pages
- [ ] Visit /tools/start-sit
- [ ] Select 2 players
- [ ] Get recommendation
- [ ] Verify max 2 reason chips
- [ ] Check confidence >= 0.65 on all visible chips

- [ ] Visit /tools/faab
- [ ] Enter player name
- [ ] Get bid range
- [ ] Verify min < likely < max

- [ ] Visit /tools/decisions
- [ ] Verify list populates
- [ ] Check risk mode selector works

# 3. Error Handling
- [ ] Temporarily disconnect from internet
- [ ] Try to load a page
- [ ] Verify graceful error UI (not blank page)
- [ ] Check request_id shows in error message
- [ ] Reconnect and verify recovery
```

---

### Analytics Endpoints

**Test analytics tracking:**

```bash
# POST an event
curl -X POST "$FRONTEND_BASE/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{
    "event_type": "tool_used",
    "tool_name": "Start/Sit",
    "action": "viewed",
    "session_id": "smoke-test-'$(date +%s)'",
    "timestamp": "'$(date -u +%Y-%m-%dT%H:%M:%SZ)'",
    "demo_mode": true
  }'

# Expected: {"ok":true,"event_id":"..."}

# GET rollups
curl -s "$FRONTEND_BASE/api/analytics/rollups?hours=24" | jq '.rollups[0]'

# Expected: Rollup data with event_counts, tool_usage, etc.
```

---

## 🎯 Pre-Production Checklist

### Authentication

```bash
NextAuth Configuration:
- [ ] NEXTAUTH_URL set correctly for each environment
  - Preview: https://your-preview.vercel.app
  - Production: https://www.customvenom.com
- [ ] AUTH_SECRET generated (openssl rand -base64 32)
- [ ] NEXTAUTH_SECRET same as AUTH_SECRET
- [ ] Google OAuth credentials configured
- [ ] Redirect URIs match exactly
- [ ] Test sign-in flow works
- [ ] Test sign-out works
- [ ] Session persists on refresh
```

### Stripe

```bash
Test Mode (Preview):
- [ ] sk_test_... secret key set
- [ ] pk_test_... publishable key set
- [ ] Test webhook endpoint configured
- [ ] Test card 4242... works
- [ ] Webhook fires successfully
- [ ] User role updates after payment
- [ ] Test subscription cancellation
- [ ] Role reverts to 'free' after cancel

Production (Do NOT test yet):
- [ ] sk_live_... secret key ready
- [ ] pk_live_... publishable key ready
- [ ] Live webhook endpoint configured
- [ ] DO NOT test with real cards until ready
```

### Database

```bash
- [ ] DATABASE_URL set in all environments
- [ ] Prisma migrations run successfully
- [ ] Tables exist:
  - User
  - Account
  - Session
  - VerificationToken
  - UserPreferences
  - League
  - AnalyticsEvent
  - HourlyRollup
- [ ] Prisma Studio connects (local)
- [ ] Sample data visible
- [ ] No connection errors in logs
```

### Security

```bash
Secrets (Must be encrypted):
- [ ] DATABASE_URL
- [ ] AUTH_SECRET
- [ ] NEXTAUTH_SECRET
- [ ] GOOGLE_CLIENT_SECRET
- [ ] STRIPE_SECRET_KEY
- [ ] STRIPE_WEBHOOK_SECRET

Public Variables (Plain text OK):
- [ ] NEXTAUTH_URL
- [ ] NEXT_PUBLIC_API_BASE
- [ ] GOOGLE_CLIENT_ID
- [ ] NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY

Verification:
- [ ] No secrets in git history
- [ ] No secrets in deployment logs
- [ ] No secrets visible in Network tab
- [ ] .env.local in .gitignore
```

---

## 📊 Monitoring Setup (Staging First)

### Sentry Configuration

**Staging/Preview First:**

```bash
# Vercel Preview Environment:
- [ ] SENTRY_DSN=https://...@sentry.io/...
- [ ] NEXT_PUBLIC_SENTRY_DSN=https://...@sentry.io/...
- [ ] Enable with low sample rate (5%)

# Update sentry.server.config.ts:
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  enabled: process.env.VERCEL_ENV === 'preview',  // Staging only!
  tracesSampleRate: 0.05,  // 5% sampling
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**Monitor for 24-48 hours:**

```bash
- [ ] Check error volume in Sentry
- [ ] Review error types and frequency
- [ ] Check performance metrics
- [ ] Decide on production enablement
- [ ] Adjust sample rate if needed
```

**Production (After Staging Success):**

```bash
- [ ] Set SENTRY_DSN in Production env
- [ ] Update enabled condition to include 'production'
- [ ] Set tracesSampleRate to 0.01 (1%) initially
- [ ] Monitor and adjust
```

---

## 🚀 Staging API Separation

**Recommended: Before Production**

### Create Staging Worker

**1. wrangler.toml update:**

```toml
[env.staging]
name = "customvenom-api-staging"
route = "staging-api.customvenom.com/*"
vars = { DEMO_MODE = "1", DEMO_WEEK = "2025-06" }

[env.production]
name = "customvenom-api-production"
route = "api.customvenom.com/*"
vars = { DEMO_MODE = "1", DEMO_WEEK = "2025-06" }
```

**2. Deploy staging:**

```bash
cd customvenom-workers-api
wrangler deploy --env staging
```

**3. Point Preview frontend to staging:**

```bash
# Vercel Preview Environment:
- [ ] NEXT_PUBLIC_API_BASE=https://staging-api.customvenom.com
- [ ] API_BASE=https://staging-api.customvenom.com
```

**4. Test breaking changes safely:**

```bash
- [ ] Deploy API changes to staging first
- [ ] Test with Preview frontend
- [ ] Verify no breaking changes
- [ ] Promote to production when safe
```

---

## 🧪 Smoke Sequence Summary

Run this complete sequence before going live:

```bash
#!/bin/bash
# Complete smoke test suite

echo "🔥 Running smoke tests..."
echo ""

# Set your URLs
API_BASE="https://your-api.workers.dev"
FRONTEND_BASE="https://your-preview.vercel.app"

# 1. Health
echo "1️⃣ Testing /health..."
curl -s "$API_BASE/health" | jq '{ok, schema_version, last_refresh}'

# 2. Projections
echo -e "\n2️⃣ Testing /projections..."
curl -s "$API_BASE/projections?week=2025-06" | jq '.[0] | {schema_version, last_refresh, range}'

# 3. Headers
echo -e "\n3️⃣ Testing headers..."
curl -si "$API_BASE/projections?week=2025-06" | grep -iE '^(x-key|x-schema-version|cache-control):'

# 4. Analytics
echo -e "\n4️⃣ Testing analytics..."
curl -X POST "$FRONTEND_BASE/api/analytics/track" \
  -H "Content-Type: application/json" \
  -d '{"event_type":"smoke_test","session_id":"test-'$(date +%s)'","timestamp":"'$(date -u +%Y-%m-%dT%H:%M:%SZ)'","demo_mode":true}' \
  | jq .

# 5. Rollups
echo -e "\n5️⃣ Testing rollups..."
curl -s "$FRONTEND_BASE/api/analytics/rollups?hours=24" | jq '{ok, count, total_events}'

echo -e "\n✅ Smoke tests complete!"
```

Save as `scripts/smoke-test.sh` and run before each deployment.

---

## 📋 Final Go-Live Checklist

### Before Flipping to Production

```bash
Infrastructure:
- [ ] DATABASE_URL in Vercel (Preview + Production)
- [ ] All secrets configured as encrypted env vars
- [ ] Staging API deployed and tested
- [ ] DNS configured (if custom domain)

Authentication:
- [ ] Google OAuth URIs match all environments
- [ ] Admin email (jdewett81@gmail.com) in ADMIN_EMAILS
- [ ] Auth flow tested in Preview
- [ ] Session persistence verified

Payments:
- [ ] Stripe test mode working in Preview
- [ ] Test webhook receiving events
- [ ] User roles updating correctly
- [ ] Subscription flow end-to-end tested
- [ ] Stripe live keys ready (don't set yet)
- [ ] Production webhook endpoint configured (don't enable yet)

Code Quality:
- [ ] npm run lint passes (0 errors)
- [ ] npm run type-check passes
- [ ] GitHub Actions passing
- [ ] No 'any' types in source
- [ ] Pre-commit hooks active

Monitoring:
- [ ] Sentry enabled on Preview (low sample)
- [ ] Cloudflare Analytics enabled
- [ ] Error logging confirmed working
- [ ] Request IDs appearing in logs

Documentation:
- [ ] All handoff docs complete
- [ ] Security docs reviewed
- [ ] Admin setup tested
- [ ] Runbooks for common issues

Testing:
- [ ] All smoke tests passing
- [ ] Admin access verified
- [ ] Pro features gated correctly
- [ ] Error boundaries working
- [ ] Analytics collecting data
- [ ] /ops/metrics rendering
```

### Production Cutover Steps

```bash
1. Final Preview Test:
- [ ] Run complete smoke sequence
- [ ] Test admin access
- [ ] Test Pro subscription
- [ ] Verify all features work

2. Switch Stripe to Live:
- [ ] Update STRIPE_SECRET_KEY (sk_live_...)
- [ ] Update NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (pk_live_...)
- [ ] Update STRIPE_WEBHOOK_SECRET (production webhook)
- [ ] Disable test mode

3. Enable Sentry (Optional):
- [ ] Set SENTRY_DSN in Production
- [ ] Update config to enable production
- [ ] Set sample rate to 1%
- [ ] Monitor for issues

4. Deploy:
- [ ] Merge to main (triggers Vercel production deploy)
- [ ] Monitor deployment logs
- [ ] Run smoke tests against production
- [ ] Verify admin access works
- [ ] Test one full user flow

5. Post-Deploy:
- [ ] Monitor error rates (Sentry/Cloudflare)
- [ ] Check database connection stability
- [ ] Verify analytics collecting
- [ ] Test from different devices/browsers
```

---

## 🆘 Rollback Plan

If production has issues:

```bash
Quick Rollback:
1. Vercel Dashboard → Deployments
2. Find last working deployment
3. Click "..." → "Promote to Production"
4. Fix issues in dev/preview
5. Redeploy when ready

Database Issues:
- Check Neon dashboard for connection errors
- Verify DATABASE_URL is correct
- Check Prisma migrations status
- Rollback migrations if needed: npx prisma migrate reset

Auth Issues:
- Verify NEXTAUTH_URL matches domain
- Check OAuth redirect URIs
- Confirm AUTH_SECRET is set
- Test in incognito window
```

---

## ✅ Success Criteria

### All Must Pass

- [x] Admin signs in successfully
- [x] Database connected (Neon)
- [x] /ops/metrics loads with data
- [x] /health returns proper headers and body
- [x] /projections returns contract fields
- [x] npm run lint passes (0 errors)
- [x] npm run type-check passes
- [x] GitHub Actions passes
- [ ] Stripe test flow completes
- [ ] Analytics events stored
- [ ] Rollups calculated correctly

### Ready for Production When

- [ ] All immediate verifications complete ✅
- [ ] Stripe test mode fully working
- [ ] OAuth working in Preview
- [ ] Smoke tests all green
- [ ] Sentry staged and monitored
- [ ] Admin comfortable with system
- [ ] Rollback plan understood

---

## 📞 Support Resources

**If Issues Occur:**

- `HANDOFF_DOCUMENT.md` - Complete handoff
- `SECURITY_AND_ACCESS_CONTROL.md` - Security setup
- `PRE_COMMIT_SETUP.md` - Pre-commit troubleshooting
- `PROJECT_ASSESSMENT.md` - Known issues and fixes

**External Resources:**

- Vercel Docs: https://vercel.com/docs
- Neon Dashboard: https://console.neon.tech
- Stripe Dashboard: https://dashboard.stripe.com
- Sentry Dashboard: https://sentry.io

---

## 🎉 When Everything is Green

**Run this final command:**

```bash
echo "✅ All checks passed - Ready for Production!"
echo "📊 Admin: jdewett81@gmail.com configured"
echo "🔐 Database: Connected to Neon"
echo "💳 Stripe: Test mode working"
echo "🔒 Security: Admin protection active"
echo "🚀 Next: Switch Stripe to live mode and deploy!"
```

---

**Last Updated:** October 18, 2025
**Prepared By:** AI Assistant
**Reviewed By:** [Pending]
**Status:** Ready for Execution
