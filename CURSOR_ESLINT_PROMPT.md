# Cursor ESLint Configuration Prompt

Use this prompt to format and apply ESLint configuration for Cursor IDE compatibility:

## Prompt Template

```
Make sure the following ESLint configuration is compatible with Cursor IDE. Modify it so that it is, then create a prompt that formats the following for you, then integrate it in:

[PASTE YOUR ESLINT CONFIGURATION HERE]

Requirements:
1. Use typescript-eslint recommended presets with typed rules
2. Add package.json scripts that Cursor can use (type, lint, fmt, preflight)
3. Ensure projectService: true for automatic tsconfig path resolution
4. Include optional guardrails for env access and strictness
5. Integrate into CONTRIBUTING.md with Cursor IDE section
```

## Key Cursor Compatibility Features

### 1. ESLint Configuration

- **Flat config** at repo root: `eslint.config.mjs`
- **TypeScript ESLint** with `recommendedTypeChecked` for typed rules
- **Project service** for automatic tsconfig path resolution
- **Prettier integration** to avoid stylistic conflicts

### 2. Package Scripts

```json
{
  "scripts": {
    "type": "tsc -p . --noEmit",
    "lint": "eslint . --max-warnings=0",
    "fmt": "prettier --write .",
    "preflight": "npm run type && npm run lint"
  }
}
```

### 3. Pre-commit Gate

```bash
#!/usr/bin/env bash
set -euo pipefail
npm run fmt
npm run type
npm run lint
```

### 4. Optional Guardrails

- **Env access**: Uncomment `no-restricted-syntax` rule for bracketed access
- **Strictness**: Add `tseslint.configs.strictTypeChecked` when ready

### 5. Verification

```bash
npm ci
npm run preflight
```

## Integration Checklist

- [ ] Update `eslint.config.mjs` with typed rules
- [ ] Add Cursor-compatible package scripts
- [ ] Update CONTRIBUTING.md with Cursor IDE section
- [ ] Test local verification with `npm run preflight`
- [ ] Ensure CI gate includes lint and typecheck
- [ ] Document optional guardrails for future use

This configuration ensures Cursor learns from your ESLint rules and enforces them consistently across the project.
