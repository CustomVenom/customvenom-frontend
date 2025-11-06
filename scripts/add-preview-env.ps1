# Add Preview Environment to Vercel Variables
# Automatically copies Production values to Preview (except NEXTAUTH_URL)
# Usage: .\scripts\add-preview-env.ps1

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Check authentication
Write-Host "Checking Vercel authentication..." -ForegroundColor Cyan
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "[ERROR] Not authenticated with Vercel" -ForegroundColor Red
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    Write-Host "Or set VERCEL_TOKEN environment variable" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Authenticated as: $($whoami | Select-String -Pattern '>\s+(.+)' | ForEach-Object { $_.Matches.Groups[1].Value })" -ForegroundColor Green
Write-Host ""

Write-Host "Adding Preview Environment to Vercel Variables" -ForegroundColor Cyan
Write-Host "This script will copy Production values to Preview environment" -ForegroundColor Yellow
Write-Host ""

# Step 1: Pull Production environment variables
Write-Host "[1/3] Pulling Production environment variables..." -ForegroundColor Cyan
$tempFile = ".env.production.temp"
vercel env pull $tempFile --environment=production --yes 2>&1 | Out-Null

if (-not (Test-Path $tempFile)) {
    Write-Host "[ERROR] Failed to pull Production variables" -ForegroundColor Red
    Write-Host "Make sure you're authenticated and have access to the project" -ForegroundColor Yellow
    exit 1
}

Write-Host "[OK] Production variables downloaded" -ForegroundColor Green
Write-Host ""

# Step 2: Parse .env file and prepare variables
Write-Host "[2/3] Preparing variables for Preview..." -ForegroundColor Cyan

$envContent = Get-Content $tempFile
$variables = @{}

foreach ($line in $envContent) {
    if ($line -match '^([^#][^=]+)=(.*)$') {
        $key = $matches[1].Trim()
        $value = $matches[2].Trim()
        $variables[$key] = $value
    }
}

# Variables that need Preview (same value as Production)
$variablesToAdd = @(
    "DATABASE_URL",
    "AUTH_SECRET",
    "NEXTAUTH_SECRET",
    "NEXT_PUBLIC_API_BASE",
    "API_BASE",
    "GOOGLE_CLIENT_ID",
    "GOOGLE_CLIENT_SECRET",
    "SENTRY_DSN",
    "NEXT_PUBLIC_SENTRY_DSN"
)

# Special case - NEXTAUTH_URL needs different value
$previewUrl = "https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app"

Write-Host "[OK] Variables parsed" -ForegroundColor Green
Write-Host ""

# Step 3: Add variables to Preview
Write-Host "[3/3] Adding variables to Preview environment..." -ForegroundColor Cyan
Write-Host ""

$added = 0
$skipped = 0
$errors = 0

foreach ($var in $variablesToAdd) {
    # Check if variable already has Preview
    $check = vercel env ls 2>&1 | Select-String -Pattern "^\s+$var\s+.*Preview"
    if ($check) {
        Write-Host "  [SKIP] $var - Already has Preview" -ForegroundColor Green
        $skipped++
        continue
    }

    # Get value from Production
    if (-not $variables.ContainsKey($var)) {
        Write-Host "  [SKIP] $var - Not found in Production" -ForegroundColor Yellow
        $skipped++
        continue
    }

    $value = $variables[$var]

    # Add to Preview environment
    Write-Host "  Adding $var..." -ForegroundColor Gray
    $value | vercel env add $var preview 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $var added to Preview" -ForegroundColor Green
        $added++
    } else {
        Write-Host "  [ERROR] Failed to add $var" -ForegroundColor Red
        $errors++
    }
}

# Handle NEXTAUTH_URL separately
Write-Host ""
Write-Host "  Processing NEXTAUTH_URL (special case)..." -ForegroundColor Gray
$check = vercel env ls 2>&1 | Select-String -Pattern "^\s+NEXTAUTH_URL\s+.*Preview"
if ($check) {
    Write-Host "  [SKIP] NEXTAUTH_URL - Already has Preview" -ForegroundColor Green
    $skipped++
} else {
    $previewUrl | vercel env add NEXTAUTH_URL preview 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] NEXTAUTH_URL added to Preview with Preview URL" -ForegroundColor Green
        $added++
    } else {
        Write-Host "  [ERROR] Failed to add NEXTAUTH_URL" -ForegroundColor Red
        $errors++
    }
}

# Cleanup
Remove-Item $tempFile -ErrorAction SilentlyContinue

# Summary
Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "[OK] Added: $added" -ForegroundColor Green
Write-Host "[SKIP] Skipped: $skipped" -ForegroundColor Yellow
Write-Host "[ERROR] Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

if ($errors -eq 0) {
    Write-Host "Success! Run verification script:" -ForegroundColor Green
    Write-Host "  .\scripts\check-vercel-env.ps1" -ForegroundColor White
} else {
    Write-Host "Some errors occurred. Check the output above." -ForegroundColor Yellow
}

Write-Host ""
