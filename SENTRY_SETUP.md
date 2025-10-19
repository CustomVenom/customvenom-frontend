# Sentry Setup for Preview Environment

## ✅ Configured Files
- `sentry.client.config.ts` - Already exists
- `sentry.server.config.ts` - Already exists
- Integration with Next.js 15 - Already configured

## 🚀 Setup Steps

### Step 1: Get Sentry DSN

1. **Create Sentry Project:**
   - Go to: https://sentry.io
   - Create new organization (or use existing)
   - Create project: "customvenom-frontend-preview"
   - Platform: Next.js
   - Copy DSN

2. **Get DSN:**
   ```
   https://[key]@[org].ingest.us.sentry.io/[project]
   ```

### Step 2: Add to Vercel Preview Environment

**Vercel Dashboard → Settings → Environment Variables → Preview**

```env
SENTRY_DSN=https://[key]@[org].ingest.us.sentry.io/[project]
NEXT_PUBLIC_SENTRY_DSN=https://[key]@[org].ingest.us.sentry.io/[project]

# Low sample rates for staging
SENTRY_SAMPLE_RATE=0.1
SENTRY_TRACES_SAMPLE_RATE=0.05
```

**Why low sample rates?**
- Preview = staging/testing environment
- 10% error sampling reduces noise
- 5% trace sampling minimizes quota usage
- Production should use 1.0 (100%) for errors

### Step 3: Configure Sentry Project Settings

**Project Settings → General:**
```
Environment: preview
Release: Enable GitHub integration
```

**Project Settings → Integrations:**
- ✅ Enable GitHub integration
- ✅ Link to: customvenom repository
- ✅ Auto-assign commits to releases

### Step 4: Test Error Reporting

1. **Deploy to Preview** with Sentry DSN configured

2. **Trigger test error:**
   ```tsx
   // Add to any page temporarily
   <button onClick={() => { throw new Error('Sentry test error'); }}>
     Test Sentry
   </button>
   ```

3. **Check Sentry Dashboard:**
   - Error should appear within 30 seconds
   - Verify includes: request_id, release SHA, user context

### Step 5: Verify Error Context

**Expected fields in Sentry events:**
```json
{
  "tags": {
    "request_id": "uuid-here",
    "release": "commit-sha",
    "environment": "preview"
  },
  "user": {
    "email": "user@example.com",
    "id": "user-id"
  },
  "request": {
    "url": "https://your-preview.vercel.app/path",
    "method": "GET",
    "headers": {...}
  }
}
```

---

## 📊 Sentry Configuration

### Client Config (`sentry.client.config.ts`)

**Current settings (already configured):**
- Automatically captures unhandled errors
- Captures unhandled promise rejections
- Browser performance monitoring
- Session replay (if enabled)

### Server Config (`sentry.server.config.ts`)

**Current settings (already configured):**
- Captures API route errors
- Server-side errors
- Edge function errors (middleware)

---

## 🔍 What to Monitor

### Critical Errors (Alert Immediately)
- 500 Internal Server Error
- Database connection failures
- Auth callback failures
- Stripe webhook failures

### Warning Errors (Review Daily)
- 400 Bad Request (might be user error)
- Rate limit hits
- External API timeouts
- Failed entitlement checks

### Ignore (Filter Out)
- Bot/crawler errors
- Known development errors
- Third-party script failures

---

## 🎯 Alert Rules

**Sentry → Alerts → Create Alert Rule**

### Rule 1: Critical Errors
```
Name: Critical Errors - Preview
Condition: Error count > 10 in 5 minutes
Filter: environment:preview AND level:error
Action: Email to jdewett81@gmail.com
```

### Rule 2: High Error Rate
```
Name: High Error Rate - Preview
Condition: Error rate > 5% in 10 minutes
Filter: environment:preview
Action: Email notification
```

### Rule 3: New Error Type
```
Name: New Error Type - Preview
Condition: First seen error
Filter: environment:preview
Action: Email notification (optional)
```

---

## 📋 Verification Checklist

### After Deploy
- [ ] Visit Preview URL
- [ ] Trigger test error
- [ ] Check Sentry dashboard (error appears)
- [ ] Verify request_id in error
- [ ] Verify release SHA matches commit
- [ ] Verify user context (if logged in)
- [ ] Check sourcemaps uploaded (readable stack trace)

### Error Context Checklist
- [ ] Request URL included
- [ ] User email (if authenticated)
- [ ] Release version (commit SHA)
- [ ] Environment tag: "preview"
- [ ] Browser info (client errors)
- [ ] Server info (API errors)

---

## 🔒 Security Notes

**DSN is NOT a secret:**
- Client DSN is exposed in browser
- It's rate-limited by Sentry
- Only allows sending events to YOUR project
- Cannot read existing events

**Webhook Secret IS a secret:**
- Used for Stripe webhooks
- Must not be exposed to client
- Store in Vercel environment variables only

---

## 💰 Quota Management

**Sentry Free Tier:**
- 5,000 errors/month
- 10,000 performance units/month
- 1 project

**With sampling:**
- 10% error sampling = 50,000 real errors before hitting quota
- 5% trace sampling = efficient performance monitoring

**Monitor quota:**
- Sentry Dashboard → Settings → Subscription
- Check usage weekly
- Adjust sample rates if needed

---

## 🚨 Production Setup

**When ready for production:**

1. **Create separate Sentry project:**
   ```
   Project: customvenom-frontend-production
   Environment: production
   ```

2. **Higher sample rates:**
   ```env
   SENTRY_SAMPLE_RATE=1.0
   SENTRY_TRACES_SAMPLE_RATE=0.2
   ```

3. **Stricter alerts:**
   - Alert on ANY error (not just high volume)
   - PagerDuty integration for critical errors
   - Slack notifications for all errors

---

## ✅ Current Status

| Item | Status | Notes |
|------|--------|-------|
| Sentry Integration | ✅ Configured | Files exist |
| Client Config | ✅ Ready | sentry.client.config.ts |
| Server Config | ✅ Ready | sentry.server.config.ts |
| Preview DSN | ⏭️ Need to Add | Get from sentry.io |
| Production DSN | ⏭️ Later | Separate project |
| Sourcemaps | ✅ Auto-upload | Next.js handles this |
| Sample Rates | 📝 Documented | 10% errors, 5% traces |

---

## 🔗 Quick Links

- **Sentry Dashboard:** https://sentry.io
- **Sentry Next.js Docs:** https://docs.sentry.io/platforms/javascript/guides/nextjs/
- **Vercel + Sentry:** https://vercel.com/integrations/sentry

---

## Next Steps

1. ✅ Get Sentry DSN from dashboard
2. ✅ Add to Vercel Preview environment
3. ✅ Deploy to Preview
4. ✅ Test error reporting
5. ✅ Set up alert rules
6. ⏭️ Monitor for 1 week
7. ⏭️ Adjust sample rates if needed

**Estimated Setup Time:** 10-15 minutes


