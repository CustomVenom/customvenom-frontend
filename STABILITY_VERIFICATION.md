# Stability Verification Checklist
**Generated:** 2025-10-18  
**Status:** Ready for execution  

## 🎯 Immediate Verification (10 minutes)

### 1. API Health Check
```bash
# Set your API base
export API_BASE="https://customvenom-workers-api.jdewett81.workers.dev"

# Health check
curl -s "$API_BASE/health" | jq '{ok,schema_version,last_refresh}'

# Expected response:
# {
#   "ok": true,
#   "schema_version": "YYYY-MM-DD",
#   "last_refresh": "2025-XX-XX ..."
# }
```

**✅ Pass Criteria:** 
- Status 200
- `ok: true`
- `schema_version` and `last_refresh` present

---

### 2. API Headers & Cache Control
```bash
# Check cache headers on projections endpoint
curl -si "$API_BASE/projections?week=2025-06" | grep -iE '^(x-key|x-stale|x-schema-version|x-last-refresh|cache-control):'

# Expected headers:
# x-schema-version: YYYY-MM-DD
# x-last-refresh: ISO8601 timestamp
# x-stale: true (if serving stale data)
# x-stale-age: NNN (seconds since refresh)
# cache-control: public, max-age=XXX
```

**✅ Pass Criteria:**
- All custom headers present
- Cache-Control directive appropriate
- Stale headers appear when relevant

---

### 3. UI Smoke Test (Browser)

**Visit:** `http://localhost:3000/projections` (dev) or your preview URL

**Check:**
- [ ] Ribbons render correctly
- [ ] Max 2 tool chips per row
- [ ] TrustSnapshot shows `last_refresh` timestamp
- [ ] No console errors
- [ ] Dark mode toggle works
- [ ] Filters apply correctly

**✅ Pass Criteria:** All visual elements render, no errors in console

---

### 4. Admin RBAC Verification

**Prerequisites:** Have admin email configured in your environment

**Steps:**
1. Sign in with admin email
2. Check for "Admin" badge in UI
3. Visit `/ops/metrics` 
4. Verify access granted (no "upgrade to pro" wall)

**✅ Pass Criteria:**
- Admin badge visible
- Access to `/ops/metrics` granted
- Page renders charts without errors

**Files to verify admin list:**
```bash
# Check auth configuration
grep -r "ADMIN_EMAILS" customvenom-frontend/src/
```

---

### 5. Ops Dashboard Smoke

**Visit:** `/ops/metrics`

**Check:**
- [ ] Page loads without errors
- [ ] Cache performance tile renders
- [ ] Charts display data (or "No events yet" message)
- [ ] Refresh button works
- [ ] Time range selector works (1h, 6h, 24h)
- [ ] No console errors

**✅ Pass Criteria:** 
- All sections render
- No errors in browser console
- Data refreshes on button click

---

## 🔒 Stabilize the Lane (Lock the Green)

### 1. Freeze Inputs ✅ ALREADY COMPLETE

**Verified in `package.json`:**
```json
{
  "engines": {
    "node": "20.x"
  },
  "packageManager": "npm@10.x"
}
```

**Vercel Settings Required:**
- **Node.js Version:** 20.x (set in Project Settings → General)
- **Install Command:** `npm ci` (not `npm install`)
- **Build Command:** `npm run build`

**Action Required:** 
```bash
# Verify Vercel settings via CLI or dashboard
# Dashboard: https://vercel.com/[team]/customvenom-frontend/settings
```

---

### 2. Dependabot Configuration

**Action Required:** Pause auto-merge for stability phase

```bash
# In GitHub Settings → Code security and analysis → Dependabot
# - Keep security updates enabled
# - Pause auto-merge PRs for 2 weeks
```

---

### 3. CI Gates (GitHub Actions)

**Create:** `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main]
  push:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    
    steps:
      - uses: actions/checkout@v4
      
      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20.x'
          cache: 'npm'
          cache-dependency-path: customvenom-frontend/package-lock.json
      
      - name: Install dependencies
        working-directory: customvenom-frontend
        run: npm ci
      
      - name: Lint
        working-directory: customvenom-frontend
        run: npm run lint
      
      - name: Type check
        working-directory: customvenom-frontend
        run: npm run type-check
      
      - name: Build
        working-directory: customvenom-frontend
        run: npm run build
```

