#!/usr/bin/env pwsh
<#
.SYNOPSIS
    Complete environment setup workflow with verification

.DESCRIPTION
    Runs the idempotent script, then performs all sanity checks.
    Ensures DATABASE_URL exists before proceeding.

.EXAMPLE
    .\scripts\RUN_ENV_SETUP.ps1 -Environment both
#>

param(
    [ValidateSet('preview', 'production', 'both')]
    [string]$Environment = 'both'
)

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Vercel Environment Setup Workflow" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Step 1: Run idempotent script
Write-Host "Step 1: Adding environment variables..." -ForegroundColor Cyan
Write-Host ""

& "$PSScriptRoot\add-vercel-env-vars-idempotent.ps1" -Environment $Environment

if ($LASTEXITCODE -ne 0) {
    Write-Error "Failed to add environment variables"
    exit 1
}

Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Step 2: Verification" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

# Step 2: Verify variables
Write-Host "Checking environment variables..." -ForegroundColor Cyan
Write-Host ""

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Write-Host "Preview Environment:" -ForegroundColor Yellow
    vercel env ls preview
    Write-Host ""
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    Write-Host "Production Environment:" -ForegroundColor Yellow
    vercel env ls production
    Write-Host ""
}

# Step 3: Pull variables locally
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Step 3: Pulling variables locally" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Write-Host "Pulling preview variables..." -ForegroundColor Cyan
    vercel env pull .env.vercel.preview
    Write-Host ""
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    Write-Host "Pulling production variables..." -ForegroundColor Cyan
    vercel env pull .env.vercel.production
    Write-Host ""
}

# Step 4: Critical checks
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Step 4: Critical Checks" -ForegroundColor Magenta
Write-Host "========================================`n" -ForegroundColor Magenta

$checks = @()

# Check DATABASE_URL exists
if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    $previewVars = vercel env ls preview 2>&1 | Select-String -Pattern 'DATABASE_URL'
    if ($previewVars) {
        Write-Host "✅ Preview DATABASE_URL exists" -ForegroundColor Green
        $checks += "Preview DATABASE_URL"
    } else {
        Write-Host "❌ Preview DATABASE_URL MISSING - builds will fail!" -ForegroundColor Red
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    $prodVars = vercel env ls production 2>&1 | Select-String -Pattern 'DATABASE_URL'
    if ($prodVars) {
        Write-Host "✅ Production DATABASE_URL exists" -ForegroundColor Green
        $checks += "Production DATABASE_URL"
    } else {
        Write-Host "❌ Production DATABASE_URL MISSING - builds will fail!" -ForegroundColor Red
    }
}

# Check NEXTAUTH_URL
if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    $previewAuth = vercel env ls preview 2>&1 | Select-String -Pattern 'NEXTAUTH_URL'
    if ($previewAuth -and $previewAuth -notmatch 'your-preview-url') {
        Write-Host "✅ Preview NEXTAUTH_URL configured" -ForegroundColor Green
        $checks += "Preview NEXTAUTH_URL"
    } else {
        Write-Host "⚠️  Preview NEXTAUTH_URL may still be placeholder - verify it matches your preview URL!" -ForegroundColor Yellow
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    $prodAuth = vercel env ls production 2>&1 | Select-String -Pattern 'NEXTAUTH_URL'
    if ($prodAuth -and $prodAuth -match 'customvenom\.com') {
        Write-Host "✅ Production NEXTAUTH_URL configured" -ForegroundColor Green
        $checks += "Production NEXTAUTH_URL"
    } else {
        Write-Host "⚠️  Production NEXTAUTH_URL may be incorrect - should be https://www.customvenom.com" -ForegroundColor Yellow
    }
}

# Step 5: Next steps
Write-Host "`n========================================" -ForegroundColor Magenta
Write-Host "Setup Complete!" -ForegroundColor Green
Write-Host "========================================`n" -ForegroundColor Magenta

Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify all variables: vercel env ls" -ForegroundColor White
Write-Host "2. Review pulled files: .env.vercel.preview and .env.vercel.production" -ForegroundColor White
Write-Host "3. Deploy to apply changes: vercel --prod" -ForegroundColor White
Write-Host ""

if ($checks.Count -lt 4 -and $Environment -eq 'both') {
    Write-Host "⚠️  Some critical checks failed. Review the output above." -ForegroundColor Yellow
    Write-Host "   Run verification: .\scripts\VERIFY_ENV_VARS.ps1" -ForegroundColor White
}

