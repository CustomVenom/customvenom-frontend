# Check Vercel Environment Variables for Preview Environment
# Usage: .\scripts\check-vercel-env.ps1

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Host "ERROR: Vercel CLI not found. Install with: npm i -g vercel" -ForegroundColor Red
    exit 1
}

# Check authentication
Write-Host "Checking Vercel authentication..." -ForegroundColor Cyan
$whoami = vercel whoami 2>&1
if ($LASTEXITCODE -ne 0) {
    Write-Host "ERROR: Not authenticated with Vercel" -ForegroundColor Red
    Write-Host "Please run: vercel login" -ForegroundColor Yellow
    exit 1
}

Write-Host "Checking Vercel Environment Variables..." -ForegroundColor Cyan
Write-Host ""

# Get all environment variables
$envOutput = vercel env ls 2>&1
$envVars = $envOutput | Select-Object -Skip 3

# Variables that should have Preview environment
$requiredForPreview = @(
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

# Special case - NEXTAUTH_URL needs different value for Preview
$specialCase = @("NEXTAUTH_URL")

Write-Host "Variables Required for Preview:" -ForegroundColor Yellow
Write-Host ""

$missingPreview = @()
$hasPreview = @()
$hasSpecialCase = @()

foreach ($var in $requiredForPreview) {
    $hasVar = $envVars | Select-String -Pattern "^\s+$var\s+"
    if ($hasVar) {
        if ($hasVar -match "Preview") {
            Write-Host "  [OK] $var - Has Preview" -ForegroundColor Green
            $hasPreview += $var
        } else {
            Write-Host "  [X] $var - Missing Preview" -ForegroundColor Red
            $missingPreview += $var
        }
    } else {
        Write-Host "  [!] $var - Not found" -ForegroundColor Yellow
        $missingPreview += $var
    }
}

Write-Host ""
Write-Host "Special Cases:" -ForegroundColor Yellow
Write-Host ""

foreach ($var in $specialCase) {
    $hasVar = $envVars | Select-String -Pattern "^\s+$var\s+"
    if ($hasVar) {
        if ($hasVar -match "Preview") {
            Write-Host "  [OK] $var - Has Preview (verify value matches Preview URL)" -ForegroundColor Green
            $hasSpecialCase += $var
        } else {
            Write-Host "  [X] $var - Missing Preview" -ForegroundColor Red
            Write-Host "      Needs: https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app" -ForegroundColor Gray
            $missingPreview += $var
        }
    } else {
        Write-Host "  [!] $var - Not found" -ForegroundColor Yellow
        $missingPreview += $var
    }
}

Write-Host ""
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host ""

if ($missingPreview.Count -eq 0) {
    Write-Host "[SUCCESS] All required variables have Preview environment!" -ForegroundColor Green
} else {
    Write-Host "[MISSING] Preview environment for:" -ForegroundColor Red
    foreach ($var in $missingPreview) {
        Write-Host "   - $var" -ForegroundColor Red
    }
    Write-Host ""
    Write-Host "Action: Go to Vercel Dashboard -> Environment Variables" -ForegroundColor Yellow
    Write-Host "   Edit each variable above and check Preview checkbox" -ForegroundColor Yellow
}

Write-Host ""
Write-Host "[OK] Variables with Preview: $($hasPreview.Count + $hasSpecialCase.Count)" -ForegroundColor Green
Write-Host "[X] Missing Preview: $($missingPreview.Count)" -ForegroundColor Red
Write-Host ""
Write-Host "Note: NEXTAUTH_URL Preview value should be your Preview deployment URL" -ForegroundColor Cyan
Write-Host ""

