# Environment Configuration

This document explains how to configure environment variables for the CustomVenom frontend.

## Environment Variables

### API Configuration

| Variable | Description | Example |
|----------|-------------|---------|
| `API_BASE` | Server-side API endpoint | `https://api.customvenom.com` |
| `NEXT_PUBLIC_API_BASE` | Client-side API endpoint | `https://api.customvenom.com` |

### Stripe Configuration (Optional)

| Variable | Description | Example |
|----------|-------------|---------|
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | Stripe publishable key | `pk_test_...` or `pk_live_...` |
| `STRIPE_SECRET_KEY` | Stripe secret key | `sk_test_...` or `sk_live_...` |
| `STRIPE_WEBHOOK_SECRET` | Stripe webhook secret | `whsec_...` |

## Setup Instructions

### Local Development

1. Create a `.env.local` file in the frontend root directory:

```bash
# .env.local
API_BASE=http://127.0.0.1:8787
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787
```

2. Start the Workers API locally:
```bash
cd ../customvenom-workers-api
npm run dev
```

3. Start the frontend:
```bash
cd ../customvenom-frontend
npm run dev
```

### Staging Environment

Create a `.env.staging` file:

```bash
# .env.staging
API_BASE=https://api-staging.customvenom.com
NEXT_PUBLIC_API_BASE=https://api-staging.customvenom.com
```

### Production Environment

Create a `.env.production` file:

```bash
# .env.production
API_BASE=https://api.customvenom.com
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
```

## Vercel Deployment

When deploying to Vercel, set these environment variables in the Vercel dashboard:

1. Go to your project settings
2. Navigate to "Environment Variables"
3. Add the following variables:
   - `API_BASE`: `https://api.customvenom.com`
   - `NEXT_PUBLIC_API_BASE`: `https://api.customvenom.com`

For staging deployments, create separate environment variables:
   - `API_BASE`: `https://api-staging.customvenom.com` (Preview only)
   - `NEXT_PUBLIC_API_BASE`: `https://api-staging.customvenom.com` (Preview only)

## Testing the Configuration

After setting up environment variables, test the connection:

```bash
# Health check
curl http://localhost:3000/api/health

# Projections check
curl "http://localhost:3000/api/projections?week=2025-06"
```

## Notes

- `.env.local` is used for local development and is git-ignored
- `.env.production` is used for production builds
- `.env.staging` is used for staging builds
- `NEXT_PUBLIC_*` variables are exposed to the browser
- Regular environment variables (without `NEXT_PUBLIC_`) are server-side only

