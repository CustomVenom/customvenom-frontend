# CustomVenom Frontend

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

## 🚀 Quick Start

```bash
npm install

cp .env.example .env.local
# Edit .env.local with your values

npx prisma generate
npx prisma migrate dev

npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 🎯 Features

- Projections with risk assessment and reason chips (±3.5% clamp)
- Density toggle with localStorage persistence
- Skeletons to prevent layout shift
- Stripe Pro tier integration
- Zod validation at API boundaries

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
