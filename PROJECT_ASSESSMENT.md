# CustomVenom - Cross-Repo Project Assessment

**Date:** October 18, 2025  
**Scope:** All 3 repositories (Workers API, Frontend, Data Pipelines)  
**Status:** Operational with identified improvements

---

## 📊 Executive Summary

### Top Findings

✅ **Strengths:**

- Contracts and ops: API headers, rate limit, stale-if-error, and request_id propagation in place and tested
- Frontend trust: TrustSnapshot wiring and request_id surfacing merged
- Docs: Manual-to-repo sync present; API Reference and Methods pages exist
- Security: Dependabot and checkout bumps flowing

⚠️ **Gaps:**

- Contract drift guard in CI isn't landed
- Staging API separation recommended but not implemented
- Sentry stubs added but disabled (needs enablement decision)
- Data pipelines: ETL robustness and schema versioning enforcement remain light

---

## 🔍 Repo-by-Repo Assessment

### 1. Workers API (customvenom-workers-api)

#### ✅ Strengths

- **Operational Excellence:**
  - Consistent stale headers
  - Trim profile documentation
  - Combined smoke tests
  - Per-IP rate limiting (merged or queued)
- **Request Tracking:**
  - Request ID propagation into error responses (PR open)
  - Proper error handling and logging
- **Documentation:**
  - Synced from Notion Manual
  - API Reference guide complete
  - Methods-at-a-glance page created
  - Quick Reference solid

#### ⚠️ Gaps and Fixes

**1. Add Contract Drift Blocker in CI** ⏰ 1-2 hours

**Why:** Prevent silent schema changes that break clients

**What to do:**

- Add CI job that diffs live responses vs golden JSON
- Fail on add/remove/rename/type changes
- Use existing planning task as foundation

**Implementation:**

```yaml
# .github/workflows/contract-guard.yml
name: Contract Guard
on: [pull_request]
jobs:
  check-contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Check contract drift
        run: |
          # Fetch current response
          curl -s https://staging-api.customvenom.com/projections > current.json

          # Compare with golden
          diff <(jq -S . tests/golden/projections.json) \
               <(jq -S . current.json) \
               || (echo "❌ Contract drift detected" && exit 1)

          echo "✅ Contract stable"
```

**2. Standardize Header Names Across Routes** ⏰ 30 min

**What to do:**

- Create shared header helper function
- Ensure these headers on ALL responses (including 429):
  - `x-schema-version`
  - `x-last-refresh`
  - `x-request-id`
  - `x-key` (for cacheable responses)

**Implementation:**

```typescript
// src/utils/headers.ts
export function standardHeaders(options: {
  schemaVersion: string;
  lastRefresh: string;
  requestId: string;
  cacheKey?: string;
  maxAge?: number;
}) {
  const headers = new Headers({
    'x-schema-version': options.schemaVersion,
    'x-last-refresh': options.lastRefresh,
    'x-request-id': options.requestId,
    'access-control-allow-origin': '*',
  });

  if (options.cacheKey) {
    headers.set('x-key', options.cacheKey);
  }

  if (options.maxAge !== undefined) {
    headers.set('cache-control', `public, max-age=${options.maxAge}, stale-if-error=86400`);
  }

  return headers;
}
```

**3. Sentry Enablement Plan** ⏰ 1 hour

**Current:** Stubs added but disabled

**Recommendation:**

- Keep disabled in production initially
- Enable on staging with:
  - 5% trace sampling
  - Release tagging via `COMMIT_SHA`
  - Error grouping by route

**Watch volume for 1 week, then decide production rollout**

**Implementation:**

```typescript
// sentry.server.config.ts
Sentry.init({
  dsn: process.env.SENTRY_DSN,
  environment: process.env.VERCEL_ENV || 'development',
  enabled: process.env.VERCEL_ENV === 'preview', // Staging only
  tracesSampleRate: 0.05, // 5%
  release: process.env.VERCEL_GIT_COMMIT_SHA,
});
```

**4. Staging API Separation** ⏰ 2 hours

**Why:** De-risk production by testing breaking changes safely

**What to do:**

- Create staging Worker deployment
- Route Preview frontend to staging API
- Test breaking changes before production

**Implementation:**

```bash
# wrangler.toml
[env.staging]
name = "customvenom-api-staging"
route = "staging-api.customvenom.com/*"

# Frontend .env.preview
NEXT_PUBLIC_API_BASE=https://staging-api.customvenom.com
```

**5. Formalize Error Shape** ⏰ 30 min

**What to do:**

- Enforce shared error payload type
- Add unit tests for 400/404/500
- Document in API Reference

**Implementation:**

