# Simple script to add Production environment variables to Vercel
# Run this from the customvenom-frontend directory

Write-Host "Adding Production Environment Variables..." -ForegroundColor Cyan
Write-Host "You will be prompted for each value. Press Enter to skip a variable.`n" -ForegroundColor Yellow

# Production variables
$productionVars = @(
    'NEXTAUTH_URL=https://www.customvenom.com',
    'AUTH_SECRET',
    'NEXTAUTH_SECRET',
    'DATABASE_URL',
    'GOOGLE_CLIENT_ID',
    'GOOGLE_CLIENT_SECRET',
    'NEXT_PUBLIC_API_BASE=https://api.customvenom.com',
    'API_BASE=https://api.customvenom.com',
    'STRIPE_SECRET_KEY',
    'NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY',
    'STRIPE_WEBHOOK_SECRET',
    'NEXT_PUBLIC_DEMO_MODE=0',
    'PAYWALL_DISABLED=0',
    'NEXT_PUBLIC_ENVIRONMENT=production',
    'NEXT_PUBLIC_LOGS_ENABLED=false'
)

foreach ($var in $productionVars) {
    if ($var -match '^([^=]+)=(.*)$') {
        $key = $matches[1]
        $defaultValue = $matches[2]

        Write-Host "Adding $key..." -ForegroundColor Cyan
        if ($defaultValue -notmatch '^(your_|generate-random|postgresql://user:password|sk_test_|pk_test_|sk_live_|pk_live_|whsec_)') {
            # Has a real default value, use it
            $defaultValue | vercel env add $key production
        } else {
            # Prompt for value
            Write-Host "  Enter value (or press Enter to skip): " -NoNewline -ForegroundColor Yellow
            $value = Read-Host
            if ($value) {
                $value | vercel env add $key production
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
            $value | vercel env add $var production
        } else {
            Write-Host "  Skipped" -ForegroundColor Gray
        }
    }
}

Write-Host "`nProduction environment setup complete!`n" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Verify: vercel env ls" -ForegroundColor White
Write-Host "2. Pull locally: vercel env pull .env.local" -ForegroundColor White
Write-Host "3. Redeploy: vercel --prod" -ForegroundColor White

