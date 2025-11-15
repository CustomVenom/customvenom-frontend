# Clean Build Playbook — Frontend (Next.js)

### Purpose

Practical, copy‑ready steps to keep the UI rebuild clean. Prevents stale files, duplicate routes, stray lockfiles, and cache residue from breaking builds.

---

## 0) One‑time sanity

- Ensure only one lockfile is active (in repo root). If Windows created a stray one under `C:\Users\<you>\package-lock.json`, rename it.
  - PowerShell:

    ```powershell
    if (Test-Path -Path "C:\Users\Fib\package-lock.json") { Rename-Item "C:\Users\Fib\package-lock.json" "package-lock.json.bak" }
    ```

- Confirm exactly one `/api/projections` route file exists in `apps/web` (delete legacy duplicates).

---

## 1) Local clean (run anytime things get weird)

```powershell
# Stop dev server first
if (Get-Process node -ErrorAction SilentlyContinue) { Stop-Process -Name node -Force -ErrorAction SilentlyContinue }

# Remove Next and tool caches
if (Test-Path .next) { Remove-Item .next -Recurse -Force }
if (Test-Path node_modules\.cache) { Remove-Item node_modules\.cache -Recurse -Force }
if (Test-Path playwright\.cache) { Remove-Item playwright\.cache -Recurse -Force }

# Reinstall deps from lockfile
npm ci

# Start fresh dev
npm run dev
```

**Notes:**

- Prefer `npm ci` over `npm install` for reproducible installs.

---

## 2) Monorepo alias sanity

- `apps/web/tsconfig.json` should map packages correctly (adjust depth as needed):

```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["src/*"],
      "@customvenom/lib/*": ["../../packages/lib/*"],
      "@customvenom/ui/*": ["../../packages/ui/*"],
    }
  }
}
```

- `apps/web/next.config.(js|mjs)` should transpile local packages:

```jsx
export default {
  transpilePackages: ['@customvenom/lib', '@customvenom/ui'],
  // experimental: { outputFileTracingRoot: __dirname } // optional if root confusion warnings appear
};
```

---

## 3) Env & flags hygiene

- `.env.local` minimal set for live:

```
NEXT_PUBLIC_API_BASE=https://api.customvenom.com
FEATURE_NBA=false
PAYWALL=false
```

- During mock UI testing, leave `NEXT_PUBLIC_API_BASE` empty (or `MOCK=1`) so `/api/projections` returns fixtures.

---

## 4) Route and stub discipline

- Keep only the intended API route files:
  - `apps/web/src/app/api/projections/route.ts` (hardened, trust headers + mock fallback)

  - `apps/web/src/app/api/lineup-optimizer/route.ts` (stub ok)

  - `apps/web/src/app/api/league/transactions/route.ts` (stub ok)

- Delete or rename any legacy/duplicate routes so they don't shadow the new ones.

---

## 5) Browser/client state

- Hard refresh and clear local storage if keys change:

```jsx
localStorage.removeItem('theme');
localStorage.removeItem('density');
```

- If any service worker was used in past experiments, unregister it:

```jsx
navigator.serviceWorker?.getRegistrations?.().then((rs) => rs.forEach((r) => r.unregister()));
```

- Clear Yahoo cookie during auth debugging only.

---

## 6) Tests — quick sequence before smoke

```powershell
# Unit
npm run test:unit

# Start dev in another terminal
npm run dev

# Integration then E2E
npm run test:integration
npm run test:e2e

# Full
npm run test:all
```

**Expected:**

- `/api/health` and `/api/projections` return 200 with trust headers (mock or live)

- Deep links open Drawer and prefill Start/Sit

- Sticky bars do not overlap table last row at 375x667

---

## 7) CI & pre‑commit (optional but recommended)

- Pre‑commit hooks: lint + typecheck + unit tests

- CI job: run `npm ci`, build, unit, integration (against mocks), and E2E minimal suite

- Add a budget check for `/players` JS bundle if desired (threshold ~250KB gzipped)

---

## 8) Workers & KV hygiene (when API is back)

- Verify Workers secrets/vars:

```bash
wrangler secret list
wrangler vars get NEXT_PUBLIC_SCHEMA_VERSION
```

- KV guardrails: ensure rate‑limit fallbacks return mock/stale data with trust headers (never 500).

---

## 9) Safe cleanup of unknown/ignored files (use with care)

```bash
# Show what would be removed (dry‑run)
git clean -fdX -n
# Then, if safe:
# git clean -fdX
```

---

## 10) Final pre‑smoke checklist

- One active lockfile in repo root only

- No duplicate API route files

- `next.config` `transpilePackages` and `tsconfig` paths are correct

- `.env.local` matches the intended mode (mock vs live)

- Dev server console shows Ready, no alias/root warnings

- Visiting `/api/projections` returns 200 and trust headers

---

## Rollback note

If an edit introduces errors, revert to the last green commit, re‑run Section 1 (Local clean), and re‑apply changes incrementally.
