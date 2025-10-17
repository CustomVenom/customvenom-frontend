# CustomVenom — Cursor System + Business Brief

## 0) Mission and Outcome

- **Mission:** Help fantasy managers make better weekly decisions through explainable AI.
- **Outcome:** Trust-first MVP that proves lift on real choices, then grow into a sustainable business.

## 1) Product Scope (MVP)

- **Core value:** Floor, Median, Ceiling per player with confidence-gated driver chips explaining "why."
- **Reads only:** Versioned JSON from week-scoped artifacts. schema_version and last_refresh in every response.
- **UI baseline:** Projections table, trust snapshot (freshness badge), up to 2 chips per row.
- **Ops:** Smokes for /health and /projections, stale-if-error with visible "stale" badge.

**Non-goals (MVP):** Write endpoints, DB-backed workflows for read paths.

## 2) Business Scope

- **Business intent:** This is a product company, not just a demo.
- **Target user:** Engaged fantasy "power users" who pay for clear, trustworthy weekly help.
- **Value promise:** Explainers plus calibrated ranges to reduce bad starts, smarter waivers, and better trades.

### Monetization Phases

- **Phase 1:** Early access supporters plan and paid visual add-ons.
- **Phase 2:** Team or league plans. Premium features like optimizer and advanced reports.
- **Phase 3:** Developer API for partners.

### Pricing Guidance

- **Near term:** $10–$20 ARPU target with a low-friction early plan.
- **Annual preferred** to smooth seasonality.

## 3) Go-To-Market (GTM)

- **Proof-led content:** Weekly "lift" stories showing decisions improved by data.
- **Distribution:** Social posts and short threads explaining one decision with chips and ranges.
- **Conversion path:** Free visuals → email capture → early access plan.
- **Feedback loop:** Lightweight onboarding survey and NPS after week 2.

## 4) KPIs and Targets

- **Product trust:** Coverage within target bands, pinball loss stable or improving.
- **Engagement:** Weekly active users and repeat visit rate on Sunday setups.
- **Conversion:** Waitlist to signup rate, free to paid conversion.
- **Monetization:** ARPU $10–$20 near-term, churn under 10% within season.

## 5) League Integration Priority

- **P0 (Phase 1):** Yahoo Fantasy API (personal priority)
- **P1 (Phase 2):** Sleeper API
- **P2 (Phase 2):** ESPN Fantasy API
- **Feature:** Import team/league info, sync rosters, personalized recommendations

## 6) Guardrails (build-time)

### Contracts
- No breaking renames or removals without schema_version bump
- Keep ranges as defined quantiles for Floor, Median, Ceiling

### Driver chips
- ≤ 2 visible per row
- confidence ≥ 0.65
- Suppress unstable or conflicting signals

### Deltas and clamps
- Total per-player |Δ| ≤ 3–4% across all modifiers
- Enforced in serialization

### Reliability
- stale-if-error up to 24h with a visible badge
- Trim mode permitted but must preserve contract keys

### Security
- No secrets in repo or logs
- CORS per route policy for public GETs

## 7) Architecture and Data

- **Source of truth:** Object storage with week JSON and Parquet.
- **API:** Serverless edge workers, read-only GETs, caching with stale-if-error.
- **Database:** Required for user accounts, sessions, subscriptions, and league data.
- **Auth:** NextAuth with multiple providers (Google, Yahoo, Twitter, Facebook).
- **Payments:** Stripe for subscriptions and feature unlocks.

## 8) Feature Flags

- OFF → SILENT (log only) → ON
- Promotion requires guardrail PASS and acceptance checks PASS

## 9) Acceptance Checks (copy-ready)

### API
- /health returns ok plus schema_version
- /projections returns valid contract with ranges, chips ≤ 2, confidence gates respected
- last_refresh present and accurate; stale mode shows badge

### Ops
- Local and Preview smokes PASS
- Intentional red cases trip guards in CI

### UI
- Bands render without CLS
- Chips capped and conflict-resolved
- Trust snapshot visible

## 10) Smokes (examples)

### Health
```bash
curl -sS https://YOUR_API/health | jq '{ok, schema_version}'
```

### Projections
```bash
curl -sS https://YOUR_API/projections | jq '.[0] | {schema_version, last_refresh, floor, median, ceiling, chips_count: (.chips | length)}'
```

## 11) Environment Policy

- Preview environment is allowed to toggle new flags and stale-if-error
- Production defaults to stable flags OFF or SILENT until acceptance

## 12) Roadmap Snapshot

- **P0:** Trust snapshot, clamps and guards, chip conflict resolver, stale badge, /health polish
- **P1:** Defensive reliability ledger, risk dial badge, FAAB bands readout
- **P2:** Additional safe modifiers and consensus bridges without contract changes

## 13) Database Strategy

- **User data:** Postgres (via Neon/Vercel) for accounts, sessions, subscriptions
- **League imports:** Store Yahoo/Sleeper/ESPN team rosters and league settings
- **Read endpoints:** Remain artifact-first (R2/Cloudflare) even with database
- **Write endpoints:** User preferences, saved lineups, league sync (coming in Phase 2)

## 14) Working Style for PRs

One feature per PR with:
- Summary, acceptance checks, links to smokes
- Example payloads before/after if contract changes
- Guardrail notes: chips count, confidence gates, |Δ| clamp evidence

## 15) Definition of Done

- Contract unchanged or version-bumped with examples
- Guardrails PASS: chips ≤ 2, confidence ≥ 0.65, |Δ| ≤ 3–4%
- Smokes PASS locally and in Preview
- Notes include acceptance and example payloads

---

**This brief aligns both AI assistants to maintain trust-first, contract-stable development.**

