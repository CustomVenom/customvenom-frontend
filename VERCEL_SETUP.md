# Vercel Deployment Setup

## Current Status

**Vercel Project:** https://vercel.com/incarcers-projects/customvenom-frontend  
**Production URL:** https://customvenom-frontend.vercel.app

## Why Deployment Shows Errors

Your app requires environment variables that aren't configured in Vercel yet.

---

## Required Environment Variables

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

### 1. Database (CRITICAL - Build will fail without this)

```bash
DATABASE_URL=postgresql://user:password@host:port/database?sslmode=require
```

**Options:**
- **Vercel Postgres** (recommended): https://vercel.com/docs/storage/vercel-postgres
  - Go to Storage tab → Create Database → Copy DATABASE_URL
- **Neon.tech** (free tier): https://neon.tech
- **Supabase** (free tier): https://supabase.com
- **Railway** (free tier): https://railway.app

**Quick Fix (Neon - Free):**
1. Go to https://neon.tech
2. Sign up (free)
3. Create a new project
4. Copy connection string
5. Add to Vercel as `DATABASE_URL`

### 2. NextAuth Configuration

```bash
# Generate a secret: openssl rand -base64 32
AUTH_SECRET=<your-random-32-char-secret>

# Or use this alias (NextAuth v5 beta supports both)
NEXTAUTH_SECRET=<same-as-above>

# Required for production
NEXTAUTH_URL=https://customvenom-frontend.vercel.app
```

**Generate AUTH_SECRET:**
```bash
# On your local machine:
openssl rand -base64 32
# Copy the output to Vercel
```

### 3. OAuth Providers (At least ONE required)

**Google OAuth:**
```bash
GOOGLE_CLIENT_ID=<your-google-client-id>
GOOGLE_CLIENT_SECRET=<your-google-secret>
```

Setup: https://console.cloud.google.com/apis/credentials

**Twitter (X) OAuth:**
```bash
TWITTER_CLIENT_ID=<your-twitter-client-id>
TWITTER_CLIENT_SECRET=<your-twitter-secret>
```

Setup: https://developer.twitter.com/en/portal/dashboard

**Facebook OAuth:**
```bash
FACEBOOK_CLIENT_ID=<your-facebook-app-id>
FACEBOOK_CLIENT_SECRET=<your-facebook-secret>
```

Setup: https://developers.facebook.com/apps/

### 4. Stripe (Required for payments)

```bash
STRIPE_SECRET_KEY=sk_live_... # or sk_test_... for testing
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... # or pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe webhook configuration
```

Get from: https://dashboard.stripe.com/apikeys

### 5. API Configuration

```bash
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
API_BASE=https://api.customvenom.com
```

Or for staging:
```bash
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
```

### 6. Sentry (Optional - already stubbed)

```bash
SENTRY_DSN=                           # Leave empty for now
NEXT_PUBLIC_SENTRY_DSN=              # Leave empty for now
```

---

## Quick Fix Strategy

### Minimum to Get Deployed (5 minutes)

**Set these in Vercel:**

1. **DATABASE_URL** - Use Neon.tech free tier (fastest):
   ```
   1. Visit https://neon.tech
   2. Sign up with GitHub
   3. Create project → Copy connection string
   4. Add to Vercel
   ```

2. **AUTH_SECRET** - Generate locally:
   ```bash
   openssl rand -base64 32
   # Add output to Vercel
   ```

3. **NEXTAUTH_URL**:
   ```
   https://customvenom-frontend.vercel.app
   ```

4. **Google OAuth** (easiest provider):
   ```
   1. https://console.cloud.google.com
   2. Create project → APIs & Services → Credentials
   3. Create OAuth 2.0 Client ID
   4. Add authorized redirect:
      https://customvenom-frontend.vercel.app/api/auth/callback/google
   5. Copy Client ID and Secret to Vercel
   ```

5. **Stripe Test Keys**:
   ```
   1. https://dashboard.stripe.com/test/apikeys
   2. Copy test keys to Vercel (start with test mode)
   ```

6. **API Base**:
   ```
   NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
   API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
   ```

### Optional Providers (Add Later)

- Twitter OAuth
- Facebook OAuth
- Production Stripe keys
- Sentry DSN

---

## Deployment Steps

### 1. Set Environment Variables

Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables

Add all required variables above. Use these environment settings:
- Production ✅
- Preview ✅
- Development ✅

### 2. Run Database Migrations

After setting DATABASE_URL, you need to push the Prisma schema:

