# Vercel Emergency Runbook — Stuck Builds & Hotfixes

**Purpose:** Cancel stuck deployments, bypass build failures, emergency deploys
**Time:** 2-5 minutes
**Use when:** Vercel build stuck, outage, or urgent hotfix needed

---

## 🚨 Emergency: Cancel Stuck Deployment

### **Via Vercel API (Most Reliable)**

**Get deployment ID:**
```bash
# From URL: https://vercel.com/.../deployments/dpl_ABC123
# Deployment ID = dpl_ABC123

# Or via CLI
npx vercel ls
```

**Cancel deployment:**
```bash
# Set your Vercel token (get from: https://vercel.com/account/tokens)
export VERCEL_TOKEN="your_token_here"

# Cancel the deployment
curl -X POST \
  "https://api.vercel.com/v13/deployments/DEPLOYMENT_ID/cancel" \
  -H "Authorization: Bearer $VERCEL_TOKEN"
```

**PowerShell:**
```powershell
$VERCEL_TOKEN = "your_token_here"
$DEPLOYMENT_ID = "dpl_ABC123"

Invoke-RestMethod -Method POST `
  -Uri "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/cancel" `
  -Headers @{ "Authorization" = "Bearer $VERCEL_TOKEN" }
```

**Expected Response:**
```json
{
  "state": "CANCELED",
  "id": "dpl_ABC123"
}
```

---

### **Via Vercel CLI (If Supported)**

```bash
# List deployments
npx vercel ls

# Inspect deployment details
npx vercel inspect <deployment-url>

# Cancel (if your CLI version supports it)
npx vercel cancel DEPLOYMENT_ID
```

---

## 🛑 Pause Auto-Deploys (Stop New Builds)

### **Method 1: Disable Auto-Deploy in Settings**

**Temporary disable (safest):**
1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/git
2. Uncheck ✅ **"Automatically expose Preview Deployments"**
3. Uncheck ✅ **"Automatically expose Production Deployments"**
4. Click "Save"

**Result:** New commits won't trigger builds until you re-enable

---

### **Method 2: Remove Git Integration (Nuclear Option)**

**Only if you need to fully stop:**
1. Settings → Git
2. Click "Disconnect" on GitHub integration
3. Confirm

**Warning:** You'll need to reconnect later to resume auto-deploys

---

## 🚀 Emergency Deploy (Bypass Cloud Builder)

### **Prebuilt Deploy — Use Local .next Folder**

**When to use:**
- Vercel cloud builder is failing/stuck
- Urgent hotfix needed immediately
- Build works locally but fails on Vercel
- Vercel experiencing outage

**Steps:**

#### **1. Build Locally**
```bash
# Ensure clean environment
nvm use 20
rm -rf .next node_modules
npm ci

# Build
npm run build

# Verify .next folder exists
ls -la .next
```

#### **2. Deploy Prebuilt (Preview)**
```bash
# Deploy to preview
npx vercel deploy --prebuilt

# Will output preview URL
```

#### **3. Deploy Prebuilt (Production)**
```bash
# Deploy to production
npx vercel deploy --prebuilt --prod

# Requires confirmation
```

**PowerShell:**
```powershell
# Build
npm run build

# Deploy preview
npx vercel deploy --prebuilt

# Deploy production
npx vercel deploy --prebuilt --prod
```

**Pros:**
- ✅ Bypasses cloud builder completely
- ✅ Uses your local build (full control)
- ✅ Works during Vercel outages
- ✅ Fast (no remote build time)

**Cons:**
- ⚠️ Requires local environment matches production
- ⚠️ Must have all env vars in .env.local
- ⚠️ No automatic deployments from Git

---

## 🔧 Clear Build Cache & Retry

### **When Previous Deploy Failed**

**Via Vercel UI:**
1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
2. Click the failed deployment
3. Click **"..."** menu (top right)
4. Select **"Redeploy"**
5. Check ✅ **"Clear build cache and redeploy"**
6. Click "Redeploy"

**When to use:**
- "Module not found" errors after dependency changes
- Mysterious build failures that work locally
- After Node version changes
- First retry after any config change

---

## 📊 Vercel CLI Commands

### **List Deployments**
```bash
# Show recent deployments
npx vercel ls

# Show with details
npx vercel ls --verbose
```

### **Inspect Deployment**
```bash
# Get deployment details
npx vercel inspect <deployment-url>

# Get deployment ID
npx vercel inspect <deployment-url> | grep "id:"
```

### **View Logs**
```bash
# Stream deployment logs
npx vercel logs <deployment-url>

# Get build logs
npx vercel logs <deployment-url> --follow
```

### **Promote Deployment to Production**
```bash
# Promote a preview to production
npx vercel promote <deployment-url>
```

---

## 🛡️ Safe Rollout After Incident

### **1. Verify Local Build**
```bash
# Clean build
rm -rf .next node_modules
npm ci
npm run build

# Verify success
echo "Exit code: $?"
```

