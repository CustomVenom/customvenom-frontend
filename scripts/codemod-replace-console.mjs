// scripts/codemod-replace-console.mjs
// Rewrites console.log|warn|error → logger.info|warn|error across src/
// Skips files that already import logger
import fs from 'node:fs';
import path from 'node:path';

const ROOT = path.resolve(process.argv[2] || 'src');
const exts = new Set(['.ts', '.tsx', '.js', '.jsx', '.mjs', '.cjs']);

function walk(dir, out = []) {
  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(p, out);
    else if (exts.has(path.extname(p))) out.push(p);
  }
  return out;
}

function ensureLoggerImport(code) {
  const hasImport = /from ['"]@\/lib\/logger['"]/.test(code);
  if (hasImport) return code;
  // Prepend import after any 'use client' line if present
  if (/['"]use client['"]/.test(code.split('\n')[0])) {
    const [first, ...rest] = code.split('\n');
    return [first, "import { logger } from '@/lib/logger';", ...rest].join('\n');
  }
  return `import { logger } from '@/lib/logger';\n${code}`;
}

function rewrite(file) {
  let code = fs.readFileSync(file, 'utf8');
  const before = code;

  // Skip tests
  if (/\.test\.(t|j)sx?$/.test(file)) return;

  // Replace calls
  code = code
    .replace(/console\.log\(/g, 'logger.info(')
    .replace(/console\.warn\(/g, 'logger.warn(')
    .replace(/console\.error\(/g, 'logger.error(');

  if (code !== before) code = ensureLoggerImport(code);

  if (code !== before) {
    fs.writeFileSync(file, code, 'utf8');
    process.stdout.write(`rewrote: ${file}\n`);
  }
}

for (const f of walk(ROOT)) rewrite(f);

