# 🚀 CustomVenom Developer Guide

**Last Updated:** October 18, 2025  
**Stack:** Cloudflare Workers + Next.js 15 + R2 + NextAuth v5 + Stripe

---

## 🎯 Quick Start Commands

### Workers API

```bash
cd customvenom-workers-api

# Local development
wrangler dev

# Deploy with env vars
wrangler deploy --var DEMO_MODE:1 --var DEMO_WEEK:2025-06

# Add secrets
echo "your_secret_value" | wrangler secret put SECRET_NAME

# View logs
wrangler tail

# Test locally
npm test
```

### Frontend

```bash
cd customvenom-frontend

# Local development
npm run dev

# Build (includes Prisma generation)
npm run build

# Deploy (auto via Vercel on git push)
git push origin main
```

---

## 🏗️ Architecture Patterns

### 1. **Edge-First, Artifact-First**

- ✅ **DO**: Read projections from R2 artifacts (pre-generated JSON)
- ✅ **DO**: Keep database for user accounts, sessions, subscriptions only
- ❌ **DON'T**: Query database for projection data
- ❌ **DON'T**: Generate projections on-demand

**Why**: Edge workers have 50ms CPU limits. Pre-computed artifacts = instant responses.

### 2. **Stale-If-Error Pattern**

```typescript
// workers-api/src/index.ts
const LAST_GOOD_CACHE = new Map<string, { body: string; ts: number }>();

// On R2 read failure:
const cached = LAST_GOOD_CACHE.get(key);
if (cached) {
  const ageSec = Math.floor((Date.now() - cached.ts) / 1000);
  c.header('x-stale', 'true');
  c.header('x-stale-age', String(ageSec)); // seconds, not milliseconds
  c.header('cache-control', 'public, max-age=60, stale-if-error=86400');
  return new Response(cached.body, { headers: c.res.headers });
}
```

**Benefits**:

- 99.99% uptime even if R2 has issues
- Graceful degradation
- Users always get data (marked as stale)
- `x-stale-age` in seconds for standard time units

### 3. **Demo Mode (Golden Week)**

```typescript
// Anonymous users → pinned to Golden Week (2025-06)
// Authenticated users → any week they request

const demoMode = c.env.DEMO_MODE === '1';
const authed = !!c.get('user');
const requestedWeek = c.req.query('week');
const demoWeek = getDemoWeek(c.env);

let weekParam = requestedWeek ?? demoWeek;
if (demoMode && !authed && requestedWeek !== demoWeek) {
  weekParam = demoWeek;
  c.header('x-demo-mode', 'true'); // Only on anonymous demo responses
}
```

**Why**:

- Reduces R2 egress costs (cache single week heavily)
- Consistent demo experience
- Auth users get full access

**Important**: `x-demo-mode: true` header only appears on anonymous requests pinned to demo week. Never leaks on authenticated requests.

### 4. **Multi-Tier Caching**

```
Browser Cache (cache-control)
    ↓
Cloudflare Edge Cache (CDN)
    ↓
Worker Instance Cache (LAST_GOOD_CACHE)
    ↓
R2 Bucket (source of truth)
```

**Cache Headers Strategy** (Explicit):

| Route                 | cache-control                                | Use Case                      |
| --------------------- | -------------------------------------------- | ----------------------------- |
| Golden Week (2025-06) | `public, max-age=3600, stale-if-error=86400` | Heavy caching (1 hour)        |
| Other weeks           | `public, max-age=300, stale-if-error=86400`  | Moderate caching (5 min)      |
| Health endpoint       | `no-store`                                   | Always fresh, never cached    |
| Stale fallback        | `public, max-age=60, stale-if-error=86400`   | Short cache with stale marker |

---

## 🔐 Security Best Practices

### Secrets Management

```bash
# ✅ GOOD: Use Wrangler secrets for sensitive data
wrangler secret put DEMO_SIGNING_KEY
wrangler secret put NOTION_TOKEN
wrangler secret put SENTRY_DSN
wrangler secret put STRIPE_SECRET_KEY

# ❌ BAD: Don't commit secrets to git
# ❌ BAD: Don't use --var for secrets (visible in deployment logs)
```

**Critical Security Rule:**

- Use `wrangler secret put` for:
  - SENTRY_DSN
  - OAuth secrets (GOOGLE_CLIENT_SECRET, YAHOO_CLIENT_SECRET, etc.)
  - Stripe live keys (STRIPE_SECRET_KEY)
  - Any API tokens or credentials
