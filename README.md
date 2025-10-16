# CustomVenom Frontend

React 19 + Next.js 15 frontend for fantasy football projections and decision tools.

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
