#!/usr/bin/env bash
set -euo pipefail

BASE_URL="https://www.customvenom.com"

mkdir -p /tmp/cv_sweep

curl -fsS "$BASE_URL/" -H 'accept:text/html' -o /tmp/cv_sweep/root.html
curl -fsS "$BASE_URL/tools" -H 'accept:text/html' -o /tmp/cv_sweep/tools.html
curl -fsS "$BASE_URL/settings" -H 'accept:text/html' -o /tmp/cv_sweep/settings.html || true

FORBIDDEN=("Connect Yahoo" "YahooStatusBadge" "League Integration" "Choose Your Team" "Refresh league" "Yahoo Fantasy")

for f in "${FORBIDDEN[@]}"; do
  if grep -R --line-number --fixed-strings "$f" /tmp/cv_sweep/root.html /tmp/cv_sweep/settings.html; then
    echo "FORBIDDEN found: $f"
    exit 1
  fi
done

echo "PASS: no forbidden provider text on / or /settings"
