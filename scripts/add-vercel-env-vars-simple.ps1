# Simple script to add Vercel environment variables
# Run this from the customvenom-frontend directory

Write-Host "Adding Preview Environment Variables..." -ForegroundColor Cyan
Write-Host "You will be prompted for each value. Press Enter to skip a variable.`n" -ForegroundColor Yellow

# Preview variables
$previewVars = @(
    'NEXTAUTH_URL=https://your-preview-url.vercel.app',
    'AUTH_SECRET',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_API_BASE=https://customvenom-workers-api-staging.jdewett81.workers.dev',
    'API_BASE=https://customvenom-workers-api-staging.jdewett81.workers.dev',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_DEMO_MODE=1',
    'PAYWALL_DISABLED=0',
    'TAILWIND_DISABLE_OXIDE=1',
    'NEXT_PUBLIC_ENVIRONMENT=preview',
    'NEXT_PUBLIC_LOGS_ENABLED=false'
)

foreach ($var in $previewVars) {
    if ($var -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $defaultValue = $matches[2]

        Write-Host "Adding $key..." -ForegroundColor Cyan
        if ($defaultValue -notmatch '^(your_|generate-random|postgresql://user:password|sk_test_|pk_test_|sk_live_|pk_live_|whsec_)') {
            # Has a real default value, use it
            $defaultValue | vercel env add $key preview
        } else {
            # Prompt for value
            Write-Host "  Enter value (or press Enter to skip): " -NoNewline -ForegroundColor Yellow
            $value = Read-Host
            if ($value) {
                $value | vercel env add $key preview
            } else {
                Write-Host "  Skipped" -ForegroundColor Gray
            }
        }
    } else {
        # Just the key, prompt for value
        Write-Host "Adding $var..." -ForegroundColor Cyan
        Write-Host "  Enter value (or press Enter to skip): " -NoNewline -ForegroundColor Yellow
        $value = Read-Host
        if ($value) {
            $value | vercel env add $var preview
        } else {
            Write-Host "  Skipped" -ForegroundColor Gray
        }
    }
}

Write-Host "`nPreview environment setup complete!`n" -ForegroundColor Green
Write-Host "To add Production variables, run:" -ForegroundColor Cyan
Write-Host "  .\scripts\add-vercel-env-vars-production.ps1" -ForegroundColor White

