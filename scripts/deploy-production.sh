#!/bin/bash

# Production deployment script for CustomVenom Frontend
# This script sets the correct environment variables and deploys to Vercel

set -euo pipefail

echo "🚀 Deploying CustomVenom Frontend to Production..."

# Set production environment variables
export NEXT_PUBLIC_API_BASE="https://customvenom-workers-api.jdewett81.workers.dev"
export NEXT_PUBLIC_ENABLE_YAHOO="true"

echo "📋 Environment Variables:"
echo "  NEXT_PUBLIC_API_BASE: $NEXT_PUBLIC_API_BASE"
echo "  NEXT_PUBLIC_ENABLE_YAHOO: $NEXT_PUBLIC_ENABLE_YAHOO"

# Deploy to Vercel production
echo "🌐 Deploying to Vercel..."
vercel --prod --yes

echo "✅ Production deployment complete!"
echo "🔗 Check your Vercel dashboard for deployment status"
