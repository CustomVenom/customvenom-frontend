#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Add environment variables to Vercel using CLI

.DESCRIPTION
    This script adds environment variables to Vercel for Preview and Production environments.
    It uses the vercel CLI to add variables. Values can be provided interactively or via a .env file.

.PARAMETER Environment
    Which environment to configure: 'preview', 'production', or 'both' (default: 'both')

.PARAMETER EnvFile
    Optional path to .env file to read values from

.EXAMPLE
    .\scripts\add-vercel-env-vars.ps1 -Environment preview
    .\scripts\add-vercel-env-vars.ps1 -Environment production
    .\scripts\add-vercel-env-vars.ps1 -Environment both
    .\scripts\add-vercel-env-vars.ps1 -Environment both -EnvFile .env.local
#>

param(
    [ValidateSet('preview', 'production', 'both')]
    [string]$Environment = 'both',

    [string]$EnvFile = $null
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

# Load .env file if provided
$envVars = @{}
if ($EnvFile -and (Test-Path $EnvFile)) {
    Write-Host "Loading values from $EnvFile..." -ForegroundColor Cyan
    Get-Content $EnvFile | ForEach-Object {
        if ($_ -match '^\s*([^#][^=]+)=(.*)$') {
            $key = $matches[1].Trim()
            $value = $matches[2].Trim()
            $envVars[$key] = $value
        }
    }
}

# Preview environment variables (defaults)
$previewVars = @{
    'NEXTAUTH_URL' = 'https://your-preview-url.vercel.app'
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

# Production environment variables (defaults)
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

function Add-VercelEnvVar {
    param(
        [string]$Key,
        [string]$Value,
        [string]$Environment
    )

    # Get value from env file if available, otherwise use provided value
    $actualValue = if ($envVars.ContainsKey($Key)) {
        $envVars[$Key]
    } elseif ($Value -match '^(generate-random|your_|postgresql://user:password|sk_test_|pk_test_|sk_live_|pk_live_|whsec_)') {
        # Prompt for placeholder values
        Write-Host "`nEnter value for $Key" -ForegroundColor Cyan
        Write-Host "  Example: $Value" -ForegroundColor Gray
        $userValue = Read-Host "  Value"
        if ([string]::IsNullOrWhiteSpace($userValue)) {
            Write-Host "  Skipping $Key (no value provided)" -ForegroundColor Yellow
            return $false
        }
        $userValue
    } else {
        $Value
    }

    Write-Host "Adding $Key to $Environment..." -ForegroundColor Cyan

    # For NEXT_PUBLIC_* variables, add to all environments
    $environments = if ($Key -like 'NEXT_PUBLIC_*') {
        @('production', 'preview', 'development')
    } else {
        @($Environment)
    }

    $success = $true
    foreach ($env in $environments) {
        Write-Host "  → Setting for $env..." -ForegroundColor Gray

        # Pipe value to vercel env add command
        $actualValue | vercel env add $Key $env 2>&1 | Out-Null

        if ($LASTEXITCODE -eq 0) {
            Write-Host "    ✓ Added $Key to $env" -ForegroundColor Green
        } else {
            Write-Host "    ✗ Failed to add $Key to $env (may already exist, use vercel env update to change)" -ForegroundColor Yellow
            $success = $false
        }
    }

    return $success
}

function Configure-Environment {
    param(
        [hashtable]$Vars,
        [string]$EnvName
    )

    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "Configuring $EnvName Environment" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta

    $added = 0
    $skipped = 0

    foreach ($key in $Vars.Keys) {
        $result = Add-VercelEnvVar -Key $key -Value $Vars[$key] -Environment $EnvName
        if ($result) {
            $added++
        } else {
            $skipped++
        }
    }

    Write-Host "`nSummary: Added $added, Skipped $skipped" -ForegroundColor Cyan
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Vercel Environment Variables Setup" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Configure-Environment -Vars $previewVars -EnvName 'preview'

    if ($Environment -eq 'both') {
        Write-Host "`nPress Enter to continue to Production environment setup..." -ForegroundColor Yellow
        Read-Host
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    Configure-Environment -Vars $productionVars -EnvName 'production'
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify variables: vercel env ls" -ForegroundColor White
Write-Host "2. Pull variables locally: vercel env pull .env.local" -ForegroundColor White
Write-Host "3. Redeploy to apply: vercel --prod" -ForegroundColor White
Write-Host "`nNote: If variables already exist, use vercel env update to change them" -ForegroundColor Yellow
