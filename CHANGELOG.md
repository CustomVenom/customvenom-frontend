# Changelog

All notable changes to CustomVenom Frontend will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/).

---

## [Unreleased] - 2025-10-17

### Added - UI shell + Tools + Design Preview + Command Palette

**Status:** Implemented (ready for Cursor)

#### What changed

- Added UI shell guidance and nav: Projections · Tools · Ops · Settings
- Tools hub with three interactive tools powered by /projections:
  - **Start/Sit Tie‑Breaker**: two players + risk → recommendation with ranges and ≤2 reason chips
  - **FAAB Bid Helper**: player + budget → min/likely/max bids with one rationale chip
  - **Important Decisions**: top 3 items with "why" and one next step
- **Design Preview** sandbox (/design-preview): theme tokens (primary/accent), Dark mode, Density, Radius. Live updates with localStorage persistence
- **Command palette** (Ctrl/⌘+K): quick actions for Tools, Projections, Design Preview, Toggle Dark, Toggle Density
- Trust Snapshot on tool pages, Quick Tips banner, and UI guardrails baked in

#### UI guardrails (client-side)

- ≤2 chips visible per row
- confidence ≥ 0.65 for visible chips
- total |Δ| ≤ 3–4% clamp across modifiers (UI clamps if needed)
- Skeletons for low CLS (< 0.1)

#### Learning loop v0

- Log weekly: start/sit decisions (risk, chosen option), outcome, spoke vs suppressed chips
- Weekly presentation-only tweaks: demote persistently noisy chips (SILENT), tiny band nudges by risk preference
- Decisions page prioritizes items aligned to stored risk profile and observed lift

#### Command palette actions

- Start/Sit → /tools/start-sit
- FAAB Helper → /tools/faab
- Important Decisions → /tools/decisions
- Open Projections → /projections
- Design Preview → /design-preview
- Toggle Dark Mode (html.class)
- Toggle Density (html[data-density])

#### Acceptance (smoke)

- /tools hub reachable from nav and palette
- Start/Sit returns result in < 1s on cache; chips capped and clamped
- FAAB shows min/likely/max with "Copy" and one rationale chip
- Decisions shows up to 3 items; list updates when risk changes
- /design-preview flips theme/density/radius live; preset persists
- Trust Snapshot shows stale badge without layout shift
- No console errors

#### Notes

- NEXT_PUBLIC_API_BASE must point to Workers API
- Keep read endpoints artifact-first; no DB dependency

---

## [0.1.0] - 2025-10-17

### Added - Production Deployment Success

- Fixed Vercel build errors (Stripe API version, ESLint warnings)
- Fixed Edge Function size limit (simplified middleware)
- Comprehensive smoke test suite
- Production-ready UI features (Density Toggle, Skeletons, Reason Chips, Glossary)
- Zod adapter for runtime validation
- 12 unit tests passing
- Full authentication system (Google, Yahoo, Twitter, Facebook)
- Stripe integration (checkout, webhooks, portal)
- Ops dashboard with 6 live tiles
- League import stub (Yahoo)
- Sentry error tracking

### Fixed

- Stripe API version compatibility (`2024-11-20.acacia` → `2024-06-20`)
- ESLint no-unused-vars warnings in logs.ts
- Edge Function bundle size (1 MB → <100 KB)
- Middleware simplified for Vercel free tier
- TypeScript strict mode compliance
- All import paths validated
- Prisma schema and client generation

### Infrastructure

- Next.js 15.5.4
- React 19.1.0
- TypeScript 5
- Prisma 6.17.1
- Stripe 16.0.0
- NextAuth 5.0.0-beta.29
- Sentry 8.0.0
- Tailwind CSS 4.1.14

---

## Links

- [Live Production](https://customvenom-frontend-incarcer-incarcers-projects.vercel.app)
- [Repository](https://github.com/Incarcer/customvenom-frontend)
- [Documentation](./docs/)
