# CustomVenom Frontend

[![e2e](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/e2e.yml/badge.svg)](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/e2e.yml)
[![docs-lint](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/docs-lint.yml/badge.svg)](https://github.com/CustomVenom/customvenom-frontend/actions/workflows/docs-lint.yml)

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

- [Stripe Preview Setup](./docs/setup/STRIPE_PREVIEW_SETUP.md) - Stripe test checkout
- [Yahoo OAuth Implementation](./docs/implementation/YAHOO_OAUTH_IMPLEMENTATION.md) - Yahoo sign-in + league import

## 🎨 Styling

- **[Tailwind CSS Implementation Reference](./TAILWIND_IMPLEMENTATION_REFERENCE.md)** - Complete setup guide, FOUC prevention, safelist config, and validation snippets

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
# Set staging API base
export NEXT_PUBLIC_API_BASE="https://customvenom-workers-api-staging.jdewett81.workers.dev"

# Run E2E tests
npx playwright test
```

## 📚 Architecture

**Architecture Law #3: API is Contract, UI is Presentation**

- Frontend NEVER calculates fantasy points - only displays API data
- Use `isEnhanced()` from `src/lib/projection-utils.ts` for enhancement checks
- All projection data comes from API responses only

### Key Files

- **Projection Utils**: `src/lib/projection-utils.ts` - Centralized enhancement checking
- **Logger**: `src/lib/logger.ts` - Structured JSON logging with request IDs
- **Middleware**: `src/middleware.ts` - Request ID generation at edge

## 📖 Documentation

All documentation is consolidated in the `docs/` folder:

- **[Documentation Index](./docs/README.md)** - Complete documentation overview
- **[Projection Utils](./docs/PROJECTION_UTILS.md)** - How to use centralized enhancement functions
- **[Developer Guide](./docs/guides/DEVELOPER_GUIDE.md)** - Development workflows and patterns
- **[Quick Reference](./docs/guides/QUICK_REFERENCE.md)** - Commands and quick patterns
- **[Troubleshooting](./docs/guides/TROUBLESHOOTING.md)** - Common issues and fixes
- **[Setup Guides](./docs/setup/)** - Environment setup (Vercel, Stripe, OAuth, etc.)
- **[Implementation Guides](./docs/implementation/)** - Feature implementation details
- **Architecture**: See `customvenom-workers-api/docs/ARCHITECTURE.md` for architectural laws