**Option A: From Local Machine**
```bash
cd customvenom-frontend

# Set the Vercel DATABASE_URL locally (temporary)
export DATABASE_URL="<your-neon-connection-string>"

# Push schema to database
npx prisma db push

# Or run migrations
npx prisma migrate deploy
```

**Option B: From Vercel CLI**
```bash
# Install Vercel CLI
npm i -g vercel

# Link project
vercel link

# Set env temporarily
vercel env pull .env.production.local

# Run migration
npx prisma db push
```

### 3. Trigger Redeploy

After setting all environment variables:

1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend-fop8
2. Click "Deployments" tab
3. Click "Redeploy" on the latest deployment
4. Or push a new commit to trigger deployment

### 4. Verify Deployment

Once deployed:

```bash
# Health check
curl https://customvenom-frontend.vercel.app/api/health

# Should return: {"ok":true}
```

Visit: https://customvenom-frontend.vercel.app

---

## Common Vercel Errors & Fixes

### Error: "Prisma Client could not be generated"

**Cause:** Missing DATABASE_URL or build failed  
**Fix:** 
1. Add DATABASE_URL to Vercel env vars
2. Add this to package.json:
   ```json
   "scripts": {
     "build": "prisma generate && next build"
   }
   ```

### Error: "Invalid `prisma.user.findUnique()` invocation"

**Cause:** Database schema not deployed  
**Fix:** Run `npx prisma db push` with your DATABASE_URL

### Error: "AUTH_SECRET not configured"

**Cause:** Missing AUTH_SECRET env var  
**Fix:** Generate with `openssl rand -base64 32` and add to Vercel

### Error: "Cannot connect to database"

**Cause:** Invalid DATABASE_URL or firewall  
**Fix:** 
1. Verify DATABASE_URL format
2. Ensure database allows connections from anywhere (0.0.0.0/0)
3. Check SSL mode is enabled

### Error: "GOOGLE_CLIENT_ID is not defined"

**Cause:** OAuth provider env vars missing  
**Fix:** Set up OAuth credentials and add to Vercel

---

## Environment Variable Checklist

Copy this to Vercel Environment Variables page:

- [ ] `DATABASE_URL` (PostgreSQL connection string)
- [ ] `AUTH_SECRET` (32+ character random string)
- [ ] `NEXTAUTH_URL` (https://customvenom-frontend.vercel.app)
- [ ] `GOOGLE_CLIENT_ID` (from Google Console)
- [ ] `GOOGLE_CLIENT_SECRET` (from Google Console)
- [ ] `STRIPE_SECRET_KEY` (from Stripe Dashboard)
- [ ] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (from Stripe Dashboard)
- [ ] `STRIPE_WEBHOOK_SECRET` (from Stripe Webhooks)
- [ ] `NEXT_PUBLIC_API_BASE` (Workers API URL)
- [ ] `API_BASE` (Workers API URL)
- [ ] `SENTRY_DSN` (leave empty for now)
- [ ] `NEXT_PUBLIC_SENTRY_DSN` (leave empty for now)

---

## Post-Deployment

### 1. Configure Stripe Webhook

After deployment, set up Stripe webhook:

1. Go to: https://dashboard.stripe.com/webhooks
2. Click "Add endpoint"
3. URL: `https://customvenom-frontend.vercel.app/api/stripe/webhook`
4. Events: Select:
   - `checkout.session.completed`
   - `customer.subscription.created`
   - `customer.subscription.updated`
   - `customer.subscription.deleted`
5. Copy webhook signing secret
6. Add to Vercel as `STRIPE_WEBHOOK_SECRET`

### 2. Update OAuth Redirect URIs

For each OAuth provider, add production callback URL:

**Google:**
- https://customvenom-frontend.vercel.app/api/auth/callback/google

**Twitter:**
- https://customvenom-frontend.vercel.app/api/auth/callback/twitter

**Facebook:**
- https://customvenom-frontend.vercel.app/api/auth/callback/facebook

### 3. Test Full Flow

1. Visit https://customvenom-frontend.vercel.app
2. Sign in with Google
3. Try going Pro (test mode)
4. Verify webhook works
5. Check settings page

---

## Need Help?

**Check Vercel logs:**
- https://vercel.com/incarcers-projects/customvenom-frontend-fop8/logs

**Check build logs:**
- https://vercel.com/incarcers-projects/customvenom-frontend-fop8/deployments

**Common log errors to search for:**
- "DATABASE_URL"
- "AUTH_SECRET"
- "Prisma"
- "OAuth"

---

**Last Updated:** October 16, 2025  
**Status:** Ready for configuration ✅

