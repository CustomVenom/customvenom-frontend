# ⚡ Quick Reference Card — Frontend

**Frontend-specific commands and patterns**

**See**: [Root QUICK_REFERENCE.md](../../../../QUICK_REFERENCE.md) for unified cross-repo commands

---

## 🚀 Essential Commands

### Workers API

```bash
# Development
cd customvenom-workers-api
wrangler dev                              # Start local dev server
wrangler tail                             # Stream live logs
wrangler tail | grep -i error             # Filter for errors

# Deployment
wrangler deploy --var DEMO_MODE:1 --var DEMO_WEEK:2025-06
wrangler deploy --env production          # Deploy to production env

# Secrets
echo "value" | wrangler secret put KEY    # Add/update secret
wrangler secret list                      # List all secrets
wrangler secret delete KEY                # Remove secret

# Testing
npm test                                  # Run all tests
npm test -- --watch                       # Watch mode
npm test -- lib/faab.test.ts              # Specific test
```

### Frontend

```bash
# Development
cd customvenom-frontend
npm run dev                               # Start dev server (port 3000)
npm run build                             # Production build
npm run lint                              # Lint check

# Database
npx prisma generate                       # Generate Prisma client
npx prisma studio                         # GUI database browser
npx prisma migrate dev                    # Run migrations

# Deployment
git add .
git commit -m "feat: description"
git push origin main                      # Auto-deploys to Vercel
```

---

## 🔗 Key URLs

```
Workers API Dev:    https://customvenom-workers-api.jdewett81.workers.dev
Workers API Prod:   https://api.customvenom.com
Frontend:           https://customvenom-frontend-incarcer-incarcers-projects.vercel.app

Cloudflare:         https://dash.cloudflare.com/
Vercel:             https://vercel.com/dashboard
GitHub:             https://github.com/CustomVenom/
```

---

## 🧪 Quick Tests

### API Health Check

```bash
curl https://customvenom-workers-api.jdewett81.workers.dev/health | jq '.ok'
```

### Cache Hit Ratio

```bash
curl https://customvenom-workers-api.jdewett81.workers.dev/ops-data | jq '.cache.rate'
# Target: > 0.80
```

### Projections Test (Anonymous)

```bash
curl -i "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-05"
# Should return 2025-06 data (Golden Week)
# Should have x-demo-mode: true header
```

### Projections Test (Authenticated)

```bash
curl -i -H "x-cv-signed: YOUR_KEY" \
  "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-05"
# Should return actual 2025-05 data
# Should NOT have x-demo-mode header
```

---

## 🌍 Environment Variables

### Workers API

```bash
DEMO_MODE=1                    # Enable demo mode (pin to Golden Week)
DEMO_WEEK=2025-06             # Golden Week identifier
DEMO_SIGNING_KEY=<secret>     # Auth key for bypassing demo mode
ENVIRONMENT=production        # Environment name (dev/staging/production)
NOTION_TOKEN=<secret>         # Optional: Notion integration
SENTRY_DSN=<secret>           # Optional: Error tracking
```

### Frontend

```bash
# Public (accessible in browser)
NEXT_PUBLIC_API_BASE=https://customvenom-workers-api.jdewett81.workers.dev
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_...

# Private (server-side only)
AUTH_SECRET=<secret>          # NextAuth session encryption
DATABASE_URL=postgresql://... # Postgres connection
STRIPE_SECRET_KEY=sk_...      # Stripe API key
STRIPE_WEBHOOK_SECRET=whsec_...  # Stripe webhook verification
YAHOO_CLIENT_ID=...           # OAuth provider
YAHOO_CLIENT_SECRET=<secret>  # OAuth provider
```

---

## 🔍 Debugging Commands

### View Logs

```bash
# Workers API (live)
wrangler tail

# Workers API (filter)
wrangler tail | grep projections
wrangler tail --format json | jq 'select(.message | contains("error"))'

# Vercel (dashboard)
# Vercel → Deployments → Latest → Logs
```

### Check Deployment Status

```bash
# Workers API
wrangler deployments list

# Frontend (git)
git log --oneline -5
```

### Test Rate Limiting

```bash
for i in {1..110}; do
  curl -s https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06
done
# Should see 429 after ~100 requests
```

---

## 📊 Performance Targets

