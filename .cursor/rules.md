# Cursor Project Rules — TypeScript + ESLint (Flat) + Prettier

## Standards

- TypeScript strict + typed linting (typescript-eslint recommendedTypeChecked)
- ESLint as the source of truth; Prettier handles formatting only
- No eslint-disable without a code-level fix or rule-level rationale
- Keep diffs minimal; do not change function signatures unless required

## Commands Cursor must run before proposing changes

- npm run type
- npm run lint

## Code style

- Imports alphabetized and grouped with blank lines
- Prefer bracket env access: process.env['FOO'] over process.env.FOO (if rule enabled)
- No unused vars: prefix with \_ to intentionally ignore

## Acceptance for any edit

- Passes npm run type and npm run lint locally (warnings = 0)
- If a rule fails: return the failing line, rule name, and the smallest viable fix