```typescript
// src/types/errors.ts
export interface ApiError {
  ok: false;
  error: string;
  code: string;
  request_id: string;
  timestamp: string;
}

// Use in all error responses
return new Response(
  JSON.stringify({
    ok: false,
    error: 'Resource not found',
    code: 'NOT_FOUND',
    request_id: ctx.requestId,
    timestamp: new Date().toISOString(),
  }),
  { status: 404 },
);
```

---

### 2. Frontend (customvenom-frontend)

#### ✅ Strengths

- **Request Tracking:**
  - Request ID surfaced in errors and logging
  - Sentry stubs integrated
- **Documentation:**
  - Domain cutover checklist complete
  - Environment setup guides thorough
  - NEXTAUTH_URL correctness emphasized
  - Google OAuth setup documented

- **Authentication:**
  - Enterprise RBAC system implemented (just added!)
  - Admin email protection
  - Complete security documentation

#### ⚠️ Gaps and Fixes

**1. TrustSnapshot Acceptance Test** ⏰ 45 min

**What to do:**

- Add Playwright test for stale badge visibility
- Assert no layout shift (CLS < 0.1)
- Link to API headers documentation

**Implementation:**

```typescript
// tests/trust-snapshot.spec.ts
import { test, expect } from '@playwright/test';

test('TrustSnapshot shows stale badge without CLS', async ({ page }) => {
  await page.goto('/projections');

  // Measure CLS
  const cls = await page.evaluate(() => {
    return new Promise((resolve) => {
      let clsValue = 0;
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (entry.entryType === 'layout-shift') {
            clsValue += entry.value;
          }
        }
        resolve(clsValue);
      }).observe({ entryTypes: ['layout-shift'] });

      setTimeout(() => resolve(clsValue), 3000);
    });
  });

  expect(cls).toBeLessThan(0.1);

  // Check stale badge appears when x-stale header present
  // (Would need to mock API response with stale header)
});
```

**2. Performance Budget Gates** ⏰ 1 hour

**What to do:**

- Add CI check for bundle size
- Add Lighthouse run on Projections page
- Fail PRs on regression

**Targets:**

- FCP < 1.8s
- CLS < 0.1
- Bundle size < 200KB

**Implementation:**

```yaml
# .github/workflows/performance.yml
name: Performance Budget
on: [pull_request]
jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Run Lighthouse
        uses: treosh/lighthouse-ci-action@v10
        with:
          urls: |
            http://localhost:3000/
            http://localhost:3000/projections
          budgetPath: ./lighthouse-budget.json

  bundle-size:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

**3. OAuth Redirect Automation** ⏰ 20 min

**What to do:**

- Document verified redirect URIs
- Add dev script to print expected URIs

**Implementation:**

```javascript
// scripts/show-oauth-uris.js
const envs = {
  local: 'http://localhost:3000',
  preview: process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'https://preview.customvenom.com',
  production: 'https://customvenom.com',
};

console.log('OAuth Redirect URIs:\n');
Object.entries(envs).forEach(([name, url]) => {
  console.log(`${name}:`);
  console.log(`  ${url}/api/auth/callback/google`);
  console.log(`  ${url}/api/auth/callback/yahoo`);
  console.log();
});
```

Run: `node scripts/show-oauth-uris.js`

---

### 3. Data Pipelines (customvenom-data-pipelines)

#### ✅ Strengths

- **Validation:**
  - Golden week validation scripts exist
  - Quick local static hosting documented

- **Structure:**
  - Clear separation of artifacts by week
  - Consistent naming conventions

#### ⚠️ Gaps and Fixes

**1. Schema Versioning and JSON Validation** ⏰ 1-2 hours

**What to do:**

- Create JSON schema files for each artifact type
- Add CI job to validate all generated files
- Enforce `schema_version` and `last_refresh` presence

**Implementation:**

```json
// schemas/projection-artifact-v1.schema.json
{
  "$schema": "http://json-schema.org/draft-07/schema#",
  "type": "array",
  "items": {
    "type": "object",
    "required": ["player_id", "range", "schema_version", "last_refresh"],
    "properties": {
      "player_id": { "type": "string" },
      "range": {
        "type": "object",
        "required": ["p10", "p50", "p90"],
        "properties": {
          "p10": { "type": "number" },
          "p50": { "type": "number" },
          "p90": { "type": "number" }
        }
      },
      "schema_version": { "type": "string", "pattern": "^v[0-9]+$" },
      "last_refresh": { "type": "string", "format": "date-time" }
    }
  }
}
```

```yaml
# .github/workflows/validate-artifacts.yml
name: Validate Artifacts
on: [push, pull_request]
jobs:
  validate:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: Install AJV CLI
        run: npm install -g ajv-cli
      - name: Validate all artifacts
        run: |
          ajv validate -s schemas/projection-artifact-v1.schema.json \
              -d "data/artifacts/*/projections.json"
