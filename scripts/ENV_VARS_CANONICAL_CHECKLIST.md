# Environment Variables Canonical Checklist

## ✅ Verification Summary

### Required Variables (Must Be Present)
- [x] `DATABASE_URL` - PostgreSQL connection string
- [x] `NEXTAUTH_URL` - Must match deployment URL exactly
- [x] `AUTH_SECRET` - 32-byte random secret
- [x] `NEXTAUTH_SECRET` - 32-byte random secret
- [x] `NEXT_PUBLIC_API_BASE` - API base URL
- [x] `API_BASE` - API base URL (server-side)

### Optional Variables (Nice to Have)
- [x] `GOOGLE_CLIENT_ID` - Google OAuth client ID
- [x] `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- [x] `STRIPE_SECRET_KEY` - Stripe secret key (test or live)
- [x] `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- [x] `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret
- [x] `NEXT_PUBLIC_ENVIRONMENT` - Environment identifier
- [x] `NEXT_PUBLIC_LOGS_ENABLED` - Logging flag
- [x] `NEXT_PUBLIC_DEMO_MODE` - Demo mode flag
- [x] `PAYWALL_DISABLED` - Paywall flag
- [x] `TAILWIND_DISABLE_OXIDE` - Tailwind flag

### ❌ Forbidden Variables (Cloudflare Workers Only)
These should **NOT** be on Vercel:
- [x] `YAHOO_CLIENT_ID` - ✅ Confirmed NOT in scripts
- [x] `YAHOO_CLIENT_SECRET` - ✅ Confirmed NOT in scripts
- [x] `SESSION_SIGNING_KEY` - ✅ Confirmed NOT in scripts

## Script Verification

### ✅ `add-vercel-env-vars-idempotent.ps1`
- ✅ Contains all required variables
- ✅ Contains optional variables
- ✅ **NO Yahoo OAuth variables** (correct - Cloudflare Workers only)
- ✅ Idempotent (safe to run multiple times)
- ✅ Checks existing variables before adding

### ✅ `upsert-vercel-env-vars.ps1`
- ✅ Only updates specified keys
- ✅ **NO Yahoo OAuth variables**
- ✅ Safe update pattern (remove then add)

### ✅ `VERCEL_ENV_COMMANDS.md`
- ✅ All commands documented
- ✅ **NO Yahoo OAuth commands**
- ✅ Ready for copy-paste

## Environment-Specific Values

### Preview
- `NEXTAUTH_URL`: `https://your-preview-url.vercel.app` (⚠️ **Must be actual preview URL**)
- `NEXT_PUBLIC_API_BASE`: `https://customvenom-workers-api-staging.jdewett81.workers.dev`
- `API_BASE`: `https://customvenom-workers-api-staging.jdewett81.workers.dev`
- `NEXT_PUBLIC_DEMO_MODE`: `1`
- `NEXT_PUBLIC_ENVIRONMENT`: `preview`

### Production
- `NEXTAUTH_URL`: `https://www.customvenom.com`
- `NEXT_PUBLIC_API_BASE`: `https://api.customvenom.com`
- `API_BASE`: `https://api.customvenom.com`
- `NEXT_PUBLIC_DEMO_MODE`: `0`
- `NEXT_PUBLIC_ENVIRONMENT`: `production`

## ⚠️ Critical Notes

1. **NEXTAUTH_URL must match deployment URL exactly** - Auth will 400 if mismatched
2. **Yahoo OAuth stays on Cloudflare Workers** - Never add to Vercel
3. **DATABASE_URL is required** - Builds will fail without it
4. **NEXT_PUBLIC_* variables** - Automatically added to all environments (production, preview, development)

## Verification Commands

```powershell
# Verify variables
.\scripts\VERIFY_ENV_VARS.ps1

# List variables
vercel env ls preview
vercel env ls production

# Pull variables locally
vercel env pull .env.vercel.preview
vercel env pull .env.vercel.production

# After adding variables, redeploy
vercel --prod
```

## Next Steps

1. Run verification: `.\scripts\VERIFY_ENV_VARS.ps1`
2. Add missing variables: `.\scripts\add-vercel-env-vars-idempotent.ps1 -Environment both`
3. Update NEXTAUTH_URL in Preview to actual preview URL
4. Verify: `vercel env ls`
5. Pull locally: `vercel env pull .env.vercel.preview`
6. Redeploy: `vercel --prod`

