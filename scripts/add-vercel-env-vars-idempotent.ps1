#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Idempotent script to add missing Vercel environment variables

.DESCRIPTION
    Checks existing variables and only adds missing ones. Safe to run multiple times.
    Prompts for secret values, uses defaults for non-secrets.

.PARAMETER Environment
    Which environment: 'preview', 'production', or 'both' (default: 'both')

.PARAMETER UpsertKeys
    Optional array of keys to update even if they exist (e.g., -UpsertKeys @('NEXTAUTH_URL', 'API_BASE'))

.EXAMPLE
    .\scripts\add-vercel-env-vars-idempotent.ps1 -Environment preview
    .\scripts\add-vercel-env-vars-idempotent.ps1 -Environment both -UpsertKeys @('NEXTAUTH_URL')
#>

param(
    [ValidateSet('preview', 'production', 'both')]
    [string]$Environment = 'both',

    [string[]]$UpsertKeys = @()
)

# Check if vercel CLI is installed
if (-not (Get-Command vercel -ErrorAction SilentlyContinue)) {
    Write-Error "Vercel CLI is not installed. Install it with: npm i -g vercel"
    exit 1
}

# Check if we're in the frontend directory
if (-not (Test-Path "vercel.json")) {
    Write-Error "This script must be run from the customvenom-frontend directory"
    exit 1
}

function Get-ExistingEnvVars {
    param([string]$EnvName)

    Write-Host "Checking existing $EnvName variables..." -ForegroundColor Gray
    $existing = vercel env ls $EnvName --json 2>$null | ConvertFrom-Json

    if ($existing) {
        return $existing.envs | ForEach-Object { $_.key } | Sort-Object -Unique
    }
    return @()
}

function Add-EnvVar {
    param(
        [string]$Key,
        [string]$Value,
        [string]$EnvName,
        [string[]]$ExistingKeys,
        [bool]$ForceUpdate = $false
    )

    $exists = $ExistingKeys -contains $Key

    if ($exists -and -not $ForceUpdate) {
        Write-Host "  ⊙ $Key (already exists, skipping)" -ForegroundColor Gray
        return $false
    }

    if ($exists -and $ForceUpdate) {
        Write-Host "  ↻ $Key (updating existing)" -ForegroundColor Yellow
        # Remove first, then add
        vercel env rm $Key $EnvName --yes 2>&1 | Out-Null
    } else {
        Write-Host "  + $Key" -ForegroundColor Cyan
    }

    # Check if value needs prompting (including placeholder NEXTAUTH_URL)
    $needsPrompt = $Value -match '^(generate-random|your_|postgresql://user:password|sk_test_|pk_test_|sk_live_|pk_live_|whsec_|your-preview-url\.vercel\.app)'

    if ($needsPrompt) {
        if ($Key -eq 'NEXTAUTH_URL' -and $Value -match 'your-preview-url') {
            Write-Host "    ⚠️  CRITICAL: NEXTAUTH_URL must match your actual preview URL exactly" -ForegroundColor Red
            Write-Host "    Example: https://customvenom-frontend-abc123.vercel.app" -ForegroundColor Gray
        }
        Write-Host "    Enter value: " -NoNewline -ForegroundColor Yellow
        $userValue = Read-Host
        if ([string]::IsNullOrWhiteSpace($userValue)) {
            Write-Host "    Skipped (no value provided)" -ForegroundColor Gray
            return $false
        }
        $Value = $userValue
    }

    # Add the variable
    $Value | vercel env add $Key $EnvName 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ Added" -ForegroundColor Green
        return $true
    } else {
        Write-Host "    ✗ Failed" -ForegroundColor Red
        return $false
    }
}