### **2. Disable Auto-Deploys**
- Pause Git integration (see above)

### **3. Deploy Manually First**
```bash
# Deploy to preview first
npx vercel deploy --prebuilt

# Test preview URL
curl -sI <preview-url> | grep HTTP

# If good, deploy to production
npx vercel deploy --prebuilt --prod
```

### **4. Re-Enable Auto-Deploys**
- Settings → Git → Re-enable auto-deploy checkboxes

### **5. Merge Safe PRs First**
**Safe order (low to high risk):**
1. Documentation changes
2. CI/workflow changes
3. Infrastructure (headers, middleware)
4. Small feature additions
5. Large refactors

**Gate with smoke tests** before each merge

---

## 🚨 Common Failures & API Cancel Commands

### **Build Timeout (>45 minutes)**
```bash
# Cancel via API
curl -X POST \
  "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/cancel" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Clear cache and retry
# (via UI: Redeploy → Clear cache)
```

### **OOM (Out of Memory)**
```bash
# Cancel stuck build
curl -X POST \
  "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/cancel" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Optimize build:
# 1. Remove large dependencies
# 2. Split large bundles
# 3. Use dynamic imports
# 4. Or use prebuilt deploy
```

### **Stuck "Building..." (No Progress)**
```bash
# Cancel and disable auto-deploy
curl -X POST \
  "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/cancel" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# Then disable Git auto-deploy in settings
```

---

## 🔐 Vercel Token Setup

### **Create Token**
1. Go to: https://vercel.com/account/tokens
2. Click "Create Token"
3. Name: `Emergency Deploys`
4. Scope: Full access (or limit to specific projects)
5. Expiration: 30 days
6. Copy token

### **Store Token Securely**

**Bash:**
```bash
# Add to ~/.bashrc or ~/.zshrc
export VERCEL_TOKEN="your_token_here"
```

**PowerShell:**
```powershell
# Add to $PROFILE
$env:VERCEL_TOKEN = "your_token_here"

# Or for persistent (requires admin):
[System.Environment]::SetEnvironmentVariable('VERCEL_TOKEN', 'your_token_here', 'User')
```

**Or store in password manager** and paste when needed

---

## 📋 Emergency Checklist (Copy-Ready)

**When deployment is stuck:**

```bash
# 1. Get deployment ID
DEPLOYMENT_ID="dpl_ABC123"  # From URL or npx vercel ls

# 2. Cancel via API
curl -X POST \
  "https://api.vercel.com/v13/deployments/$DEPLOYMENT_ID/cancel" \
  -H "Authorization: Bearer $VERCEL_TOKEN"

# 3. Disable auto-deploy
# Settings → Git → Uncheck auto-deploy boxes

# 4. Build locally
rm -rf .next node_modules
npm ci
npm run build

# 5. Deploy prebuilt
npx vercel deploy --prebuilt

# 6. Test preview URL
curl -sI <preview-url> | grep HTTP

# 7. If good, deploy to prod
npx vercel deploy --prebuilt --prod

# 8. Re-enable auto-deploy
# Settings → Git → Re-check auto-deploy boxes
```

---

## 🔗 Quick Links

**Vercel Dashboard:**
- Project: https://vercel.com/incarcers-projects/customvenom-frontend
- Settings: https://vercel.com/incarcers-projects/customvenom-frontend/settings
- Git Settings: https://vercel.com/incarcers-projects/customvenom-frontend/settings/git
- Deployments: https://vercel.com/incarcers-projects/customvenom-frontend/deployments
- Create Token: https://vercel.com/account/tokens

**Vercel API Docs:**
- Cancel Deployment: https://vercel.com/docs/rest-api/endpoints/deployments#cancel-a-deployment
- List Deployments: https://vercel.com/docs/rest-api/endpoints/deployments#list-deployments
- Get Deployment: https://vercel.com/docs/rest-api/endpoints/deployments#get-a-deployment

**Related Docs:**
- `LOCAL_SMOKE_TESTS.md` — Local validation commands
- `VERCEL_SETTINGS_CHECKLIST.md` — Required settings
- `VERCEL_DEBUG_FIXES.md` — Common issues

---

## 💡 Prevention Tips

**To avoid stuck builds:**
- ✅ Test `npm run build` locally first
- ✅ Use branch protection to require CI before merge
- ✅ Keep builds small (< 5 minutes target)
- ✅ Monitor deployment times for regression
- ✅ Set deployment timeout alerts (if available)

**To avoid build failures:**
- ✅ Pin Node version in package.json
- ✅ Add defaults for all env vars in code
- ✅ Make Prisma postinstall non-fatal (already done)
- ✅ Run type-check before committing
- ✅ Use smoke tests to catch issues early

---

**Last Updated:** 2025-10-20
**Tested:** Vercel API v13
**Status:** Ready for emergency use

