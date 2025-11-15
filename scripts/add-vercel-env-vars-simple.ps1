# Simple script to add Vercel environment variables
# Run this from the customvenom-frontend directory

Write-Host "Adding Preview Environment Variables..." -ForegroundColor Cyan
Write-Host "You will be prompted for each value. Press Enter to skip a variable.`n" -ForegroundColor Yellow

# Preview variables (with actual values)
$previewVars = @(
    @{Key='NEXTAUTH_URL'; Value='https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app'},
    @{Key='AUTH_SECRET'; Value='mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U='},
    @{Key='NEXTAUTH_SECRET'; Value='5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o='},
    @{Key='DATABASE_URL'; Value='postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'},
    @{Key='GOOGLE_CLIENT_ID'; Value='<YOUR_GOOGLE_CLIENT_ID>'},
    @{Key='GOOGLE_CLIENT_SECRET'; Value='<YOUR_GOOGLE_CLIENT_SECRET>'},
    @{Key='NEXT_PUBLIC_API_BASE'; Value='https://customvenom-workers-api-staging.jdewett81.workers.dev'},
    @{Key='API_BASE'; Value='https://customvenom-workers-api-staging.jdewett81.workers.dev'},
    @{Key='REDIS_URL'; Value='redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421'},
    @{Key='NEXT_PUBLIC_DEMO_MODE'; Value='1'},
    @{Key='PAYWALL_DISABLED'; Value='0'},
    @{Key='TAILWIND_DISABLE_OXIDE'; Value='1'},
    @{Key='NEXT_PUBLIC_ENVIRONMENT'; Value='preview'},
    @{Key='NEXT_PUBLIC_LOGS_ENABLED'; Value='false'}
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

