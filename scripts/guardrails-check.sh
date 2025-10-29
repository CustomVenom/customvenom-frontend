#!/usr/bin/env bash

set -euo pipefail

# forbid provider UI in Settings directory
# allow provider UI only on /tools via ConnectLeague

patterns=(
  "/api/yahoo/"
  "/api/leagues"
  "/app/me"
  "Connect Yahoo"
  "YahooStatusBadge"
  "League Integration"
  "Choose Your Team"
  "Refresh league"
  "Yahoo Fantasy"
  "settings.route.enter"
)

for p in "${patterns[@]}"; do
  if grep -R --line-number --fixed-strings "$p" src/app/settings; then
    echo "Guardrail violation in settings: $p"
    exit 1
  fi
done

echo "✅ All guardrails passed - Settings directory is clean"