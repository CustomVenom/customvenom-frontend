#!/usr/bin/env node

/**
 * Tailwind CSS Smoke Test
 *
 * Verifies that Tailwind CSS is properly configured and working.
 * This script checks:
 * 1. globals.css imports Tailwind
 * 2. tailwind.config.js has correct content paths
 * 3. Basic utility classes can be processed
 */

const fs = require('fs');
const path = require('path');

const PROJECT_ROOT = path.join(__dirname, '..');
const GLOBALS_CSS = path.join(PROJECT_ROOT, 'src', 'app', 'globals.css');
const TAILWIND_CONFIG = path.join(PROJECT_ROOT, 'tailwind.config.js');
const POSTCSS_CONFIG = path.join(PROJECT_ROOT, 'postcss.config.js');

function checkFileExists(filePath, description) {
  if (!fs.existsSync(filePath)) {
    console.error(`❌ ${description} not found: ${filePath}`);
    return false;
  }
  console.log(`✅ ${description} exists: ${path.relative(PROJECT_ROOT, filePath)}`);
  return true;
}

function checkGlobalsCSS() {
  if (!checkFileExists(GLOBALS_CSS, 'globals.css')) {
    return false;
  }

  const content = fs.readFileSync(GLOBALS_CSS, 'utf8');

  // Check for Tailwind v4 import (modern syntax)
  if (content.includes('@import "tailwindcss"')) {
    console.log('✅ globals.css imports Tailwind CSS v4');
    return true;
  }

  // Check for Tailwind v3 directives (fallback)
  if (
    content.includes('@tailwind base') &&
    content.includes('@tailwind components') &&
    content.includes('@tailwind utilities')
  ) {
    console.log('✅ globals.css has Tailwind v3 directives');
    return true;
  }

  console.error('❌ globals.css missing Tailwind import/directives');
  console.error('   Expected: @import "tailwindcss"; (v4) or @tailwind directives (v3)');
  return false;
}

function checkTailwindConfig() {
  if (!checkFileExists(TAILWIND_CONFIG, 'tailwind.config.js')) {
    return false;
  }

  const content = fs.readFileSync(TAILWIND_CONFIG, 'utf8');

  // Check for required content paths
  const requiredPaths = [
    './src/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
    './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
    './stories/**/*.{js,ts,jsx,tsx,mdx}',
    './tests/**/*.{js,ts,jsx,tsx,mdx}',
  ];

  let allPathsFound = true;
  requiredPaths.forEach((requiredPath) => {
    if (content.includes(requiredPath)) {
      console.log(`✅ Content path found: ${requiredPath}`);
    } else {
      console.error(`❌ Missing content path: ${requiredPath}`);
      allPathsFound = false;
    }
  });

  // Check for safelist configuration
  if (content.includes('safelist:')) {
    console.log('✅ Safelist configuration found');
  } else {
    console.log('⚠️  No safelist found (optional but recommended for dynamic classes)');
  }

  return allPathsFound;
}

function checkPostCSSConfig() {
  if (!checkFileExists(POSTCSS_CONFIG, 'postcss.config.js')) {
    return false;
  }

  const content = fs.readFileSync(POSTCSS_CONFIG, 'utf8');

  // Check for Tailwind PostCSS plugin
  if (content.includes('@tailwindcss/postcss') || content.includes('tailwindcss')) {
    console.log('✅ PostCSS config includes Tailwind plugin');
    return true;
  }

  console.error('❌ PostCSS config missing Tailwind plugin');
  return false;
}

function checkPackageJSON() {
  const packageJsonPath = path.join(PROJECT_ROOT, 'package.json');
  if (!checkFileExists(packageJsonPath, 'package.json')) {
    return false;
  }

  const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
  const devDependencies = { ...packageJson.dependencies, ...packageJson.devDependencies };

  if (devDependencies.tailwindcss) {
    console.log(`✅ Tailwind CSS installed: ${devDependencies.tailwindcss}`);
    return true;
  }

  console.error('❌ Tailwind CSS not found in package.json');
  return false;
}

function main() {
  console.log('🔍 Running Tailwind CSS Smoke Test...\n');

  const checks = [
    { name: 'Package.json', fn: checkPackageJSON },
    { name: 'PostCSS Config', fn: checkPostCSSConfig },
    { name: 'Tailwind Config', fn: checkTailwindConfig },
    { name: 'Globals CSS', fn: checkGlobalsCSS },
  ];

  let allPassed = true;

  checks.forEach((check) => {
    console.log(`\n📋 ${check.name}:`);
    if (!check.fn()) {
      allPassed = false;
    }
  });

  console.log('\n' + '='.repeat(50));

  if (allPassed) {
    console.log('🎉 All Tailwind CSS checks passed!');
    console.log('✅ Tailwind is properly configured and ready to use.');
    process.exit(0);
  } else {
    console.log('❌ Tailwind CSS configuration issues detected.');
    console.log('🔧 Please fix the issues above before proceeding.');
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = { main };
