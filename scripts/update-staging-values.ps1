# Update or Add Staging-Specific Variable Values
# This allows you to update variables with staging API URLs or add to Development environment
# Usage: .\scripts\update-staging-values.ps1

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

# Ask which environment
Write-Host "Which environment do you want to update?" -ForegroundColor Cyan
Write-Host "  1. Production" -ForegroundColor White
Write-Host "  2. Preview (staging API)" -ForegroundColor White
Write-Host "  3. Development (local dev with staging API)" -ForegroundColor White
Write-Host ""
$envChoice = Read-Host "Enter choice (1-3)"

$targetEnv = switch ($envChoice) {
    "1" { "production" }
    "2" { "preview" }
    "3" { "development" }
    default {
        Write-Host "Invalid choice. Using 'development'." -ForegroundColor Yellow
        "development"
    }
}

Write-Host ""
Write-Host "Target environment: $targetEnv" -ForegroundColor Cyan
Write-Host ""

# Variables that might need staging values (especially API URLs)
$stagingVariables = @(
    @{
        Name = "NEXT_PUBLIC_API_BASE";
        Description = "API base URL";
        StagingExample = "https://api-staging.customvenom.com or https://api.customvenom.com";
        Default = "https://api.customvenom.com"
    },
    @{
        Name = "API_BASE";
        Description = "API base URL (same as NEXT_PUBLIC_API_BASE)";
        StagingExample = "https://api-staging.customvenom.com or https://api.customvenom.com";
        Default = "https://api.customvenom.com"
    },
    @{
        Name = "NEXTAUTH_URL";
        Description = "Auth callback URL";
        StagingExample = "Your deployment URL";
        Default = ""
    }
)

Write-Host "Staging-specific variables to update:" -ForegroundColor Cyan
Write-Host ""

$updated = 0
$skipped = 0
$errors = 0

foreach ($varInfo in $stagingVariables) {
    $var = $varInfo.Name
    $desc = $varInfo.Description
    $example = $varInfo.StagingExample
    $default = $varInfo.Default

    Write-Host "Variable: $var" -ForegroundColor White
    Write-Host "  Description: $desc" -ForegroundColor Gray
    Write-Host "  Example: $example" -ForegroundColor Gray
    if ($default) {
        Write-Host "  Default: $default" -ForegroundColor DarkGray
    }

    # Check if variable exists
    $check = vercel env ls 2>&1 | Select-String -Pattern "^\s+$var\s+.*$targetEnv"
    if ($check) {
        Write-Host "  [EXISTS] Variable already exists in $targetEnv" -ForegroundColor Yellow
        $update = Read-Host "  Update it? (y/n)"
        if ($update -ne "y" -and $update -ne "Y") {
            Write-Host "  [SKIP] $var - Skipped" -ForegroundColor Yellow
            $skipped++
            Write-Host ""
            continue
        }
        # Remove existing first
        Write-Host "  Removing existing variable..." -ForegroundColor Gray
        vercel env rm $var $targetEnv --yes 2>&1 | Out-Null
    }

    $value = Read-Host "  Enter value"

    if ([string]::IsNullOrWhiteSpace($value)) {
        if ($default) {
            $value = $default
            Write-Host "  Using default: $value" -ForegroundColor Gray
        } else {
            Write-Host "  [SKIP] $var - No value provided" -ForegroundColor Yellow
            $skipped++
            Write-Host ""
            continue
        }
    }

    # Add/update variable
    Write-Host "  Adding/updating in $targetEnv..." -ForegroundColor Gray
    $value | vercel env add $var $targetEnv 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "  [OK] $var updated in $targetEnv" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "  [ERROR] Failed to update $var" -ForegroundColor Red
        $errors++
    }
    Write-Host ""
}

# Summary
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "Summary" -ForegroundColor Cyan
Write-Host ("=" * 60) -ForegroundColor Cyan
Write-Host "[OK] Updated: $updated" -ForegroundColor Green
Write-Host "[SKIP] Skipped: $skipped" -ForegroundColor Yellow
Write-Host "[ERROR] Errors: $errors" -ForegroundColor $(if ($errors -gt 0) { "Red" } else { "Green" })
Write-Host ""

