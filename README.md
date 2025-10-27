# CustomVenom Frontend

[![trust-gate](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/trust-gate.yml/badge.svg)](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/trust-gate.yml)
[![pr-lite](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/pr-lite.yml/badge.svg)](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/pr-lite.yml)

React 19 + Next.js 15 frontend for fantasy football projections and decision tools.

## 🌐 Live Production URLs

- **Main Site:** https://www.customvenom.com
- **Ops Dashboard:** https://www.customvenom.com/ops (6 tiles, all LIVE!)
- **Projections:** https://www.customvenom.com/projections
- **Preview:** https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app

## ✨ Preview-Ready Features

- ✅ **Stripe Checkout** - Test mode ready (needs test keys in Preview env vars)
- ✅ **Yahoo OAuth** - Sign-in ready (needs Yahoo app credentials in Preview env vars)
- ✅ **League Import Stub** - Test endpoint ready at `/api/league/import`

**Setup Guides:**
- [STRIPE_PREVIEW_SETUP.md](./STRIPE_PREVIEW_SETUP.md) - Stripe test checkout
- [YAHOO_OAUTH_SETUP.md](./YAHOO_OAUTH_SETUP.md) - Yahoo sign-in + league import

## 🧪 Testing

Run tests with CI parity (same environment as GitHub Actions):

```bash
# Smoke tests against production
make smoke-prod

# E2E tests against production
make e2e-prod

# Show all available targets
make help
```

**Environment Variables:**
- `FRONTEND_BASE=https://www.customvenom.com` - Target domain for testing
- `CANON=https://www.customvenom.com` - Canonical domain (should be primary)
- `ALT=https://customvenom.com` - Non-canonical domain (should redirect to CANON)

## 🚀 Quick Start

```bash
npm install

cp .env.example .env.local
# Edit .env.local with your values

npx prisma generate
npx prisma migrate dev --name add_yahoo_stripe_fields

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🚪 Local Gate

Quick validation before commits (Windows-optimized):

```bash
# Full local gate (build + start server + run tests + cleanup)
npm run test:gate

# Individual checks
npm run preflight:grep    # Check for http:// Yahoo references
npm run lint              # ESLint with max 2 warnings
npm run typecheck         # TypeScript validation
npm run test:unit         # Vitest unit tests only
npm run test:e2e          # Playwright E2E tests
```

**Pre-push hooks** run `npm run preflight` automatically on every commit.

### 🔧 **Operator Commands**

**Local gate validation:**
```bash
npm run test:gate
```

**Deterministic install:**
```bash
npx -y npm@10.7.0 ci
```

**Production smoke tests:**
```bash
# Trust Snapshot render
curl -s "https://www.customvenom.com/tools" | grep -i "trust\|schema\|calibrated\|stale"

# Health endpoint contract
curl -sSD - "https://api.customvenom.com/health" -o /dev/null | head -20
curl -s "https://api.customvenom.com/health" | jq -e '.ok and .ready and .schema_version and .last_refresh and .r2_key'

# Yahoo session probe (expects 401)
curl -sSD - "https://api.customvenom.com/yahoo/me" -o /dev/null

# Preflight CORS
curl -sSD - -X OPTIONS "https://api.customvenom.com/yahoo/leagues" \
  -H "Origin: https://www.customvenom.com" \
  -H "Access-Control-Request-Method: GET" -o /dev/null
```

## 🧪 E2E: Trust Snapshot

Test the Trust Snapshot UI component against staging:

```bash
# Install Playwright browsers
npx playwright install

# Run E2E tests
NEXT_PUBLIC_API_BASE="https://customvenom-workers-api-staging.jdewett81.workers.dev" npm run test:e2e
```

The test verifies that `/tools` page displays the Trust Snapshot with version and timestamp.

## 🎯 Features

- **Projections** - Risk assessment and reason chips (±3.5% clamp)
- **Auth Hardening** - Type-safe Yahoo OAuth + Stripe integration (v1.0.0)
- **League Import** - Yahoo Fantasy integration ready
- **Paywall** - Runtime guards for paid features
- **UI Polish** - Density toggle, skeletons, localStorage persistence
- **Validation** - Zod schema validation at API boundaries

## 📡 API

Set `NEXT_PUBLIC_API_BASE` in `.env.local` (e.g., `https://api.customvenom.com`).

See [workers-api](../customvenom-workers-api) for backend setup.

## 📚 Documentation

- [UI Features](./UI_FEATURES.md) - Component documentation
- [Reasons Adapter](./REASONS_ADAPTER.md) - Validation system
- [API Setup](./API_SETUP.md) - Backend integration
- [Auth Setup](./AUTH_SETUP_COMPLETE.md) - NextAuth configuration

## 🛠️ Tech Stack

- **Framework**: Next.js 15 (App Router)
- **UI**: React 19, Tailwind CSS, Radix UI
- **Auth**: NextAuth.js v5
- **Database**: PostgreSQL + Prisma
- **Payments**: Stripe
- **Validation**: Zod
