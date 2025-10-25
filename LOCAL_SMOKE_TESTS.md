# Local Smoke Tests — Copy-Ready Commands

**Purpose:** Quick validation of local development setup
**Time:** 2-3 minutes
**Prerequisites:** Node 20.x, jq (optional but recommended)

---

## 📋 Setup Prerequisites

### **Install jq (JSON processor)**

**macOS:**

```bash
brew install jq
```

**Ubuntu/Debian:**

```bash
sudo apt-get install -y jq
```

**Windows (choose one):**

```powershell
# Chocolatey
choco install jq

# Winget
winget install jqlang.jq

# Or use PowerShell native (slower but works without jq)
```

### **Verify Services Running**

**Workers API (Backend):**

- Default: `http://localhost:8787`
- Check with: `curl http://localhost:8787/health`

**Next.js Frontend:**

- Default: `http://localhost:3000`
- Start with: `npm run dev`

**Note:** Adjust ports if your setup differs

---

## 🐧 Bash / macOS / Linux

### **Start Dev Server (Terminal A)**

```bash
cd customvenom-frontend
npm run dev
```

### **Run Smoke Tests (Terminal B)**

#### **1. Health Check (Workers API)**

```bash
curl -s http://localhost:8787/health | jq '{ok, schema_version, last_refresh}'
```

**Expected:**

```json
{
  "ok": true,
  "schema_version": "v1.0.0",
  "last_refresh": "2025-10-20T..."
}
```

#### **2. Projections Endpoint**

```bash
curl -s "http://localhost:8787/projections?week=2025-06" \
  | jq '{schema_version, last_refresh, projection_count: (.projections | length)}'
```

**Expected:**

```json
{
  "schema_version": "v1.0.0",
  "last_refresh": "2025-10-20T...",
  "projection_count": 150
}
```

**Note:** If your API returns data at top level (not `.data`), remove `.data` from jq pipe

#### **3. NextAuth Session**

```bash
curl -s http://localhost:3000/api/auth/session | jq
```

**Expected (not logged in):**

```json
{
  "user": null
}
```

**Expected (logged in):**

```json
{
  "user": {
    "id": "...",
    "name": "...",
    "email": "..."
  }
}
```

#### **4. Homepage Check**

```bash
curl -sI http://localhost:3000 | grep -i '^HTTP/'
```

**Expected:**

```
HTTP/1.1 200 OK
```

#### **5-7. Static Checks**

```bash
# Build check
npm run build

# Type check
npm run type-check

# Lint check
npm run lint
```

**Expected:** All complete with exit code 0

### **One-Liner Pass/Fail**

```bash
npm run build && npm run type-check && npm run lint && echo "✅ All local smokes PASS"
```

---

## 🪟 PowerShell / Windows

### **Start Dev Server (Window A)**

```powershell
cd customvenom-frontend
npm run dev
```

### **Run Smoke Tests (Window B)**

#### **1. Health Check (Workers API)**

```powershell
(Invoke-WebRequest http://localhost:8787/health -UseBasicParsing).Content |
  ConvertFrom-Json |
  Select-Object ok, schema_version, last_refresh |
  ConvertTo-Json
```

**Expected:**

```json
{
  "ok": true,
  "schema_version": "v1.0.0",
  "last_refresh": "2025-10-20T..."
}
```

#### **2. Projections Endpoint**

```powershell
$proj = (Invoke-WebRequest "http://localhost:8787/projections?week=2025-06" -UseBasicParsing).Content | ConvertFrom-Json
$projection_count = $proj.projections.Count
[pscustomobject]@{
  schema_version = $proj.schema_version
  last_refresh   = $proj.last_refresh
  projection_count = $projection_count
} | ConvertTo-Json
```

**Expected:**

```json
{
  "schema_version": "v1.0.0",
  "last_refresh": "2025-10-20T...",
  "projection_count": 150
}
```

#### **3. NextAuth Session**

```powershell
(Invoke-WebRequest http://localhost:3000/api/auth/session -UseBasicParsing).Content
```

**Expected (not logged in):**

```json
{ "user": null }
```

#### **4. Homepage Check**

```powershell
$iwr = Invoke-WebRequest http://localhost:3000 -UseBasicParsing -Method Head -ErrorAction SilentlyContinue
"$($iwr.StatusCode) $($iwr.StatusDescription)"
```

