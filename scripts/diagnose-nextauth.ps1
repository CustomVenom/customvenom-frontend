# Diagnose NextAuth 404 Issue
# Checks if NextAuth routes are accessible

$PreviewURL = "https://customvenom-frontend-npx2mvsgp-incarcers-projects.vercel.app"

Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "NextAuth Diagnostics" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Check /api/auth/providers
Write-Host "Test 1: Checking /api/auth/providers..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$PreviewURL/api/auth/providers" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ FOUND: /api/auth/providers returns 200" -ForegroundColor Green
        $providers = $response.Content | ConvertFrom-Json
        Write-Host "  Available providers:" -ForegroundColor Gray
        $providers.PSObject.Properties | ForEach-Object {
            Write-Host "    - $($_.Name)" -ForegroundColor Gray
        }
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ✗ 404: Route not found" -ForegroundColor Red
        Write-Host "    This means NextAuth route isn't deployed to Preview" -ForegroundColor Yellow
        Write-Host "    Check:" -ForegroundColor Yellow
        Write-Host "      1. Is the code pushed to git?" -ForegroundColor Gray
        Write-Host "      2. Did Vercel build succeed?" -ForegroundColor Gray
        Write-Host "      3. Are you viewing the right Preview URL?" -ForegroundColor Gray
    } elseif ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "  ⚠️  500: Route exists but erroring" -ForegroundColor Yellow
        Write-Host "    Likely cause: Missing environment variables" -ForegroundColor Yellow
        Write-Host "    Check Vercel env vars for Preview:" -ForegroundColor Yellow
        Write-Host "      - NEXTAUTH_SECRET" -ForegroundColor Gray
        Write-Host "      - GOOGLE_CLIENT_ID" -ForegroundColor Gray
        Write-Host "      - GOOGLE_CLIENT_SECRET" -ForegroundColor Gray
    } else {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 2: Check /api/auth/signin
Write-Host "Test 2: Checking /api/auth/signin..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "$PreviewURL/api/auth/signin" -Method Get -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ FOUND: /api/auth/signin returns 200" -ForegroundColor Green
        Write-Host "  Opening sign-in page in browser..." -ForegroundColor Gray
        Start-Process "$PreviewURL/api/auth/signin"
    }
} catch {
    if ($_.Exception.Response.StatusCode -eq 404) {
        Write-Host "  ✗ 404: Sign-in page not found" -ForegroundColor Red
    } elseif ($_.Exception.Response.StatusCode -eq 500) {
        Write-Host "  ⚠️  500: Sign-in page exists but erroring" -ForegroundColor Yellow
    } else {
        Write-Host "  ✗ Error: $($_.Exception.Message)" -ForegroundColor Red
    }
}

Write-Host ""

# Test 3: Check main site
Write-Host "Test 3: Checking main site..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri $PreviewURL -Method Head -TimeoutSec 10
    if ($response.StatusCode -eq 200) {
        Write-Host "  ✓ Main site is accessible" -ForegroundColor Green
    }
} catch {
    Write-Host "  ✗ Main site not accessible" -ForegroundColor Red
}

Write-Host ""
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host "Diagnosis complete" -ForegroundColor Cyan
Write-Host "=====================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "Next steps based on results:" -ForegroundColor Yellow
Write-Host ""
Write-Host "If you got 404 on /providers:" -ForegroundColor White
Write-Host "  1. Check Vercel dashboard for build errors" -ForegroundColor Gray
Write-Host "  2. Verify you're viewing the latest Preview deployment" -ForegroundColor Gray
Write-Host "  3. Push code and trigger new deployment" -ForegroundColor Gray
Write-Host ""
Write-Host "If you got 500 on /providers:" -ForegroundColor White
Write-Host "  1. Add environment variables in Vercel (Preview env)" -ForegroundColor Gray
Write-Host "  2. Redeploy after adding env vars" -ForegroundColor Gray
Write-Host ""
Write-Host "If you got 200 on /providers:" -ForegroundColor White
Write-Host "  1. Your NextAuth is working!" -ForegroundColor Gray
Write-Host "  2. Test sign-in flow with Google" -ForegroundColor Gray
Write-Host ""

