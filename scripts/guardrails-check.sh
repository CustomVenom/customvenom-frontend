#!/usr/bin/env bash

set -euo pipefail

# forbid provider UI in Settings directory
# allow provider UI only on /tools via ConnectLeague

patterns=(
  "Connect Yahoo"
  "YahooStatusBadge"
  "League Integration"
  "Choose Your Team"
  "Refresh league"
)

for p in "${patterns[@]}"; do
  if grep -R --line-number --fixed-strings "$p" src/app/settings/ --exclude="*.test.*" --exclude="*.spec.*"; then
    echo "Guardrail violation: $p found in Settings directory"
    exit 1
  fi
done

echo "✅ All guardrails passed - Settings directory is clean"