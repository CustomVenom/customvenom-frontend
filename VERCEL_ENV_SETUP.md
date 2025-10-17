# 🔧 Vercel Environment Variables Setup

**Quick Reference for Preview & Production**

---

## 🎯 Your Vercel URLs

| Environment | URL | Use Case |
|-------------|-----|----------|
| **Preview** | `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app` | Testing & OAuth setup |
| **Production** | `https://customvenom-frontend-incarcer-incarcers-projects.vercel.app` | Live deployment |
| **Custom Domain** | `https://customvenom.com` | Future (after DNS setup) |

---

## 📋 Step-by-Step Setup

### Step 1: Go to Vercel Environment Variables

**URL:** https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

---

### Step 2: Add Variables for PREVIEW Environment

Click **"Add New"** for each variable below. Select **"Preview"** environment only.

#### 1. NextAuth URL (PREVIEW)
```
Name:  NEXTAUTH_URL
Value: https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
Environment: ☑️ Preview only
```

#### 2. Auth Secrets (PREVIEW)
```
Name:  AUTH_SECRET
Value: mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Preview only

Name:  NEXTAUTH_SECRET
Value: mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Preview only
```

#### 3. Google OAuth (PREVIEW - Add redirect URI first!)
```
Name:  GOOGLE_CLIENT_ID
Value: <your-google-client-id>
Environment: ☑️ Preview, ☑️ Production

Name:  GOOGLE_CLIENT_SECRET
Value: <your-google-client-secret>
Environment: ☑️ Preview, ☑️ Production
```

#### 4. API Configuration (PREVIEW)
```
Name:  NEXT_PUBLIC_API_BASE
Value: https://api.customvenom.com
Environment: ☑️ Preview, ☑️ Production

Name:  API_BASE
Value: https://api.customvenom.com
Environment: ☑️ Preview, ☑️ Production
```

#### 5. Database (All Environments)
```
Name:  DATABASE_URL
Value: <your-postgres-connection-string>
Environment: ☑️ Preview, ☑️ Production, ☑️ Development
```

#### 6. Stripe Test Keys (PREVIEW)
```
Name:  STRIPE_SECRET_KEY
Value: sk_test_<your-test-secret>
Environment: ☑️ Preview only

Name:  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_test_<your-test-key>
Environment: ☑️ Preview only

Name:  STRIPE_WEBHOOK_SECRET
Value: whsec_<leave-blank-for-now>
Environment: ☑️ Preview only
```

---

### Step 3: Add Variables for PRODUCTION Environment

Click **"Add New"** for each variable. Select **"Production"** environment only.

#### 1. NextAuth URL (PRODUCTION)
```
Name:  NEXTAUTH_URL
Value: https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
Environment: ☑️ Production only
```

#### 2. Auth Secrets (PRODUCTION)
```
Name:  AUTH_SECRET
Value: mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Production only

Name:  NEXTAUTH_SECRET
Value: mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
Environment: ☑️ Production only
```

#### 3. Stripe Live Keys (PRODUCTION)
```
Name:  STRIPE_SECRET_KEY
Value: sk_live_<your-live-secret>
Environment: ☑️ Production only

Name:  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
Value: pk_live_<your-live-key>
Environment: ☑️ Production only

Name:  STRIPE_WEBHOOK_SECRET
Value: whsec_<leave-blank-for-now>
Environment: ☑️ Production only
```

---

## 🔐 Google OAuth Setup

### Setup Google Console

1. **Go to:** https://console.cloud.google.com/apis/credentials

2. **Create OAuth 2.0 Client ID** (if not already created)

3. **Add Authorized Redirect URIs** (add BOTH):

