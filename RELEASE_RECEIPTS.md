# Release Receipts Template

## Health Headers (no-store + x-request-id)
```bash
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/health" -o /dev/null | grep -Ei '^(cache-control: no-store|x-request-id:)'
```

Expected:
```
Cache-Control: no-store
x-request-id: [uuid]
```

## Projections 200 Body (schema_version + last_refresh)
```bash
curl -s "https://customvenom-workers-api.jdewett81.workers.dev/projections?week=2025-06" | jq '.schema_version and .last_refresh'
```

Expected:
```json
{
  "schema_version": "v1",
  "last_refresh": "2025-10-25T12:04:02.257Z",
  "projections": [...]
}
```

## Drift FAIL Body (schema_mismatch + request_id + diff_keys)
```bash
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/projections?simulate_drift=1" -o /tmp/drift.json
jq -e '.ok==false and .error=="schema_mismatch" and .request_id and (.diff_keys|index("schema_version"))' /tmp/drift.json
```

Expected:
```json
{
  "ok": false,
  "error": "schema_mismatch",
  "request_id": "[uuid]",
  "diff_keys": ["schema_version"]
}
```

## Trust Snapshot Screenshot
- Capture screenshot of Trust Snapshot v2 widget on production
- Include in release notes as visual proof of functionality

## HTTPS Verification
```bash
# HTTP redirect to HTTPS
curl -sSD - "http://customvenom-workers-api.jdewett81.workers.dev/health" | head -1
# Expected: HTTP/1.1 301 Moved Permanently

# HSTS header present
curl -sSD - "https://customvenom-workers-api.jdewett81.workers.dev/health" | grep -i strict-transport-security
# Expected: Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
```

## Settings Page Verification
```bash
# Settings page renders without crash
curl -s "https://www.customvenom.com/settings" | grep -q "Settings"
# Expected: Page contains "Settings" text
```
