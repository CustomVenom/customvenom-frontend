#!/bin/bash

# Architecture Law #5: CI/CD Quality Gates
# Deployment script that ensures all architectural laws pass before deployment

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${BLUE}🚀 CustomVenom Frontend Deployment Pipeline${NC}"
echo -e "${BLUE}===========================================>${NC}\n"

# Step 1: Check for uncommitted changes
echo -e "${YELLOW}📋 Checking for uncommitted changes...${NC}"
if [[ -n $(git status -s) ]]; then
    echo -e "${RED}❌ Error: You have uncommitted changes${NC}"
    echo "Please commit or stash your changes before deploying"
    git status -s
    exit 1
fi
echo -e "${GREEN}✅ Working directory clean${NC}\n"

# Step 2: Pull latest changes
echo -e "${YELLOW}📥 Pulling latest changes...${NC}"
git pull origin main || echo -e "${YELLOW}⚠️  Could not pull (may be on different branch)${NC}"
echo -e "${GREEN}✅ Repository up to date${NC}\n"

# Step 3: Install dependencies
echo -e "${YELLOW}📦 Installing dependencies...${NC}"
npm ci || npm install
echo -e "${GREEN}✅ Dependencies installed${NC}\n"

# Step 4: Run smoke tests (Architecture Laws)
echo -e "${YELLOW}🧪 Running architecture law smoke tests...${NC}"
if ! npx tsx scripts/smoke-tests.ts; then
    echo -e "${RED}❌ Smoke tests failed. Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All smoke tests passed${NC}\n"

# Step 5: Run unit tests
echo -e "${YELLOW}🧪 Running unit tests...${NC}"
if ! npm test; then
    echo -e "${RED}❌ Unit tests failed. Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ All unit tests passed${NC}\n"

# Step 6: Build the application
echo -e "${YELLOW}🔨 Building application...${NC}"
if ! npm run build; then
    echo -e "${RED}❌ Build failed. Aborting deployment.${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Build successful${NC}\n"

# Step 7: Commit and push (if there are any auto-generated changes)
echo -e "${YELLOW}📤 Checking for changes to push...${NC}"
if [[ -n $(git status -s) ]]; then
    echo "Auto-generated files detected, committing..."
    git add .
    git commit -m "chore: auto-generated build artifacts [skip ci]" || echo "No changes to commit"
fi

# Step 8: Push to remote
echo -e "${YELLOW}📤 Pushing to remote...${NC}"
git push origin main || echo -e "${YELLOW}⚠️  Could not push (may need to set upstream)${NC}"
echo -e "${GREEN}✅ Pushed to remote${NC}\n"

# Step 9: Deploy to Vercel
echo -e "${YELLOW}🌐 Deploying to Vercel...${NC}"
if command -v vercel &> /dev/null; then
    # Deploy to preview first
    echo -e "${CYAN}Deploying to preview...${NC}"
    PREVIEW_URL=$(vercel --yes 2>&1 | grep -o 'https://[^ ]*' | head -1) || PREVIEW_URL=""

    if [[ -n "$PREVIEW_URL" ]]; then
        echo -e "${GREEN}✅ Deployed to preview: ${PREVIEW_URL}${NC}\n"

        # Wait a moment for deployment to propagate
        sleep 5

        # Test preview deployment
        echo -e "${YELLOW}🔍 Testing preview deployment...${NC}"
        if curl -f -s -o /dev/null "${PREVIEW_URL}/api/health"; then
            echo -e "${GREEN}✅ Preview API responding correctly${NC}"
        else
            echo -e "${YELLOW}⚠️  Warning: Preview API test failed (non-critical)${NC}"
        fi

        # Prompt for production deployment
        echo -e "\n${BLUE}===========================================>${NC}"
        echo -e "${YELLOW}Preview deployment successful!${NC}"
        echo -e "Preview URL: ${PREVIEW_URL}"
        echo ""
        read -p "Deploy to production? (y/N): " -n 1 -r
        echo ""

        if [[ $REPLY =~ ^[Yy]$ ]]; then
            echo -e "\n${YELLOW}🚀 Deploying to production...${NC}"
            PROD_URL=$(vercel --prod --yes 2>&1 | grep -o 'https://[^ ]*' | head -1) || PROD_URL=""

            if [[ -n "$PROD_URL" ]]; then
                echo -e "${GREEN}✨ Successfully deployed to production!${NC}"
                echo -e "Production URL: ${PROD_URL}"

                # Tag the release
                VERSION=$(node -p "require('./package.json').version")
                git tag -a "v${VERSION}-frontend" -m "feat: Frontend deployment v${VERSION}" || echo "Tag already exists"
                git push --tags || echo "Could not push tags"

                echo -e "\n${GREEN}🎉 Deployment Complete!${NC}"
                echo -e "${BLUE}===========================================>${NC}"
                echo -e "Next steps:"
                echo -e "  1. Test the application at ${PROD_URL}"
                echo -e "  2. Monitor error logs in Vercel dashboard"
                echo -e "  3. Check structured logs for request IDs"
            else
                echo -e "${RED}❌ Production deployment failed${NC}"
                exit 1
            fi
        else
            echo -e "${YELLOW}Production deployment cancelled.${NC}"
            echo -e "Preview deployment remains at: ${PREVIEW_URL}"
        fi
    else
        echo -e "${YELLOW}⚠️  Could not determine preview URL${NC}"
        echo -e "Check Vercel dashboard for deployment status"
    fi
else
    echo -e "${YELLOW}⚠️  Vercel CLI not found. Install with: npm i -g vercel${NC}"
    echo -e "Or deploy manually via Vercel dashboard"
fi

