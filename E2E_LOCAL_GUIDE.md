# 🧪 **How to Run E2E Tests Locally**

## **Quick Start**

### **1. Start the Development Server**
```bash
# Terminal 1: Start the Next.js dev server
npm run dev
# Server will be available at http://localhost:3000
```

### **2. Run E2E Tests**
```bash
# Terminal 2: Run Playwright tests
npx playwright test

# Or run specific test files:
npx playwright test tests/trust-snapshot.spec.ts
npx playwright test tests/start-sit.spec.ts
npx playwright test tests/protection-mode-badge.spec.ts
```

## **Test Categories**

### **Core Functionality Tests**
- `tests/trust-snapshot.spec.ts` - Trust Snapshot rendering
- `tests/start-sit.spec.ts` - Start/Sit tool functionality
- `tests/protection-mode-badge.spec.ts` - Protection mode badge

### **Contract Tests**
- `tests/contract-tests.spec.ts` - API contract validation
- `tests/league/prolock.spec.ts` - ProLock component
- `tests/leagues-selection.spec.ts` - League selection flow

### **Navigation Tests**
- `tests/nav/dock.spec.ts` - Mobile dock navigation
- `tests/nav/nav.spec.ts` - Navigation components

### **Visual Tests**
- `tests/visual/cls.spec.ts` - Cumulative Layout Shift
- `tests/visual/tools-header.vrt.spec.ts` - Visual regression

## **Environment Setup**

### **Required Environment Variables**
```bash
# Set API base to staging for tests
$env:NEXT_PUBLIC_API_BASE="https://customvenom-workers-api-staging.jdewett81.workers.dev"
```

### **Test Configuration**
- **Base URL**: `http://localhost:3000`
- **Test Directory**: `tests/`
- **Test Pattern**: `**/*.spec.ts`, `**/*.pw.ts`
- **Parallel**: Enabled
- **Retries**: 0
- **Trace**: Retained on failure

## **Troubleshooting**

### **Common Issues**

**1. Connection Refused**
```
Error: page.goto: net::ERR_CONNECTION_REFUSED at http://localhost:3000
```
**Solution**: Ensure dev server is running with `npm run dev`

**2. Test Discovery Issues**
```
Error: Playwright Test did not expect test.describe() to be called here
```
**Solution**: This is fixed - we have a single Playwright version enforced

**3. Import Path Issues**
```
Error: Cannot find package '@/lib/logger'
```
**Solution**: Tests should not import app code - they interact via browser only

### **Debug Mode**
```bash
# Run tests in headed mode (see browser)
npx playwright test --headed

# Run specific test with debug
npx playwright test tests/trust-snapshot.spec.ts --debug

# Show test trace
npx playwright show-trace test-results/[test-name]/trace.zip
```

## **Test Results**

### **Expected Output**
```
Running 41 tests using 1 worker

✓ tests/trust-snapshot.spec.ts:3:5 › Trust Snapshot renders with version and timestamp (2.1s)
✓ tests/start-sit.spec.ts:5:5 › Start/Sit tool loads correctly (1.8s)
✓ tests/protection-mode-badge.spec.ts:4:7 › Protection Mode Badge shows when x-stale=true (1.2s)

41 passed (15.2s)
```

### **Test Reports**
- **HTML Report**: `npx playwright show-report`
- **Trace Files**: `test-results/[test-name]/trace.zip`
- **Screenshots**: `test-results/[test-name]/screenshot.png`

## **CI Integration**

### **GitHub Actions Workflow**
```yaml
name: frontend:e2e
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '20'
      - run: npm ci
      - run: npx playwright install
      - run: npm run dev &
      - run: npx playwright test
```

### **Required Secrets**
- `API_BASE`: Staging Workers API URL
- `NEXT_PUBLIC_API_BASE`: Frontend API base URL

## **Performance Notes**

- **Test Runtime**: ~15-20 seconds for full suite
- **Parallel Execution**: 1 worker (can be increased)
- **Memory Usage**: ~200MB per test
- **Trace Files**: ~1-5MB per failed test

---

**✅ All tests are now properly configured and ready to run!**