#### Preview Redirect URI
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
```

#### Production Redirect URI
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

4. **Copy Client ID and Secret** → Add to Vercel (Step 2 above)

---

## 🗄️ Database Setup (Quick Start with Neon)

### Option 1: Neon (Recommended - Free)

1. **Go to:** https://neon.tech
2. **Sign up** with GitHub
3. **Create a project** (takes 30 seconds)
4. **Copy connection string**
5. **Paste as DATABASE_URL** in Vercel (all environments)

### Option 2: Vercel Postgres

1. **Go to:** https://vercel.com/incarcers-projects/customvenom-frontend/stores
2. **Click "Create Database"** → Postgres
3. **Automatic:** DATABASE_URL will be added to all environments

---

## 💳 Stripe Setup

### Get Test Keys (For Preview)

1. **Go to:** https://dashboard.stripe.com/test/apikeys
2. **Copy:**
   - Secret key: `sk_test_...`
   - Publishable key: `pk_test_...`
3. **Add to Vercel** (Preview environment)

### Get Live Keys (For Production - Later)

1. **Go to:** https://dashboard.stripe.com/apikeys
2. **Copy:**
   - Secret key: `sk_live_...`
   - Publishable key: `pk_live_...`
3. **Add to Vercel** (Production environment)

---

## ✅ Verification Checklist

### Preview Environment
- [ ] NEXTAUTH_URL = Preview URL (npx2mvsgp)
- [ ] AUTH_SECRET = Generated secret
- [ ] GOOGLE_CLIENT_ID = From Google Console
- [ ] GOOGLE_CLIENT_SECRET = From Google Console
- [ ] DATABASE_URL = Neon/Vercel Postgres
- [ ] Stripe keys = Test keys (sk_test_)
- [ ] API_BASE = https://api.customvenom.com
- [ ] Google redirect URI added (Preview URL)

### Production Environment
- [ ] NEXTAUTH_URL = Production URL (incarcer)
- [ ] AUTH_SECRET = Same as Preview
- [ ] GOOGLE_CLIENT_ID = Same as Preview
- [ ] GOOGLE_CLIENT_SECRET = Same as Preview
- [ ] DATABASE_URL = Same as Preview
- [ ] Stripe keys = Live keys (sk_live_)
- [ ] API_BASE = https://api.customvenom.com
- [ ] Google redirect URI added (Production URL)

---

## 🚀 After Adding Variables

### 1. Run Database Migration

```bash
cd customvenom-frontend

# Pull env vars from Vercel
npx vercel env pull .env.production.local

# Run Prisma migration
npx prisma db push
```

### 2. Redeploy

**Preview:**
1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend
2. Find latest Preview deployment
3. Click **"Redeploy"**

**Production:**
1. Push to main branch, OR
2. Manually redeploy from Vercel dashboard

### 3. Test

**Preview:**
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
```

**Production:**
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
```

---

## 📊 Environment Variables Summary

| Variable | Preview | Production | Shared? |
|----------|---------|------------|---------|
| NEXTAUTH_URL | npx2mvsgp URL | incarcer URL | ❌ |
| AUTH_SECRET | ✅ | ✅ | ✅ Same value |
| GOOGLE_CLIENT_ID | ✅ | ✅ | ✅ Same value |
| GOOGLE_CLIENT_SECRET | ✅ | ✅ | ✅ Same value |
| DATABASE_URL | ✅ | ✅ | ✅ Same value |
| STRIPE_SECRET_KEY | sk_test_ | sk_live_ | ❌ |
| STRIPE_PUBLISHABLE_KEY | pk_test_ | pk_live_ | ❌ |
| API_BASE | api.customvenom.com | api.customvenom.com | ✅ Same |

---

## 🎯 Quick Copy-Paste Values

### For Vercel Environment Variables

**Preview NEXTAUTH_URL:**
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
```

**Production NEXTAUTH_URL:**
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
```

**AUTH_SECRET (both environments):**
```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
```

### For Google Console Redirect URIs

**Preview:**
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
```

**Production:**
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

---

## 💡 Pro Tips

1. **Start with Preview:** Test everything in Preview before touching Production
2. **Same secrets work everywhere:** AUTH_SECRET, GOOGLE credentials, DATABASE_URL
3. **Different Stripe keys:** Use test keys in Preview, live keys in Production
4. **After env changes:** Always redeploy that environment
5. **Google needs both URIs:** Add both Preview and Production redirect URIs now

---

## ⚠️ CRITICAL: Avoid Common Auth Pitfalls

### 🔒 Before You Paste Into Vercel & Google

**1. NextAuth Redirect URIs - MUST BE EXACT**

