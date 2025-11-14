# Vercel Environment Variables - Copy-Paste Commands

Run these commands from the `customvenom-frontend` directory.

Replace placeholders (like `YOUR_VALUE_HERE`) with actual values before running.

## Preview Environment

### Non-Secret Variables (can copy-paste directly)

```powershell
# API Configuration
"https://customvenom-workers-api-staging.jdewett81.workers.dev" | vercel env add NEXT_PUBLIC_API_BASE preview
"https://customvenom-workers-api-staging.jdewett81.workers.dev" | vercel env add API_BASE preview

# Feature Flags
"1" | vercel env add NEXT_PUBLIC_DEMO_MODE preview
"0" | vercel env add PAYWALL_DISABLED preview
"1" | vercel env add TAILWIND_DISABLE_OXIDE preview
"preview" | vercel env add NEXT_PUBLIC_ENVIRONMENT preview
"false" | vercel env add NEXT_PUBLIC_LOGS_ENABLED preview
```

### Secret Variables (replace YOUR_VALUE_HERE)

```powershell
# NextAuth (Preview URL found: customvenom-frontend-b3aoume16-incarcers-projects.vercel.app)
"https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app" | vercel env add NEXTAUTH_URL preview
"YOUR_32_BYTE_SECRET" | vercel env add AUTH_SECRET preview
"YOUR_32_BYTE_SECRET" | vercel env add NEXTAUTH_SECRET preview

# Database
"postgresql://user:password@host:5432/database" | vercel env add DATABASE_URL preview

# Google OAuth
"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID preview
"YOUR_GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET preview

# Stripe (Test Mode)
"sk_test_YOUR_TEST_KEY" | vercel env add STRIPE_SECRET_KEY preview
"pk_test_YOUR_TEST_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY preview
"whsec_YOUR_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET preview
```

## Production Environment

### Non-Secret Variables (can copy-paste directly)

```powershell
# API Configuration
"https://api.customvenom.com" | vercel env add NEXT_PUBLIC_API_BASE production
"https://api.customvenom.com" | vercel env add API_BASE production

# Feature Flags
"0" | vercel env add NEXT_PUBLIC_DEMO_MODE production
"0" | vercel env add PAYWALL_DISABLED production
"production" | vercel env add NEXT_PUBLIC_ENVIRONMENT production
"false" | vercel env add NEXT_PUBLIC_LOGS_ENABLED production
```

### Secret Variables (replace YOUR_VALUE_HERE)

```powershell
# NextAuth
"https://www.customvenom.com" | vercel env add NEXTAUTH_URL production
"YOUR_32_BYTE_SECRET" | vercel env add AUTH_SECRET production
"YOUR_32_BYTE_SECRET" | vercel env add NEXTAUTH_SECRET production

# Database
"postgresql://user:password@host:5432/database" | vercel env add DATABASE_URL production

# Google OAuth
"YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com" | vercel env add GOOGLE_CLIENT_ID production
"YOUR_GOOGLE_CLIENT_SECRET" | vercel env add GOOGLE_CLIENT_SECRET production

# Stripe (Live Mode)
"sk_live_YOUR_LIVE_KEY" | vercel env add STRIPE_SECRET_KEY production
"pk_live_YOUR_LIVE_KEY" | vercel env add NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY production
"whsec_YOUR_WEBHOOK_SECRET" | vercel env add STRIPE_WEBHOOK_SECRET production
```

## Update Existing Variables

If a variable already exists and you want to update it:

```powershell
# Remove first
vercel env rm VARIABLE_NAME ENVIRONMENT --yes

# Then add new value
"NEW_VALUE" | vercel env add VARIABLE_NAME ENVIRONMENT
```

## Verify Variables

```powershell
# List all variables for an environment
vercel env ls preview
vercel env ls production

# Pull variables locally (creates .env.local)
vercel env pull .env.local
```

## Quick Reference

- **Preview API**: `https://customvenom-workers-api-staging.jdewett81.workers.dev`
- **Production API**: `https://api.customvenom.com`
- **Preview URL**: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app` ✅
- **Production URL**: `https://www.customvenom.com`

## Notes

- `NEXT_PUBLIC_*` variables are automatically added to all environments (production, preview, development)
- Secret variables should never be committed to git
- After adding variables, redeploy: `vercel --prod`

