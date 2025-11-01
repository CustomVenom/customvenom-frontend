# CI Status & Manual Verification Guide

**Last Updated**: 2025-11-01
**Status**: 🚧 CI Workflows Currently Unavailable

## Current Constraints

### ✅ What Works

- Local development and testing
- Manual test execution
- Git commits and pushes
- Code changes and feature development

### ❌ What's Unavailable

- Automated CI workflows
- Automated test gates on PRs
- Automated deployments
- CI-based verification

## Manual Verification Process

### Running Tests Locally

#### Frontend Tests

```powershell
# Install dependencies (if needed)
npm install
npx playwright install

# Run E2E tests
npx playwright test tests/trust-snapshot.spec.ts

# Run unit tests
npm test
```

#### Workers API Tests

```powershell
# Run unit tests
npm test

# Run health contract tests
npm test -- src/__tests__/health.spec.ts
```

### Verification with curl

#### Health Endpoint

```powershell
# Staging
curl.exe -fsS "https://customvenom-workers-api-staging.jdewett81.workers.dev/health" | jq '{ok, schema_version, last_refresh}'

# Production
curl.exe -fsS "https://api.customvenom.com/health" | jq '{ok, schema_version, last_refresh}'
```

## Receipt Requirements

When completing test tasks, **paste full terminal output** into task pages with:

1. **Test Output**: Complete terminal output from test execution
2. **API Responses**: JSON responses from curl commands
3. **Screenshots**: For visual/E2E tests (if applicable)
4. **Exit Codes**: Test pass/fail status

### Example Receipt Format

```markdown
## Test Results

**Test**: Trust Snapshot e2e
**Command**: `npx playwright test tests/trust-snapshot.spec.ts`
**Exit Code**: 0 ✅

**Output**:
```

[Full terminal output here]

````

**API Verification**:
```json
{
  "ok": true,
  "schema_version": "v1",
  "last_refresh": "2025-11-01T12:00:00Z"
}
````

```

## What This Means for Development

1. **Run tests locally** before considering work complete
2. **Commit test files** to repo (no merge gates active)
3. **Paste receipts** into Notion task pages
4. **Use curl commands** for API contract verification
5. **Manual verification** until workflows restore

## Recovery Plan

When CI workflows are restored:
- All test files are already committed
- Tests will run automatically on PRs
- Receipts can be automated again

## Related Documentation

- **[Roadmap Alignment Handoff](https://www.notion.so/Cursor-Handoff-Roadmap-Alignment-Next-3-Sprint-2025-11-01-b75161e43bfa496f846afbc3e788d7f4)** - Full context and current sprint tasks
- **[LOCAL_GATE_RUNBOOK.md](../LOCAL_GATE_RUNBOOK.md)** - Detailed local testing procedures

```
