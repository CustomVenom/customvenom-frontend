# TypeScript Strictness Standards

## Canonical Strict Settings

All `tsconfig.json` files across the monorepo must use these explicit strict flags for uniformity:

```json
{
  "strict": true,
  "noImplicitAny": true,
  "strictNullChecks": true,
  "strictFunctionTypes": true,
  "strictBindCallApply": true,
  "strictPropertyInitialization": true,
  "noImplicitThis": true,
  "alwaysStrict": true,
  "noUncheckedIndexedAccess": true,
  "noImplicitOverride": true,
  "noFallthroughCasesInSwitch": true,
  "noPropertyAccessFromIndexSignature": true,
  "useUnknownInCatchVariables": true,
  "exactOptionalPropertyTypes": false
}
```

## Why `exactOptionalPropertyTypes: false`?

This flag is intentionally disabled across all configs because:

1. **API Boundary Patterns**: Our API boundaries (Workers ↔ Frontend, API ↔ External services) rely on lenient optional property handling
2. **Migration Cost**: Enabling this flag would require significant refactoring across the codebase
3. **Post-MVP**: This is a candidate for post-MVP strictness enhancement

**Documentation**: Each `tsconfig.json` includes a comment explaining this decision.

## Package Config Pattern

Child packages should explicitly inherit and restate strict settings:

```json
{
  // exactOptionalPropertyTypes disabled - breaks API boundary patterns
  "extends": "../../tsconfig.json",
  "compilerOptions": {
    "strict": true,
    "noImplicitAny": true
    // ... all other strict flags explicitly listed
  }
}
```

**Why**: Makes configs self-documenting and prevents silent drift if parent config changes.

## Files Using These Standards

- `customvenom-workers-api/tsconfig.json`
- `customvenom-workers-api/packages/contracts/tsconfig.json`
- `customvenom-frontend/tsconfig.json`
- `customvenom-frontend/packages/shared-types/tsconfig.json`

## Verification

Run TypeScript compiler to verify strictness:

```bash
# Workers API
cd customvenom-workers-api
npx tsc --noEmit

# Frontend
cd customvenom-frontend
npx tsc --noEmit
```

All packages should compile without errors under these strict settings.
