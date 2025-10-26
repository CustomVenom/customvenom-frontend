# CustomVenom Frontend Makefile
# Local vs CI Environment Parity:
# - CI: FRONTEND_BASE=https://www.customvenom.com, CANON=https://www.customvenom.com, ALT=https://customvenom.com
# - Local: Same defaults ensure local runs match CI behavior

.PHONY: help smoke-prod e2e-prod install build

help:
	@echo "CustomVenom Frontend - Available targets:"
	@echo ""
	@echo "Testing (CI Parity):"
	@echo "  smoke-prod  - Run smoke tests against production (matches CI)"
	@echo "  e2e-prod    - Run E2E tests against production (matches CI)"
	@echo ""
	@echo "Development:"
	@echo "  install     - Install dependencies"
	@echo "  build       - Build the application"

smoke-prod:
	@echo "Running smoke tests against production (CI parity)..."
	FRONTEND_BASE=https://www.customvenom.com \
	CANON=https://www.customvenom.com \
	ALT=https://customvenom.com \
	./scripts/smoke_frontend.sh

e2e-prod:
	@echo "Running E2E tests against production (CI parity)..."
	FRONTEND_BASE=https://www.customvenom.com \
	npx playwright test

install:
	npm ci

build:
	npm run build
