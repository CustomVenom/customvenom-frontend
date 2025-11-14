# UI Rebuild — Consolidated Handoff

> **🛡️ KV Status and Guardrails — Read Me First**
>
> - KV circuit breaker may be active during local or staging work. When active, public endpoints must return either 429 (rate limited) or 200 with `x-stale=true` and trust headers. **Never 500**.
> - `/health` is allowlisted from the rate limiter and must not touch KV. It should always return 200 with trust headers in healthy states.
> - Frontend proxies must always set trust headers and fall back to mocks with `x-stale=true` on upstream errors.

## Purpose

Single, cursor-ready handoff that consolidates ALL corrections and implementation instructions across phases. Keep sub-package layout intact for quick export.

---

## Repo Layout Constraints (Do Not Restructure)

> **Note on 3-repo setup**
>
> - **customvenom-frontend** (Next.js): This work order applies here. The "apps/web" and "packages/\*" references map to your existing sub-packages within this repo if present; do not restructure the repo, just place files as listed under the current package folders.
> - **customvenom-workers-api** (Cloudflare Workers): No schema or contract changes required. Frontend proxies must forward `cv_yahoo` and preserve trust headers.
> - **customvenom-data-pipelines** (Python): No changes required. Continue publishing artifacts to canonical R2 keys; frontend consumes via the existing `/projections` Workers endpoint.

- `apps/`
  - `web/` (Next.js app)
- `packages/`
  - `ui/` (tokens, layout primitives, shared UI)
  - `lib/` (fetch-with-trust, trust context, hooks, adapters, utils)
  - `config/` (feature flags, env mirroring)

---

## Phase 1 — Foundation (Required First)

### 1.1 Shared Foundation — Hooks & Utilities

**Files**

- `packages/lib/hooks/useSession.ts`
- `packages/lib/hooks/useYahooRoster.ts`
- `packages/lib/yahoo-client.ts`
- `packages/lib/trust-context.ts`
- `packages/config/flags.ts`

**API**

- `/api/auth/session`, `/api/yahoo/leagues`, `/api/yahoo/roster`

**Acceptance**

- `useSession` returns `{session, loading, error}`
- `useYahooRoster` keyed as `['roster', sport, leagueKey]`
- `TrustProvider` emits updates on each `fetchWithTrust` call
- `FEATURE_NBA`, `PAYWALL` read from `packages/config/flags.ts`

### 1.2 Backend Stubs & Proxies

**Files**

- `apps/web/src/app/api/lineup-optimizer/route.ts` (mock)
- `apps/web/src/app/api/league/transactions/route.ts` (mock)
- `apps/web/src/app/api/yahoo/roster/route.ts` (proxy verify)

**Rules**

- Node runtime; forward `cv_yahoo` cookie
- Forward trust headers: `x-schema-version`, `x-last-refresh`, `x-request-id`, `x-stale`

**Acceptance**

- All stubs return JSON + trust headers; Yahoo proxies forward cookie

### 1.3 NFL App Shell — Layout & Tokens

**Files**

- `packages/ui/styles/tokens.css`
- `packages/lib/adapters/projections-adapter.ts` (guardrails)
- `apps/web/src/components/layout/Header.tsx`
- `apps/web/src/components/layout/MobileNav.tsx`
- `apps/web/src/app/layout.tsx` (wrap QueryClientProvider + TrustProvider)
- `apps/web/src/components/trust/TrustSnapshot.tsx`
- `apps/web/src/app/players/page.tsx`, `components/players/*`

**Acceptance**

- Sticky header/bottom nav; `[main.app]` has padding-top/bottom tokens
- Adapter enforces confidence ≥0.65 and max 2 chips
- TrustSnapshot shows schema and last refresh

### 1.4 Public Trust Window

**Files**

- `apps/web/src/components/trust/PublicTrustFooter.tsx`
- `packages/lib/fetch-with-trust.ts`

**Integration**

- Render PublicTrustFooter only on public routes; TrustSnapshot on private

**Acceptance**

- Footer shows schema + last refresh; respects safe-area; no overlap

---

## Phase 2 — Core Features

### 2.1 Team + Player Drawer

**Files**

- `apps/web/src/app/team/page.tsx`
- `apps/web/src/components/team/StarterGrid.tsx`
- `apps/web/src/components/team/BenchList.tsx`
- `apps/web/src/components/team/TeamTotal.tsx`
- `apps/web/src/components/team/OptimizerWidget.tsx` (stub wire)
- `apps/web/src/components/player/PlayerDrawer.tsx`

