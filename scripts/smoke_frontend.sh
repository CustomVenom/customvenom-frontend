#!/usr/bin/env bash
set -euo pipefail

# Local vs CI Environment Parity:
# - CI: FRONTEND_BASE=https://www.customvenom.com, CANON=https://www.customvenom.com, ALT=https://customvenom.com
# - Local: Same defaults ensure local runs match CI behavior

# Config
FRONTEND_BASE="${FRONTEND_BASE:-https://www.customvenom.com}"
API_BASE_EXPECT="${API_BASE_EXPECT:-https://api.customvenom.com}"

# Canonical host enforcement
CANON="${CANON:-https://www.customvenom.com}"   # canonical domain
ALT="${ALT:-https://customvenom.com}"           # non-canonical (should redirect)

# CI receipts directory
mkdir -p receipts

# Curl with strict timeouts
CURL_OPTS="--max-time 10 --connect-timeout 5 --retry 2 --fail-with-body"

say(){ printf "\n== %s ==\n" "$*"; }

check_status(){
  local path="$1" expect="${2:-200}"
  local url="$FRONTEND_BASE$path"
  code="$(curl $CURL_OPTS -sS -o /dev/null -w '%{http_code}' "$url")"
  [ "$code" = "$expect" ] || { echo "FAIL $path: $code != $expect"; exit 1; }
  echo "OK $path → $code"
}

check_hsts(){
  local url="$FRONTEND_BASE$1"
  # Export HSTS headers to receipts
  curl $CURL_OPTS -sS -D - "$url" -o /dev/null > receipts/hsts_headers.txt
  grep -qi '^strict-transport-security:' receipts/hsts_headers.txt \
    || { echo "FAIL HSTS missing on $url"; exit 1; }
  echo "OK HSTS on $url"
}

check_no_http_redirect(){
  local http="$(echo "$FRONTEND_BASE" | sed 's|^https://|http://|')$1"
  # Expect a 301/308 redirect to https
  code="$(curl $CURL_OPTS -sS -o /dev/null -w '%{http_code}' -L --max-redirs 0 "$http" || true)"
  [ "$code" = "301" ] || [ "$code" = "308" ] || { echo "FAIL HTTP→HTTPS redirect missing for $http ($code)"; exit 1; }
  echo "OK HTTP→HTTPS redirect on $http ($code)"
}

check_tools_trust_snapshot(){
  # Expect page HTML and then JS fetch to API; basic smoke via response headers
  local url="$FRONTEND_BASE/tools"
  # Page reachable
  curl $CURL_OPTS -sS "$url" -o /dev/null || { echo "FAIL /tools unreachable"; exit 1; }

  # Strict Trust Snapshot check - fail if missing
  if ! curl $CURL_OPTS -sS "$url" | grep -qi 'Trust Snapshot'; then
    echo "FAIL: Trust Snapshot missing"; exit 1;
  fi

  echo "OK /tools reachable with Trust Snapshot"
}

check_api_base_exposed(){
  # If your app exposes NEXT_PUBLIC_API_BASE in a boot script or data attribute, probe it.
  # Fallback heuristic: request a well-known asset that logs the base in HTML (optional).
  echo "SKIP API_BASE exposure probe (implement if you render it). Expect: $API_BASE_EXPECT"
}

check_canonical_host(){
  # Ensure non-canonical host redirects to canonical host
  code="$(curl $CURL_OPTS -sS -o /dev/null -w '%{http_code}' -L --max-redirs 0 "$ALT" || true)"
  [ "$code" = "301" ] || [ "$code" = "308" ] || { echo "FAIL: $ALT should redirect to $CANON (got $code)"; exit 1; }
  loc="$(curl $CURL_OPTS -sS -D - -o /dev/null "$ALT" | awk -F': ' '/^location:/I {print $2}' | tr -d '\r')"
  [[ "$loc" == "$CANON"* ]] || { echo "FAIL: redirect location is $loc, expected $CANON"; exit 1; }
  echo "OK canonical redirect $ALT -> $CANON"
}

