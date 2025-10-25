# Frontend API Configuration Guide

This guide explains how to configure the Next.js frontend to use the Cloudflare Workers API.

## Environment Variables

The frontend uses environment variables to configure the API endpoint.

### Local Development

Create `.env.local` in the root of `customvenom-frontend`:

```env
# Local development - points to local Workers API
API_BASE=http://127.0.0.1:8787
NEXT_PUBLIC_API_BASE=http://127.0.0.1:8787
```

### Staging

Create `.env.staging`:

```env
# Staging - points to staging Workers deployment
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api-staging.<your-account>.workers.dev
```

### Production

Create `.env.production`:

```env
# Production - points to custom domain
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
```

## How It Works

The frontend has API route handlers that proxy requests to the Workers API:

### Health Check: `/api/health`

```typescript
// src/app/api/health/route.ts
const API_BASE = process.env.API_BASE;
const upstream = `${API_BASE}/health`;
```

### Projections: `/api/projections`

```typescript
// src/app/api/projections/route.ts
const apiBase = process.env.NEXT_PUBLIC_API_BASE || process.env.API_BASE;
```

## API Endpoints

### 1. Health Check

**Request:**

```bash
GET /api/health
```

**Response:**

```json
{
  "ok": true,
  "schema_version": "v1",
  "last_refresh": "2025-10-15T12:34:56.789Z"
}
```

### 2. Projections

**Request:**

```bash
GET /api/projections?week=2025-06
```

**Response:**

```json
{
  "schema_version": "v1",
  "last_refresh": "2025-10-15T12:34:56.789Z",
  "projections": [
    {
      "player_id": "espn:12345",
      "stat_name": "touchdowns",
      "projection": 3.0,
      "method": "avg(vendor_values)",
      "sources_used": 2,
      "confidence": 0.8,
      "reasons": ["Based on 2 data sources", "Averaged across multiple vendor projections"]
    }
  ]
}
```

## Testing

### 1. Test Local Setup

```bash
# Terminal 1: Start Workers API
cd customvenom-workers-api
npm run dev

# Terminal 2: Start Frontend
cd customvenom-frontend
npm run dev

# Terminal 3: Test endpoints
curl http://localhost:3000/api/health
curl "http://localhost:3000/api/projections?week=2025-06"
```

### 2. Test Production Setup

```bash
# Test Workers API directly
curl https://api.customvenom.com/health
curl "https://api.customvenom.com/projections?week=2025-06"

# Test Frontend (after deployment)
curl https://customvenom.com/api/health
curl "https://customvenom.com/api/projections?week=2025-06"
```

## Deployment Steps

### 1. Deploy Workers API

```bash
cd customvenom-workers-api

# Deploy to production
npm run deploy:production

# Verify deployment
curl https://api.customvenom.com/health
```

### 2. Update Frontend Environment

Ensure `.env.production` has:

```env
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
```

### 3. Deploy Frontend

```bash
cd customvenom-frontend

# Build with production env
npm run build

# Deploy (depends on your hosting - Vercel, Netlify, etc.)
# Example for Vercel:
vercel --prod

# Or for self-hosted:
npm start
```

### 4. Verify Integration

```bash
# Test frontend API routes
curl https://customvenom.com/api/health
curl "https://customvenom.com/api/projections?week=2025-06"
```

## Troubleshooting

### Issue: API_BASE not defined

**Error:**

```json
{
  "ok": false,
  "error": "missing_API_BASE"
}
```

**Solution:**

1. Create `.env.local` with `API_BASE=http://127.0.0.1:8787`
2. Restart the Next.js dev server
3. Verify: `echo $env:API_BASE` (PowerShell) or `echo $API_BASE` (bash)

### Issue: CORS errors

**Error:**

```
Access to fetch at 'https://api.customvenom.com/health' has been blocked by CORS policy
```

**Solution:**
The Workers API already has CORS headers. Verify they're present:

```bash
curl -I https://api.customvenom.com/health
```

Should include:

```
access-control-allow-origin: *
access-control-allow-methods: GET, OPTIONS
access-control-allow-headers: Content-Type
```

### Issue: 404 Not Found on Workers API

**Possible causes:**

1. Worker not deployed
2. Custom domain not configured
3. DNS not proxied through Cloudflare

**Solution:**

1. Check deployment: `cd customvenom-workers-api && npm run deploy:production`
2. Verify custom domain in Cloudflare Dashboard: Workers & Pages → Your Worker → Triggers
3. Check DNS: Cloudflare Dashboard → DNS → Ensure `api` is **Proxied** (orange cloud)

### Issue: Stale data

The API may return stale data if R2 is slow. Check headers:

```bash
curl -I "https://api.customvenom.com/projections?week=2025-06"
```

Look for:

```
x-stale: true
cache-control: public, max-age=60, stale-if-error=86400
```

This is expected behavior - the API serves stale data as a fallback when R2 is slow.

## Environment Variable Reference

| Variable               | Usage                 | Example                       |
| ---------------------- | --------------------- | ----------------------------- |
| `API_BASE`             | Server-side API calls | `http://127.0.0.1:8787`       |
| `NEXT_PUBLIC_API_BASE` | Client-side API calls | `https://api.customvenom.com` |

**Note:** `NEXT_PUBLIC_*` variables are exposed to the browser, while `API_BASE` is server-side only.

## Direct API Usage (Optional)

If you want to call the Workers API directly from frontend components:

```typescript
// In a React component
async function fetchProjections(week: string) {
  const apiBase = process.env.NEXT_PUBLIC_API_BASE;
  const response = await fetch(`${apiBase}/projections?week=${week}`);
  const data = await response.json();
  return data;
}
```

## Next Steps

1. ✅ Set up environment variables (`.env.local`, `.env.production`)
2. ✅ Test locally: Start both Workers API and Frontend
3. ✅ Deploy Workers API with custom domain
4. ✅ Deploy Frontend with production environment
5. ✅ Verify end-to-end: `curl https://customvenom.com/api/health`

---

**Quick Reference:**

```bash
# Local Development
cd customvenom-workers-api && npm run dev    # Start API on :8787
cd customvenom-frontend && npm run dev       # Start frontend on :3000

# Production Deployment
cd customvenom-workers-api && npm run deploy:production
cd customvenom-frontend && npm run build && npm start

# Testing
curl http://localhost:8787/health                    # Workers API (local)
curl http://localhost:3000/api/health                # Frontend proxy (local)
curl https://api.customvenom.com/health              # Workers API (production)
curl https://customvenom.com/api/health              # Frontend proxy (production)
```