**API**

- `/api/yahoo/roster`, `/api/projections`, `/api/lineup-optimizer` (stub)

**Acceptance**

- Roster enriched from projections cache; team total = sum of starters' median
- Drawer opens from `/team` and `/players` and deep link `?player=ID`

### 2.2 Start/Sit v1

**Files**

- `apps/web/src/app/tools/start-sit/page.tsx`
- `packages/lib/recommendation.ts`
- `apps/web/src/components/start-sit/{StartSitForm, RiskSelector, ComparisonPanel}.tsx`

**Acceptance**

- Deep links `?playerA=&playerB=&risk=protect|neutral|chase`
- Single concise rationale uses most confident Venom Chip; UI clamps deltas

---

## Phase 3 — Tools Suite

### 3.1 Trade Analyzer v1

**Files**

- `apps/web/src/app/tools/trade/page.tsx`
- `apps/web/src/components/trade/{TradeColumns,FairnessBadge}.tsx`
- `packages/lib/ros-value.ts` (position weights constants included)

**Acceptance**

- Multi-select works; deep links `?offer=&request=`

### 3.2 FAAB Helper v1

**Files**

- `apps/web/src/app/tools/faab/page.tsx`
- `apps/web/src/components/faab/{FaabBudget,TargetsTable,BidCalculator}.tsx`
- `packages/lib/faab.ts` (bands clamp to budget)

**API**

- `/api/yahoo/league-settings` (proxy or stub if missing)

**Acceptance**

- Budget renders; `/tools/faab?target=ID` preselects; bands never exceed budget

### 3.3 Matchup + Standings

**Files**

- `apps/web/src/app/matchup/page.tsx`
- `apps/web/src/components/matchup/{ComparisonTable,Insights}.tsx`
- `packages/lib/winprob.ts` (marked Estimated)
- `apps/web/src/app/league/standings/page.tsx`
- `apps/web/src/components/league/{StandingsTable,PlayoffLine}.tsx`

**Acceptance**

- Edges per position; win probability labeled Estimated; standings mobile-safe

### 3.4 Optimizer Widget (stub)

**Files**

- `apps/web/src/components/team/OptimizerWidget.tsx`

**Acceptance**

- Shows top 3 placeholders; confirm modal stubs; risk profile respected

---

## Phase 4 — Public & Settings

### 4.1 Public Pages

**Files**

- `apps/web/src/app/{page.tsx,features/page.tsx,pricing/page.tsx,about/page.tsx}`
- `apps/web/src/components/public/{Hero,FeatureGrid,PricingTiers,SiteFooter}.tsx`

**Acceptance**

- Hero + CTA; public trust footer present; no horizontal scroll

### 4.2 Settings & Legal

**Files**

- `apps/web/src/app/settings/page.tsx`
- `apps/web/src/components/settings/{PreferencesForm,TierPanel}.tsx`
- `apps/web/src/app/legal/{terms/privacy}/page.tsx`
- `apps/web/src/app/contact/page.tsx`

**Acceptance**

- Preferences persist; Yahoo connect status visible; legal pages render

---

## Phase 5 — QA & Testing

**Files**

- `apps/web/playwright.config.ts`
- `apps/web/tests/e2e/{sticky,trust,deeplinks,responsive}.spec.ts`

**Assertions**

- Sticky bars always visible and non-blocking (last row tappable at 375×667)
- TrustSnapshot renders headers after first fetch
- Deep links open Drawer and prefill tools
- No horizontal scroll on xs; table→card switch at 768px visual snapshot

---

## Cross-Cutting Rules (Enforced in Code)

- Single `fetchWithTrust` wrapper for all data calls; always capture trust headers
- React Query keys: `['projections', sport, week]` and `['roster', sport, leagueKey]`
- Feature flags from `packages/config/flags.ts`; `FEATURE_NBA=false`, `PAYWALL=false` by default
- A11y: aria-modal drawers, focus trap, ≥44px targets, aria-busy skeletons
- Performance: shared cache; no duplicate fetches across pages

---

## Links to Detailed Handoffs (Reference)

