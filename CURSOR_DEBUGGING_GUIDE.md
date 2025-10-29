# Cursor Debugging Directives — CustomVenom

### Purpose

Equip Cursor to be an excellent debugger for CustomVenom. Concrete tasks, guardrails, and copy‑ready snippets so anyone in Cursor can diagnose OAuth, CORS, trust headers, resilience gates, and UI quickly.

---

### 0) Ground rules (follow every time)

- One failure → one hypothesis → one minimal change → re‑measure (no parallel "maybe" fixes)
- Outside‑in: start at URL and headers → routing → env → middleware → route handler → vendor
- Always capture request_id, first 10–20 headers, and a body snippet for receipts
- HTTPS only. Never use http or scheme‑relative URLs in examples

---

### 1) Cursor workspace setup

- Install and pin Node 20.x in the environment (Dev Container or local)
- Recommend extensions
    - TypeScript ESLint, Tailwind CSS IntelliSense, Thunder Client or REST Client
- Project tasks
    - Workers API
        - "Test" → `npm -w customvenom-workers-api test`
        - "Build" → `npm -w customvenom-workers-api run build`
        - "Dev (Wrangler)" → `npx -w customvenom-workers-api wrangler dev --local`
    - Frontend
        - "Playwright E2E" → `NEXT_PUBLIC_API_BASE="$API_BASE" npx -w customvenom-frontend playwright test`

---

### 2) Environment variables (staging or preview)

- In Cursor terminal before running:

```bash
export FRONTEND_ORIGIN="https://www.customvenom.com"
export API_BASE="https://api.customvenom.com"
```

- Frontend Playwright runs

```bash
NEXT_PUBLIC_API_BASE="$API_BASE" npx -w customvenom-frontend playwright test --project=chromium
```

---

### 3) Quick receipts (copy‑paste)

- Callback 302 (expect Set-Cookie + no-store + Location to FRONTEND)

```bash
curl -sSD - "$API_BASE/api/yahoo/callback?code=dummy&state=dummy" -o /dev/null | sed -n '1,25p'
```

- Health headers (expect no-store + x-request-id)

```bash
curl -sSD - "$API_BASE/health" -o /dev/null | sed -n '1,20p'
```

- Projections headers (expect x-schema-version + x-last-refresh; x-stale on fallback)

```bash
curl -sSD - "$API_BASE/projections?week=2025-06" -o /dev/null | sed -n '1,30p'
```

- OPTIONS preflight for leagues

```bash
curl -sSD - -X OPTIONS "$API_BASE/yahoo/leagues" \
 -H "Origin: $FRONTEND_ORIGIN" \
 -H "Access-Control-Request-Headers: content-type" \
 -H "Access-Control-Request-Method: GET" -o /dev/null | sed -n '1,30p'
```

---

### 4) OAuth — what good looks like

- /api/connect/start?host=yahoo&from=/tools → 302 to /api/yahoo/signin (sets cv_return_to)
- /api/yahoo/signin → Yahoo authorize (scope=fspt-r, redirect_uri exact)
- /api/yahoo/callback → 302 back to FRONTEND_ORIGIN + return path; headers include Set-Cookie cv_yahoo; Cache-Control: no-store; x-request-id
- /yahoo/me, /yahoo/leagues → 200 JSON with ACAO=FRONTEND_ORIGIN; ACAC=true

---

### 5) Trust bundle — central enforcement

- Post‑response middleware (Workers/Hono) sets:
    - /health: cache-control=no-store
    - JSON routes: cache-control=SWR+SIE, x-request-id, ACAO=FRONTEND_ORIGIN, ACAC=true, Vary: Origin
- OPTIONS responder for /yahoo/* returns 204 with the same CORS headers and no-store

---

### 6) Resilience gates — helpers

- Expose in `src/lib/upstream.ts`:
    - `resilientFetch(url, init, retries, timeoutMs)`
    - `breakerOpen()`
    - `__resetResilienceForTests()`
- Debug loop
    - Reset → force 5×5xx → assert breakerOpen=true → run 25 parallel 200s → ensure no 503s

---

### 7) Common errors → one‑line fixes

- Missing cookie on 302 callback → merge headers and append `set-cookie` on the redirect Response

```tsx
return c.redirect(`${FRONTEND_ORIGIN}${ret||'/tools'}`, 302, {
  'cache-control':'no-store', 'x-request-id':reqId, 'set-cookie': cookieStr,
});
```

- Hono overload: passing `Headers` into `c.json` → pass a record

```tsx
return c.json(body, 200, { 'cache-control':'no-store', 'x-request-id': reqId })
```

- ACAO is `*` on cookieed endpoints → set explicit origin in middleware for /yahoo/*
- Vitest env fails with undici "reading node" → use `environment:'node'` and add `import 'undici/polyfill'` + preserve `process.versions.node`
- Tailwind v4 canonical classes → `border-(--cv-primary)`, `text-(--cv-primary)`, `shrink-0`, `wrap-break-word`

---

### 8) Cursor /.cursor/rules.md — debugging mode (drop‑in)

```markdown
# Cursor Debugging Directives — CustomVenom
- Always run receipts first: callback 302, health headers, projections headers, OPTIONS preflight
- Propose ONE minimal diff tied to the FIRST failing line, then stop and re-run receipts
- Prefer middleware for headers; avoid per-route header duplication
- For OAuth: assert redirect_uri, scope=fspt-r, and state; never add openid
- For CORS with cookies: ACAO must equal FRONTEND_ORIGIN and ACAC=true; never "*"
- For tests: use Vitest node env with undici polyfill; cast unknown JSON bodies; avoid generic Request types
```

---

### 9) Run order (one pass every time)

1) Receipts: callback 302 → health → projections → OPTIONS

2) If any red: apply exactly one minimal patch (headers/cookie/ACAO/redirect)

3) Re-run receipts; capture request_id and Location/Set-Cookie lines

4) Only then run Workers tests and Playwright trust snapshot

---

### 10) Acceptance

- OAuth happy path: cookie on 302 + correct Location back to frontend
- CORS consistent on /yahoo/* and OPTIONS returns 204 with expected headers
- Health no-store + x-request-id; projections include schema_version and last_refresh
- Resilience helpers exported; breaker opens after 5×5xx; high concurrency returns without 503s

---

### 11) Paste‑in snippets index

- Cookie on redirect, Hono HeaderRecord helper, OPTIONS preflight handler, trust middleware, Vitest setup with undici, Tailwind v4 class conversions
