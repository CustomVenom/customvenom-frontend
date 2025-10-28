#!/bin/bash

# Guardrails Check Script
# Enforces single connect mode rules

set -e

echo "🔍 Running guardrails check..."

fail=0

# Check for forbidden patterns in client code
check_pattern() {
  local pattern="$1"
  local description="$2"
  local files=$(find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules)

  if echo "$files" | xargs grep -l "$pattern" >/dev/null 2>&1; then
    echo "❌ FAIL: $description found in client code"
    echo "$files" | xargs grep -n "$pattern" || true
    fail=1
  else
    echo "✅ PASS: No $description in client code"
  fi
}

# Check for allowed patterns only
check_allowed_patterns() {
  local files=$(find src -name "*.tsx" -o -name "*.ts" -o -name "*.js" -o -name "*.jsx" | grep -v node_modules)

  # Check that all API calls use /yahoo/* pattern
  if echo "$files" | xargs grep -l "fetch.*api" >/dev/null 2>&1; then
    local bad_calls=$(echo "$files" | xargs grep -n "fetch.*api" | grep -v "/yahoo/" || true)
    if [ -n "$bad_calls" ]; then
      echo "❌ FAIL: Found API calls not using /yahoo/* pattern"
      echo "$bad_calls"
      fail=1
    else
      echo "✅ PASS: All API calls use /yahoo/* pattern"
    fi
  fi
}

# Run checks
check_pattern "/api/yahoo/" "Direct /api/yahoo/ references"
check_pattern "/api/leagues" "Direct /api/leagues references"
check_pattern "Connect Yahoo" "Connect Yahoo text"
check_pattern "YahooStatusBadge" "YahooStatusBadge component"
check_allowed_patterns

echo ""
if [ $fail -eq 0 ]; then
  echo "✅ GREEN: All guardrails checks PASSED"
  exit 0
else
  echo "❌ RED: Guardrails checks FAILED - see errors above"
  exit 1
fi