- [App Shell — Sticky Bars, Trust, Players v1](https://www.notion.so/Cursor-Handoff-NFL-App-Shell-Sticky-Bars-Trust-Players-v1-e1eee01b3a0546b183bb36ad23023a47)
- [Team v1 + Player Drawer](https://www.notion.so/Cursor-Handoff-Team-v1-Player-Drawer-Roster-Projections-Optimizer-Hook-ba6bdcd3e25a4034b62b7ee5d413f3dd)
- [Start/Sit v1](https://www.notion.so/Cursor-Handoff-Start-Sit-v1-Risk-Profiles-Deep-Link-Prefill-Shared-Cache-17c8455790a149d09ffb8396b57e8bca)
- [Matchup + Standings](https://www.notion.so/Cursor-Handoff-Matchup-League-Standings-Edges-Win-Probability-Playoff-Line-15c1e3a721ad4308bba20d8fff077b68)
- [Public Trust Footer](https://www.notion.so/Cursor-Handoff-Public-Trust-Window-Footer-Site-wide-Schema-Refresh-b36db878dadb4bd8943a4b55a100dca2)
- [FAAB Helper](https://www.notion.so/Cursor-Handoff-FAAB-Helper-v1-Budget-Targets-Bid-Bands-16e1155055a7498dbaf7f368ec092adb)
- [Trade Analyzer](https://www.notion.so/Cursor-Handoff-Trade-Analyzer-v1-Two-way-Compare-ROS-Value-03a8921a91c94296953ff1ce8f15dc89)
- [Optimizer Widget](https://www.notion.so/Cursor-Handoff-Optimizer-Widget-v1-Top-3-Suggestions-Apply-Dismiss-ff2e9a9319354ebab7e262bf45a024ff)
- [Public Pages Scaffold](https://www.notion.so/Cursor-Handoff-Public-Pages-Scaffold-Landing-Features-Pricing-About-6398815d351f41119975ad405c99bbbb)
- [Error/Empty/Skeleton Kit](https://www.notion.so/Cursor-Handoff-Error-Empty-and-Skeleton-States-Unified-Kit-f53c70deeadb473caceeeb700b55e3c0)
- [Navigation & Deep Links](https://www.notion.so/Cursor-Handoff-Navigation-Deep-Links-IA-Map-and-URL-Conventions-c2319e4474c5465482c001967436afab)
- [Settings & Tier Gates](https://www.notion.so/Cursor-Handoff-Settings-Tier-Gates-Preferences-Feature-Flags-78afb54a9657499e93f8e1274816fede)
- [Player Drawer — Charts/News/History](https://www.notion.so/Cursor-Handoff-Player-Detail-Drawer-Charts-News-History-5b88def0baf5406aa72868700ea92d5b)
- [League Transactions](https://www.notion.so/Cursor-Handoff-League-Transactions-Adds-Drops-Trades-Feed-da35863001814139b05dc9f7fab94e32)
- [Legal & Footer](https://www.notion.so/Cursor-Handoff-Legal-Footer-Terms-Privacy-Contact-57ddc59652964715aa45104567a9b80d)
- [QA — Playwright Harness](https://www.notion.so/Cursor-Handoff-QA-Playwright-Smoke-Visual-Snapshots-c8c926e11dfe45819cb1e4d7b7d2992a)

---

## Turn-Key Instructions for Cursor

1. Keep sub-package layout intact. Add new files to `packages/ui|lib|config` and `apps/web` only.

2. Implement Phase 1 fully, then Phase 2, etc., validating acceptance after each step.

3. Use `fetchWithTrust` for all API calls and update `TrustProvider` on success.

4. For Yahoo proxies, forward `cv_yahoo` cookie and trust headers; Node runtime only.

5. Open PRs per phase; run Playwright e2e locally before marking done.

---

## Current Status

### ✅ Completed

- **Phase 1**: Foundation (hooks, utilities, layout, trust components)
- **Phase 2**: Core features (Team page, Player drawer, Start/Sit tool)
- **Phase 3**: Tools suite (Trade Analyzer, FAAB Helper, Matchup, Standings)
- **Phase 4**: Public pages and settings
- **Polish fixes**: TrustSnapshot formatting, chip delta display, CORS headers

### ⏳ In Progress / Pending

- **Phase 5**: Full Playwright QA suite (partial coverage exists)
- **Workers API switchover**: Ready for live data when Workers is available

### 🛡️ KV Guardrails (Active)

- All public endpoints return 200 with `x-stale=true` or 429, never 500
- `/health` allowlisted from rate limiter (no KV operations)
- Frontend proxies always set trust headers and fall back to mocks on upstream errors
