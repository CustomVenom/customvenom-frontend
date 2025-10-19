#!/bin/bash
# Smoke Test Suite for CustomVenom
# Run: ./scripts/smoke-test.sh [API_BASE]
# Example: ./scripts/smoke-test.sh https://customvenom-workers-api.jdewett81.workers.dev

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Config
API_BASE="${1:-https://customvenom-workers-api.jdewett81.workers.dev}"
DEMO_WEEK="2025-06"
RESULTS_FILE="smoke-test-results-$(date +%Y%m%d-%H%M%S).txt"

echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "🔥 CustomVenom Smoke Test Suite"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "API Base: $API_BASE"
echo "Demo Week: $DEMO_WEEK"
echo "Time: $(date)"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Initialize results
PASSED=0
FAILED=0
WARNINGS=0

# Helper functions
pass() {
    echo -e "${GREEN}✅ PASS${NC} $1"
    PASSED=$((PASSED + 1))
}

fail() {
    echo -e "${RED}❌ FAIL${NC} $1"
    FAILED=$((FAILED + 1))
}

warn() {
    echo -e "${YELLOW}⚠️  WARN${NC} $1"
    WARNINGS=$((WARNINGS + 1))
}

info() {
    echo -e "${BLUE}ℹ️  INFO${NC} $1"
}

section() {
    echo ""
    echo -e "${BLUE}━━━ $1 ━━━${NC}"
}

# Check dependencies
section "Dependency Check"
command -v curl >/dev/null 2>&1 || { fail "curl not installed"; exit 1; }
command -v jq >/dev/null 2>&1 || { fail "jq not installed"; exit 1; }
pass "curl and jq available"

# Test 1: Health Check
section "Test 1: API Health Check"
info "GET $API_BASE/health"

HEALTH_RESPONSE=$(curl -s -w "\n%{http_code}" "$API_BASE/health")
HEALTH_CODE=$(echo "$HEALTH_RESPONSE" | tail -n1)
HEALTH_BODY=$(echo "$HEALTH_RESPONSE" | head -n-1)

if [ "$HEALTH_CODE" = "200" ]; then
    pass "Health endpoint returns 200"
    
    # Check JSON structure
    OK=$(echo "$HEALTH_BODY" | jq -r '.ok // empty')
    SCHEMA_VERSION=$(echo "$HEALTH_BODY" | jq -r '.schema_version // empty')
    LAST_REFRESH=$(echo "$HEALTH_BODY" | jq -r '.last_refresh // empty')
    
    if [ "$OK" = "true" ]; then
        pass "Health status: ok"
    else
        fail "Health status not ok: $OK"
    fi
    
    if [ -n "$SCHEMA_VERSION" ]; then
        pass "schema_version present: $SCHEMA_VERSION"
    else
        fail "schema_version missing"
    fi
    
    if [ -n "$LAST_REFRESH" ]; then
        pass "last_refresh present: $LAST_REFRESH"
    else
        fail "last_refresh missing"
    fi
else
    fail "Health endpoint returned $HEALTH_CODE"
fi

# Test 2: Projections Headers
section "Test 2: Projections Cache Headers"
info "GET $API_BASE/projections?week=$DEMO_WEEK"

PROJ_HEADERS=$(curl -sI "$API_BASE/projections?week=$DEMO_WEEK")
PROJ_CODE=$(echo "$PROJ_HEADERS" | grep -oP 'HTTP/\S+ \K\d+' | head -n1)

if [ "$PROJ_CODE" = "200" ]; then
    pass "Projections endpoint returns 200"
    
    # Check required headers
    if echo "$PROJ_HEADERS" | grep -qi "x-schema-version:"; then
        HEADER_VAL=$(echo "$PROJ_HEADERS" | grep -i "x-schema-version:" | cut -d: -f2 | tr -d '[:space:]')
        pass "x-schema-version header present: $HEADER_VAL"
    else
        fail "x-schema-version header missing"
    fi
    
    if echo "$PROJ_HEADERS" | grep -qi "x-last-refresh:"; then
        HEADER_VAL=$(echo "$PROJ_HEADERS" | grep -i "x-last-refresh:" | cut -d: -f2 | tr -d '[:space:]')
        pass "x-last-refresh header present: ${HEADER_VAL:0:20}..."
    else
        fail "x-last-refresh header missing"
    fi
    
    if echo "$PROJ_HEADERS" | grep -qi "cache-control:"; then
        HEADER_VAL=$(echo "$PROJ_HEADERS" | grep -i "cache-control:" | cut -d: -f2 | tr -d '[:space:]')
        pass "cache-control header present: $HEADER_VAL"
    else
        warn "cache-control header missing (recommended)"
    fi
    
    if echo "$PROJ_HEADERS" | grep -qi "x-stale:"; then
        HEADER_VAL=$(echo "$PROJ_HEADERS" | grep -i "x-stale:" | cut -d: -f2 | tr -d '[:space:]')
        warn "Serving stale data: x-stale=$HEADER_VAL"
        
        if echo "$PROJ_HEADERS" | grep -qi "x-stale-age:"; then
            AGE_VAL=$(echo "$PROJ_HEADERS" | grep -i "x-stale-age:" | cut -d: -f2 | tr -d '[:space:]')
            info "Stale age: $AGE_VAL seconds"
        fi
    else
        pass "Serving fresh data (no x-stale header)"
    fi
