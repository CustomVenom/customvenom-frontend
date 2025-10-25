# UI Smoke Test for Leagues Flow on Staging
# Tests the complete leagues flow and captures requestId for debugging

param(
    [string]$StagingUrl = "https://customvenom-frontend-staging.vercel.app",
    [string]$ApiBase = "https://customvenom-workers-api-staging.jdewett81.workers.dev"
)

Write-Host "🧪 UI Smoke Test: Leagues Flow" -ForegroundColor Cyan
Write-Host "📍 Frontend: $StagingUrl" -ForegroundColor Yellow
Write-Host "📍 API: $ApiBase" -ForegroundColor Yellow

# Set environment variables for the test
$env:NEXT_PUBLIC_API_BASE = $ApiBase

Write-Host "`n🔧 Environment Setup:" -ForegroundColor Cyan
Write-Host "  NEXT_PUBLIC_API_BASE = $ApiBase" -ForegroundColor Green

Write-Host "`n🌐 Testing Frontend Pages:" -ForegroundColor Cyan

# Test 1: Home page
Write-Host "`n1️⃣ Testing Home Page..." -ForegroundColor Yellow
try {
    $HomeResponse = Invoke-WebRequest -Uri "$StagingUrl" -Method GET -ErrorAction Stop
    if ($HomeResponse.StatusCode -eq 200) {
        Write-Host "✅ Home page: PASS (Status: $($HomeResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Home page: FAIL (Status: $($HomeResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Home page: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 2: Tools page (leagues flow entry point)
Write-Host "`n2️⃣ Testing Tools Page..." -ForegroundColor Yellow
try {
    $ToolsResponse = Invoke-WebRequest -Uri "$StagingUrl/tools" -Method GET -ErrorAction Stop
    if ($ToolsResponse.StatusCode -eq 200) {
        Write-Host "✅ Tools page: PASS (Status: $($ToolsResponse.StatusCode))" -ForegroundColor Green
        
        # Check for Trust Snapshot element
        if ($ToolsResponse.Content -match "Trust Snapshot") {
            Write-Host "✅ Trust Snapshot element found" -ForegroundColor Green
        } else {
            Write-Host "⚠️ Trust Snapshot element not found" -ForegroundColor Yellow
        }
    } else {
        Write-Host "❌ Tools page: FAIL (Status: $($ToolsResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Tools page: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 3: Leagues page
Write-Host "`n3️⃣ Testing Leagues Page..." -ForegroundColor Yellow
try {
    $LeaguesResponse = Invoke-WebRequest -Uri "$StagingUrl/tools/leagues" -Method GET -ErrorAction Stop
    if ($LeaguesResponse.StatusCode -eq 200) {
        Write-Host "✅ Leagues page: PASS (Status: $($LeaguesResponse.StatusCode))" -ForegroundColor Green
    } else {
        Write-Host "❌ Leagues page: FAIL (Status: $($LeaguesResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ Leagues page: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 4: API Health Check
Write-Host "`n4️⃣ Testing API Health..." -ForegroundColor Yellow
try {
    $HealthResponse = Invoke-WebRequest -Uri "$ApiBase/health" -Method GET -ErrorAction Stop
    if ($HealthResponse.StatusCode -eq 200) {
        Write-Host "✅ API Health: PASS (Status: $($HealthResponse.StatusCode))" -ForegroundColor Green
        
        # Extract requestId from headers
        $RequestId = $HealthResponse.Headers['x-request-id']
        if ($RequestId) {
            Write-Host "🔗 RequestId: $RequestId" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ API Health: FAIL (Status: $($HealthResponse.StatusCode))" -ForegroundColor Red
    }
} catch {
    Write-Host "❌ API Health: ERROR - $($_.Exception.Message)" -ForegroundColor Red
}

# Test 5: Yahoo Leagues API
Write-Host "`n5️⃣ Testing Yahoo Leagues API..." -ForegroundColor Yellow
try {
    $YahooResponse = Invoke-WebRequest -Uri "$ApiBase/yahoo/leagues" -Method GET -ErrorAction Stop
    if ($YahooResponse.StatusCode -eq 200) {
        Write-Host "✅ Yahoo Leagues API: PASS (Status: $($YahooResponse.StatusCode))" -ForegroundColor Green
        
        # Extract requestId from headers
        $RequestId = $YahooResponse.Headers['x-request-id']
        if ($RequestId) {
            Write-Host "🔗 RequestId: $RequestId" -ForegroundColor Cyan
        }
    } else {
        Write-Host "❌ Yahoo Leagues API: FAIL (Status: $($YahooResponse.StatusCode))" -ForegroundColor Red
        Write-Host "📄 Response body:" -ForegroundColor Yellow
        Write-Host $YahooResponse.Content -ForegroundColor White
    }
} catch {
    Write-Host "❌ Yahoo Leagues API: ERROR - $($_.Exception.Message)" -ForegroundColor Red
    Write-Host "🔗 If you need to debug, check the requestId in the error details" -ForegroundColor Cyan
}

Write-Host "`n🎯 UI Smoke Test Complete!" -ForegroundColor Cyan
Write-Host "💡 If any tests failed, copy the 'Show details' with requestId for debugging" -ForegroundColor Yellow
