# Environment Configuration

## API Configuration

The frontend connects to the Cloudflare Workers API. Configure the API base URL using environment variables.

### Local Development

Create `.env.local` in the project root:

```bash
# Point to local worker (if running wrangler dev)
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787

# Or point to production API
# NEXT_PUBLIC_API_BASE=https://api.customvenom.com
```

### Staging

Create `.env.staging`:

```bash
NEXT_PUBLIC_API_BASE=https://api-staging.customvenom.com
```

### Production

Create `.env.production`:

```bash
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
```

## Stripe Configuration (Optional)

If using Stripe for payments:

```bash
# Public key (safe to expose in frontend)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_...

# Secret key (server-side only, NEVER expose in frontend)
STRIPE_SECRET_KEY=sk_live_...
```

## Environment Variables Reference

| Variable | Required | Description | Example |
|----------|----------|-------------|---------|
| `NEXT_PUBLIC_API_BASE` | Yes | API base URL | `https://api.customvenom.com` |
| `API_BASE` | Optional | Server-side API URL | `https://api.customvenom.com` |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | No | Stripe public key | `pk_live_...` |
| `STRIPE_SECRET_KEY` | No | Stripe secret key | `sk_live_...` |

## Usage in Code

### Client-side (Frontend Components)

```typescript
// Use NEXT_PUBLIC_ prefix for client-side access
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const response = await fetch(`${apiBase}/projections?week=2025-06`);
```

### Server-side (API Routes, Server Components)

```typescript
// Can access both NEXT_PUBLIC_ and non-prefixed vars
const apiBase = process.env.API_BASE || process.env.NEXT_PUBLIC_API_BASE;
const response = await fetch(`${apiBase}/projections?week=2025-06`);
```

## Current Setup

Your frontend currently uses Next.js API routes as a proxy:

```
Frontend → Next.js API Route → Cloudflare Worker → R2 Data
```

### Option 1: Direct API Calls (Recommended)

Update components to call the API directly:

**Before:**
```typescript
const response = await fetch('/api/projections?week=2025-06');
```

**After:**
```typescript
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const response = await fetch(`${apiBase}/projections?week=2025-06`);
```

**Benefits:**
- Faster (no extra hop through Next.js)
- Lower hosting costs
- Better caching at CDN edge
- Simpler architecture

### Option 2: Keep Proxy (Current)

Keep the Next.js API routes. Just update `.env.local`:

```bash
API_BASE=https://api.customvenom.com
```

**Benefits:**
- No frontend code changes needed
- Can add auth/middleware in Next.js
- Can transform responses

## Deployment

### Vercel

Vercel automatically loads environment variables from:
1. `.env.local` (local dev, not committed)
2. `.env.production` (production build)
3. Vercel Dashboard → Project → Settings → Environment Variables

Set in Vercel Dashboard:
- `NEXT_PUBLIC_API_BASE` = `https://api.customvenom.com`

### Other Platforms

Set environment variables in your hosting platform:
- Netlify: Site Settings → Build & Deploy → Environment
- AWS Amplify: App Settings → Environment Variables
- Railway: Project → Variables

## Verification

Test your environment configuration:

```bash
# Local dev
npm run dev
# Check http://localhost:3000/api/health

# Production build
npm run build
npm start
```

## Troubleshooting

### "API base URL not configured"

→ Add `NEXT_PUBLIC_API_BASE` to your `.env.local` or `.env.production`

### API calls failing in production

→ Check Vercel environment variables are set correctly

### CORS errors

→ The worker already has CORS configured. Check browser console for specific error.

### Using wrong API

→ Check `.env.local` vs `.env.production`
→ Restart dev server after changing env vars

