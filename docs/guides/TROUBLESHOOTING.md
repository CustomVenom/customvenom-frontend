# 🔧 Troubleshooting Guide

**Common issues and their solutions**

---

## 🚨 Workers API Issues

### Issue: "Worker exceeded CPU time limit"

**Symptoms**:
```
Error 1102: Worker exceeded CPU time limit
```

**Causes**:
- Heavy computation in worker
- Large JSON parsing
- Inefficient loops
- Synchronous I/O

**Solutions**:

1. **Move computation to build time**:
```typescript
// ❌ BAD: Compute in worker
app.get('/projections', async (c) => {
  const rawData = await r2.get('data.csv');
  const parsed = heavyParser(rawData); // CPU limit exceeded!
  return c.json(parsed);
});

// ✅ GOOD: Pre-compute, store as JSON
app.get('/projections', async (c) => {
  const data = await r2.get('precomputed.json');
  return c.json(data);
});
```

2. **Use streaming for large responses**:
```typescript
return c.stream(async (stream) => {
  for (const chunk of largeDataset) {
    await stream.write(JSON.stringify(chunk));
  }
});
```

3. **Reduce JSON size**:
```typescript
// Remove unnecessary fields
const trimmed = projections.map(({ player_id, projection }) => 
  ({ player_id, projection })
);
```

---

### Issue: "R2 operation timeout"

**Symptoms**:
- Request hangs
- 504 Gateway Timeout
- x-stale: true responses

**Causes**:
- R2 temporarily unavailable
- Large file reads
- Network issues

**Solutions**:

1. **Reduce timeout**:
```typescript
// Current: 300ms
const { data } = await r2GetText(bucket, key, 200); // Reduce to 200ms
```

2. **Use stale-if-error pattern** (already implemented):
```typescript
if (!data && LAST_GOOD_CACHE.has(key)) {
  c.header('x-stale', 'true');
  return LAST_GOOD_CACHE.get(key).body;
}
```

3. **Check R2 status**:
```bash
# Visit Cloudflare status page
open https://www.cloudflarestatus.com/
```

---

### Issue: "Environment variables not working"

**Symptoms**:
- `process.env.DEMO_MODE` is undefined
- Demo mode not activating
- Secrets not accessible

**Causes**:
- Deployed without env vars
- Wrong environment selected
- Secrets not bound

**Solutions**:

1. **Deploy with vars**:
```bash
# For default environment
wrangler deploy --var DEMO_MODE:1 --var DEMO_WEEK:2025-06

# For named environment
wrangler deploy --env production
```

2. **Check wrangler.toml**:
```toml
[vars]
DEMO_MODE = "1"
DEMO_WEEK = "2025-06"

[env.production.vars]
DEMO_MODE = "1"
DEMO_WEEK = "2025-06"
```

3. **Verify secrets**:
```bash
# List secrets
wrangler secret list

# Add missing secret
echo "value" | wrangler secret put SECRET_NAME
```

---

### Issue: "Rate limit not working"

**Symptoms**:
- No 429 responses
- Rate limit bypassed
- Excessive requests

**Causes**:
- Middleware not applied
- IP extraction failing
- Rate limit too high

**Solutions**:

1. **Verify middleware order**:
```typescript
// Must be BEFORE routes
app.use('*', rateLimit);
app.get('/projections', async (c) => { /* ... */ });
```

2. **Check IP extraction**:
```typescript
// In rate-limit.ts
const ip = c.req.header('cf-connecting-ip') || 
           c.req.header('x-real-ip') || 
           'unknown';

console.log('Rate limit check for IP:', ip);
```

3. **Test rate limiting**:
```bash
# Make 100+ requests quickly
for i in {1..110}; do 
  curl https://your-api.com/projections?week=2025-06
done
# Should see 429 after ~100
```

---

## 💻 Frontend Issues

### Issue: "Page not found after deploy"

**Symptoms**:
- 404 errors on new pages
- Routes not working
- Vercel 404 page

**Causes**:
- Build failed silently
- Dynamic route misconfigured
- File not committed

**Solutions**:

1. **Check Vercel deployment logs**:
```bash
# In Vercel dashboard
# Deployments → Latest → View Logs
```

2. **Verify file structure**:
```bash
# Ensure page.tsx exists
ls src/app/my-page/page.tsx

# Check git status
git status
git add src/app/my-page/
git commit -m "Add new page"
git push
```

3. **Test build locally**:
```bash
npm run build
# Check for errors
```

---

### Issue: "Prisma client not generated"

**Symptoms**:
```
Error: @prisma/client did not initialize yet
Cannot find module '@prisma/client'
```

**Causes**:
- postinstall script didn't run
- Prisma schema changed
- Build cache issue

**Solutions**:

1. **Generate manually**:
```bash
npx prisma generate
```

2. **Clear cache and rebuild**:
```bash
rm -rf .next node_modules
npm install
npm run build
```

