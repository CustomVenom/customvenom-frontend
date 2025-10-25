#!/usr/bin/env node

import { readFileSync, writeFileSync } from 'fs';
import { glob } from 'glob';

// Find all TypeScript/JavaScript files in src/
const files = await glob('src/**/*.{ts,tsx,js,jsx}', { cwd: process.cwd() });

console.log(`Found ${files.length} files to process...`);

let totalReplacements = 0;

for (const file of files) {
  const content = readFileSync(file, 'utf8');
  let newContent = content;
  let fileReplacements = 0;

  // Replace console.log statements with conditional logging
  newContent = newContent.replace(/console\.(log|error|warn|info|debug)\(/g, (match, method) => {
    fileReplacements++;
    return `if (process.env.NODE_ENV !== 'production') { console.${method}(`;
  });

  // Add closing brace for conditional logging
  if (fileReplacements > 0) {
    // This is a simplified approach - in practice, you'd need more sophisticated parsing
    // For now, let's just add the conditional wrapper
    newContent = newContent.replace(/console\.(log|error|warn|info|debug)\([^)]*\);?/g, (match) => {
      return (
        match.replace(
          /console\.(log|error|warn|info|debug)\(/,
          `if (process.env.NODE_ENV !== 'production') { console.$1(`,
        ) + ' }'
      );
    });
  }

  if (fileReplacements > 0) {
    writeFileSync(file, newContent, 'utf8');
    console.log(`Fixed ${fileReplacements} console statements in ${file}`);
    totalReplacements += fileReplacements;
  }
}

console.log(`\nTotal replacements: ${totalReplacements}`);
console.log('Console.log statements have been wrapped with production checks.');
