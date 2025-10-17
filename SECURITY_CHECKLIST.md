# 🔒 Security & Operational Checklist

**Critical checks before deploying**

---

## ⚠️ Common Auth Pitfalls (Must Check!)

### 1. NextAuth Redirect URIs - MUST BE EXACT

❌ **Common Mistakes:**
- Missing `/api/auth/callback/google` suffix
- Wrong URL (dashboard URL instead of site URL)
- Trailing slash
- HTTP instead of HTTPS

✅ **Correct Format:**
```
https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app/api/auth/callback/google
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

**Verify in Google Console:**
1. Go to: https://console.cloud.google.com/apis/credentials
2. Click your OAuth 2.0 Client ID
3. Check "Authorized redirect URIs" section
4. Must include BOTH Preview and Production URLs
5. Must end with `/api/auth/callback/google`

---

### 2. NEXTAUTH_URL - Must Match Site URL EXACTLY

❌ **Wrong:**
```
NEXTAUTH_URL=https://vercel.com/incarcers-projects/...  ← Dashboard URL
NEXTAUTH_URL=https://customvenom-frontend.vercel.app/   ← Trailing slash
```

✅ **Correct:**
```
# Preview
NEXTAUTH_URL=https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app

# Production
NEXTAUTH_URL=https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
```

**Rules:**
- No trailing slash
- Must be the actual site URL (not dashboard)
- Must match environment exactly

---

## 🔐 Secrets Handling

### NEVER Commit These to Git

❌ **Do NOT add to repository:**
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`
- `SENTRY_DSN`

✅ **Only set in:**
- Vercel environment variables (secure)
- Local `.env.local` (gitignored)

### Current Generated Secret

```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
```

**Important:**
- ✅ Store only in Vercel env vars
- ✅ Store in password manager (backup)
- ❌ Never commit to git
- ❌ Never paste in public chat/issue

---

## 🗄️ Database Separation (STRONGLY RECOMMENDED)

### ⚠️ Risk: Shared Database

You noted "Same Database" for Preview and Production. **This is risky:**

❌ **Problems with shared DB:**
- Test data pollutes production
- Preview tests can break prod data
- Hard to debug which env caused issues
- Migrations tested in prod first
- Can't rollback independently

### ✅ Recommended: Separate Databases

**Setup (Neon.tech):**

1. **Create Preview Database:**
   - Go to: https://neon.tech
   - Create new project: `customvenom-preview`
   - Copy connection string
   - Add to Vercel as `DATABASE_URL` (Preview only)

2. **Create Production Database:**
   - Create new project: `customvenom-production`
   - Copy connection string
   - Add to Vercel as `DATABASE_URL` (Production only)

**Benefits:**
- ✅ Test migrations safely in Preview
- ✅ Production data never touched by tests
- ✅ Can reset Preview DB anytime
- ✅ Independent backups/restores
- ✅ Separate connection limits

**Cost:** Both Neon free tier projects = $0

---

## 🌐 API Environment Separation

### ⚠️ Risk: Preview Hitting Production API

Current setup:
```
Preview: api.customvenom.com (production API)
Production: api.customvenom.com (production API)
```

❌ **Problems:**
- Preview tests hit production rate limits
- Preview load affects production performance
- Can't test breaking API changes safely
- Shared cache/data coupling

### ✅ Recommended: Staging API for Preview

**Once you have a staging Workers deployment:**

```bash
# Preview Environment
NEXT_PUBLIC_API_BASE=https://api-staging.customvenom.com
API_BASE=https://api-staging.customvenom.com

# Production Environment
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
API_BASE=https://api.customvenom.com
```

**Deploy staging Workers:**
```bash
cd customvenom-workers-api
npm run deploy:staging
```

**Update Vercel Preview:**
- Change `API_BASE` to staging URL
- Redeploy Preview

---

## 💳 Stripe Keys (Different Per Environment)

### ✅ Correct Setup

**Preview (Testing):**
```bash
STRIPE_SECRET_KEY=sk_test_51A... 
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_51A...
```

**Production (Live Payments):**
```bash
STRIPE_SECRET_KEY=sk_live_51A...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_51A...
```

### ⚠️ Never Mix

❌ **Do NOT:**
- Use live keys in Preview
- Use test keys in Production
- Share webhook secrets between environments

✅ **Always:**
- Test keys for Preview/testing
- Live keys only in Production
- Separate webhook endpoints

---

## 🧪 Smoke Tests After Setup

### 1. Test Preview Environment

**Auth Flow:**
```bash
# Visit in browser
https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app/api/auth/signin

# Steps:
1. Click "Sign in with Google"
2. Complete OAuth flow
3. Should redirect back to app
4. Visit /settings to verify role and email
```

**API Health:**
```bash
# Set API base
export NEXT_PUBLIC_API_BASE=https://api.customvenom.com

# Test health endpoint
curl -s "$NEXT_PUBLIC_API_BASE/health" | jq '{ok, schema_version, last_refresh}'

# Should return:
# {
#   "ok": true,
#   "schema_version": "v1",
#   "last_refresh": "2025-10-17T..."
# }
```

