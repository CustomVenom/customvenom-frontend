# Yahoo Leagues Smoke Test
# Tests the /yahoo/leagues endpoint with requestId capture

Write-Host "🔍 Yahoo Leagues Smoke Test" -ForegroundColor Green
Write-Host "================================" -ForegroundColor Green

# Test staging endpoint
$stagingUrl = "https://customvenom-workers-api-staging.jdewett81.workers.dev/yahoo/leagues?season=2025"
Write-Host "`n📡 Testing Staging: $stagingUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $stagingUrl -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📋 Headers:" -ForegroundColor Yellow
    $response.Headers | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray }
    
    $body = $response.Content | ConvertFrom-Json
    Write-Host "`n📄 Response Body:" -ForegroundColor Yellow
    Write-Host "  ok: $($body.ok)" -ForegroundColor Gray
    Write-Host "  ready: $($body.ready)" -ForegroundColor Gray
    Write-Host "  schema_version: $($body.schema_version)" -ForegroundColor Gray
    Write-Host "  last_refresh: $($body.last_refresh)" -ForegroundColor Gray
    
    if ($body.error) {
        Write-Host "  error: $($body.error)" -ForegroundColor Red
        Write-Host "  message: $($body.message)" -ForegroundColor Red
    }
    
    # Capture requestId for debugging
    $requestId = $response.Headers['x-request-id']
    if ($requestId) {
        Write-Host "`n🆔 Request ID: $requestId" -ForegroundColor Magenta
    }
    
} catch {
    Write-Host "❌ Staging Error: $($_.Exception.Message)" -ForegroundColor Red
}

# Test production endpoint
$prodUrl = "https://api.customvenom.com/yahoo/leagues?season=2025"
Write-Host "`n📡 Testing Production: $prodUrl" -ForegroundColor Cyan

try {
    $response = Invoke-WebRequest -Uri $prodUrl -UseBasicParsing -ErrorAction Stop
    
    Write-Host "✅ Status: $($response.StatusCode)" -ForegroundColor Green
    Write-Host "📋 Headers:" -ForegroundColor Yellow
    $response.Headers | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" -ForegroundColor Gray }
    
    $body = $response.Content | ConvertFrom-Json
    Write-Host "`n📄 Response Body:" -ForegroundColor Yellow
    Write-Host "  ok: $($body.ok)" -ForegroundColor Gray
    Write-Host "  ready: $($body.ready)" -ForegroundColor Gray
    Write-Host "  schema_version: $($body.schema_version)" -ForegroundColor Gray
    Write-Host "  last_refresh: $($body.last_refresh)" -ForegroundColor Gray
    
    if ($body.leagues) {
        Write-Host "  leagues: $($body.leagues.Count) items" -ForegroundColor Gray
    }
    
    # Capture requestId for debugging
    $requestId = $response.Headers['x-request-id']
    if ($requestId) {
        Write-Host "`n🆔 Request ID: $requestId" -ForegroundColor Magenta
    }
    
} catch {
    Write-Host "❌ Production Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host "`n🎯 Smoke Test Complete" -ForegroundColor Green
Write-Host "💡 If you see errors, copy the Request ID for debugging" -ForegroundColor Blue
