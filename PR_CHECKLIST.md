# PR Checklist

## Frontend PR Checklist

### 1. Run Local Smokes

```bash
cd customvenom-frontend
npm install
npm run build
npx playwright install --with-deps
npx serve -s .next/standalone -l 3000 &
npx wait-on http://localhost:3000
npx playwright test tests/trust/tools-trust.spec.ts tests/visual/cls.spec.ts tests/nav/nav.spec.ts tests/nav/dock.spec.ts
```

### 2. Verify Aria-Current

- [ ] Navigate to `/tools` and check SideNav shows `aria-current="page"` on Tools link
- [ ] Navigate to `/projections` and check SideNav shows `aria-current="page"` on Projections link
- [ ] Check MobileDock shows same behavior (set viewport to mobile)

### 3. Test Skip Link

- [ ] Tab from address bar, verify skip link appears with yellow highlight
- [ ] Press Enter, verify jumps to #main-content

### 4. Test Quick Nav (G+P/T/L/S)

- [ ] Press `G` then `P` → navigates to /projections
- [ ] Press `G` then `T` → navigates to /tools
- [ ] Press `G` then `L` → navigates to /league
- [ ] Press `G` then `S` → navigates to /settings

### 5. Check CLS < 0.1

- [ ] Open DevTools → Performance tab
- [ ] Record on /tools page, check CLS metric < 0.1
- [ ] Record on /projections page, check CLS metric < 0.1

### 6. Verify DevOverlay Dev-Only

- [ ] Run `npm run build`
- [ ] Run `npm run start`
- [ ] Navigate to any page, verify DevOverlay does NOT appear
- [ ] Switch to dev mode: `npm run dev`
- [ ] Press backtick (`) → DevOverlay should toggle visible

### 7. Sanity Check Trust Snapshot

- [ ] Navigate to /tools
- [ ] Verify Trust Snapshot component shows "Schema: v1" and "Calibrated: [timestamp]"

## Workers API PR Checklist

### 1. Test /health Endpoint

```bash
cd customvenom-workers-api
wrangler dev --env staging
# In another terminal:
curl -si http://127.0.0.1:8787/health | head -20
```

Expected output:

```
HTTP/1.1 200 OK
x-request-id: <uuid>
x-schema-version: v1
x-last-refresh: <iso timestamp>
cache-control: no-store

{"ok":true,"ready":true,"schema_version":"v1","last_refresh":"..."}
```

### 2. Review HEALTH_MONITORING.md

- [ ] Skim docs for accuracy
- [ ] Verify Cloudflare synthetics examples match your setup
- [ ] Confirm GitHub Actions syntax is correct

### 3. Verify Sentry Stub

- [ ] Check `wrangler.toml` has `SENTRY_DSN = ""`
- [ ] Confirm no Sentry traffic in logs during test requests
