# Add Staging Environment Variables to Vercel
# Usage: .\scripts\add-staging-env.ps1

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
    exit 1
}

Write-Host "[OK] Authenticated" -ForegroundColor Green
Write-Host ""

# Ask which environment (Production, Preview, or Development)
Write-Host "Which environment do you want to add variables to?" -ForegroundColor Cyan
Write-Host "  1. Production" -ForegroundColor White
Write-Host "  2. Preview" -ForegroundColor White
Write-Host "  3. Development" -ForegroundColor White
Write-Host ""
$envChoice = Read-Host "Enter choice (1-3)"

$targetEnv = switch ($envChoice) {
    "1" { "production" }
    "2" { "preview" }
    "3" { "development" }
    default {
        Write-Host "Invalid choice. Using 'preview'." -ForegroundColor Yellow
        "preview"
    }
}

Write-Host ""
Write-Host "Target environment: $targetEnv" -ForegroundColor Cyan
Write-Host ""

# Variables that typically need staging values
$variablesToAdd = @(
    @{ Name = "DATABASE_URL"; Description = "Database connection string (from Neon.tech)" },
    @{ Name = "AUTH_SECRET"; Description = "Auth secret (same as Production)" },
    @{ Name = "NEXTAUTH_SECRET"; Description = "NextAuth secret (same as Production)" },
    @{ Name = "NEXT_PUBLIC_API_BASE"; Description = "API base URL (e.g., https://api-staging.customvenom.com or https://api.customvenom.com)" },
    @{ Name = "API_BASE"; Description = "API base URL (same as NEXT_PUBLIC_API_BASE)" },
    @{ Name = "GOOGLE_CLIENT_ID"; Description = "Google OAuth Client ID (same as Production)" },
    @{ Name = "GOOGLE_CLIENT_SECRET"; Description = "Google OAuth Client Secret (same as Production)" },
    @{ Name = "NEXTAUTH_URL"; Description = "Auth callback URL (your deployment URL)" },
    @{ Name = "SENTRY_DSN"; Description = "Sentry DSN (optional, can leave empty)" },
    @{ Name = "NEXT_PUBLIC_SENTRY_DSN"; Description = "Sentry public DSN (optional, can leave empty)" }
)

Write-Host "Adding variables to $targetEnv environment..." -ForegroundColor Cyan
Write-Host "You can enter values or press Enter to skip a variable." -ForegroundColor Yellow
Write-Host ""

$added = 0
$skipped = 0
$errors = 0

foreach ($varInfo in $variablesToAdd) {
    $var = $varInfo.Name
    $desc = $varInfo.Description

    # Check if variable already exists in target environment
    $check = vercel env ls 2>&1 | Select-String -Pattern "^\s+$var\s+.*$targetEnv"
    if ($check) {
        Write-Host "[SKIP] $var - Already exists in $targetEnv" -ForegroundColor Green
        $skipped++
        continue
    }

    Write-Host ""
    Write-Host "Variable: $var" -ForegroundColor White
    Write-Host "  Description: $desc" -ForegroundColor Gray
    $value = Read-Host "  Enter value (or press Enter to skip)"

    if ([string]::IsNullOrWhiteSpace($value)) {
        Write-Host "  [SKIP] $var - No value provided" -ForegroundColor Yellow
        $skipped++
        continue
    }

    # Add to target environment
    Write-Host "  Adding to $targetEnv..." -ForegroundColor Gray
    $value | vercel env add $var $targetEnv 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $var added to $targetEnv" -ForegroundColor Green
        $added++
    } else {
        Write-Host "  [ERROR] Failed to add $var" -ForegroundColor Red
        $errors++
    }
}

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
    Write-Host "Success! Variables added to $targetEnv environment." -ForegroundColor Green
} else {
    Write-Host "Some errors occurred. Check the output above." -ForegroundColor Yellow
}

Write-Host ""

