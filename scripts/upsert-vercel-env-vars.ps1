#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Update specific Vercel environment variables (removes and re-adds)

.DESCRIPTION
    Use this to update existing variables. Removes the old value and adds the new one.
    Only updates keys you explicitly specify.

.PARAMETER Environment
    Which environment: 'preview' or 'production'

.PARAMETER Keys
    Array of keys to update (required)

.EXAMPLE
    .\scripts\upsert-vercel-env-vars.ps1 -Environment preview -Keys @('NEXTAUTH_URL', 'API_BASE')
    .\scripts\upsert-vercel-env-vars.ps1 -Environment production -Keys @('NEXTAUTH_URL')
#>

param(
    [ValidateSet('preview', 'production')]
    [Parameter(Mandatory=$true)]
    [string]$Environment,

    [Parameter(Mandatory=$true)]
    [string[]]$Keys
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

# Variable definitions
$previewVars = @{
    'NEXTAUTH_URL' = 'https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app'
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

$vars = if ($Environment -eq 'preview') { $previewVars } else { $productionVars }

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Upserting $Environment Environment Variables" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$updated = 0
$notFound = 0

foreach ($key in $Keys) {
    if (-not $vars.ContainsKey($key)) {
        Write-Host "  ✗ $key (not in variable definitions, skipping)" -ForegroundColor Red
        $notFound++
        continue
    }

    Write-Host "  ↻ Updating $key..." -ForegroundColor Yellow

    # Remove existing
    vercel env rm $key $Environment --yes 2>&1 | Out-Null

    # Get new value
    $defaultValue = $vars[$key]
    $needsPrompt = $defaultValue -match '^(generate-random|your_|postgresql://user:password|sk_test_|pk_test_|sk_live_|pk_live_|whsec_)'

    if ($needsPrompt) {
        Write-Host "    Enter new value: " -NoNewline -ForegroundColor Yellow
        $value = Read-Host
        if ([string]::IsNullOrWhiteSpace($value)) {
            Write-Host "    Skipped (no value provided)" -ForegroundColor Gray
            continue
        }
    } else {
        $value = $defaultValue
    }

    # Add new value
    $value | vercel env add $key $Environment 2>&1 | Out-Null

    if ($LASTEXITCODE -eq 0) {
        Write-Host "    ✓ Updated" -ForegroundColor Green
        $updated++
    } else {
        Write-Host "    ✗ Failed" -ForegroundColor Red
    }
}

Write-Host "`nSummary: Updated $updated, Not Found $notFound" -ForegroundColor Cyan

