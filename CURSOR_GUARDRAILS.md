# Cursor Guardrails - Never-Again Rules

## 🚫 **Cursor Must NEVER Do**

### **Security Violations**

- ❌ **Never request Vercel tokens** or dashboard access
- ❌ **Never commit .env files** to repository
- ❌ **Never use HTTP URLs** for OAuth or API calls
- ❌ **Never allow open redirects** in OAuth callbacks

### **Next.js App Router Violations**

- ❌ **Never use `next/dynamic({ ssr: false })`** in Server Components
- ❌ **Never access `process.env`** in client components
- ❌ **Never skip route-level error.tsx/loading.tsx** for RSC surfaces

### **Production Violations**

- ❌ **Never deploy without receipts** for API/UI trust paths
- ❌ **Never skip HTTPS enforcement** checks
- ❌ **Never ignore schema sentry** validation

## ✅ **Cursor Must ALWAYS Do**

### **Security Requirements**

- ✅ **Always use HTTPS** for all external URLs
- ✅ **Always validate same-host** for OAuth callbacks
- ✅ **Always use secure cookies**: HttpOnly + Secure + SameSite=Lax
- ✅ **Always guard against open redirects**

### **Next.js App Router Requirements**

- ✅ **Always use client wrapper** for dynamic imports
- ✅ **Always add error.tsx/loading.tsx** for RSC routes
- ✅ **Always pass props** instead of reading env vars in client components
- ✅ **Always use 'use client'** for interactive components

### **Production Requirements**

- ✅ **Always run receipts** for API/UI trust paths
- ✅ **Always test Vercel Preview** before merging
- ✅ **Always check for RSC digest errors**
- ✅ **Always monitor post-deploy** for 60 minutes

## 🛡️ **HTTPS-Only Front-Door Policy**

### **Never-Again Guardrails**

1. **All HTTP requests** → 301 redirect to HTTPS
2. **HSTS headers** on all responses
3. **Mixed content blocked** by browser
4. **Secure cookies only** (HttpOnly + Secure + SameSite=Lax)

### **Implementation**

- **Workers**: HTTPS redirect middleware + HSTS headers
- **Next.js**: HTTPS redirect middleware
- **OAuth**: Same-host callbacks only
- **API calls**: HTTPS-only endpoints

## 📋 **Fast Acceptance Checklist**

### **Before Every PR**

- [ ] Vercel Preview builds green
- [ ] No RSC digest errors in Preview
- [ ] All URLs are HTTPS
- [ ] No .env files in changes
- [ ] Client components use 'use client'
- [ ] Server components don't access process.env

### **Before Every Merge**

- [ ] Receipts attached for API/UI trust paths
- [ ] OAuth flow tested end-to-end
- [ ] Schema sentry working
- [ ] HTTPS enforcement active

### **After Every Deploy**

- [ ] Monitor 5xx rate for 60 minutes
- [ ] Check for schema drift
- [ ] Verify OAuth sessions work
- [ ] Confirm HTTPS redirects working

## 🚨 **Emergency Rollback**

### **If Production Issues**

1. **Immediate**: Comment out problematic code
2. **Deploy**: `git commit && git push`
3. **Verify**: Check Vercel deployment status
4. **Monitor**: Watch error rates drop

### **If Schema Drift**

1. **Check**: `diff_keys` in error responses
2. **Trace**: Use `request_id` to find source
3. **Fix**: Update schema or API response
4. **Deploy**: Test with receipts

### **If OAuth Issues**

1. **Check**: Same-host callback validation
2. **Verify**: HTTPS URLs in OAuth flow
3. **Test**: Session cookies working
4. **Monitor**: OAuth success rate

## 📚 **Reference Documentation**

- **Production Workflow**: `PRODUCTION_WORKFLOW.md`
- **Release Receipts**: `RELEASE_RECEIPTS.md`
- **OAuth Security**: `OAUTH_SECURITY.md`
- **HTTPS Front Door**: `HTTPS_FRONT_DOOR.md`
- **Vercel Documentation**: Linked from Custom Venom Home
