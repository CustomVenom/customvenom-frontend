#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Verify Vercel environment variables against canonical list

.DESCRIPTION
    Lists existing variables and compares against the canonical set.
    Shows missing required variables and unexpected variables.

.EXAMPLE
    .\scripts\VERIFY_ENV_VARS.ps1
#>

# Required variables (must be present)
$requiredVars = @(
    'DATABASE_URL',
    'NEXTAUTH_URL',
    'AUTH_SECRET',
    'NEXTAUTH_SECRET',
    'NEXT_PUBLIC_API_BASE',
    'API_BASE'
)

# Optional variables (nice to have)
$optionalVars = @(
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_ENVIRONMENT',
    'NEXT_PUBLIC_LOGS_ENABLED',
    'NEXT_PUBLIC_DEMO_MODE',
    'PAYWALL_DISABLED',
    'TAILWIND_DISABLE_OXIDE'
)

# Variables that should NOT be on Vercel (Cloudflare Workers only)
$forbiddenVars = @(
    'YAHOO_CLIENT_ID',
    'YAHOO_CLIENT_SECRET',
    'SESSION_SIGNING_KEY'
)

# All canonical variables
$canonicalVars = $requiredVars + $optionalVars

function Get-EnvVars {
    param([string]$EnvName)

    Write-Host "Fetching $EnvName variables..." -ForegroundColor Gray
    $output = vercel env ls $EnvName 2>&1

    if ($LASTEXITCODE -ne 0) {
        Write-Warning "Failed to fetch $EnvName variables. Are you logged in?"
        return @()
    }

    # Parse output - look for variable names
    $vars = @()
    $output | ForEach-Object {
        if ($_ -match '^\s+(\w+)\s+') {
            $vars += $matches[1]
        }
    }

    return $vars | Sort-Object -Unique
}

function Verify-Environment {
    param(
        [string]$EnvName,
        [string[]]$ExistingVars
    )

    Write-Host "`n========================================" -ForegroundColor Magenta
    Write-Host "Verifying $EnvName Environment" -ForegroundColor Magenta
    Write-Host "========================================`n" -ForegroundColor Magenta

    Write-Host "Found $($ExistingVars.Count) variables`n" -ForegroundColor Gray

    # Check for forbidden variables
    $foundForbidden = $ExistingVars | Where-Object { $forbiddenVars -contains $_ }
    if ($foundForbidden.Count -gt 0) {
        Write-Host "❌ FORBIDDEN VARIABLES FOUND (should be on Cloudflare Workers only):" -ForegroundColor Red
        $foundForbidden | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        Write-Host ""
    } else {
        Write-Host "✅ No forbidden variables found" -ForegroundColor Green
    }

    # Check for missing required variables
    $missingRequired = $requiredVars | Where-Object { $ExistingVars -notcontains $_ }
    if ($missingRequired.Count -gt 0) {
        Write-Host "❌ MISSING REQUIRED VARIABLES:" -ForegroundColor Red
        $missingRequired | ForEach-Object { Write-Host "  - $_" -ForegroundColor Red }
        Write-Host ""
    } else {
        Write-Host "✅ All required variables present" -ForegroundColor Green
    }

    # Check for missing optional variables
    $missingOptional = $optionalVars | Where-Object { $ExistingVars -notcontains $_ }
    if ($missingOptional.Count -gt 0) {
        Write-Host "⚠️  MISSING OPTIONAL VARIABLES:" -ForegroundColor Yellow
        $missingOptional | ForEach-Object { Write-Host "  - $_" -ForegroundColor Yellow }
        Write-Host ""
    }

    # Check for unexpected variables
    $unexpected = $ExistingVars | Where-Object { $canonicalVars -notcontains $_ -and $forbiddenVars -notcontains $_ }
    if ($unexpected.Count -gt 0) {
        Write-Host "ℹ️  UNEXPECTED VARIABLES (not in canonical list):" -ForegroundColor Cyan
        $unexpected | ForEach-Object { Write-Host "  - $_" -ForegroundColor Cyan }
        Write-Host ""
    }

    # Summary
    Write-Host "Summary:" -ForegroundColor Cyan
    Write-Host "  Required: $($requiredVars.Count - $missingRequired.Count)/$($requiredVars.Count) present" -ForegroundColor $(if ($missingRequired.Count -eq 0) { 'Green' } else { 'Red' })
    Write-Host "  Optional: $($optionalVars.Count - $missingOptional.Count)/$($optionalVars.Count) present" -ForegroundColor Yellow
    Write-Host "  Forbidden: $($foundForbidden.Count) found" -ForegroundColor $(if ($foundForbidden.Count -eq 0) { 'Green' } else { 'Red' })
}

# Main execution
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Vercel Environment Variables Verification" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$previewVars = Get-EnvVars -EnvName 'preview'
$productionVars = Get-EnvVars -EnvName 'production'

Verify-Environment -EnvName 'Preview' -ExistingVars $previewVars
Verify-Environment -EnvName 'Production' -ExistingVars $productionVars

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Verification Complete" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Host "To add missing variables, run:" -ForegroundColor Cyan
Write-Host "  .\scripts\add-vercel-env-vars-idempotent.ps1 -Environment both" -ForegroundColor White

