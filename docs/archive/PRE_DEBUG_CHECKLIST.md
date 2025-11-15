# Pre-Debug Checklist — Automated Validation

This checklist covers runtime and integration issues that can be caught before smoke testing.

## ✅ Status Legend

- ✅ Implemented
- 🟡 Partial
- ⏳ Pending
- ❌ Not Started

---

## 1. Environment & Config Guards

- ✅ Startup validator for missing env vars
- ✅ Health check client for Workers API
- ⏳ Feature flag validation

**Files:**

- `src/lib/env-validator.ts`
- `src/app/api/health/route.ts`

---

## 2. API Proxy & Trust Headers Assertions

- ✅ Trust header assertion utility
- ✅ Request ID logging
- ⏳ Automated test suite

**Files:**

- `src/lib/test-utils/trust-headers.ts`
- `tests/integration/api-proxy.test.ts`

---

## 3. Adapter & Data-Shape Hardening (Unit Tests)

- ✅ Unit tests for projections-adapter
- ✅ Unit tests for mapExplanationToReason null-safety
- ✅ Legacy and new shape handling

**Files:**

- `tests/unit/adapters/projections-adapter.test.ts`
- `tests/unit/lib/tools.test.ts`

---

## 4. Deep-Link Coverage

- ⏳ E2E tests for drawer deep links
- ⏳ E2E tests for tool pre-fills

**Files:**

- `tests/e2e/deep-links.spec.ts`

---

## 5. Sticky Bars & Layout Overlap

- ⏳ Playwright assertions for 375×667 viewport
- ⏳ Visual snapshot for 768px breakpoint

**Files:**

- `tests/e2e/layout-overlap.spec.ts`
- `tests/e2e/responsive.spec.ts`

---

## 6. Public vs User Trust Windows

- ✅ PublicTrustFooter route detection
- ⏳ TrustSnapshot route detection
- ⏳ Automated assertions

**Files:**

- `tests/e2e/trust-windows.spec.ts`

---

## 7. Theme & Hydration

- ✅ Pre-paint theme script (in layout.tsx)
- ⏳ Hydration warning test
- ⏳ Theme/density persistence test

**Files:**

- `tests/e2e/hydration.spec.ts`

---

## 8. Cookie Forwarding & CORS Sanity

- ✅ Runtime assertions in proxy routes
- ⏳ Credentials forwarding test
- ⏳ Error handling test

**Files:**

- `tests/integration/yahoo-proxy.test.ts`

---

## 9. Error/Empty States Consistency

- ⏳ Snapshot tests for loading states
- ⏳ Snapshot tests for empty states
- ⏳ Snapshot tests for error states

**Files:**

- `tests/e2e/error-states.spec.ts`

---

## 10. Feature Flags Behavior

- ⏳ FEATURE_NBA=false test
- ⏳ PAYWALL=false test

**Files:**

- `tests/e2e/feature-flags.spec.ts`

---

## 11. Performance Guardrails

- ✅ React Query staleTime/refetchInterval set (5 min)
- ⏳ Bundle size guard
- ⏳ Shared cache verification

**Files:**

- `tests/performance/bundle-size.test.ts`

---

## 12. Accessibility Quick Pass

- ⏳ Axe-core Playwright integration
- ⏳ Drawer aria-modal test
- ⏳ Button size assertions

**Files:**

- `tests/e2e/a11y.spec.ts`

---

## 13. Routing & 404s

- ⏳ All documented routes return 200
- ⏳ Unknown routes show friendly 404

**Files:**

- `tests/e2e/routing.spec.ts`

---

## 14. Logging Essentials

- ✅ TrustSnapshot headers logged
- ✅ RequestId on error states
- ⏳ Structured error logging

**Files:**

- `src/lib/error-logging.ts`

---

## Running the Checks

```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# All checks
npm run test:all
```