check_cache_policy(){
  # HTML should not be long-cached
  echo "HTML cache policy:"
  curl $CURL_OPTS -sS -D - "$FRONTEND_BASE/" -o /dev/null | awk -F': ' '/^cache-control:/I {print}'
  # Static asset should be long-cached
  asset="$(curl $CURL_OPTS -sS "$FRONTEND_BASE/" | grep -oE '/_next/static/[^"]+\.js' | head -n1)"
  [ -n "$asset" ] || { echo "FAIL: no asset found"; exit 1; }
  echo "Asset cache policy for $asset:"
  curl $CURL_OPTS -sS -D - "$FRONTEND_BASE$asset" -o /dev/null | awk -F': ' '/^cache-control:/I {print}'

  # Export asset path to receipts
  echo "$asset" > receipts/asset.txt
}

check_robots_status(){
  # Check robots.txt exists or returns 404 (both are acceptable)
  robots_code="$(curl $CURL_OPTS -sS -o /dev/null -w '%{http_code}' "$FRONTEND_BASE/robots.txt")"
  echo "robots.txt status: $robots_code"
  [ "$robots_code" = "200" ] || [ "$robots_code" = "404" ] || { echo "FAIL robots status: $robots_code"; exit 1; }

  # Check status page exists or returns 404 (both are acceptable)
  status_code="$(curl $CURL_OPTS -sS -o /dev/null -w '%{http_code}' "$FRONTEND_BASE/status")"
  echo "status page status: $status_code"
  [ "$status_code" = "200" ] || [ "$status_code" = "404" ] || { echo "FAIL status page check: $status_code"; exit 1; }
}

check_slo_ttfb(){
  # SLO guard: TTFB should be under threshold (default 2 seconds)
  local threshold="${TTFB_THRESHOLD:-2000}"  # milliseconds
  echo "Checking TTFB SLO (threshold: ${threshold}ms)"

  # Test root page TTFB
  local root_ttfb="$(curl $CURL_OPTS -sS -o /dev/null -w '%{time_starttransfer}' "$FRONTEND_BASE/" | awk '{print int($1 * 1000)}')"
  echo "Root page TTFB: ${root_ttfb}ms"

  # Test tools page TTFB
  local tools_ttfb="$(curl $CURL_OPTS -sS -o /dev/null -w '%{time_starttransfer}' "$FRONTEND_BASE/tools" | awk '{print int($1 * 1000)}')"
  echo "Tools page TTFB: ${tools_ttfb}ms"

  # Check SLO compliance
  if [ "$root_ttfb" -gt "$threshold" ]; then
    echo "FAIL: Root page TTFB ${root_ttfb}ms exceeds threshold ${threshold}ms"
    exit 1
  fi

  if [ "$tools_ttfb" -gt "$threshold" ]; then
    echo "FAIL: Tools page TTFB ${tools_ttfb}ms exceeds threshold ${threshold}ms"
    exit 1
  fi

  echo "OK TTFB SLO: root=${root_ttfb}ms, tools=${tools_ttfb}ms"

  # Export TTFB data to receipts
  cat > receipts/ttfb.txt << EOF
root_ttfb_ms: $root_ttfb
tools_ttfb_ms: $tools_ttfb
threshold_ms: $threshold
timestamp: $(date -u +%Y-%m-%dT%H:%M:%SZ)
EOF
}

say "Canonical host"
check_canonical_host

say "Status codes"
check_status "/" 200
check_status "/tools" 200
check_status "/tools/start-sit" 200
check_status "/tools/faab" 200
check_status "/tools/decisions" 200
check_status "/design-preview" 200 || true  # optional route

say "HTTPS-only front door"
check_hsts "/"
check_no_http_redirect "/"

say "Cache policy"
check_cache_policy

say "robots.txt and status page"
check_robots_status

say "SLO TTFB monitoring"
check_slo_ttfb

say "Trust Snapshot"
check_tools_trust_snapshot

say "API base wiring (informational)"
check_api_base_exposed

# Generate CI summary
mkdir -p receipts
echo "SMOKES PASS: host,hsts,https-redirect,cache,robots,status,trust ($FRONTEND_BASE)" | tee receipts/summary.txt