- **Never commit secrets to git** - they're visible in history forever
- **Never use --var for secrets** - they appear in deployment logs

### Environment Variables

```bash
# ✅ GOOD: Use --var for non-sensitive config
wrangler deploy --var DEMO_MODE:1 --var DEMO_WEEK:2025-06

# For production
wrangler deploy --env production
```

### Rate Limiting

```typescript
// workers-api/src/middleware/rate-limit.ts
import type { Context, Next } from 'hono';

export const rateLimit = async (c: Context, next: Next) => {
  const limit = 100; // Requests per window
  const windowMs = 60_000; // 1 minute

  const ip = c.req.header('cf-connecting-ip') || 'unknown';
  const key = `ratelimit:${ip}`;

  // Check and increment rate limit
  // Implementation depends on KV or in-memory store

  await next();
};
```

---

## 🎨 Frontend Patterns

### 1. **Server Components by Default**

```tsx
// ✅ GOOD: Use Server Components for data fetching
export default async function ProjectionsPage() {
  const data = await fetch('...');
  return <ProjectionsTable data={data} />;
}

// ❌ BAD: Don't use 'use client' unless you need interactivity
('use client');
export default function ProjectionsPage() {
  const [data, setData] = useState();
  useEffect(() => {
    fetch('...');
  }, []);
}
```

### 2. **Client Components for Interactivity**

```tsx
// ✅ GOOD: Mark only interactive parts as 'use client'
'use client';
export function PlayerDrawer({ row }: Props) {
  const [open, setOpen] = useState(false);
  return (
    <Dialog open={open} onOpenChange={setOpen}>
      ...
    </Dialog>
  );
}
```

### 3. **Entitlements Pattern**

```typescript
// Centralized in: frontend/src/lib/entitlements.ts

export type Entitlements = {
  isPro: boolean;
  tier: 'free' | 'pro' | 'team';
  features: string[];
};

// Usage:
const entitlements = await getEntitlements(sessionId);
if (entitlements.isPro) {
  // Show pro features
}
```

### 4. **ProLock Pattern**

```tsx
// Gate features behind entitlements
<ProFeature isPro={entitlements.isPro}>
  <button>📊 Export CSV</button>
</ProFeature>

// Shows lock overlay for free users
// Shows actual feature for pro users
```

### 5. **TrustSnapshot Pattern (No Layout Shift)**

```tsx
// components/TrustSnapshot.tsx
export function TrustSnapshot({ ver, ts, stale }: { ver: string; ts: string; stale?: boolean }) {
  return (
    <div className="trust">
      <span className="ver">v{ver}</span>
      <span className="ts">{ts}</span>
      {/* Use visibility instead of conditional render to prevent CLS */}
      <span
        className="stale"
        aria-hidden={!stale}
        style={{ visibility: stale ? 'visible' : 'hidden' }}
      >
        Stale
      </span>
    </div>
  );
}
```

**Why `visibility` instead of conditional render:**

- Prevents layout shift (CLS < 0.1)
- Reserves space even when badge is hidden
- Accessibility: `aria-hidden` for screen readers

---

## ⚡ Performance Optimization

### Workers API

**1. Minimize Bundle Size**

```typescript
// ✅ GOOD: Import only what you need
import { cors } from 'hono/cors';

// ❌ BAD: Import entire libraries
import * as hono from 'hono';
```

**2. Use Streaming for Large Responses**

```typescript
// For future large datasets:
return c.stream(async (stream) => {
  await stream.write(chunk1);
  await stream.write(chunk2);
});
```

**3. Optimize R2 Reads**

```typescript
// Current timeout: 300ms
// If slow, reduce timeout or use parallel reads
const { data } = await r2GetText(bucket, key, 200); // 200ms timeout
```

### Frontend

**1. Image Optimization**

```tsx
// ✅ GOOD: Use Next.js Image component
import Image from 'next/image';
<Image src="/logo.png" width={200} height={50} alt="Logo" />

// ❌ BAD: Regular img tags
<img src="/logo.png" />
```

**2. Code Splitting**

```tsx
// ✅ GOOD: Dynamic imports for heavy components
const PlayerDrawer = dynamic(() => import('@/components/PlayerDrawer'), {
  loading: () => <Skeleton />,
});
```

**3. Memoization**

```tsx
// ✅ GOOD: Memoize expensive calculations
const groupedData = useMemo(
  () =>
    projections.reduce((acc, p) => {
      /* ... */
    }, {}),
  [projections],
);
```

