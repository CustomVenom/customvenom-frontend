# 🏥 **CI Health Gate - Fast Fail Step**

## **GitHub Actions Workflow Addition**

Add this step to your `frontend:e2e` workflow **before** running tests:

```yaml
- name: Health precheck
  run: |
    set -euo pipefail
    curl -fsS "$NEXT_PUBLIC_API_BASE/health" | jq -e '.ok and .ready and .schema_version and .last_refresh and .r2_key' >/dev/null
    curl -fsSI "$NEXT_PUBLIC_API_BASE/health" | grep -qi '^cache-control: .*no-store'
```

## **PowerShell Version (Windows)**

```yaml
- name: Health precheck
  run: |
    $response = Invoke-WebRequest -Uri "$env:NEXT_PUBLIC_API_BASE/health" -UseBasicParsing
    $json = $response.Content | ConvertFrom-Json
    if (-not ($json.ok -and $json.ready -and $json.schema_version -and $json.last_refresh -and $json.r2_key)) {
      throw "Health check failed: API not ready"
    }
    if (-not ($response.Headers.'Cache-Control' -match 'no-store')) {
      throw "Health check failed: Missing no-store cache control"
    }
```

## **What This Validates**

1. **API is responding** - `curl` succeeds
2. **API is healthy** - `ok: true` and `ready: true`
3. **Data is available** - `schema_version`, `last_refresh`, `r2_key` present
4. **Cache headers correct** - `Cache-Control: no-store` present

## **Benefits**

- **Fast failure** - Fails in ~2 seconds instead of waiting for full test suite
- **Clear error messages** - Shows exactly what's wrong with the API
- **Prevents flaky tests** - Ensures API is ready before running E2E tests
- **Cost savings** - Avoids running expensive tests when API is down

## **Integration**

Add this step **immediately after** setting up the environment and **before** running Playwright tests:

```yaml
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install

      # Health check - FAST FAIL
      - name: Health precheck
        run: |
          set -euo pipefail
          curl -fsS "$NEXT_PUBLIC_API_BASE/health" | jq -e '.ok and .ready and .schema_version and .last_refresh and .r2_key' >/dev/null
          curl -fsSI "$NEXT_PUBLIC_API_BASE/health" | grep -qi '^cache-control: .*no-store'

      # Only run tests if health check passes
      - run: npm run dev &
      - run: npx playwright test
```

---

**✅ This ensures your CI fails fast when the API is down, saving time and resources.**
