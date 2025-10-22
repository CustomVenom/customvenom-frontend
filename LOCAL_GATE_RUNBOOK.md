# Local Gate + Release Runbook

**Purpose**: Run these gates locally before any push. Zero CI minutes, immediate feedback.

---

## 🚦 Pre-Push Gate (Required)

### Frontend E2E — Trust Snapshot (Staging)

**Location**: `customvenom-frontend`

```powershell
# Install dependencies
npm install

# Install Playwright browsers (one-time)
npx playwright install

# Set API base to staging
$env:NEXT_PUBLIC_API_BASE="https://customvenom-workers-api-staging.jdewett81.workers.dev"

# Run E2E tests
npx playwright test
```

**Acceptance** ✅
- Next.js builds successfully
- Server starts on port 3000 via Playwright webServer
- Navigates to `/tools` page
- Trust Snapshot component:
  - Visible (has `aria-label="Trust Snapshot"`)
  - Shows version string (starts with "v")
  - Contains `<time datetime="...">` element with valid ISO timestamp
- All E2E tests pass

**On FAIL**:
- Check `playwright-report/index.html` for visual report
- Paste first error line for one-line fix

---

## 🚀 Manual Deploy (After Local Gate PASS)

### Build

```powershell
cd customvenom-frontend

# Build for production
npm run build
```

**Acceptance** ✅
- Build completes without errors
- No Vitest import errors (tests excluded from build)
- `.next` directory created

---

### Deploy to Vercel/Preview

```powershell
# Deploy to preview
vercel

# Or deploy to production
vercel --prod
```

**Acceptance** ✅
- Deployment succeeds
- Visit live URL → `/tools` page
- Trust Snapshot visible with current version and timestamp

---

## 🛡️ Cost Guards

### CI Minutes
- **Disable GitHub Actions** by default
- Only enable for release weeks
- Local gates for daily development

### When CI Is Enabled
- Only run `e2e.yml` workflow
- No PR triggers (avoids Dependabot secret failures)
- Runs on: push to main, manual trigger only

---

## 📋 Quick Commands

### Local Gate (Full)
```powershell
$env:NEXT_PUBLIC_API_BASE="https://customvenom-workers-api-staging.jdewett81.workers.dev"
npm install
npx playwright test
```

### Dev Server
```powershell
npm run dev
# Open http://localhost:3000
```

### Type Check + Lint
```powershell
npm run type-check
npm run lint
```

---

## 🔧 Emergency Fixes

### Playwright "Invalid project directory .../3000"
✅ Already fixed: `PORT=3000 npm run start` in `playwright.config.ts`

### "Cannot find Trust Snapshot"
- Verify `src/components/TrustSnapshot.tsx` has `aria-label="Trust Snapshot"`
- Check component is rendered on `/tools` page

### EUSAGE / Lockfile mismatch
```powershell
npm install
npm run build
git add package-lock.json
git commit -m "chore(lock): sync lockfile"
git push origin main
```

---

## ✅ Release Checklist

- [ ] Local E2E gate PASS
- [ ] Build completes without errors
- [ ] Deploy to preview/staging
- [ ] Visit /tools in browser
- [ ] Trust Snapshot visible with version + timestamp
- [ ] Working tree clean
- [ ] PASS receipts documented

**Then**: Ship with confidence!

---

## 🎯 Current Config

**Playwright**: `playwright.config.ts`
- ✅ webServer: `PORT=3000 npm run start`
- ✅ trace: 'on-first-retry'
- ✅ timeout: 120s for server startup

**Tests**: Isolated from build
- ✅ Unit tests: `tests/unit/`
- ✅ E2E tests: `tests/*.spec.ts`
- ✅ tsconfig excludes all test patterns

**Workflow**: `.github/workflows/e2e.yml`
- ✅ Boot-first logging
- ✅ npm install (non-strict until lockfile synced)
- ✅ Guarded secrets
- ✅ Artifacts on failure