---

## 🧪 Testing Strategy

### Workers API Testing

```bash
cd customvenom-workers-api

# Run all tests
npm test

# Run specific test
npm test -- lib/faab.test.ts

# Watch mode
npm test -- --watch
```

**Test Structure**:

```typescript
import { describe, it, expect } from 'vitest';

describe('FAAB Calculator', () => {
  it('should generate bid bands', () => {
    const result = generateFaabBands(mockData, 100);
    expect(result.min).toBeLessThan(result.likely);
    expect(result.likely).toBeLessThan(result.max);
  });
});
```

**Contract Validation (CI):**

- CI fails if `schema_version` or `last_refresh` are missing on `/projections` and `/health`
- Prevents silent schema drift
- Validates response structure matches golden examples

### Frontend Testing

```bash
cd customvenom-frontend

# Lint
npm run lint

# Type check
npx tsc --noEmit

# Build test
npm run build
```

---

## 📊 Monitoring & Observability

### Cloudflare Analytics

- **Location**: Cloudflare Dashboard → Workers & Pages → customvenom-workers-api
- **Metrics**: Requests, Errors, CPU time, Success rate

### Structured Logging

```typescript
// Current pattern (workers-api/src/index.ts)
console.log(
  JSON.stringify({
    request_id: requestId,
    message: 'Projections served',
    r2_key: key,
    duration_ms: Date.now() - startTime,
    stale: isStale,
    timestamp: new Date().toISOString(),
  }),
);
```

**Benefits**:

- Searchable by request_id
- Structured for log aggregation
- Performance tracking

### Sentry Integration

```typescript
// Already configured in workers-api/src/observability/sentry.ts
import { captureException } from './observability/sentry';

try {
  // risky operation
} catch (error) {
  captureException(error, {
    tags: { route: '/projections', week: '2025-06' },
  });
  throw error;
}
```

---

## 🐛 Debugging Tips

### Workers API

**1. Use `wrangler tail` for live logs**

```bash
wrangler tail
# Then make requests to see logs in real-time
```

**2. Test locally with real R2**

```bash
# Local dev connects to production R2
wrangler dev
```

**3. Check request headers**

```bash
# PowerShell
$response = Invoke-WebRequest -Uri "https://..." -Method GET
$response.Headers
```

### Frontend

**1. Check Network Tab**

- API calls timing
- Cache headers
- Response payloads

**2. React DevTools**

- Component tree
- Props/state inspection
- Re-render tracking

**3. Console Logging**

```typescript
console.log('[ProjectionsPage] Loading...', { week, entitlements });
```

---

## 🔄 Common Workflows

### Adding a New Endpoint

**Standard Health Endpoint Pattern:**

```typescript
// workers-api/src/routes/health.ts
import type { Context } from 'hono';

app.get('/health', (c: Context) => {
  const started = Date.now();
  const requestId = crypto.randomUUID();

  // Set required headers (even on errors)
  c.header('cache-control', 'no-store');
  c.header('x-request-id', requestId);

  const body = {
    ok: true,
    schema_version: 'v1',
    last_refresh: new Date().toISOString(),
    environment: c.env.ENVIRONMENT ?? 'development',
  };

  c.header('x-duration-ms', String(Date.now() - started));
  return c.json(body, 200);
});
```

**General Endpoint Pattern:**

```typescript
// 1. Add route (workers-api/src/index.ts)
app.get('/my-endpoint', async (c) => {
  const startTime = c.get('startTime');
  const requestId = c.get('requestId');

  // Your logic here

  return c.json({ data: 'response' });
});
```

**Deployment:**

```bash
# 2. Test locally
wrangler dev

# 3. Deploy
wrangler deploy --var DEMO_MODE:1 --var DEMO_WEEK:2025-06
```

### Adding a New Frontend Page

```bash
# 1. Create page
mkdir src/app/my-page
touch src/app/my-page/page.tsx

# 2. Implement
# src/app/my-page/page.tsx

# 3. Test locally
# npm run dev

# 4. Deploy
# git add . && git commit -m "Add my-page" && git push
```

### Updating Entitlements

```typescript
// 1. Update type (frontend/src/lib/entitlements.ts)
export type Entitlements = {
  isPro: boolean;
  tier: 'free' | 'pro' | 'team' | 'enterprise'; // Added enterprise
  features: string[];
};

// 2. Update logic
export async function getEntitlements(sessionId?: string): Promise<Entitlements> {
  // Add enterprise tier checks
}

// 3. Use in components
if (entitlements.tier === 'enterprise') {
  // Show enterprise features
}
```

