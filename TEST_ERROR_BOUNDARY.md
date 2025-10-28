# Test ApiErrorBoundary

## Manual Validation

### Setup

```bash
cd customvenom-frontend
npm run dev
```

### Test 1: Simulate API Failure

**Method A: Invalid API URL**

```bash
# Edit .env.local
NEXT_PUBLIC_API_BASE=http://invalid-api-url-for-testing
```

**Method B: Use Invalid Week**
Navigate to: `http://localhost:3000/projections?week=invalid`

### Expected Results

- ✅ Friendly error message appears
- ✅ "Retry" button visible and clickable
- ✅ No blank page, no crash
- ✅ Browser console shows structured log

### Test 2: Retry Functionality

1. Click "Retry" button
2. Expected: Attempts to reload (may fail if API still down)

### Test 3: Recovery

1. Restore valid NEXT_PUBLIC_API_BASE
2. Click "Retry"
3. Expected: Data loads successfully

---

## ✅ Acceptance

- [ ] Error boundary shows on API failure
- [ ] Retry button works
- [ ] No app crash
- [ ] Logs are structured
