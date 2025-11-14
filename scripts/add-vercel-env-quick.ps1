# Quick script to add Vercel environment variables with actual values
# Run from customvenom-frontend directory

param(
    [ValidateSet('preview', 'production', 'both')]
    [string]$Environment = 'both'
)

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Adding Vercel Environment Variables" -ForegroundColor Magenta
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""

# Preview variables
$previewVars = @{
    'NEXTAUTH_URL' = 'https://customvenom-frontend-b3aoume16-incarcers-projects.vercel.app'
    'AUTH_SECRET' = 'mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U='
    'NEXTAUTH_SECRET' = '5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o='
    'DATABASE_URL' = 'postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    'GOOGLE_CLIENT_ID' = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    'GOOGLE_CLIENT_SECRET' = 'YOUR_GOOGLE_CLIENT_SECRET'
    'NEXT_PUBLIC_API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'API_BASE' = 'https://customvenom-workers-api-staging.jdewett81.workers.dev'
    'REDIS_URL' = 'redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421'
    'NEXT_PUBLIC_DEMO_MODE' = '1'
    'PAYWALL_DISABLED' = '0'
    'TAILWIND_DISABLE_OXIDE' = '1'
    'NEXT_PUBLIC_ENVIRONMENT' = 'preview'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

# Production variables
$productionVars = @{
    'NEXTAUTH_URL' = 'https://www.customvenom.com'
    'AUTH_SECRET' = 'mrCsQrchjWR2ZbJodgFQO9OTH1ksOnw/W+STFu5wj3U='
    'NEXTAUTH_SECRET' = '5ohrfT9jmWWrywYPeVBwsHeEhKROEg1aUrFizMJMq8o='
    'DATABASE_URL' = 'postgresql://neondb_owner:npg_itg7c6XSIGQe@ep-quiet-frog-ad4o9gki-pooler.c-2.us-east-1.aws.neon.tech/neondb?sslmode=require&channel_binding=require'
    'GOOGLE_CLIENT_ID' = 'YOUR_GOOGLE_CLIENT_ID.apps.googleusercontent.com'
    'GOOGLE_CLIENT_SECRET' = 'YOUR_GOOGLE_CLIENT_SECRET'
    'NEXT_PUBLIC_API_BASE' = 'https://api.customvenom.com'
    'API_BASE' = 'https://api.customvenom.com'
    'REDIS_URL' = 'redis://default:YckZg0Kt7NbBPvlsvWNqkhMJT2VHdaJq@redis-19421.crce220.us-east-1-4.ec2.redns.redis-cloud.com:19421'
    'NEXT_PUBLIC_DEMO_MODE' = '0'
    'PAYWALL_DISABLED' = '0'
    'NEXT_PUBLIC_ENVIRONMENT' = 'production'
    'NEXT_PUBLIC_LOGS_ENABLED' = 'false'
}

function Add-Var {
    param($Key, $Value, $Env)
    Write-Host "Adding $Key to $Env..." -ForegroundColor Cyan
    $Value | vercel env add $Key $Env 2>&1 | Out-Null
    if ($LASTEXITCODE -eq 0) {
        Write-Host "  ✓ Added" -ForegroundColor Green
    } else {
        Write-Host "  ⊙ Already exists or failed" -ForegroundColor Gray
    }
}

if ($Environment -eq 'preview' -or $Environment -eq 'both') {
    Write-Host ""
    Write-Host "=== Preview Environment ===" -ForegroundColor Yellow
    foreach ($key in $previewVars.Keys) {
        Add-Var -Key $key -Value $previewVars[$key] -Env 'preview'
    }
}

if ($Environment -eq 'production' -or $Environment -eq 'both') {
    if ($Environment -eq 'both') {
        Write-Host "`nPress Enter to continue to Production..." -ForegroundColor Yellow
        Read-Host
    }
    Write-Host "`n=== Production Environment ===" -ForegroundColor Yellow
    foreach ($key in $productionVars.Keys) {
        Add-Var -Key $key -Value $productionVars[$key] -Env 'production'
    }
}

Write-Host ""
Write-Host "========================================" -ForegroundColor Magenta
Write-Host "Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Magenta
Write-Host ""
Write-Host 'Next steps:' -ForegroundColor Cyan
Write-Host '1. Verify: vercel env ls' -ForegroundColor White
Write-Host '2. Pull: vercel env pull .env.vercel.preview' -ForegroundColor White
Write-Host '3. Deploy: vercel --prod' -ForegroundColor White

