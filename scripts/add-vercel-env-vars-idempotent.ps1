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
    $output = vercel env ls $EnvName 2>$null
    $keys = @()

    if ($output) {
        # Parse the table output - extract variable names from the "name" column
        $lines = $output -split [Environment]::NewLine
        foreach ($line in $lines) {
            if ($line -match '^\s+(\S+)\s+') {
                $key = $matches[1].Trim()
                # Skip header lines and common Vercel system variables
                if ($key -and $key -ne 'name' -and $key -notmatch '^VERCEL_') {
                    $keys += $key
                }
            }
        }
    }
    return $keys | Sort-Object -Unique
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
        Write-Host "  [SKIP] $Key (already exists, skipping)" -ForegroundColor Gray
        return $false
    }

    if ($exists -and $ForceUpdate) {
        Write-Host "  [UPDATE] $Key (updating existing)" -ForegroundColor Yellow
        # Remove first, then add
        vercel env rm $Key $EnvName --yes 2>&1 | Out-Null
    } else {
        Write-Host "  + $Key" -ForegroundColor Cyan
    }

    # Check if value needs prompting (Stripe keys, Google OAuth, and other secrets)
    $needsPrompt = $Value -match '^(sk_test_|pk_test_|sk_live_|pk_live_|whsec_|YOUR_).*your_|your_.*key|your_.*secret|YOUR_'

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
        Write-Host "    [OK] Added" -ForegroundColor Green
        return $true
    } else {
        Write-Host "    [FAIL] Failed" -ForegroundColor Red
        return $false
    }
}

function Configure-Environment {
    param(
        [hashtable]$Vars,
        [string]$EnvName,
        [string[]]$UpsertList
    )

    Write-Host ""
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host "Configuring $EnvName Environment" -ForegroundColor Magenta
    Write-Host "========================================" -ForegroundColor Magenta
    Write-Host ""

    $existingKeys = Get-ExistingEnvVars -EnvName $EnvName
    Write-Host "Found $($existingKeys.Count) existing variables" -ForegroundColor Gray
    Write-Host ""

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

    Write-Host ""
    Write-Host "Summary: Added $added, Updated $updated, Skipped $skipped" -ForegroundColor Cyan
}

# Preview environment variables
# NOTE: NEXTAUTH_URL found in check-vercel-env.ps1 - using actual preview URL
# DATABASE_URL uses same Neon DB as production (shared)
# Using single quotes to prevent PowerShell from interpreting special characters
[string]$dbUrl = 'postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
$previewVars = @{
    'NEXTAUTH_URL' = 'https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app'  # Actual preview URL
    'AUTH_SECRET' = 'mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U='  # Same as production (can share)
    'NEXTAUTH_SECRET' = '5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o='  # Same as production (can share)
    'DATABASE_URL' = $dbUrl
    'GOOGLE_CLIENT_ID' = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'  # Prompt for actual value
    'GOOGLE_CLIENT_SECRET' = 'YOUR_GOOGLE_CLIENT_SECRET'  # Prompt for actual value
    'NEXT_PUBLIC_API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'REDIS_URL' = 'redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421'  # Same Redis (can share)
    'STRIPE_SECRET_KEY' = 'sk_test_your_test_key'  # Still need test key for preview
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' = 'pk_test_your_test_key'  # Still need test key for preview
    'STRIPE_WEBHOOK_SECRET' = 'whsec_your_webhook_secret'  # Still need test webhook secret
    'NEXT_PUBLIC_DEMO_MODE' = '1'
    'PAYWALL_DISABLED' = '0'
    'TAILWIND_DISABLE_OXIDE' = '1'
    'NEXT_PUBLIC_ENVIRONMENT' = 'preview'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

# Production environment variables (from Vercel production environment)
$productionVars = @{
    'NEXTAUTH_URL' = 'https://www.customvenom.com'
    'AUTH_SECRET' = 'mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U='  # From production
    'NEXTAUTH_SECRET' = '5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o='  # From production
    'DATABASE_URL' = $dbUrl
    'GOOGLE_CLIENT_ID' = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'  # Prompt for actual value
    'GOOGLE_CLIENT_SECRET' = 'YOUR_GOOGLE_CLIENT_SECRET'  # Prompt for actual value
    'NEXT_PUBLIC_API_BASE' = 'https://api.customvenom.com'
    'API_BASE' = 'https://api.customvenom.com'
    'REDIS_URL' = 'redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421'  # From production
    'STRIPE_SECRET_KEY' = 'sk_live_your_live_key'  # Still need actual value
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY' = 'pk_live_your_live_key'  # Still need actual value
    'STRIPE_WEBHOOK_SECRET' = 'whsec_your_webhook_secret'  # Still need actual value
    'NEXT_PUBLIC_DEMO_MODE' = '0'
    'PAYWALL_DISABLED' = '0'
    'NEXT_PUBLIC_ENVIRONMENT' = 'production'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

# Main execution
Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Vercel Environment Variables (Idempotent)" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

if ($UpsertKeys.Count -gt 0) {
    Write-Host "Upsert mode: Will update these keys if they exist:" -ForegroundColor Yellow
    Write-Host "  $($UpsertKeys -join ', ')" -ForegroundColor Yellow
    Write-Host ""
}

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Configure-Environment -Vars $previewVars -EnvName 'preview' -UpsertList $UpsertKeys

    if ($Environment -eq 'both') {
        Write-Host ""
        Write-Host "Press Enter to continue to Production..." -ForegroundColor Yellow
        Read-Host
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    Configure-Environment -Vars $productionVars -EnvName 'production' -UpsertList $UpsertKeys
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host '1. Verify: vercel env ls' -ForegroundColor White
Write-Host '2. Pull locally: vercel env pull .env.local' -ForegroundColor White
Write-Host '3. Redeploy: vercel --prod' -ForegroundColor White

