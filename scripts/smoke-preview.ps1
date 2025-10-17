# Smoke Tests for Preview Environment
# Run after setting up Vercel environment variables

$PreviewURL = "https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app"
$APIBASE = "https://api.customvenom.com"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Preview Environment Smoke Tests" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Preview Site Reachable
Write-Host "Test 1: Preview site reachable..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $PreviewURL -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Preview site is live (200 OK)" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Failed to reach preview site" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 2: API Health Check
Write-Host "Test 2: API health check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$APIBASE/health" -Method Get -TimeoutSec 10
    $data = $response.Content | ConvertFrom-Json
    
    if ($data.ok -eq $true) {
        Write-Host "  ✓ API health check passed" -ForegroundColor Green
        Write-Host "    schema_version: $($data.schema_version)" -ForegroundColor Gray
        Write-Host "    last_refresh: $($data.last_refresh)" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ API health check failed (ok: false)" -ForegroundColor Red
    }
} catch {
    Write-Host "  ✗ API health check failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 3: API Headers
Write-Host "Test 3: API headers check..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$APIBASE/projections?week=2025-06" -Method Get -TimeoutSec 10
    
    $headersToCheck = @('x-key', 'cache-control', 'x-schema-version', 'x-last-refresh')
    $allPresent = $true
    
    foreach ($header in $headersToCheck) {
        if ($response.Headers[$header]) {
            Write-Host "  ✓ Header present: $header" -ForegroundColor Green
        } else {
            Write-Host "  ✗ Header missing: $header" -ForegroundColor Red
            $allPresent = $false
        }
    }
    
    if ($allPresent) {
        Write-Host "  ✓ All required headers present" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ API headers check failed" -ForegroundColor Red
    Write-Host "    Error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Test 4: Open Auth Page
Write-Host "Test 4: Opening auth page in browser..." -ForegroundColor Yellow
Write-Host "  Opening: $PreviewURL/api/auth/signin" -ForegroundColor Gray
Write-Host "  Please test:" -ForegroundColor Yellow
Write-Host "    1. Click 'Sign in with Google'" -ForegroundColor Gray
Write-Host "    2. Complete OAuth flow" -ForegroundColor Gray
Write-Host "    3. Visit /settings to verify role and email" -ForegroundColor Gray

Start-Process "$PreviewURL/api/auth/signin"

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Smoke tests complete!" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Next steps:" -ForegroundColor Yellow
Write-Host "  1. Complete OAuth test in browser" -ForegroundColor Gray
Write-Host "  2. Verify /settings shows your data" -ForegroundColor Gray
Write-Host "  3. Check Vercel logs for errors" -ForegroundColor Gray
Write-Host ""

