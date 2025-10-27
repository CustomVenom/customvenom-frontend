#!/bin/bash

# CustomVenom Frontend Deployment Verification Script
# Run this after Vercel deployment to verify everything works

set -e

echo "🔍 Verifying CustomVenom Frontend Deployment..."

# Check if PREVIEW_URL is provided
if [ -z "$1" ]; then
    echo "❌ Usage: ./scripts/verify-deployment.sh <PREVIEW_URL>"
    echo "   Example: ./scripts/verify-deployment.sh https://customvenom-frontend-abc123.vercel.app"
    exit 1
fi

PREVIEW_URL="$1"
API_BASE="https://api.customvenom.com"

echo "📡 Testing API health..."
if curl -s "$API_BASE/health" | jq -e '.ok and .ready and (.schema_version|length>0) and (.last_refresh|length>0)' > /dev/null; then
    echo "✅ API health check passed"
else
    echo "❌ API health check failed"
    exit 1
fi

echo "🌐 Testing preview deployment..."
if curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL" | grep -q "200"; then
    echo "✅ Preview URL loads successfully"
else
    echo "❌ Preview URL failed to load"
    exit 1
fi

echo "🔗 Testing selection API proxy..."
if curl -s -o /dev/null -w "%{http_code}" "$PREVIEW_URL/api/session/selection" | grep -q "200\|401"; then
    echo "✅ Selection API proxy responds"
else
    echo "❌ Selection API proxy failed"
    exit 1
fi

echo "🍪 Testing CORS headers..."
CORS_HEADERS=$(curl -s -I "$PREVIEW_URL/api/session/selection" | grep -i "access-control")
if [ -n "$CORS_HEADERS" ]; then
    echo "✅ CORS headers present: $CORS_HEADERS"
else
    echo "⚠️  CORS headers not detected (may be normal for some responses)"
fi

echo "🎉 Deployment verification complete!"
echo "📋 Manual checks to perform:"
echo "   1. Open $PREVIEW_URL in browser"
echo "   2. Navigate to /tools page"
echo "   3. Verify selection status component appears"
echo "   4. Check that no 'Yahoo' labels show after team selection"
echo "   5. Test that selection persists after page refresh"
