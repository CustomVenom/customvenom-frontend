# Vercel Deployment Checklist

## Required Environment Variables

### Production and Preview Environments

Set these in **Vercel → Project → Settings → Environment Variables**:

#### Critical (Required)
- `NEXT_PUBLIC_SITE_URL` = `https://www.customvenom.com` (or your domain)
- `DATABASE_URL` = `postgresql://user:password@host:5432/database` (valid format required, even if placeholder at build)
- `NEXTAUTH_URL` = `https://www.customvenom.com` (must match NEXT_PUBLIC_SITE_URL)
- `AUTH_SECRET` or `NEXTAUTH_SECRET` = `<32+ character random string>`

#### API Configuration
- `NEXT_PUBLIC_API_BASE` = `https://api.customvenom.com` (production) or staging URL (preview)
- `API_BASE` = Same as NEXT_PUBLIC_API_BASE

#### OAuth Providers (if used)
- `GOOGLE_CLIENT_ID` = Your Google OAuth client ID
- `GOOGLE_CLIENT_SECRET` = Your Google OAuth client secret
- `YAHOO_CLIENT_ID` = Your Yahoo OAuth client ID
- `YAHOO_CLIENT_SECRET` = Your Yahoo OAuth client secret

#### Stripe (if used)
- `STRIPE_SECRET_KEY` = `sk_live_...` (production) or `sk_test_...` (preview)
- `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` = `pk_live_...` (production) or `pk_test_...` (preview)
- `STRIPE_WEBHOOK_SECRET` = Webhook secret from Stripe dashboard

### Optional/Safe Toggles (Recommended Off)

These can be set to reduce KV usage and costs:

- `FEATURE_TRUST_ENGINE` = `false`
- `RATE_LIMIT_PERSIST` = `off`
- `VIOLATION_WRITES` = `off`
- `METRIC_PUTS` = `off`
- `WRITE_SAMPLE` = `0.01`

### Feature Flags

- `NEXT_PUBLIC_FEATURE_NBA` = `false` (keep off for NFL-first pass)
- `NEXT_PUBLIC_PAYWALL` = `false` (keep off for clean testing)
- `NEXT_PUBLIC_DEMO_MODE` = `0` (production) or `1` (preview)

## Pre-Deployment Verification

1. **Build Test**: Run `npm run build` locally to verify it completes
2. **Environment Variables**: Verify all required vars are set in Vercel dashboard
3. **Database**: Ensure DATABASE_URL format is valid (Prisma validates format at build)
4. **API Base**: Confirm NEXT_PUBLIC_API_BASE points to correct Workers API

## Post-Deployment Verification

1. **Health Check**: Visit `/api/health` - should return 200 with trust headers
2. **Players Page**: Visit `/players` - verify:
   - `x-stale=false` when Workers is healthy
   - TrustSnapshot shows correct schema version and recent refresh
   - No console errors
3. **Monitor Usage**: Check `/api/admin/usage → cost_metrics` for first hour

## Troubleshooting

### Build Fails
- Check DATABASE_URL format (must be valid PostgreSQL connection string)
- Verify all required env vars are set
- Check build logs for Prisma generate errors

### Runtime Errors
- Verify NEXT_PUBLIC_SITE_URL matches deployment URL
- Check that Workers API is reachable (NEXT_PUBLIC_API_BASE)
- Review Vercel function logs for specific errors

### Missing Data
- Verify NEXT_PUBLIC_API_BASE is set correctly
- Check Workers API health endpoint
- Review network tab for failed API calls