**Status:** ⏳ Pending creation

---

## 🛡️ Operational Hardening

### 1. Synthetics / Uptime Monitoring

**Recommended Services:**
- **Uptime Robot** (free tier: 50 monitors, 5-min intervals)
- **BetterUptime** (free tier: 10 monitors, 3-min intervals)
- **Checkly** (built for APIs, programmable checks)

**Monitor Setup:**

#### Health Endpoint (1-min interval)
```
URL: https://customvenom-workers-api.jdewett81.workers.dev/health
Method: GET
Expected: 200 status + "ok": true in body
Alert: 3 consecutive failures
```

#### Projections Endpoint (5-min interval)
```
URL: https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06
Method: GET
Expected: 200 status + valid JSON
Alert: p95 > 300ms for 5 minutes OR 3 consecutive failures
```

#### Frontend Page (5-min interval)
```
URL: https://[your-domain].vercel.app/projections
Method: GET
Expected: 200 status
Alert: 3 consecutive failures OR response time > 2s
```

**Action Required:** 
```bash
# Sign up and configure monitors
# Recommended: Start with Uptime Robot (easiest setup)
```

---

### 2. Sentry Error Tracking

**Current Status:** Sentry already integrated in codebase (sentry.client.config.ts, sentry.server.config.ts)

**Staging Configuration:**

```bash
# Add to Vercel Preview environment variables
SENTRY_DSN=https://[your-key]@[org].ingest.us.sentry.io/[project]
NEXT_PUBLIC_SENTRY_DSN=https://[your-key]@[org].ingest.us.sentry.io/[project]

# Low sample rate for staging
SENTRY_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.05
```

**Verification:**
1. Deploy with Sentry DSN
2. Trigger test error: `/api/test-sentry-error`
3. Verify event appears in Sentry dashboard
4. Confirm `request_id` and `release` tags present

**Action Required:** 
```bash
# Get DSN from: https://sentry.io/settings/[org]/projects/[project]/keys/
```

---

### 3. Stripe Test Mode

**Prerequisites:** Stripe account in test mode

**Setup Steps:**

#### A. Get Test API Keys
```bash
# From: https://dashboard.stripe.com/test/apikeys
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_test_...
```

#### B. Create Test Products
```bash
# Via Dashboard or CLI
stripe products create --name="Pro Monthly" --description="Full access"
stripe prices create --product=prod_XXX --unit-amount=1999 --currency=usd --recurring[interval]=month
```

#### C. Configure Webhook
```bash
# Webhook URL: https://[your-preview-url].vercel.app/api/webhooks/stripe
# Events to listen: checkout.session.completed, customer.subscription.updated, customer.subscription.deleted

# Get webhook secret
STRIPE_WEBHOOK_SECRET=whsec_...
```

#### D. Test Checkout Flow
1. Visit `/go-pro` page
2. Click "Upgrade to Pro"
3. Complete test checkout with card: `4242 4242 4242 4242`
4. Verify entitlements updated
5. Check webhook received and processed

**Action Required:**
```bash
# Add test keys to Vercel Preview environment
# Test full flow end-to-end
```

---

## 📋 Data & Contract Validation

### 1. Schema Version Headers

**Verify all cacheable routes include:**
```bash
# Check multiple endpoints
for endpoint in "/health" "/projections" "/stats" "/weather"; do
  echo "=== $endpoint ==="
  curl -sI "$API_BASE$endpoint" | grep -i "x-schema-version\|x-last-refresh"
done
```

**✅ Pass Criteria:** All endpoints return both headers

---

### 2. Stale Data Handling

**Test stale path:**
```bash
# When cache is stale, these headers should appear:
curl -si "$API_BASE/projections?week=2025-06" | grep -i "x-stale"

# Expected:
# x-stale: true
# x-stale-age: 3600 (example: 1 hour old)
```

**✅ Pass Criteria:** Stale headers appear when cache exceeds TTL

---

### 3. Golden Week Validation

**Check artifact validator:**
```bash
cd customvenom-data-pipelines

# Run validator on golden week
node scripts/validate_file.js data/artifacts/2025-5/2025-06.json

# Expected: ✅ All keys valid, no missing fields
```

**Action Required:** Ensure golden week data passes validation before promotion

---

## 🚀 Safe Upgrade Path

### Create Upgrade Branch Process

