# AI Code Review & Integration Ruleset

**Created**: After multiple Vercel deployment failures  
**Purpose**: Ensure thorough, accurate reviews and prevent wasted deployments  
**Status**: MANDATORY for all code reviews and integrations

---

## RULE 1: VERIFY 3RD PARTY REQUIREMENTS FIRST ⚠️ CRITICAL

**Before writing ANY code, configuration, or instructions involving external services:**

### Must Do:
1. ✅ Use web search to get CURRENT documentation (2024/2025)
2. ✅ Check version-specific requirements (e.g., Next.js 15 vs 14)
3. ✅ Verify API signatures, config options, and patterns
4. ✅ Check platform requirements (Vercel, AWS, npm, etc.)

### Never Do:
- ❌ Rely on training data or assumptions
- ❌ Use patterns from older versions without verification
- ❌ Assume configuration options still exist
- ❌ Give instructions for external sites without checking current UI

### Examples:
- Before: "Add `experimental.instrumentationHook: true`" → ❌ WRONG (doesn't exist in Next.js 15)
- After: Web search → "Instrumentation is stable in Next.js 15, no config needed" → ✅ CORRECT

---

## RULE 2: SYSTEMATIC FILE-BY-FILE REVIEW

**When debugging or reviewing code:**

### Process:
1. List ALL files in scope
   ```
   - Use list_dir for directories
   - Use glob_file_search for specific types
   - Document total file count
   ```

2. Read EACH file completely
   ```
   - Don't just grep for patterns
   - Read the entire file context
   - Understand what it does
   ```

3. Verify each file:
   - ✅ Imports resolve correctly
   - ✅ Exports are used correctly  
   - ✅ Function calls match signatures
   - ✅ Type annotations are valid
   - ✅ No deprecated APIs

4. Track progress:
   ```
   Files Reviewed: X/Y
   Issues Found: N
   Issues Fixed: N
   ```

### Never:
- ❌ Skip files assuming they're fine
- ❌ Only check files with obvious issues
- ❌ Rely solely on automated tools

---

## RULE 3: CLIENT/SERVER BOUNDARY VERIFICATION

**For Next.js/React applications:**

### Server Components (No 'use client'):
- ✅ Can use: async/await, auth(), prisma, database calls, Node.js APIs
- ❌ Cannot use: useState, useEffect, onClick, browser APIs, window, localStorage

### Client Components ('use client'):
- ✅ Can use: useState, useEffect, onClick, browser APIs, event handlers
- ❌ Cannot use: Direct auth() calls, direct prisma calls, server-only functions

### Verification Process:
1. Identify all 'use client' components
2. Identify all server components
3. Check each client component:
   - No direct server function calls
   - No prisma imports
   - No auth() calls (use API routes instead)
4. Check each server component:
   - No useState/useEffect
   - No browser API access
   - No event handlers

### Common Violations:
```typescript
// ❌ WRONG - Client component calling server function
'use client';
import { getEntitlements } from '@/lib/entitlements'; // Uses auth() + prisma
const data = await getEntitlements(); // WILL FAIL

// ✅ CORRECT - Client component using API route
'use client';
const response = await fetch('/api/entitlements');
const data = await response.json();
```

---

## RULE 4: CONFIGURATION FILE VALIDATION

**Always check these files completely:**

### Required Checks:

#### package.json:
- ✅ All dependencies are valid
- ✅ All devDependencies are valid
- ✅ **engines.node is specified** (critical for Vercel)
- ✅ Build script includes all required steps (e.g., prisma generate)
- ✅ No missing peer dependencies

#### tsconfig.json:
- ✅ Paths alias (@/*) is configured
- ✅ moduleResolution is correct for Next.js 15 (bundler)
- ✅ strict mode enabled
- ✅ All compiler options are valid

#### next.config.* :
- ✅ Every option exists in the current Next.js version
- ✅ No experimental features from old versions
- ✅ Proper TypeScript types used
- ✅ Valid export syntax

#### Cross-Reference:
- Web search: "Next.js [VERSION] [option] configuration"
- Verify BEFORE adding any config option

---

## RULE 5: DEPENDENCY PATTERN VERIFICATION

### Database Connections (Prisma, etc.):

```typescript
// ❌ WRONG - Multiple instances
const prisma = new PrismaClient();

// ✅ CORRECT - Singleton
import { prisma } from '@/lib/db';
```

### Patterns to Check:
1. ✅ Singleton pattern for database clients
2. ✅ No multiple PrismaClient() instances
3. ✅ Proper connection pooling
4. ✅ Environment-aware logging

### Deprecated APIs:
- ❌ `.substr()` → ✅ `.substring()`
- ❌ Old React lifecycle methods → ✅ Hooks
- ❌ Pages Router patterns in App Router → ✅ App Router patterns

---

## RULE 6: NEVER CLAIM "NO ERRORS" WITHOUT

### Completed Checklist:
- [ ] Read ALL relevant files (not just searched)
- [ ] Ran or simulated type-check
- [ ] Ran or simulated lint
- [ ] Verified against current 3rd party documentation
- [ ] Checked all import/export chains
- [ ] Verified server/client boundaries
- [ ] Confirmed build command will execute successfully
- [ ] Tested or mentally simulated the build process

### If ANY checkbox is unchecked:
→ DO NOT claim "no errors" or "ready to deploy"
→ DO say "Still reviewing..." or "Need to verify..."

---

## RULE 7: ITERATIVE REVIEW REQUIREMENT

**After fixing ANY error:**

### Process:
1. ✅ Fix the error completely
2. ✅ Commit the fix
3. ✅ Start a COMPLETE NEW REVIEW from scratch
4. ✅ Repeat until a full review finds ZERO issues

### Why:
- New code can introduce new issues
- Fixed files might reveal dependencies
- Pattern fixes might be needed elsewhere
- Type changes can cascade

### Never:
- ❌ Fix one thing and assume everything else is fine
- ❌ Skip the re-review after making changes
- ❌ Assume "just one fix" won't affect anything else

---

## RULE 8: BUILD SIMULATION CHECKLIST

**Before claiming "ready to deploy":**

### Simulate Each Build Phase:

#### Phase 1: Dependency Installation
- [ ] All packages in package.json are valid
- [ ] No missing peer dependencies
- [ ] Node.js version is compatible

#### Phase 2: Prisma Generation
- [ ] prisma/schema.prisma is valid
- [ ] DATABASE_URL will be available
- [ ] Generator configuration is correct

#### Phase 3: Type Checking
- [ ] All imports resolve
- [ ] All types are valid
- [ ] No type errors in function calls
- [ ] No missing type definitions

#### Phase 4: Next.js Build
- [ ] All components properly marked (client vs server)
- [ ] No server code in client bundles
- [ ] All API routes follow App Router patterns
- [ ] Metadata only in server components
- [ ] Dynamic imports are valid

#### Phase 5: Optimization
- [ ] No huge bundles that will fail
- [ ] Edge middleware < 1MB
- [ ] No problematic dynamic imports

---

## RULE 9: DOCUMENTATION & INSTRUCTION VERIFICATION

**When providing user instructions for external services:**

### Before Giving Instructions:
1. ✅ Web search for current process
2. ✅ Check for UI changes
3. ✅ Verify steps are still valid
4. ✅ Include version-specific notes

### Example:
```
❌ WRONG: "Go to Settings > Deployment > Add Environment Variable"
(What if UI changed?)

✅ CORRECT: 
1. Web search "Vercel environment variables 2024"
2. Verify current UI
3. "Go to [verified path] based on current Vercel UI..."
```

---

## RULE 10: HONESTY & TRANSPARENCY

### Communication Standards:
- ✅ "I need to verify this against current docs..."
- ✅ "I'm checking all X files individually..."
- ✅ "After fixing this, I'll do another complete review..."
- ✅ "I haven't checked [X] yet, so I can't confirm..."

### Never Say:
- ❌ "No errors found" (without completing checklist)
- ❌ "This should work" (without verification)
- ❌ "Everything looks good" (without reading all files)
- ❌ "Ready to deploy" (without build simulation)

### When Uncertain:
→ Say "Let me verify this..." and actually verify  
→ Better to over-check than under-check  
→ User's time and deployment limits are valuable

---

## ENFORCEMENT CHECKLIST

**For EVERY task involving code review or integration:**

### Pre-Work:
- [ ] Do I need to check 3rd party docs? → If yes, web_search FIRST
- [ ] Do I know the exact current requirements? → If no, web_search
- [ ] Am I making any assumptions? → If yes, VERIFY them

### During Work:
- [ ] Am I reading files or just searching? → READ them
- [ ] Am I checking imports/exports? → Check ALL of them  
- [ ] Am I verifying function signatures? → Verify EACH call
- [ ] Am I tracking what I've reviewed? → Document it

### Post-Work:
- [ ] Did I find any errors? → If yes, START NEW COMPLETE REVIEW
- [ ] Did I check EVERYTHING? → Go through checklist
- [ ] Can I honestly say "no errors"? → Only if ALL boxes checked
- [ ] Am I 100% confident? → If no, keep checking

---

## FAILURE CASE STUDIES

### Case 1: instrumentationHook Error
- **Mistake**: Added `experimental.instrumentationHook: true` without checking
- **Root Cause**: Assumed Next.js 15 works like Next.js 14
- **Should Have Done**: Web search "Next.js 15 instrumentation" FIRST
- **Lesson**: Always verify config options exist in current version

### Case 2: Client Calling Server Function
- **Mistake**: Client component called getEntitlements() which uses auth() + prisma
- **Root Cause**: Didn't verify server/client boundaries
- **Should Have Done**: Check where getEntitlements() is called and from what type of component
- **Lesson**: Trace ALL function calls to verify compatibility

### Case 3: Missing Node.js Version
- **Mistake**: No engines.node in package.json
- **Root Cause**: Didn't check Vercel requirements
- **Should Have Done**: Web search "Vercel Next.js 15 requirements"
- **Lesson**: Always check platform-specific requirements

### Case 4: Multiple Prisma Instances
- **Mistake**: API routes created `new PrismaClient()` instead of using singleton
- **Root Cause**: Didn't read API route files individually
- **Should Have Done**: Read ALL API routes file-by-file
- **Lesson**: Can't find issues without reading the actual code

---

## SUCCESS METRICS

### A thorough review includes:
- ✅ All files read individually
- ✅ All 3rd party docs verified
- ✅ All patterns validated
- ✅ All boundaries checked
- ✅ Build mentally simulated
- ✅ Iterative re-review after fixes

### When you can honestly say:
"I have read every relevant file, verified all patterns against current documentation, checked all boundaries, simulated the build process, and found zero issues through multiple complete review rounds."

**ONLY THEN** is the code ready for deployment.

---

## FINAL NOTE

**Cost of mistakes:**
- User's deployment limits wasted
- User's time wasted
- User's trust damaged
- Project delayed

**Cost of thoroughness:**
- A few extra minutes
- Higher token usage
- More tool calls

**The thoroughness is ALWAYS worth it.**

---

**This ruleset must be followed without exception.**

