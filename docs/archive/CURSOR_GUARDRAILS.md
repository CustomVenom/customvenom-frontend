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
- ❌ **NEVER run `wrangler deploy` without `--keep-vars` flag** — Wrangler DELETES secrets if `--keep-vars` is not included

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
- ✅ **ALWAYS use `wrangler deploy --env production --keep-vars`** — Wrangler does NOT preserve secrets by default, they will be DELETED without `--keep-vars`

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

## 🧠 **MANDATORY: Working Memory Protocol**

**⚠️ ALL AI AGENTS MUST FOLLOW THIS PROTOCOL**

Before making ANY code changes, agents MUST:

1. **Anchor**: State the task and acceptance criteria
2. **Load**: Read all files that will be modified
3. **Baseline**: Quote relevant existing code sections
4. **Plan**: Show what will change (before → after)
5. **Execute**: Make changes only after approval
6. **Hand-back**: Report what changed and acceptance status

**Reference**: See `docs/CURSOR_WORKING_MEMORY_PROTOCOL.md` for complete protocol
**Notion Source**: [Cursor Working Memory Protocol Handoff](https://www.notion.so/Cursor-Working-Memory-Protocol-Handoff-62ba04448a0141a7b158bdacb18d662a)

**User Commands:**

- `show context` — Display current task, loaded files, and plan
- `context check` — Verify proper context before proceeding
- `show context first` — Stop and load context if not already done
- `reset context` — Clear working memory (end of task)

## 📋 **Project Roadmap & Resources**

**⚠️ ALL AGENTS MUST REFERENCE NOTION RESOURCES FOR ROADMAP ALIGNMENT**

See `docs/NOTION_RESOURCES.md` for complete list of Notion documentation:

- **MVP & Roadmap**: CustomVenom MVP - Next - Later Synopsis
- **Sprint Planning**: Roadmap Alignment - Next 3 Sprint
- **Build Manual**: CustomVenom Build Manual v1
- **UI Design**: Custom Venom UI Design Brief v1
- **Development Resources**: Frontend Agent Resource Pack, Debugger Handoff

**Notion Resources**: `docs/NOTION_RESOURCES.md`

## 📚 **Reference Documentation**

- **Production Workflow**: `PRODUCTION_WORKFLOW.md`
- **Release Receipts**: `RELEASE_RECEIPTS.md`
- **OAuth Security**: `OAUTH_SECURITY.md`
- **HTTPS Front Door**: `HTTPS_FRONT_DOOR.md`
- **Notion Resources**: `docs/NOTION_RESOURCES.md` — **Project roadmap & documentation**
- **Working Memory Protocol**: `docs/CURSOR_WORKING_MEMORY_PROTOCOL.md` — **MANDATORY for all agents**
- **Vercel Documentation**: Linked from Custom Venom Home
