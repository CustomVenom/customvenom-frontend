# For Contributors - CustomVenom Development Workflow

## 🚀 **Quick Start**

### **One-time Setup**

1. **Connect repo to Vercel**: Dashboard → Import Project → GitHub repo
2. **Set Production branch**: `main`
3. **Add environment variables** in Vercel dashboard:
   - `NEXT_PUBLIC_API_BASE` = `https://customvenom-workers-api.jdewett81.workers.dev`
   - `NEXT_PUBLIC_ENABLE_YAHOO` = `true` (when ready)

### **Daily Development**

```bash
# 1. Create feature branch
git checkout -b feat/your-feature-name
# or
git checkout -b fix/your-bug-fix
# or
git checkout -b docs/your-documentation

# 2. Make changes and commit
git add .
git commit -m "feat: your descriptive message"

# 3. Push and create PR
git push origin feat/your-feature-name
# Create PR on GitHub

# 4. Review Vercel Preview
# - Vercel automatically builds Preview on PR open
# - Open Preview URL from Vercel comment
# - Run receipts if applicable (see below)

# 5. Merge to main
# - Vercel auto-deploys to production
# - Paste receipts in Release entry
```

## 📊 **Receipts Pattern (Copy-Ready)**

### **Standard Receipts (Always Run)**

```bash
# Health headers (no-store + x-request-id)
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/health" -o /dev/null | grep -Ei '^(cache-control: no-store|x-request-id:)'

# Projections 200 body (schema_version + last_refresh)
curl -s "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06" | jq '.schema_version and .last_refresh'

# Schema sentry (request_id + status)
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06" | grep -i '^x-request-id:'
```

### **OAuth Receipts (If OAuth work in PR)**

1. **Screenshot**: `/settings` showing "Yahoo Connected" with roster
2. **OAuth flow**: Connect → Consent → Return to `/settings`
3. **Session validation**: `/api/yahoo/me` returns 200

### **Release Entry Template**

```markdown
### Release Receipts - [Date]

**Health Headers (no-store + x-request-id)**
```

Cache-Control: no-store
x-request-id: [uuid]

````

**Projections 200 Body (schema_version + last_refresh)**
```json
{
  "schema_version": "v1",
  "last_refresh": "[timestamp]",
  "projections": [count]
}
````

**Schema Sentry (request_id + status)**

```
Status: 200
x-request-id: [uuid]
```

**OAuth Screenshot** (if applicable)

- Screenshot of `/settings` showing "Yahoo Connected" with roster

````

## 🛡️ **Guardrails (Never-Again Rules)**

### **Security Requirements**
- ❌ **Never commit .env files** to repository
- ❌ **Never use HTTP URLs** for OAuth or API calls
- ✅ **Always use HTTPS** for all external URLs
- ✅ **Always validate same-host** for OAuth callbacks

### **Next.js App Router Requirements**
- ❌ **Never use `next/dynamic({ ssr: false })`** in Server Components
- ❌ **Never access `process.env`** in client components
- ✅ **Always use client wrapper** for dynamic imports
- ✅ **Always add error.tsx/loading.tsx** for RSC routes

### **Production Requirements**
- ✅ **Always run receipts** for API/UI trust paths
- ✅ **Always test Vercel Preview** before merging
- ✅ **Always check for RSC digest errors**
- ✅ **Always monitor post-deploy** for 60 minutes

## 🔍 **Fast Acceptance Checklist**

### **Before Every PR**
- [ ] Vercel Preview builds green
- [ ] No RSC digest errors in Preview
- [ ] All URLs are HTTPS
- [ ] No .env files in changes
- [ ] Client components use 'use client'
- [ ] Server components don't access process.env

### **Before Every Merge**
- [ ] Receipts attached for API/UI trust paths
- [ ] OAuth flow tested end-to-end (if applicable)
- [ ] Schema sentry working
- [ ] HTTPS enforcement active

### **After Every Deploy**
- [ ] Monitor 5xx rate for 60 minutes
- [ ] Check for schema drift
- [ ] Verify OAuth sessions work (if applicable)
- [ ] Confirm HTTPS redirects working

## 🚨 **Emergency Rollback**

### **If Production Issues**
1. **Immediate**: Comment out problematic code
2. **Deploy**: `git commit && git push`
3. **Verify**: Check Vercel deployment status
4. **Monitor**: Watch error rates drop

### **If Schema Drift**
1. **Check**: `diff_keys` in error responses
2. **Trace**: Use `request_id` to find source
3. **Fix**: Update schema or API response
4. **Deploy**: Test with receipts

## 📚 **Reference Documentation**

- **Production Workflow**: `PRODUCTION_WORKFLOW.md`
- **Cursor Guardrails**: `CURSOR_GUARDRAILS.md`
- **Release Receipts**: `RELEASE_RECEIPTS.md`
- **OAuth Security**: `OAUTH_SECURITY.md`
- **HTTPS Front Door**: `HTTPS_FRONT_DOOR.md`

## 🎯 **Quick Commands**

```bash
# Create feature branch
git checkout -b feat/your-feature

# Run receipts (PowerShell)
$response = Invoke-WebRequest -Uri "https://customvenom-workers-api.jdewett81.workers.dev/health" -Method GET -UseBasicParsing; Write-Host "Cache-Control: $($response.Headers['cache-control'])"; Write-Host "x-request-id: $($response.Headers['x-request-id'])"

# Deploy to production
git push origin main
# Vercel auto-deploys from main
````