3. **Update package.json**:
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "build": "prisma generate && next build"
  }
}
```

---

### Issue: "Environment variables undefined in browser"

**Symptoms**:
- `process.env.NEXT_PUBLIC_API_BASE` is undefined
- API calls fail
- Missing env var errors

**Causes**:
- Env var not prefixed with `NEXT_PUBLIC_`
- Not set in Vercel
- Build cache issue

**Solutions**:

1. **Check prefix**:
```typescript
// ❌ BAD: Won't work in browser
const api = process.env.API_BASE;

// ✅ GOOD: Accessible in browser
const api = process.env.NEXT_PUBLIC_API_BASE;
```

2. **Set in Vercel**:
```bash
# Via Vercel dashboard
# Project Settings → Environment Variables
# Add: NEXT_PUBLIC_API_BASE = https://api.customvenom.com
```

3. **Redeploy after adding vars**:
```bash
# Trigger redeploy
git commit --allow-empty -m "Trigger redeploy"
git push
```

---

### Issue: "Hydration mismatch"

**Symptoms**:
```
Error: Text content does not match server-rendered HTML
Warning: Expected server HTML to contain...
```

**Causes**:
- Client/server rendering difference
- Date/time formatting
- Random values
- Browser extensions

**Solutions**:

1. **Use suppressHydrationWarning**:
```tsx
// For intentionally different content
<time suppressHydrationWarning>
  {new Date().toLocaleString()}
</time>
```

2. **Ensure consistent rendering**:
```tsx
// ❌ BAD: Different on client/server
<div>{Math.random()}</div>
<div>{new Date().toString()}</div>

// ✅ GOOD: Consistent
<div>{props.timestamp}</div>
```

3. **Use 'use client' for dynamic content**:
```tsx
'use client';
export function DynamicComponent() {
  const [time, setTime] = useState(new Date());
  return <div>{time.toString()}</div>;
}
```

---

## 🔐 Authentication Issues

### Issue: "NextAuth session undefined"

**Symptoms**:
- `session` is always null
- Can't authenticate
- Login doesn't persist

**Causes**:
- AUTH_SECRET not set
- Cookie domain mismatch
- NEXTAUTH_URL wrong

**Solutions**:

1. **Check AUTH_SECRET**:
```bash
# Generate new secret
openssl rand -base64 32

# Set in .env.local and Vercel
AUTH_SECRET=<generated_secret>
```

2. **Verify NEXTAUTH_URL**:
```bash
# Local
NEXTAUTH_URL=http://localhost:3000

# Production
NEXTAUTH_URL=https://customvenom-frontend.vercel.app
```

3. **Check cookie settings**:
```typescript
// In auth config
cookies: {
  sessionToken: {
    name: `__Secure-next-auth.session-token`,
    options: {
      httpOnly: true,
      sameSite: 'lax',
      path: '/',
      secure: true // Only in production
    }
  }
}
```

---

### Issue: "Yahoo OAuth failing"

**Symptoms**:
- OAuth redirect fails
- "Invalid redirect_uri"
- Can't complete login

**Causes**:
- Redirect URI not whitelisted
- Client ID/secret wrong
- Scope incorrect

**Solutions**:

1. **Check Yahoo Developer Console**:
```
# Verify redirect URIs include:
http://localhost:3000/api/auth/callback/yahoo
https://your-domain.vercel.app/api/auth/callback/yahoo
```

2. **Verify credentials**:
```typescript
// In auth config
YahooProvider({
  clientId: process.env.YAHOO_CLIENT_ID!,
  clientSecret: process.env.YAHOO_CLIENT_SECRET!
})
```

3. **Test locally**:
```bash
# Start local server
npm run dev

# Try OAuth flow
open http://localhost:3000/api/auth/signin
```

---

## 💳 Stripe Issues

### Issue: "Checkout session expires"

**Symptoms**:
- User redirected but no upgrade
- Entitlements not updated
- Payment succeeded but no Pro access

**Causes**:
- Webhook not receiving events
- session_id not captured
- Database not updated

**Solutions**:

1. **Check webhook endpoint**:
```bash
# Verify webhook URL in Stripe dashboard
https://your-domain.vercel.app/api/stripe/webhook

