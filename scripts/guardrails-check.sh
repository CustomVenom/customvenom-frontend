#!/usr/bin/env bash

set -euo pipefail

# forbid provider UI/legacy routes in client code
# exclude server-side API routes and test files

patterns=(
  "Connect Yahoo"
  "YahooStatusBadge"
  "League Integration"
  "Choose Your Team"
)

for p in "${patterns[@]}"; do
  if grep -R --line-number --fixed-strings "$p" src --exclude-dir=api --exclude="*.test.*" --exclude="*.spec.*"; then
    echo "Guardrail violation: $p"
    exit 1
  fi
done

echo "✅ All guardrails passed"