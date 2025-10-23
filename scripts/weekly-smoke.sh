#!/usr/bin/env bash
set -euo pipefail

BASE="${BASE:-https://customvenom.com}"

echo "== /api/health headers =="
curl -sSD - "$BASE/api/health" -o /dev/null | grep -Ei '^(HTTP/|cache-control|x-request-id|access-control-allow-origin)' || true
echo

echo "== /api/projections?week=2025-06 headers =="
curl -sSD - "$BASE/api/projections?week=2025-06" -o /dev/null | grep -Ei '^(HTTP/|cache-control|x-request-id|access-control-allow-origin)' || true
echo

echo "== /api/projections body fields =="
curl -sS "$BASE/api/projections?week=2025-06" | jq -e '(.schema_version|length>0) and (.last_refresh|length>0)' && echo "OK"

echo
echo "== /api/yahoo/me test (should be 401 without y_at) =="
curl -sSD - "$BASE/api/yahoo/me" -o /dev/null | grep -Ei '^(HTTP/)' || true

echo
echo "== Weekly smoke test completed =="