---

## 🚨 Troubleshooting

### Canonical Error Shape

All API errors should follow this standard format:

```typescript
type ApiError = {
  ok: false;
  error: string;
  code: string;
  request_id: string;
  timestamp: string;
};

// Example: 404 Not Found
return c.json<ApiError>(
  {
    ok: false,
    error: 'Resource not found',
    code: 'NOT_FOUND',
    request_id: c.get('requestId'),
    timestamp: new Date().toISOString(),
  },
  404,
);

// Example: 400 Bad Request
return c.json<ApiError>(
  {
    ok: false,
    error: 'Invalid week parameter',
    code: 'INVALID_PARAMETER',
    request_id: c.get('requestId'),
    timestamp: new Date().toISOString(),
  },
  400,
);

// Example: 500 Server Error
return c.json<ApiError>(
  {
    ok: false,
    error: 'Failed to fetch projections',
    code: 'INTERNAL_ERROR',
    request_id: c.get('requestId'),
    timestamp: new Date().toISOString(),
  },
  500,
);
```

**Benefits:**

- Consistent error handling across all endpoints
- `request_id` for tracing and debugging
- `code` field for programmatic error handling
- `timestamp` for logging correlation

---

### "Worker exceeded CPU time limit"

**Solution**: Reduce computation, use pre-computed artifacts

```typescript
// ❌ BAD: Heavy computation in worker
const result = heavyCalculation(largeDataset);

// ✅ GOOD: Pre-compute, store in R2, read from R2
const result = await r2.get('precomputed-result.json');
```

### "R2 read timeout"

**Solution**: Adjust timeout, use stale fallback

```typescript
const { data, stale } = await r2GetText(bucket, key, 200); // Reduce timeout
if (stale && LAST_GOOD_CACHE.has(key)) {
  return LAST_GOOD_CACHE.get(key).body;
}
```

**Note**: Only shorten timeout if stale fallback is healthy. Avoid noisy flapping between fresh and stale.

### "Next.js build fails"

**Solution**: Check Prisma generation

```bash
npx prisma generate
npm run build
```

### "Environment variables not set"

**Solution**: Use correct deployment command

```bash
# For default env
wrangler deploy --var KEY:value

# For named env
wrangler deploy --env production
```

---

## 📈 Optimization Checklist

### Before Each Deploy

- [ ] Run tests: `npm test`
- [ ] Check bundle size: `wrangler deploy --dry-run`
- [ ] Verify env vars are set
- [ ] Test locally: `wrangler dev`
- [ ] Check for console.errors in frontend
- [ ] Verify cache headers are correct

### Monthly Performance Review

- [ ] Check cache hit ratio (target: >80%)
- [ ] Review R2 egress (should trend down)
- [ ] Check average response time (<300ms)
- [ ] Review error rate (<0.1%)
- [ ] Check Sentry for recurring issues
- [ ] Review Cloudflare Analytics

---

## 🎓 Learning Resources

### Cloudflare Workers

- [Workers Documentation](https://developers.cloudflare.com/workers/)
- [Hono Framework](https://hono.dev/)
- [R2 Best Practices](https://developers.cloudflare.com/r2/)

### Next.js 15

- [App Router Guide](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### TypeScript

- [TypeScript Handbook](https://www.typescriptlang.org/docs/handbook/intro.html)
- [Type Challenges](https://github.com/type-challenges/type-challenges)

---

## 🤝 Contributing

### Code Style

- Use TypeScript strict mode
- Prefer functional components
- Use async/await over promises
- Keep functions small (<50 lines)
- Add JSDoc comments for complex logic

### Commit Messages

```bash
# Good
git commit -m "Add FAAB bid calculator with confidence bands"
git commit -m "Fix: Rate limiting on /projections endpoint"
git commit -m "Refactor: Extract caching logic to middleware"

# Bad
git commit -m "stuff"
git commit -m "fixed it"
```

### Pull Request Template

```markdown
## What

Brief description of changes

## Why

Why this change is needed

## Testing

- [ ] Tested locally
- [ ] Tests pass
- [ ] Deployed to staging

## Screenshots (if applicable)
```

---

**Next Steps**: See `ARCHITECTURE.md` for detailed system design and `API_REFERENCE.md` for endpoint documentation.