**Expected:**

```
200 OK
```

#### **5-7. Static Checks**

```powershell
# Build check
cmd /c "npm run build"
if ($LASTEXITCODE -ne 0) { Write-Error "Build failed"; exit $LASTEXITCODE }

# Type check
cmd /c "npm run type-check"
if ($LASTEXITCODE -ne 0) { Write-Error "Type check failed"; exit $LASTEXITCODE }

# Lint check
cmd /c "npm run lint"
if ($LASTEXITCODE -ne 0) { Write-Error "Lint failed"; exit $LASTEXITCODE }

"✅ All local smokes PASS"
```

### **One-Liner Pass/Fail (PowerShell)**

```powershell
cmd /c "npm run build" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
cmd /c "npm run type-check" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
cmd /c "npm run lint" ; if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
"✅ All local smokes PASS"
```

---

## 🔧 Troubleshooting

### **"Connection refused" or "Failed to connect"**

**Cause:** Service not running or wrong port
**Fix:**

```bash
# Check if Workers API is running
lsof -i :8787  # macOS/Linux
netstat -ano | findstr :8787  # Windows

# Start Workers API
cd customvenom-workers-api
npm run dev

# Check if Next.js is running
lsof -i :3000  # macOS/Linux
netstat -ano | findstr :3000  # Windows

# Start Next.js
cd customvenom-frontend
npm run dev
```

### **"jq: command not found" (Linux/macOS)**

**Fix:** Install jq (see Prerequisites above)
**Workaround:** Use PowerShell-style JSON parsing with `| python3 -m json.tool`

### **"npm run build" fails**

**Cause:** TypeScript errors, missing deps, or env vars
**Fix:**

1. Run `npm run type-check` to see TypeScript errors
2. Run `npm run lint` to see linter errors
3. Check `.env.local` has required vars (see `env.template.txt`)
4. Run `npm install` to ensure deps are up to date

### **"Prisma Client not generated"**

**Cause:** Missing DATABASE_URL or prisma generate didn't run
**Fix:**

```bash
# Set DATABASE_URL in .env.local
echo "DATABASE_URL=postgresql://..." >> .env.local

# Generate Prisma client
npx prisma generate
```

### **"Module not found" errors**

**Cause:** Missing dependencies or stale node_modules
**Fix:**

```bash
rm -rf node_modules package-lock.json
npm install
```

---

## ✅ Success Criteria

**All tests pass when:**

- Health returns `ok: true`
- Projections returns schema_version + projections array
- Session returns valid JSON (null user or user object)
- Homepage returns `200 OK`
- Build completes without errors
- Type-check shows 0 errors
- Lint shows 0 warnings/errors

**Time to run:** 2-3 minutes total

---

## 🔗 Related Documentation

**Trust-First Smokes (Workers API):**

- `customvenom-workers-api/scripts/smoke-robust.sh`
- `customvenom-workers-api/docs/JQ_ROBUST_PATTERNS.md`

**Build Guides:**

- `VERCEL_SETTINGS_CHECKLIST.md` — Vercel configuration
- `env.template.txt` — Required environment variables
- `README.md` — Full setup guide

**Notion References:**

- [CustomVenom Build Manual](https://www.notion.so/CustomVenom-Build-Manual-v1-d5825d6035204be3afc9782e9d697cad)
- [My Custom Venom AI Agent](https://www.notion.so/My-Custom-Venom-AI-Agent-2859f930952d8047bfeccbe61199d600)

---

## 📊 Quick Reference Card

| Test        | Endpoint                        | Expected                        |
| ----------- | ------------------------------- | ------------------------------- |
| Health      | `GET /health`                   | `{"ok": true, ...}`             |
| Projections | `GET /projections?week=2025-06` | `{"projections": [...], ...}`   |
| Session     | `GET /api/auth/session`         | `{"user": null}` or user object |
| Homepage    | `GET /`                         | `200 OK`                        |
| Build       | `npm run build`                 | Exit 0                          |
| Type-check  | `npm run type-check`            | Exit 0                          |
| Lint        | `npm run lint`                  | Exit 0                          |

---

**Last Updated:** 2025-10-20
**Tested On:** macOS, Linux (Ubuntu), Windows 11
**Node Version:** 20.x
**Next.js Version:** 15.5.4
