# TODO — Next Slices (A-grade lock-in)

## Frontend

- [ ] Wire Zod schema into projections fetcher
  - Acceptance:
    - Invalid payload shows ApiErrorBoundary fallback with retry
    - Valid payload renders density toggle, skeletons, chips ≤ 2 with ±3.5% clamp
  - Files:
    - src/app/projections/page.tsx or data.ts (use parseProjectionsPayload)
    - tests/projections.e2e.test.ts updated

- [ ] Run codemod to replace all console.\* with logger
  - Acceptance:
    - No console.log/warn/error in src/ (except error paths)
    - All files import logger and use structured logging
  - Command:
    - node scripts/codemod-replace-console.mjs src

- [ ] Add Playwright E2E tests for critical flows
  - Acceptance:
    - /projections page loads with data
    - Density toggle works
    - Reason chips render correctly
    - Error boundary shows on API failure
  - Files:
    - tests/e2e/projections.spec.ts
    - playwright.config.ts

## CI / Integrations

- [ ] Add frontend smoke tests to CI
  - Acceptance:
    - Build passes
    - Linter passes
    - Unit tests pass (21/21)
    - E2E tests pass
  - Files:
    - .github/workflows/frontend-ci.yml

## Notes

- Guardrails: require schema_version + last_refresh; chips ≤ 2; conf ≥ 0.65; |Δ| ≤ 3.5–4%; fail‑closed
- Phase 3 items: observability polish, trim mode + stale badge, projections table UX, trust snapshot v2