✅ **Correct (copy these exactly):**
```
https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

❌ **Common Mistakes:**
- Using dashboard URL: `https://vercel.com/incarcers-projects/...`
- Missing suffix: `.../callback/google`
- Adding trailing slash: `.../google/`
- Using wrong Vercel URL

**2. NEXTAUTH_URL - Must Match Site URL Exactly**

✅ **Correct:**
```
NEXTAUTH_URL=https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app
```

❌ **Wrong:**
```
NEXTAUTH_URL=https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/  ← Trailing slash
```

**3. Secrets Handling - NEVER Commit**

🔒 **These go ONLY in Vercel (never in git):**
- `AUTH_SECRET`
- `NEXTAUTH_SECRET`
- `GOOGLE_CLIENT_SECRET`
- `STRIPE_SECRET_KEY`
- `DATABASE_URL`

**4. Database Choice - Consider Separation**

⚠️ **Risk:** Sharing database across Preview and Production
- Test data can contaminate production
- Preview tests can break prod
- Hard to debug which env caused issues

✅ **Strongly Recommended:** Separate DATABASE_URL per environment

**Create 2 databases on Neon.tech:**
1. `customvenom-preview` → Preview DATABASE_URL
2. `customvenom-production` → Production DATABASE_URL

**Benefits:**
- Safe testing
- Independent migrations
- Can reset Preview anytime
- Production data protected

**5. API Base - Rate Limits & Coupling**

⚠️ **Current Setup:** Both environments hit same production API
- Preview tests affect production rate limits
- Shared cache/data coupling

🔶 **Consider Later:** Deploy staging Workers API
```bash
cd customvenom-workers-api
npm run deploy:staging

# Then update Preview env:
NEXT_PUBLIC_API_BASE=https://api-staging.customvenom.com
API_BASE=https://api-staging.customvenom.com
```

---

## 🆘 Common Issues & Fixes

### "Invalid callback URL"
**Cause:** NEXTAUTH_URL doesn't match site URL  
**Fix:** Check exact URL (no trailing slash, must be .vercel.app URL, not dashboard)

### "Google OAuth error: redirect_uri_mismatch"
**Cause:** Redirect URI not added to Google Console or doesn't match exactly  
**Fix:** 
1. Go to Google Console
2. Add exact URI: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/callback/google`
3. Must include `/api/auth/callback/google`

### "Prisma Client not generated"
**Cause:** DATABASE_URL missing or database schema not deployed  
**Fix:** 
```bash
npx vercel env pull .env.production.local
npx prisma db push
```

### Variables not updating
**Cause:** Changes not deployed  
**Fix:** Must redeploy after changing environment variables

### "Session is not available"
**Cause:** AUTH_SECRET or NEXTAUTH_URL wrong  
**Fix:** 
1. Verify AUTH_SECRET set in Vercel
2. Check NEXTAUTH_URL matches deployment URL exactly
3. Redeploy

---

## 🧪 Quick Smoke Tests After Preview Setup

### Run Automated Tests
```powershell
cd customvenom-frontend
pwsh scripts/smoke-preview.ps1
```

### Manual Test - OAuth Flow
1. Visit: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app/api/auth/signin`
2. Click "Sign in with Google"
3. Complete OAuth flow
4. Visit `/settings` to see role and email

### API Health Check
```powershell
$API = "https://api.customvenom.com"
Invoke-WebRequest -Uri "$API/health" | Select-Object StatusCode, Content
```

Expected:
```json
{
  "ok": true,
  "schema_version": "v1",
  "last_refresh": "2025-10-17T..."
}
```

### API Headers Check
```powershell
$response = Invoke-WebRequest -Uri "$API/projections?week=2025-06"
$response.Headers | Where-Object {$_.Key -match 'x-key|cache-control|x-schema'}
```

Expected headers:
- `x-key: data/projections/nfl/2025/week=2025-06/baseline.json`
- `cache-control: public, max-age=300`
- `x-schema-version: v1`
- `x-last-refresh: 2025-10-17T...`

---

**Last Updated:** October 17, 2025  
**Status:** Ready for setup ✅

