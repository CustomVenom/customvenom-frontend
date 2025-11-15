# Environment Variable Values Found

## ✅ Values Found in Repositories

### Preview NEXTAUTH_URL

- **Found**: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app`
- **Source**: `scripts/check-vercel-env.ps1` (line 70)
- **Status**: ✅ Updated in script

### API Base URLs

- **Preview**: `https://customvenom-workers-api-staging.jdewett81.workers.dev` ✅
- **Production**: `https://api.customvenom.com` ✅
- **Source**: Multiple files, canonical

### Production URLs

- **NEXTAUTH_URL**: `https://www.customvenom.com` ✅
- **Source**: Canonical configuration

## ⚠️ Values Still Need to be Entered

These will be prompted when running the script:

### Required Secrets (Both Environments)

- `DATABASE_URL` - PostgreSQL connection string
- `AUTH_SECRET` - 32-byte random secret
- `NEXTAUTH_SECRET` - 32-byte random secret

### Optional Secrets (Both Environments)

- `GOOGLE_CLIENT_ID` - Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` - Google OAuth client secret
- `STRIPE_SECRET_KEY` - Stripe secret key (test for preview, live for production)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` - Stripe publishable key
- `STRIPE_WEBHOOK_SECRET` - Stripe webhook secret

## 📝 Notes

- **Yahoo OAuth**: Correctly excluded from Vercel (Cloudflare Workers only)
- **Preview URL**: Now hardcoded in script (no prompt needed)
- **DATABASE_URL**: Must be provided - builds will fail without it
- **Secrets**: All secret values must be entered manually for security

## 🚀 Ready to Run

The script now has:

- ✅ Preview NEXTAUTH_URL (actual URL)
- ✅ All API base URLs
- ✅ All non-secret defaults

You'll only be prompted for:

- DATABASE_URL (required)
- AUTH_SECRET / NEXTAUTH_SECRET (required)
- OAuth credentials (optional)
- Stripe keys (optional)