function Configure-Environment {
    param(
        [hashtable]$Vars,
        [string]$EnvName,
        [string[]]$UpsertList
    )

    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "Configuring $EnvName Environment" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta

    $existingKeys = Get-ExistingEnvVars -EnvName $EnvName
    Write-Host "Found $($existingKeys.Count) existing variables`n" -ForegroundColor Gray

    $added = 0
    $skipped = 0
    $updated = 0

    foreach ($key in $Vars.Keys) {
        $forceUpdate = $UpsertList -contains $key
        $result = Add-EnvVar -Key $key -Value $Vars[$key] -EnvName $EnvName -ExistingKeys $existingKeys -ForceUpdate $forceUpdate

        if ($result) {
            if ($forceUpdate) {
                $updated++
            } else {
                $added++
            }
        } else {
            $skipped++
        }
    }

    Write-Host "`nSummary: Added $added, Updated $updated, Skipped $skipped" -ForegroundColor Cyan
}

# Preview environment variables
# NOTE: NEXTAUTH_URL found in check-vercel-env.ps1 - using actual preview URL
$previewVars = @{
    'NEXTAUTH_URL' = 'https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app'  # ✅ Actual preview URL
    'AUTH_SECRET' = 'generate-random-32-byte-secret'
    'NEXTAUTH_SECRET' = 'generate-random-32-byte-secret'
    'DATABASE_URL' = 'postgresql://user:password@host:5432/database'
    'GOOGLE_CLIENT_ID' = 'your_google_client_id.apps.googleusercontent.com'
    'GOOGLE_CLIENT_SECRET' = 'your_google_client_secret'
    'NEXT_PUBLIC_API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'STRIPE_SECRET_KEY' = 'sk_test_your_test_key'
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' = 'pk_test_your_test_key'
    'STRIPE_WEBHOOK_SECRET' = 'whsec_your_webhook_secret'
    'NEXT_PUBLIC_DEMO_MODE' = '1'
    'PAYWALL_DISABLED' = '0'
    'TAILWIND_DISABLE_OXIDE' = '1'
    'NEXT_PUBLIC_ENVIRONMENT' = 'preview'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

# Production environment variables
$productionVars = @{
    'NEXTAUTH_URL' = 'https://www.customvenom.com'
    'AUTH_SECRET' = 'generate-random-32-byte-secret'
    'NEXTAUTH_SECRET' = 'generate-random-32-byte-secret'
    'DATABASE_URL' = 'postgresql://user:password@host:5432/database'
    'GOOGLE_CLIENT_ID' = 'your_google_client_id.apps.googleusercontent.com'
    'GOOGLE_CLIENT_SECRET' = 'your_google_client_secret'
    'NEXT_PUBLIC_API_BASE' = 'https://api.customvenom.com'
    'API_BASE' = 'https://api.customvenom.com'
    'STRIPE_SECRET_KEY' = 'sk_live_your_live_key'
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' = 'pk_live_your_live_key'
    'STRIPE_WEBHOOK_SECRET' = 'whsec_your_webhook_secret'
    'NEXT_PUBLIC_DEMO_MODE' = '0'
    'PAYWALL_DISABLED' = '0'
    'NEXT_PUBLIC_ENVIRONMENT' = 'production'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Vercel Environment Variables (Idempotent)" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

if ($UpsertKeys.Count -gt 0) {
    Write-Host "Upsert mode: Will update these keys if they exist:" -ForegroundColor Yellow
    Write-Host "  $($UpsertKeys -join ', ')" -ForegroundColor Yellow
    Write-Host ""
}

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Configure-Environment -Vars $previewVars -EnvName 'preview' -UpsertList $UpsertKeys

    if ($Environment -eq 'both') {
        Write-Host "`nPress Enter to continue to Production..." -ForegroundColor Yellow
        Read-Host
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    Configure-Environment -Vars $productionVars -EnvName 'production' -UpsertList $UpsertKeys
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify: vercel env ls" -ForegroundColor White
Write-Host "2. Pull locally: vercel env pull .env.local" -ForegroundColor White
Write-Host "3. Redeploy: vercel --prod" -ForegroundColor White