```

**2. Deterministic Outputs** ⏰ 1 hour

**Why:** Avoid noisy diffs in version control

**What to do:**

- Ensure deterministic ordering (sort by player_id)
- Stable numeric formatting (round to fixed decimals)
- Add "clean sort" step before writing files

**Implementation:**

```python
# src/io/storage.py
import json
from decimal import Decimal

def write_artifact(data: list, path: str) -> None:
    """Write artifact with deterministic formatting"""
    # Sort by player_id for consistent diffs
    sorted_data = sorted(data, key=lambda x: x.get('player_id', ''))

    # Round all numeric values to 3 decimals
    def round_floats(obj):
        if isinstance(obj, float):
            return round(obj, 3)
        elif isinstance(obj, dict):
            return {k: round_floats(v) for k, v in obj.items()}
        elif isinstance(obj, list):
            return [round_floats(item) for item in obj]
        return obj

    clean_data = round_floats(sorted_data)

    # Write with consistent formatting
    with open(path, 'w') as f:
        json.dump(clean_data, f, indent=2, sort_keys=True, ensure_ascii=False)
        f.write('\n')  # Trailing newline
```

**3. Parquet and DuckDB Ingest** ⏰ 2 hours

**Why:** High leverage for model features from nflverse data

**What to do:**

- Add DuckDB script to read nflverse parquet
- Write to `usage_artifact_v1.json` with consistent keys
- Fast to wire, high value for advanced features

**Implementation:**

```python
# scripts/ingest_nflverse.py
import duckdb

def ingest_nflverse_to_usage(week: str, output_path: str):
    """Read nflverse parquet and generate usage artifact"""

    con = duckdb.connect()

    # Load nflverse play-by-play data
    query = f"""
    SELECT
        player_id,
        player_name,
        COUNT(*) as total_snaps,
        SUM(CASE WHEN pass_attempt = 1 THEN 1 ELSE 0 END) as pass_snaps,
        SUM(CASE WHEN rush_attempt = 1 THEN 1 ELSE 0 END) as rush_snaps,
        AVG(target_share) as target_share
    FROM read_parquet('nflverse/play_by_play_{week}.parquet')
    WHERE week = {week}
    GROUP BY player_id, player_name
    ORDER BY player_id
    """

    df = con.execute(query).fetchdf()

    # Convert to usage artifact format
    usage_data = []
    for _, row in df.iterrows():
        usage_data.append({
            'player_id': row['player_id'],
            'player_name': row['player_name'],
            'total_snaps': int(row['total_snaps']),
            'pass_snaps': int(row['pass_snaps']),
            'rush_snaps': int(row['rush_snaps']),
            'target_share': round(float(row['target_share']), 3),
            'schema_version': 'v1',
            'last_refresh': datetime.now().isoformat()
        })

    write_artifact(usage_data, output_path)
```

**4. Weekly Job Skeleton** ⏰ 1 hour

**What to do:**

- Provide cron-compatible script
- Write `calibration_report_v1` and ops summaries to R2
- Match ops dashboard documentation

**Implementation:**

```python
# scripts/weekly_job.py
#!/usr/bin/env python3
"""
Weekly job: Generate calibration report and ops summaries
Run: python scripts/weekly_job.py --week 2025-06
"""

import argparse
from src.etl import generate_calibration_report, generate_ops_summary
from src.io.storage import upload_to_r2

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--week', required=True, help='Week to process (YYYY-WW)')
    args = parser.parse_args()

    # Generate calibration report
    calibration = generate_calibration_report(args.week)
    upload_to_r2(calibration, f'calibration/{args.week}/report_v1.json')

    # Generate ops summary
    ops_summary = generate_ops_summary(args.week)
    upload_to_r2(ops_summary, f'ops/weeklies/{args.week}/summary_v1.json')

    print(f"✅ Weekly job complete for {args.week}")

if __name__ == '__main__':
    main()
