# Production deployment script for CustomVenom Frontend
# This script sets the correct environment variables and deploys to Vercel

Write-Host "🚀 Deploying CustomVenom Frontend to Production..." -ForegroundColor Green

# Set production environment variables
$env:NEXT_PUBLIC_API_BASE = "https://customvenom-workers-api.jdewett81.workers.dev"
$env:NEXT_PUBLIC_ENABLE_YAHOO = "true"

Write-Host "📋 Environment Variables:" -ForegroundColor Yellow
Write-Host "  NEXT_PUBLIC_API_BASE: $env:NEXT_PUBLIC_API_BASE"
Write-Host "  NEXT_PUBLIC_ENABLE_YAHOO: $env:NEXT_PUBLIC_ENABLE_YAHOO"

# Deploy to Vercel production
Write-Host "🌐 Deploying to Vercel..." -ForegroundColor Blue
vercel --prod --yes

Write-Host "✅ Production deployment complete!" -ForegroundColor Green
Write-Host "🔗 Check your Vercel dashboard for deployment status" -ForegroundColor Cyan
