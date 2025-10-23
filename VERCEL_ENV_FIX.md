# Vercel Environment Variables Fix - URGENT

## Steps to Complete the Fix

### 1. Update Vercel Environment Variables (Production)
1. Go to: https://vercel.com/incarcers-projects/customvenom-frontend/settings/environment-variables
2. Select **Production** environment
3. Add/Update these variables:
   ```
   API_BASE = https://customvenom-workers-api.jdewett81.workers.dev
   NEXT_PUBLIC_API_BASE = https://customvenom-workers-api.jdewett81.workers.dev
   ```

### 2. Redeploy with Clear Build Cache
1. Go to Deployments tab
2. Click "Redeploy" on latest deployment
3. Check "Clear build cache" option
4. Click "Redeploy"

### 3. Optional (Preview Environment)
- Set the same two variables under Preview environment
- Or point to staging Workers URL if preferred

## Verification Commands

After redeploy, run these to verify:

```bash
# Health through frontend proxy
curl -sSD - "https://customvenom.com/api/health" -o /dev/null | grep -Ei '^(cache-control|x-request-id|access-control-allow-origin)'

# Projections through frontend proxy  
curl -sS "https://customvenom.com/api/projections?week=2025-06" | jq -e '(.schema_version|length>0) and (.last_refresh|length>0)'

# Yahoo flow unchanged
curl -i "https://customvenom.com/api/yahoo/connect" | grep -i ^Location
```

## Expected Results
- ✅ /api/health → 200 with required headers and fields
- ✅ /api/projections?week=… → 200 with schema_version and last_refresh  
- ✅ Yahoo connect still 302 → Yahoo

## If Still Failing
If projections is still 404 after redeploy, run:
```bash
curl -i "https://customvenom.com/api/projections?week=2025-06"
```
And paste the first 10 lines for the one-line fix.