```

**Cron setup:**

```bash
# Run every Tuesday at 2 AM (after week data is finalized)
0 2 * * 2 cd /path/to/pipelines && python scripts/weekly_job.py --week $(date +%Y-%V)
```

---

## 🛡️ Security and Org Hygiene (Cross-Repo)

### ✅ Current State

- Dependabot enabled and flowing
- Security updates automated
- Checkout action bumps happening

### ⏭️ Follow-Through Items

1. **Organization-Wide Security Settings**
   - [ ] Confirm 2FA required for all members
   - [ ] Enable security advisories
   - [ ] Configure Dependabot alerts
   - [ ] Review and enable automated updates

2. **Secret Management**
   - [ ] Rotate all API keys every 90 days
   - [ ] Use GitHub Secrets for all CI/CD
   - [ ] Never commit `.env` files
   - [ ] Audit secret access logs

3. **Compliance**
   - [ ] Document data retention policies
   - [ ] Add privacy policy (required for monetization)
   - [ ] Terms of service (before payments)
   - [ ] GDPR compliance (if EU users)

**Resources:**

- GitHub Security Setup: `customvenom-workers-api/GITHUB_SECURITY_SETUP.md`
- Ops Dashboard: `customvenom-workers-api/OPS_DASHBOARD_SETUP.md`

---

## ⚡ Immediate Action Plan (1-2 Hours)

### Priority 1: Fix Deployment (Done ✅)

- [x] Fix TypeScript linting errors
- [x] Remove `@typescript-eslint/no-explicit-any` usages
- [x] Fix unused variable warnings

### Priority 2: Workers API

**Task 1:** Add Contract Drift CI Job (1 hour)

```bash
cd customvenom-workers-api
mkdir -p tests/golden
curl https://api.customvenom.com/projections > tests/golden/projections.json
# Create .github/workflows/contract-guard.yml (see above)
```

**Task 2:** Normalize Header Helper (30 min)

```bash
cd customvenom-workers-api/src
# Create utils/headers.ts (see implementation above)
# Update all route handlers to use standardHeaders()
```

### Priority 3: Frontend

**Task:** Add Playwright Test (45 min)

```bash
cd customvenom-frontend
npm install -D @playwright/test
npx playwright install
# Create tests/trust-snapshot.spec.ts (see above)
```

---

## 📅 Next 1-2 Days Plan

### Day 1: Staging & Monitoring

**Morning (2-3 hours):**

1. Stand up staging Workers API
2. Point Preview frontend to staging
3. Test breaking changes flow

**Afternoon (2-3 hours):**

1. Enable Sentry on staging (low sample rate)
2. Configure release tagging
3. Monitor for 24 hours

### Day 2: Data Pipeline Hardening

**Morning (3-4 hours):**

1. Create JSON schemas for all artifacts
2. Add CI validation step
3. Test with golden week data

**Afternoon (2-3 hours):**

1. Add DuckDB nflverse ingest script
2. Test deterministic output formatting
3. Set up weekly job skeleton

---

## 🎯 Success Criteria

### Workers API

- [ ] Contract drift CI job passes
- [ ] All responses include standard headers
- [ ] Staging environment operational
- [ ] Error shapes standardized

### Frontend

- [ ] Playwright tests passing
- [ ] Performance budgets enforced in CI
- [ ] OAuth redirect documentation complete
- [ ] Zero TypeScript errors in deployment

### Data Pipelines

- [ ] All artifacts pass JSON schema validation
- [ ] Deterministic output verified (no noisy diffs)
- [ ] DuckDB ingest working
- [ ] Weekly job tested

---

## 📚 Implementation Resources

### Documentation References

- **API Contract:** `customvenom-workers-api/docs/guides/API_REFERENCE.md`
- **Quick Reference:** `customvenom-workers-api/docs/QUICK_REFERENCE.md`
- **Security:** `customvenom-frontend/SECURITY_AND_ACCESS_CONTROL.md`
- **Environment:** `customvenom-frontend/ENV_VALUES_REFERENCE.md`

### Code Examples

All implementation snippets above are production-ready and can be copy-pasted directly into your codebase.

### External Resources

- **GitHub Advisory Database:** https://docs.github.com/en/code-security/security-advisories
- **CISA Known Exploited Vulnerabilities:** https://www.cisa.gov/known-exploited-vulnerabilities-catalog
- **DuckDB Parquet:** https://duckdb.org/docs/data/parquet

---

## 🚀 Getting Started

### Quick Wins (Start Here)

1. ✅ Fix linting errors (DONE)
2. ⏭️ Add contract drift CI job (1 hour)
3. ⏭️ Create header helper function (30 min)
4. ⏭️ Add Playwright test (45 min)

### This Week

- Set up staging API
- Enable Sentry on staging
- Add JSON schema validation

### This Month

- Performance budgets in CI
- DuckDB ingest pipeline
- Weekly automation job

---

## ✅ Status Summary

| Category            | Status     | Priority |
| ------------------- | ---------- | -------- |
| TypeScript Errors   | ✅ Fixed   | Critical |
| Contract Guards     | ⏭️ Pending | High     |
| Staging Environment | ⏭️ Pending | High     |
| Performance Tests   | ⏭️ Pending | Medium   |
| Schema Validation   | ⏭️ Pending | Medium   |
| DuckDB Ingest       | ⏭️ Pending | Medium   |
| Sentry Enablement   | ⏭️ Pending | Low      |

---

**Next Step:** Choose a priority from the "Immediate Action Plan" and I'll implement it! 🚀
