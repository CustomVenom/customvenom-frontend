# Environment Variable Access Rules

## Rule: Always use bracket notation for `process.env` access

**❌ WRONG:**

```typescript
const apiBase = process.env.NEXT_PUBLIC_API_BASE;
const stripeKey = process.env.STRIPE_SECRET_KEY;
```

**✅ CORRECT:**

```typescript
const apiBase = process.env['NEXT_PUBLIC_API_BASE'];
const stripeKey = process.env['STRIPE_SECRET_KEY'];
```

## Why?

With `exactOptionalPropertyTypes: true` in TypeScript, dot notation access to `process.env` properties triggers index signature errors. Bracket notation is the safe, type-compliant approach.

## Helper Functions

Use the safe environment accessor in `src/lib/env.ts`:

```typescript
import { getEnv, requireEnv } from '@/lib/env';

// Safe access (returns string | undefined)
const apiBase = getEnv('NEXT_PUBLIC_API_BASE');

// Required access (throws if missing)
const stripeKey = requireEnv('STRIPE_SECRET_KEY');
```

## ESLint Rule

Add this to your ESLint config to prevent regression:

```javascript
{
  "rules": {
    "no-restricted-syntax": [
      "error",
      {
        "selector": "MemberExpression[object.name='process'][property.name='env'] > Identifier.property",
        "message": "Use bracket notation for process.env access: process.env['FOO'] instead of process.env.FOO"
      }
    ]
  }
}
```

## Migration

If you need to bulk-fix existing code, use this PowerShell codemod:

```powershell
# Convert process.env.FOO to process.env['FOO']
$files = Get-ChildItem -Recurse -Include *.ts,*.tsx -Path .\src
$pattern = 'process\.env\.([A-Z0-9_]+)'
$repl = "process.env['`$1']"
foreach ($f in $files) {
  $t = Get-Content $f | Out-String
  $n = [regex]::Replace($t, $pattern, $repl)
  if ($n -ne $t) {
    Set-Content $f $n
  }
}
```