**API Headers:**
```bash
# Test projections endpoint headers
curl -si "$NEXT_PUBLIC_API_BASE/projections?week=2025-06" | sed -n '1,20p' | grep -iE '^(x-key|cache-control|x-stale|x-schema-version|x-last-refresh):'

# Should see:
# x-key: data/projections/nfl/2025/week=2025-06/baseline.json
# cache-control: public, max-age=300
# x-schema-version: v1
# x-last-refresh: 2025-10-17T...
```

### 2. Common Issues & Fixes

**Issue: "redirect_uri_mismatch"**
```
Fix: Verify Google Console redirect URI matches exactly
Expected: https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app/api/auth/callback/google
```

**Issue: "Invalid session"**
```
Fix: Check NEXTAUTH_URL matches site URL (no trailing slash)
```

**Issue: "Database connection error"**
```
Fix: Run prisma migration
cd customvenom-frontend
npx vercel env pull .env.production.local
npx prisma db push
```

**Issue: API not responding**
```
Fix: Verify Workers API is deployed
curl https://api.customvenom.com/health
```

---

## ✅ Pre-Launch Checklist

### Preview Environment
- [ ] NEXTAUTH_URL = exact Preview URL (no trailing slash)
- [ ] AUTH_SECRET = never committed to git
- [ ] Google redirect URI = Preview URL + `/api/auth/callback/google`
- [ ] DATABASE_URL = separate Preview database (recommended)
- [ ] API_BASE = staging API (recommended) or production
- [ ] Stripe keys = test keys (sk_test_, pk_test_)
- [ ] Auth flow works (sign in with Google)
- [ ] API health check passes
- [ ] /settings shows correct user data

### Production Environment
- [ ] NEXTAUTH_URL = exact Production URL (no trailing slash)
- [ ] AUTH_SECRET = same as Preview, never committed
- [ ] Google redirect URI = Production URL + `/api/auth/callback/google`
- [ ] DATABASE_URL = separate Production database (recommended)
- [ ] API_BASE = production API only
- [ ] Stripe keys = LIVE keys (sk_live_, pk_live_)
- [ ] Stripe webhooks configured
- [ ] All smoke tests pass
- [ ] Monitor for errors

---

## 🎯 Quick Verification Commands

### Windows PowerShell

**Test Preview Auth:**
```powershell
# Set base URL
$PreviewURL = "https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app"

# Open sign in page
start "$PreviewURL/api/auth/signin"
```

**Test API:**
```powershell
# Health check
Invoke-WebRequest -Uri "https://api.customvenom.com/health" | Select-Object StatusCode, Content

# Headers check
$response = Invoke-WebRequest -Uri "https://api.customvenom.com/projections?week=2025-06"
$response.Headers | Format-List
```

---

## 🔍 What to Watch For

### During Preview Testing
- [ ] OAuth redirects work smoothly
- [ ] No CORS errors in browser console
- [ ] User session persists after refresh
- [ ] API responses have correct headers
- [ ] Database queries succeed
- [ ] Stripe test mode payments work

### Before Production Deploy
- [ ] All Preview tests pass
- [ ] Separate production database configured
- [ ] Live Stripe keys ready
- [ ] Production redirect URI added to Google
- [ ] Monitoring/alerts configured
- [ ] Backup strategy in place

---

## 📚 Reference Documents

1. **`ENV_VALUES_REFERENCE.md`** - All environment values
2. **`VERCEL_ENV_SETUP.md`** - Step-by-step setup
3. **`SECURITY_CHECKLIST.md`** - This document

---

## 🚦 Decision Points

### Database Strategy

**Option A: Shared Database (Quick Start)**
- ✅ Faster setup (one database)
- ✅ Lower cost (free tier)
- ❌ Test data in production
- ❌ Risky for prod stability

**Option B: Separate Databases (Recommended)**
- ✅ Safe testing environment
- ✅ Production data protected
- ✅ Independent scaling
- ❌ Slightly more setup

**Recommendation:** Start with separate databases from day 1

### API Strategy

**Option A: Shared API (Current)**
- ✅ Simple setup
- ❌ Preview affects production
- ❌ Can't test breaking changes

**Option B: Staging API (Recommended)**
- ✅ Safe testing
- ✅ Can test breaking changes
- ✅ Independent rate limits
- ❌ Need to deploy staging Workers

**Recommendation:** Add staging API once you start regular development

---

## ✅ When Preview is Green

**Next steps:**
1. Clone Preview environment variables
2. Change `NEXTAUTH_URL` to Production URL
3. Switch Stripe to live keys
4. Configure production webhook
5. Deploy to Production
6. Run smoke tests on Production
7. Monitor for errors

---

**Last Updated:** October 17, 2025  
**Status:** Ready for secure deployment ✅

