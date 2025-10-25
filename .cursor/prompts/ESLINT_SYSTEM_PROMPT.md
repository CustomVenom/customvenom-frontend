You must pass the repository's TypeScript + ESLint gate before returning code.

Run:

- npm run type # tsc --noEmit
- npm run lint # eslint . --max-warnings=0

Constraints:

- Follow eslint.config.mjs exactly (typescript-eslint ...recommendedTypeChecked + Prettier).
- Do not add new dependencies or change script names unless asked.
- Do not blanket-disable rules; propose the smallest code fix.

Output:

- Minimal diffs that make type + lint pass.
- When blocking, show: rule name, failing line, 1-line rationale, and exact patch.
