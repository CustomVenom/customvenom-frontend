# API Setup Instructions

## ✅ Cloudflare Worker Deployed

Your API is now live at:
**https://customvenom-workers-api.jdewett81.workers.dev**

### Testing Endpoints

Health check:
```bash
curl https://customvenom-workers-api.jdewett81.workers.dev/health
```

Projections:
```bash
curl "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06"
```

## Frontend Environment Setup

Create a `.env.local` file in this directory with:

```env
# Cloudflare Workers API Base URL
API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
```

## Setting Up Custom Domain (api.customvenom.com)

### Prerequisites
- Your domain `customvenom.com` must be added to Cloudflare
- DNS must be proxied through Cloudflare (orange cloud icon)

### Steps

1. **Add DNS Record (if not exists)**
   - Go to Cloudflare Dashboard → Your domain → DNS
   - Add an A record:
     - Type: `A`
     - Name: `api`
     - IPv4 address: `192.0.2.1` (dummy IP, will be proxied)
     - Proxy status: **Proxied** (orange cloud)

2. **Add Worker Route**
   - Go to Cloudflare Dashboard → Workers & Pages
   - Click on your worker: `customvenom-workers-api`
   - Go to **Triggers** tab
   - Click **Add Route**
   - Route: `api.customvenom.com/*`
   - Zone: `customvenom.com`
   - Click **Save**

3. **Update Frontend Environment Variables**
   
   Update your `.env.local`:
   ```env
   API_BASE=https://api.customvenom.com
   NEXT_PUBLIC_API_BASE=https://api.customvenom.com
   ```

4. **Verify**
   ```bash
   curl https://api.customvenom.com/health
   ```

## Worker Configuration

Your worker is configured with:
- ✅ R2 Bucket: `customvenom-data`
- ✅ CORS enabled
- ✅ Request logging (request_id, duration_ms)
- ✅ Production environment configured

## Useful Commands

Deploy worker:
```bash
cd ../customvenom-workers-api
wrangler deploy
```

View worker logs:
```bash
wrangler tail
```

Test locally:
```bash
wrangler dev
```

Deploy to staging (if configured):
```bash
wrangler deploy --env=staging
```

## Adding Secrets

If you need to add API keys or secrets:

```bash
cd ../customvenom-workers-api
wrangler secret put NOTION_TOKEN
wrangler secret put STRIPE_SECRET_KEY
# etc...
```

## Cron Jobs (Optional)

To add scheduled tasks, update `wrangler.jsonc`:

```jsonc
{
  // ... existing config
  "triggers": {
    "crons": ["0 */6 * * *"]  // Run every 6 hours
  }
}
```

Then add a scheduled handler to `src/index.ts`:

```typescript
export default {
  async fetch(request: Request, env: Env): Promise<Response> {
    // ... existing code
  },
  
  async scheduled(event: ScheduledEvent, env: Env, ctx: ExecutionContext) {
    // Run your cron job here
    console.log('Cron job running at:', new Date().toISOString());
  }
} satisfies ExportedHandler<Env>;
```