else
    fail "Projections endpoint returned $PROJ_CODE"
fi

# Test 3: Projections Response Body
section "Test 3: Projections Data Structure"
PROJ_BODY=$(curl -s "$API_BASE/projections?week=$DEMO_WEEK")

if [ -n "$PROJ_BODY" ] && [ "$PROJ_BODY" != "null" ]; then
    # Check if valid JSON
    if echo "$PROJ_BODY" | jq empty 2>/dev/null; then
        pass "Valid JSON response"
        
        # Check for data array
        DATA_LENGTH=$(echo "$PROJ_BODY" | jq -r '.data | length // 0')
        if [ "$DATA_LENGTH" -gt 0 ]; then
            pass "Data array present with $DATA_LENGTH players"
            
            # Check first player structure
            FIRST_PLAYER=$(echo "$PROJ_BODY" | jq -r '.data[0] // empty')
            if [ -n "$FIRST_PLAYER" ]; then
                HAS_NAME=$(echo "$FIRST_PLAYER" | jq -r '.name // empty')
                HAS_PROJECTED=$(echo "$FIRST_PLAYER" | jq -r '.projected // empty')
                
                if [ -n "$HAS_NAME" ]; then
                    pass "Player objects have 'name' field"
                else
                    fail "Player objects missing 'name' field"
                fi
                
                if [ -n "$HAS_PROJECTED" ]; then
                    pass "Player objects have 'projected' field"
                else
                    warn "Player objects missing 'projected' field (might be null)"
                fi
            fi
        else
            warn "Data array empty (might be expected for demo week)"
        fi
        
        # Check metadata
        META=$(echo "$PROJ_BODY" | jq -r '.meta // empty')
        if [ -n "$META" ]; then
            pass "Metadata present"
        else
            warn "Metadata missing"
        fi
    else
        fail "Invalid JSON response"
    fi
else
    fail "Empty or null response body"
fi

# Test 4: Other Key Endpoints
section "Test 4: Additional Endpoints"

# Stats endpoint
info "Checking /stats..."
STATS_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/stats")
if [ "$STATS_CODE" = "200" ]; then
    pass "/stats returns 200"
else
    warn "/stats returned $STATS_CODE"
fi

# Weather endpoint
info "Checking /weather..."
WEATHER_CODE=$(curl -s -o /dev/null -w "%{http_code}" "$API_BASE/weather")
if [ "$WEATHER_CODE" = "200" ]; then
    pass "/weather returns 200"
else
    warn "/weather returned $WEATHER_CODE"
fi

# Test 5: Response Times
section "Test 5: Performance Check"

# Health endpoint
HEALTH_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_BASE/health")
HEALTH_MS=$(echo "$HEALTH_TIME * 1000" | bc -l | cut -d. -f1)
if [ "$HEALTH_MS" -lt 300 ]; then
    pass "/health response time: ${HEALTH_MS}ms (< 300ms)"
elif [ "$HEALTH_MS" -lt 1000 ]; then
    warn "/health response time: ${HEALTH_MS}ms (> 300ms)"
else
    fail "/health response time: ${HEALTH_MS}ms (> 1000ms)"
fi

# Projections endpoint
PROJ_TIME=$(curl -s -o /dev/null -w "%{time_total}" "$API_BASE/projections?week=$DEMO_WEEK")
PROJ_MS=$(echo "$PROJ_TIME * 1000" | bc -l | cut -d. -f1)
if [ "$PROJ_MS" -lt 500 ]; then
    pass "/projections response time: ${PROJ_MS}ms (< 500ms)"
elif [ "$PROJ_MS" -lt 2000 ]; then
    warn "/projections response time: ${PROJ_MS}ms (> 500ms)"
else
    fail "/projections response time: ${PROJ_MS}ms (> 2000ms)"
fi

# Final Report
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "📊 Test Results Summary"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo -e "${GREEN}✅ Passed:  $PASSED${NC}"
echo -e "${RED}❌ Failed:  $FAILED${NC}"
echo -e "${YELLOW}⚠️  Warnings: $WARNINGS${NC}"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"

# Exit code
if [ "$FAILED" -gt 0 ]; then
    echo -e "${RED}❌ SMOKE TEST FAILED${NC}"
    exit 1
else
    echo -e "${GREEN}✅ SMOKE TEST PASSED${NC}"
    if [ "$WARNINGS" -gt 0 ]; then
        echo -e "${YELLOW}⚠️  Review warnings above${NC}"
    fi
    exit 0
fi


