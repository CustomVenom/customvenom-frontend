# CustomVenom Frontend

[![e2e](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/e2e.yml/badge.svg)](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/e2e.yml)

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