| Metric                         | Target  | Monitoring             |
| ------------------------------ | ------- | ---------------------- |
| Cache hit ratio                | > 80%   | `/ops-data`            |
| API response (p95)             | < 300ms | `x-duration-ms` header |
| LCP (Largest Contentful Paint) | < 2.5s  | Lighthouse             |
| FCP (First Contentful Paint)   | < 1.5s  | Lighthouse             |
| TTI (Time to Interactive)      | < 3.5s  | Lighthouse             |

---

## 🚨 Emergency Procedures

### API Down

```bash
# 1. Check health
curl https://customvenom-workers-api.jdewett81.workers.dev/health

# 2. Check Cloudflare status
open https://www.cloudflarestatus.com/

# 3. Review recent deployments
wrangler deployments list

# 4. Rollback if needed
git checkout <last-working-commit>
wrangler deploy
```

### Frontend Down

```bash
# 1. Check Vercel status
open https://www.vercel-status.com/

# 2. Check latest deployment
# Vercel Dashboard → Deployments

# 3. Rollback if needed
# Vercel Dashboard → Deployments → Previous → Redeploy
```

### Database Issues

```bash
# 1. Check connection
npx prisma db execute --stdin <<< "SELECT 1"

# 2. Generate client
npx prisma generate

# 3. Reset (dev only!)
npx prisma migrate reset
```

---

## 🔐 Security Checklist

### Before Deploy

- [ ] No hardcoded secrets in code
- [ ] All secrets in wrangler or Vercel
- [ ] Environment variables set correctly
- [ ] CORS headers allow only necessary origins
- [ ] Rate limiting enabled
- [ ] Authentication tested

### Monthly Review

- [ ] Rotate secrets
- [ ] Review access logs
- [ ] Check for suspicious activity
- [ ] Update dependencies
- [ ] Review Sentry errors

---

## 📝 Git Commit Conventions

```bash
feat: add new feature             # New feature
fix: resolve bug                  # Bug fix
docs: update documentation        # Documentation only
style: format code                # Formatting, no code change
refactor: refactor code           # Code change, no feature/fix
perf: improve performance         # Performance improvement
test: add tests                   # Adding tests
chore: update dependencies        # Maintenance tasks
```

---

## 🎯 Common Patterns

### Adding New Endpoint (Workers API)

```typescript
// 1. Add route
app.get('/my-endpoint', async (c) => {
  const requestId = c.get('requestId');
  const startTime = c.get('startTime');

  // Your logic

  return c.json({ data: 'response' });
});

// 2. Test locally
// wrangler dev

// 3. Deploy
// wrangler deploy
```

### Adding New Page (Frontend)

```tsx
// 1. Create file: src/app/my-page/page.tsx
export default function MyPage() {
  return <div>My Page</div>;
}

// 2. Test
// npm run dev
// open http://localhost:3000/my-page

// 3. Deploy
// git push origin main
```

### Fetching API Data (Frontend)

```tsx
// Server Component
export default async function MyPage() {
  const res = await fetch(
    `${process.env.NEXT_PUBLIC_API_BASE}/projections?week=2025-06`,
    { next: { revalidate: 300 } }, // Cache 5 minutes
  );
  const data = await res.json();
  return <DataTable data={data} />;
}
```

---

## 🎓 Learning Resources

### Cloudflare

- [Workers Docs](https://developers.cloudflare.com/workers/)
- [R2 Storage](https://developers.cloudflare.com/r2/)
- [Hono Framework](https://hono.dev/)

### Next.js

- [App Router](https://nextjs.org/docs/app)
- [Server Components](https://nextjs.org/docs/app/building-your-application/rendering/server-components)
- [Data Fetching](https://nextjs.org/docs/app/building-your-application/data-fetching)

### Internal Docs

- [Developer Guide](./DEVELOPER_GUIDE.md)
- [API Reference](./API_REFERENCE.md)
- [Troubleshooting](./TROUBLESHOOTING.md)
- [Performance](./PERFORMANCE_OPTIMIZATION.md)

---

## 💡 Pro Tips

1. **Use `wrangler tail`** for real-time debugging
2. **Cache aggressively** for Golden Week data
3. **Always check x-demo-mode header** for anonymous requests
4. **Use Server Components by default**, Client only when needed
5. **Monitor cache hit ratio** - target >80%
6. **Keep bundle sizes small** - check with `npm run build`
7. **Test locally first** with `wrangler dev` or `npm run dev`
8. **Use structured logging** with request_id for tracing

---

**Print this page and keep it handy!** 📄🖨️