**Template for each upgrade:**

```bash
# 1. Create feature branch
git checkout -b upgrade/next-15.5.5
cd customvenom-frontend

# 2. Upgrade single dependency family
npm install next@15.5.5 --save-exact

# 3. Run full quality checks
npm ci
npm run lint
npm run type-check
npm run build

# 4. Local smoke test
npm run dev
# Test /projections, /ops/metrics, auth flow

# 5. Commit and push
git add package.json package-lock.json
git commit -m "chore: upgrade Next.js to 15.5.5"
git push origin upgrade/next-15.5.5

# 6. Create PR → triggers CI
# 7. Deploy to Preview → manual smoke test
# 8. Merge only when ALL checks pass
```

**Upgrade Order (One at a time):**
1. Next.js + React (together)
2. Tailwind CSS
3. Stripe SDK
4. Auth libraries
5. Dev dependencies

---

## 📊 Success Metrics

### Green Lock Criteria

**Before declaring "STABLE":**
- [ ] All immediate verifications pass
- [ ] No console errors on any major page
- [ ] Type checker returns 0 errors (`npm run type-check`)
- [ ] Build succeeds locally and on Vercel
- [ ] Admin can access protected routes
- [ ] Cache headers present on all API routes
- [ ] Uptime monitors configured and reporting
- [ ] At least 1 successful test Stripe checkout (if applicable)

### Monitoring Targets

**Week 1 Baseline:**
- Uptime: 99.9%
- p95 API response: < 300ms
- p95 Page load: < 2s
- Error rate: < 0.1%
- Cache hit rate: > 80%

---

## 🔥 Smoke Test Automation (Optional)

### Playwright Quick Smoke

**Create:** `tests/smoke.spec.ts`

```typescript
import { test, expect } from '@playwright/test';

test.describe('Critical Path Smoke', () => {
  test('projections page renders without errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') errors.push(msg.text());
    });
    
    await page.goto('/projections');
    
    // Check key elements
    await expect(page.locator('h1')).toContainText('Projections');
    await expect(page.locator('[data-testid="trust-snapshot"]')).toBeVisible();
    
    // No console errors
    expect(errors).toHaveLength(0);
  });
  
  test('ops metrics requires auth or entitlement', async ({ page }) => {
    await page.goto('/ops/metrics');
    
    // Should either show login prompt or metrics (if authed)
    const hasAuth = await page.locator('h1').innerText();
    expect(['Analytics Metrics', 'Sign In']).toContain(hasAuth);
  });
});
```

**Run:** `npx playwright test tests/smoke.spec.ts`

---

## 📝 Green-Lock PR Template

**Create:** `.github/pull_request_template.md`

```markdown
## Changes
<!-- Brief description -->

## Pre-Merge Checklist
- [ ] `npm run lint` passes
- [ ] `npm run type-check` passes (0 errors)
- [ ] `npm run build` succeeds
- [ ] Preview deploy successful
- [ ] Manual smoke: /projections renders
- [ ] Manual smoke: /ops/metrics accessible
- [ ] No new console errors
- [ ] Cache headers still present (if API change)

## Verification
<!-- Paste evidence: build output, test results, screenshots -->

## Rollback Plan
<!-- How to revert if issues found in production -->
```

---

## ✅ Completion Report

**After completing all items, generate report:**

```bash
# Save this as your completion proof
cat > STABILITY_LOCK_COMPLETE.md << 'EOF'
# Stability Lock Complete

**Date:** $(date -I)
**Completed By:** [Your Name]

## Verification Results
- API Health: ✅ 200 OK, all fields present
- Cache Headers: ✅ Present on all routes
- UI Smoke: ✅ No errors, renders correctly
- Admin RBAC: ✅ Badge visible, access granted
- Ops Dashboard: ✅ All charts render

## Configuration Locked
- Node: 20.x ✅
- npm: 10.x ✅
- Install: npm ci ✅
- Dependabot: Paused ✅

## Monitoring Active
- Health check: ✅ 1-min interval
- Projections: ✅ 5-min interval
- Alerts: ✅ Configured

## Next Steps
- Safe upgrade path established
- PR template in place
- Ready for production traffic

**Status:** 🟢 GREEN LOCKED
EOF
```

---

**Questions or Issues?** Reference this checklist line-by-line. Each item includes pass criteria and troubleshooting hints.

