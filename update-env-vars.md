# Vercel Environment Variables Update

## Manual Steps to Fix API Configuration

### 1. Go to Vercel Dashboard
- Navigate to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables
- Select **Production** environment

### 2. Add/Update Environment Variables
Add these two variables:

```
API_BASE = https://customvenom-workers-api.jdewett81.workers.dev
NEXT_PUBLIC_API_BASE = https://customvenom-workers-api.jdewett81.workers.dev
```

### 3. Redeploy with Clear Build Cache
- Go to Deployments tab
- Click "Redeploy" on the latest deployment
- Check "Clear build cache" option
- Click "Redeploy"

### 4. Verify After Deployment
Run these commands to verify:

```bash
# Test proxy health headers
curl -sS "https://customvenom.com/api/health" -I | grep -Ei '^(x-request-id|access-control-allow-origin|cache-control)'

# Test proxy projections contract
curl -sS "https://customvenom.com/api/projections?week=2025-06" | jq -e '(.schema_version|length>0) and (.last_refresh|length>0)'

# Test Yahoo flow unchanged
curl -i "https://customvenom.com/api/yahoo/connect" | grep -i ^Location
```

### Expected Results:
- ✅ Frontend proxies return 200 with required headers and fields
- ✅ No more 400/404 from /api/projections  
- ✅ Yahoo connect still 302 → Yahoo, callback sets y_at cookie
