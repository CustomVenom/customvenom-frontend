# Vercel Settings Checklist — Build Hardening

**Last Updated:** 2025-10-20
**Purpose:** Prevent build failures and ensure consistent deployments

---

## ✅ Required Vercel Project Settings

### **1. Node Version**

👉 **Settings → General → Node.js Version**

- Set to: **20.x**
- ✅ Also pinned in package.json `engines`

---

### **2. Build & Development Settings**

👉 **Settings → General → Build & Development Settings**

**Build Command:**

```
next build
```

**Install Command:**

```
npm install
```

_(Leave default unless using pnpm/yarn)_

**Output Directory:**

```
(leave empty for Next.js App Router)
```

**Framework Preset:**

- Next.js (auto-detected)

---

### **3. Environment Variables**

👉 **Settings → Environment Variables**

#### **Required for ALL environments:**

**NEXT_PUBLIC_API_BASE**

- Preview: `https://customvenom-workers-api-staging.fib-dev.workers.dev`
- Production: `https://api.customvenom.com`

**DATABASE_URL**

- Get from Neon/Vercel Postgres
- Required for Prisma to generate client
- Format: `postgresql://user:password@host:5432/database?sslmode=require`

**AUTH_SECRET** / **NEXTAUTH_SECRET**

- Generate with: `openssl rand -base64 32`
- Use same value for both

**NEXTAUTH_URL**

- Preview: `https://customvenom-frontend-git-main-customvenom.vercel.app`
- Production: `https://app.customvenom.com` (when ready)

#### **OAuth Credentials (if using):**

- `GOOGLE_CLIENT_ID`
- `GOOGLE_CLIENT_SECRET`
- `YAHOO_CLIENT_ID` (optional)
- `YAHOO_CLIENT_SECRET` (optional)

#### **Stripe (if using):**

- `STRIPE_SECRET_KEY`
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`

#### **Optional:**

- `NEXT_PUBLIC_DEMO_MODE=1` (for preview)
- `PAYWALL_DISABLED=0`
- `SENTRY_DSN` (if using Sentry)

---

### **4. Build Cache**

If builds fail after code works locally:

1. Go to: **Deployments** → Click failing deployment
2. Click **"..."** menu → **"Redeploy"**
3. Check ✅ **"Clear build cache and redeploy"**

**When to clear cache:**

- After changing dependencies
- After Node version change
- After mysterious "module not found" errors

---

## 🛡️ Code-Level Safeguards (Already Implemented)

### **1. Env Defaults in Code** ✅

```typescript
const apiBase = process.env.NEXT_PUBLIC_API_BASE || 'https://api.customvenom.com';
```

All `process.env` usage has fallback defaults.

### **2. Prisma Safety** ✅

```json
"postinstall": "prisma generate || echo 'Prisma generate skipped'"
```

Postinstall won't fail hard if DATABASE_URL missing.

### **3. Node Version Pinned** ✅

```json
"engines": {
  "node": "20.x"
}
```

### **4. No CF Worker Imports** ✅

No Cloudflare-specific code imported in client components.

### **5. Proper "use client" Directives** ✅

All interactive components marked with "use client".

---

## 🚨 Common Build Failures & Fixes

### **"Module not found: Can't resolve..."**

**Cause:** Stale cache or missing dependency
**Fix:**

1. Clear build cache in Vercel
2. Verify package is in `package.json` dependencies

### **"fetch is not defined" or "window is not defined"**

**Cause:** Server-only code running at build time
**Fix:**

1. Add `"use client"` to component
2. Use dynamic import: `const Component = dynamic(() => import('./Component'), { ssr: false })`

### **"Prisma Client could not be generated"**

**Cause:** Missing DATABASE_URL env var
**Fix:**

1. Add DATABASE_URL to Vercel env vars (Preview + Production)
2. Or add `PRISMA_SKIP_POSTINSTALL=1` if DB not needed at build

### **"Environment variable not found"**

**Cause:** Env var not set in Vercel or no default in code
**Fix:**

1. Add env var to Vercel Settings → Environment Variables
2. Or add default in code: `process.env.VAR || 'default'`

### **TypeScript errors blocking build**

**Cause:** Type errors in code
**Fix:**

1. Fix type errors locally first
2. Run `npm run type-check` before committing
3. Or temporarily set `NEXT_DISABLE_TYPE_CHECKING=true` to isolate issue

---

## 🎯 Deployment Verification

After each deployment:

```bash
# Check health
curl -s https://your-vercel-url.vercel.app/api/health | jq

# Check build-time env
curl -s https://your-vercel-url.vercel.app/api/projections | jq '.headers'

# Verify Next.js is responding
curl -I https://your-vercel-url.vercel.app
```

---

## 📋 Pre-Deployment Checklist

Before pushing to main:

- [ ] Run `npm run build` locally (should succeed)
- [ ] Run `npm run type-check` (no errors)
- [ ] Run `npm run lint` (no errors)
- [ ] Verify env vars are set in Vercel for target environment
- [ ] Check previous deployment didn't fail (fix first if it did)

---

## 🔗 Quick Links

**Vercel Dashboard:**

- Project: https://vercel.com/incarcers-projects/customvenom-frontend
- Settings: https://vercel.com/incarcers-projects/customvenom-frontend/settings
- Env Vars: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables
- Deployments: https://vercel.com/incarcers-projects/customvenom-frontend/deployments

**Related Docs:**

- `VERCEL_ENV_PREVIEW.env` — Env template for Preview
- `VERCEL_ENV_PRODUCTION.env` — Env template for Production
- `VERCEL_SETUP.md` — Initial setup guide
- `VERCEL_DEBUG_FIXES.md` — Common issues

---

**Last verified:** 2025-10-20
**Node version:** 20.x
**Next.js version:** 15.5.4
**Build command:** `next build`
