#!/usr/bin/env node
/**
 * Route existence check
 * Verifies that all navigation links have corresponding route files
 */

import { existsSync } from 'fs';
import { join } from 'path';

const ROUTES = [
  { path: '/tools', file: 'src/app/tools/page.tsx' },
  { path: '/league', file: 'src/app/league/page.tsx' },
  { path: '/league/roster', file: 'src/app/league/roster/page.tsx' },
  { path: '/league/waivers', file: 'src/app/league/waivers/page.tsx' },
  { path: '/projections', file: 'src/app/projections/page.tsx' },
  { path: '/settings', file: 'src/app/settings/page.tsx' },
  { path: '/ops', file: 'src/app/ops/page.tsx' },
];

let exitCode = 0;

console.log('🔍 Checking route files...\n');

for (const route of ROUTES) {
  const fullPath = join(process.cwd(), route.file);
  const exists = existsSync(fullPath);

  if (exists) {
    console.log(`✅ ${route.path} → ${route.file}`);
  } else {
    console.error(`❌ ${route.path} → ${route.file} (MISSING)`);
    exitCode = 1;
  }
}

console.log('');

if (exitCode === 0) {
  console.log('✅ All routes exist');
} else {
  console.error('❌ Some routes are missing');
}

process.exit(exitCode);