# Test locally with Stripe CLI
stripe listen --forward-to localhost:3000/api/stripe/webhook
```

2. **Verify webhook secret**:
```bash
# In Vercel environment variables
STRIPE_WEBHOOK_SECRET=whsec_xxxxx
```

3. **Check session_id handling**:
```typescript
// In /api/checkout/session/route.ts
const sessionId = url.searchParams.get('session_id');
if (sessionId) {
  await updateUserEntitlements(sessionId);
}
```

---

## 🗄️ Database Issues

### Issue: "Prisma migration failed"

**Symptoms**:
```
Error: P3009: migrate found failed migrations
```

**Causes**:
- Migration applied partially
- Database state mismatch
- Schema and database out of sync

**Solutions**:

1. **Reset database** (development only):
```bash
npx prisma migrate reset
npx prisma db push
```

2. **Mark migration as applied**:
```bash
npx prisma migrate resolve --applied "20231015_migration_name"
```

3. **Create new migration**:
```bash
npx prisma migrate dev --name fix_schema
```

---

### Issue: "Connection pool exhausted"

**Symptoms**:
```
Error: Too many connections
Can't reach database server
```

**Causes**:
- Too many concurrent requests
- Connections not closed
- Pool size too small

**Solutions**:

1. **Configure connection limit**:
```typescript
// In lib/db.ts
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL + '?connection_limit=10'
    }
  }
});
```

2. **Use connection pooling**:
```bash
# In DATABASE_URL
postgresql://user:pass@host/db?pgbouncer=true&connection_limit=10
```

3. **Close connections properly**:
```typescript
// Ensure prisma.$disconnect() is called
process.on('beforeExit', async () => {
  await prisma.$disconnect();
});
```

---

## 🐛 Debugging Techniques

### Enable Verbose Logging

**Workers API**:
```typescript
// Add detailed logs
console.log(JSON.stringify({
  request_id: requestId,
  message: "Debug info",
  env: c.env,
  headers: Object.fromEntries(c.req.raw.headers),
  url: c.req.url,
  timestamp: new Date().toISOString()
}));
```

**Frontend**:
```typescript
// Add to layout.tsx for global debugging
if (process.env.NODE_ENV === 'development') {
  console.log('[Debug]', {
    url: window.location.href,
    env: process.env,
    session: await getServerSession()
  });
}
```

### Use Wrangler Tail

```bash
# Stream live logs
wrangler tail

# Filter by specific request
wrangler tail --format json | jq 'select(.message | contains("projections"))'

# Search for errors
wrangler tail | grep -i error
```

### Browser DevTools

**Network Tab**:
1. Check request/response headers
2. Verify cache-control headers
3. Monitor response times
4. Check for 429 rate limits

**Console Tab**:
1. Filter by error/warning
2. Check for hydration warnings
3. Monitor component renders (React DevTools)

**Performance Tab**:
1. Record page load
2. Check LCP/FCP times
3. Identify slow requests

---

## 📊 Health Check Commands

### Quick Status Check
```bash
# Workers API
curl -i https://customvenom-workers-api.jdewett81.workers.dev/health | head -20

# Frontend
curl -I https://customvenom-frontend.vercel.app

# Check cache hit ratio
curl https://customvenom-workers-api.jdewett81.workers.dev/ops-data | jq '.cache.rate'
```

### Smoke Test Script
```bash
#!/bin/bash
# Save as smoke-test.sh

API_BASE="https://customvenom-workers-api.jdewett81.workers.dev"

echo "=== Smoke Tests ==="

# Test 1: Health
echo "1. Health check..."
curl -s "$API_BASE/health" | jq '.ok'

# Test 2: Projections
echo "2. Projections..."
curl -s "$API_BASE/projections?week=2025-06" | jq '.schema_version'

# Test 3: Demo mode
echo "3. Demo mode header..."
curl -I -s "$API_BASE/projections?week=2025-05" | grep x-demo-mode

# Test 4: Ops data
echo "4. Cache rate..."
curl -s "$API_BASE/ops-data" | jq '.cache.rate'

echo "=== Tests Complete ==="
```

---

## 🆘 When All Else Fails

### 1. Check Service Status
- [Cloudflare Status](https://www.cloudflarestatus.com/)
- [Vercel Status](https://www.vercel-status.com/)
- [GitHub Status](https://www.githubstatus.com/)

### 2. Review Recent Changes
```bash
# Check recent commits
git log --oneline -10

# See what changed
git diff HEAD~1

# Revert if needed
git revert <commit-hash>
```

### 3. Redeploy from Known Good State
```bash
# Workers API
git checkout <last-working-commit>
wrangler deploy

# Frontend
git push --force origin <last-working-commit>:main
```

### 4. Enable Maintenance Mode
```typescript
// In workers-api/src/index.ts
const MAINTENANCE_MODE = true;

app.use('*', async (c, next) => {
  if (MAINTENANCE_MODE) {
    return c.json({ 
      error: 'Maintenance in progress',
      retry_after: 300 
    }, 503);
  }
  await next();
});
```

---

## 📞 Getting Help

### 1. Check Existing Documentation
- `DEVELOPER_GUIDE.md` - Development workflows
- `API_REFERENCE.md` - API endpoints
- `ARCHITECTURE.md` - System design
- `PERFORMANCE_OPTIMIZATION.md` - Performance tips

### 2. Review Error Logs
- Cloudflare: Dashboard → Workers → Logs
- Vercel: Dashboard → Deployments → Logs
- Sentry: Error tracking and stack traces

### 3. Search Known Issues
```bash
# Search codebase for similar errors
git log --all --grep="<error message>"

# Check GitHub issues
open https://github.com/CustomVenom/customvenom-workers-api/issues
```

---

**Remember**: Most issues have simple fixes. Check logs first, verify environment variables, and ensure services are up! 🔧

