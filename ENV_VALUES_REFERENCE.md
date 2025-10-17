# 🔑 Environment Variables Reference

**All values organized for easy copy-paste**

---

## 🎯 Quick Copy Section

### AUTH_SECRET (Use same for all environments)
```
mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
```

### Preview URL
```
https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app
```

### Production URL
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
```

### API Base (Same for all)
```
https://api.customvenom.com
```

---

## 📋 Preview Environment (For Testing)

Copy these to Vercel → Select "Preview" environment:

```bash
# NextAuth
NEXTAUTH_URL=https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=

# Google OAuth (same client for both environments)
GOOGLE_CLIENT_ID=<get-from-google-console>
GOOGLE_CLIENT_SECRET=<get-from-google-console>

# API
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
API_BASE=https://api.customvenom.com

# Database (same for all)
DATABASE_URL=<get-from-neon-or-vercel>

# Stripe (TEST keys for preview)
STRIPE_SECRET_KEY=sk_test_<get-from-stripe>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<get-from-stripe>
STRIPE_WEBHOOK_SECRET=whsec_<leave-blank-for-now>

# Sentry (optional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=
```

---

## 🚀 Production Environment (For Live Site)

Copy these to Vercel → Select "Production" environment:

```bash
# NextAuth
NEXTAUTH_URL=https://customvenom-frontend-incarcer-incarcers-projects.vercel.app
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=

# Google OAuth (same as preview)
GOOGLE_CLIENT_ID=<same-as-preview>
GOOGLE_CLIENT_SECRET=<same-as-preview>

# API (same as preview)
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
API_BASE=https://api.customvenom.com

# Database (same as preview)
DATABASE_URL=<same-as-preview>

# Stripe (LIVE keys for production)
STRIPE_SECRET_KEY=sk_live_<get-from-stripe>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_<get-from-stripe>
STRIPE_WEBHOOK_SECRET=whsec_<configure-after-deployment>

# Sentry (optional)
SENTRY_DSN=<same-as-preview>
NEXT_PUBLIC_SENTRY_DSN=<same-as-preview>
```

---

## 🔐 Google OAuth Redirect URIs

**Add BOTH to Google Console:**

1. Go to: https://console.cloud.google.com/apis/credentials
2. Select your OAuth 2.0 Client
3. Under "Authorized redirect URIs", add:

### Preview Redirect URI
```
https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app/api/auth/callback/google
```

### Production Redirect URI
```
https://customvenom-frontend-incarcer-incarcers-projects.vercel.app/api/auth/callback/google
```

### Local Development (Optional)
```
http://localhost:3000/api/auth/callback/google
```

---

## 💻 Local Development (.env.local)

Create this file in `customvenom-frontend/.env.local`:

```bash
# NextAuth (Local)
NEXTAUTH_URL=http://localhost:3000
AUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=
NEXTAUTH_SECRET=mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=

# Google OAuth
GOOGLE_CLIENT_ID=<same-as-vercel>
GOOGLE_CLIENT_SECRET=<same-as-vercel>

# API (Local Workers)
NEXT_PUBLIC_API_BASE=http://localhost:8787
API_BASE=http://localhost:8787

# Database
DATABASE_URL=<same-as-vercel>

# Stripe (Test keys)
STRIPE_SECRET_KEY=sk_test_<same-as-preview>
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_<same-as-preview>
STRIPE_WEBHOOK_SECRET=whsec_<from-stripe-cli>

# Sentry (optional)
SENTRY_DSN=
NEXT_PUBLIC_SENTRY_DSN=

# Logs (optional)
NEXT_PUBLIC_LOGS_ENABLED=false
```

---

## 📊 Variable Assignment Table

| Variable | Preview | Production | Local | Notes |
|----------|---------|------------|-------|-------|
| **NEXTAUTH_URL** | npx2mvsgp URL | incarcer URL | localhost:3000 | ⚠️ Must match EXACTLY |
| **AUTH_SECRET** | ✅ Same | ✅ Same | ✅ Same | 🔒 NEVER commit to git |
| **NEXTAUTH_SECRET** | ✅ Same | ✅ Same | ✅ Same | 🔒 NEVER commit to git |
| **GOOGLE_CLIENT_ID** | ✅ Same | ✅ Same | ✅ Same | One OAuth client |
| **GOOGLE_CLIENT_SECRET** | ✅ Same | ✅ Same | ✅ Same | 🔒 NEVER commit to git |
| **DATABASE_URL** | 🔶 Separate DB | 🔶 Separate DB | Dev DB | ⚠️ Use separate per env! |
| **API_BASE** | api-staging (later) | api.customvenom.com | localhost:8787 | 🔶 Consider staging API |
| **STRIPE_SECRET_KEY** | sk_test_ | sk_live_ | sk_test_ | ✅ Different keys |
| **STRIPE_PUBLISHABLE_KEY** | pk_test_ | pk_live_ | pk_test_ | ✅ Different keys |

---

## ✅ Setup Checklist

### 1. Get Credentials

- [ ] Generate AUTH_SECRET (already done: `mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=`)
- [ ] Create Google OAuth Client at https://console.cloud.google.com
- [ ] Create Neon database at https://neon.tech
- [ ] Get Stripe test keys at https://dashboard.stripe.com/test/apikeys

### 2. Configure Google OAuth

- [ ] Add Preview redirect URI
- [ ] Add Production redirect URI
- [ ] (Optional) Add localhost redirect URI

### 3. Add to Vercel

- [ ] Add all Preview environment variables
- [ ] Add all Production environment variables
- [ ] Verify variable names match exactly

### 4. Deploy & Test

- [ ] Redeploy Preview environment
- [ ] Run smoke tests: `pwsh scripts/smoke-preview.ps1`
- [ ] Test Preview site login
- [ ] Redeploy Production environment
- [ ] Test Production site login

---

## 🎯 Where to Add in Vercel

**Direct Link:**
https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

**For each variable:**
1. Click "Add New"
2. Enter Name (e.g., `NEXTAUTH_URL`)
3. Enter Value (copy from above)
4. Select Environment(s):
   - Preview values → Check "Preview" only
   - Production values → Check "Production" only
   - Shared values → Check "Preview" + "Production" + "Development"

---

## 💡 Pro Tips

1. **Copy the AUTH_SECRET first** - You'll use it multiple times
2. **Add Google redirect URIs BEFORE testing** - OAuth won't work without them
3. **Use test Stripe keys everywhere** - Switch to live keys only when ready for real payments
4. **After adding all variables** - Redeploy both Preview and Production
5. **Keep this file handy** - You'll reference these URLs often

---

**Last Updated:** October 17, 2025  
**Status:** Ready to copy-paste ✅

