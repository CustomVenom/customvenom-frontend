# Weekly Drift Watch - Yahoo OAuth URL Alignment
# Verifies NEXTAUTH_URL, Yahoo redirect URI, and scope fspt-r still match
# Run weekly and paste receipts in Weekly Readout

Write-Host "=== Yahoo OAuth Drift Watch - $(Get-Date -Format 'yyyy-MM-dd') ===" -ForegroundColor Green

$errors = @()

# 1. Check NEXTAUTH_URL environment variable
Write-Host "`n1. Checking NEXTAUTH_URL..." -ForegroundColor Yellow
try {
    $nextAuthUrl = $env:NEXTAUTH_URL
    if ($nextAuthUrl -eq "https://www.customvenom.com") {
        Write-Host "✅ NEXTAUTH_URL: $nextAuthUrl" -ForegroundColor Green
    } else {
        $errors += "❌ NEXTAUTH_URL mismatch: Expected 'https://www.customvenom.com', got '$nextAuthUrl'"
        Write-Host "❌ NEXTAUTH_URL mismatch: Expected 'https://www.customvenom.com', got '$nextAuthUrl'" -ForegroundColor Red
    }
} catch {
    $errors += "❌ Failed to check NEXTAUTH_URL: $($_.Exception.Message)"
    Write-Host "❌ Failed to check NEXTAUTH_URL: $($_.Exception.Message)" -ForegroundColor Red
}

# 2. Check Workers API Yahoo connect endpoint
Write-Host "`n2. Checking Workers API Yahoo connect endpoint..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://api.customvenom.com/api/yahoo/connect" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 302) {
        $location = $response.Headers['Location']
        if ($location -match "redirect_uri=https://www.customvenom.com/api/auth/callback/yahoo" -and $location -match "scope=fspt-r") {
            Write-Host "✅ Workers API redirect URI and scope correct" -ForegroundColor Green
            Write-Host "   Location: $location" -ForegroundColor Gray
        } else {
            $errors += "❌ Workers API redirect URI or scope mismatch in: $location"
            Write-Host "❌ Workers API redirect URI or scope mismatch in: $location" -ForegroundColor Red
        }
    } else {
        $errors += "❌ Workers API connect endpoint returned status $($response.StatusCode), expected 302"
        Write-Host "❌ Workers API connect endpoint returned status $($response.StatusCode), expected 302" -ForegroundColor Red
    }
} catch {
    $errors += "❌ Failed to check Workers API: $($_.Exception.Message)"
    Write-Host "❌ Failed to check Workers API: $($_.Exception.Message)" -ForegroundColor Red
}

# 3. Check frontend Connect Yahoo button href
Write-Host "`n3. Checking frontend Connect Yahoo button href..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.customvenom.com/settings" -Method GET
    $content = $response.Content

    if ($content -match 'href="https://www.customvenom.com/api/yahoo/connect') {
        Write-Host "✅ Frontend Connect Yahoo button href correct" -ForegroundColor Green
    } else {
        $errors += "❌ Frontend Connect Yahoo button href mismatch"
        Write-Host "❌ Frontend Connect Yahoo button href mismatch" -ForegroundColor Red
    }
} catch {
    $errors += "❌ Failed to check frontend: $($_.Exception.Message)"
    Write-Host "❌ Failed to check frontend: $($_.Exception.Message)" -ForegroundColor Red
}

# 4. Check NextAuth callback route
Write-Host "`n4. Checking NextAuth callback route..." -ForegroundColor Yellow
try {
    $response = Invoke-WebRequest -Uri "https://www.customvenom.com/api/auth/callback/yahoo?code=test" -Method GET -MaximumRedirection 0 -ErrorAction SilentlyContinue
    if ($response.StatusCode -eq 200 -or $response.StatusCode -eq 400) {
        Write-Host "✅ NextAuth callback route accessible (status: $($response.StatusCode))" -ForegroundColor Green
    } else {
        $errors += "❌ NextAuth callback route returned unexpected status: $($response.StatusCode)"
        Write-Host "❌ NextAuth callback route returned unexpected status: $($response.StatusCode)" -ForegroundColor Red
    }
} catch {
    $errors += "❌ Failed to check NextAuth callback: $($_.Exception.Message)"
    Write-Host "❌ Failed to check NextAuth callback: $($_.Exception.Message)" -ForegroundColor Red
}

# 5. Check for any remaining customvenom.com (without www) references
Write-Host "`n5. Checking for customvenom.com (without www) references..." -ForegroundColor Yellow
try {
    $gitGrep = git grep -n "https://customvenom\.com" -- 'src/**/*.{ts,tsx,js,jsx}' 2>$null
    if ($gitGrep) {
        $errors += "❌ Found customvenom.com (without www) references in source code:"
        Write-Host "❌ Found customvenom.com (without www) references in source code:" -ForegroundColor Red
        Write-Host $gitGrep -ForegroundColor Red
    } else {
        Write-Host "✅ No customvenom.com (without www) references found" -ForegroundColor Green
    }
} catch {
    Write-Host "⚠️ Could not check for customvenom.com references (git not available)" -ForegroundColor Yellow
}

# Summary
Write-Host "`n=== DRIFT WATCH SUMMARY ===" -ForegroundColor Green
if ($errors.Count -eq 0) {
    Write-Host "✅ ALL CHECKS PASSED - Yahoo OAuth URLs are aligned" -ForegroundColor Green
    Write-Host "`nCopy this to Weekly Readout:" -ForegroundColor Cyan
    Write-Host "✅ Yahoo OAuth Drift Watch $(Get-Date -Format 'yyyy-MM-dd'): All URLs aligned to https://www.customvenom.com" -ForegroundColor White
} else {
    Write-Host "❌ $($errors.Count) ISSUES FOUND:" -ForegroundColor Red
    foreach ($error in $errors) {
        Write-Host "  $error" -ForegroundColor Red
    }
    Write-Host "`nCopy this to Weekly Readout:" -ForegroundColor Cyan
    Write-Host "❌ Yahoo OAuth Drift Watch $(Get-Date -Format 'yyyy-MM-dd'): $($errors.Count) issues found - see drift-watch.log" -ForegroundColor White
}

# Save detailed log
$logContent = @"
Yahoo OAuth Drift Watch - $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss')
===============================================

NEXTAUTH_URL: $env:NEXTAUTH_URL
Errors: $($errors.Count)
Issues:
$($errors -join "`n")

"@

$logContent | Out-File -FilePath "drift-watch.log" -Encoding UTF8
Write-Host "`nDetailed log saved to: drift-watch.log" -ForegroundColor Gray
