# Environment Variable Values - Complete List

## ✅ Production Values (From Vercel)

All production values have been found and added to scripts:

- **NEXTAUTH_URL**: `https://www.customvenom.com` ✅
- **AUTH_SECRET**: `mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U=` ✅
- **NEXTAUTH_SECRET**: `5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o=` ✅
- **DATABASE_URL**: `postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require` ✅ (Neon)
- **GOOGLE_CLIENT_ID**: `294409641665-58nk9ngpglaq7e3v99bpckupr780lpsj.apps.googleusercontent.com` ✅
- **GOOGLE_CLIENT_SECRET**: `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` ✅
- **API_BASE**: `https://api.customvenom.com` ✅
- **NEXT_PUBLIC_API_BASE**: `https://api.customvenom.com` ✅
- **REDIS_URL**: `redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421` ✅
- **NEXT_PUBLIC_LOGS_ENABLED**: `false` ✅

## ✅ Preview Values

- **NEXTAUTH_URL**: `https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app` ✅
- **AUTH_SECRET**: Same as production ✅
- **NEXTAUTH_SECRET**: Same as production ✅
- **DATABASE_URL**: Same Neon DB as production ✅
- **GOOGLE_CLIENT_ID**: Same as production ✅
- **GOOGLE_CLIENT_SECRET**: Same as production ✅
- **REDIS_URL**: Same Redis as production ✅
- **NEXT_PUBLIC_API_BASE**: `https://customvenom-workers-api-staging.jdewett81.workers.dev` ✅
- **API_BASE**: `https://customvenom-workers-api-staging.jdewett81.workers.dev` ✅

## ⚠️ Still Need (Optional)

Only Stripe keys still need to be provided (if using Stripe):

- **STRIPE_SECRET_KEY** (test for preview, live for production)
- **NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY** (test for preview, live for production)
- **STRIPE_WEBHOOK_SECRET** (test for preview, live for production)

## 📝 Notes

- **DATABASE_URL**: Uses Neon PostgreSQL (shared between preview and production)
- **REDIS_URL**: Uses Redis Cloud (shared between preview and production)
- **Secrets**: AUTH_SECRET and NEXTAUTH_SECRET are shared between environments (common practice)
- **OAuth**: Google OAuth credentials are shared (can use same app for both environments)
- **Stripe**: Different keys for preview (test) vs production (live)

## 🚀 Ready to Run

The script now has **all required values** pre-filled. It will only prompt for Stripe keys (if you want to add them).

Run:

```powershell
.\scripts\add-vercel-env-vars-idempotent.ps1 -Environment both
```

The script will:

- ✅ Add all variables with actual values (no prompts for secrets)
- ⚠️ Only prompt for Stripe keys (optional - can skip)
- ✅ Skip variables that already exist (idempotent)
