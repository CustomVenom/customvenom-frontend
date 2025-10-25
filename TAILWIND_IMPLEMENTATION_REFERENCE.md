# Tailwind CSS Implementation Reference

## 🛡️ Dark-Mode FOUC Prevention Script

**Location**: `src/app/layout.tsx` in the `<head>` section

```tsx
<script
  dangerouslySetInnerHTML={{
    __html: `
      // Prevent dark-mode FOUC (Flash of Unstyled Content)
      (function() {
        try {
          const stored = localStorage.getItem('theme');
          const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
          const shouldBeDark = stored === 'dark' || (stored === null && prefersDark);

          if (shouldBeDark) {
            document.documentElement.classList.add('dark');
          } else {
            document.documentElement.classList.remove('dark');
          }
        } catch (e) {
          // Fallback: default to dark mode for fantasy football
          document.documentElement.classList.add('dark');
        }
      })();
    `,
  }}
/>
```

## 🎯 Safelist Configuration

**Location**: `tailwind.config.js` in the `safelist` array

```js
safelist: [
  // Dynamic color classes
  'bg-red-500', 'bg-green-500', 'bg-blue-500', 'bg-yellow-500', 'bg-purple-500',
  'text-red-500', 'text-green-500', 'text-blue-500', 'text-yellow-500', 'text-purple-500',
  'border-red-500', 'border-green-500', 'border-blue-500', 'border-yellow-500', 'border-purple-500',

  // Dynamic grid classes
  'grid-cols-1', 'grid-cols-2', 'grid-cols-3', 'grid-cols-4', 'grid-cols-5', 'grid-cols-6',
  'col-span-1', 'col-span-2', 'col-span-3', 'col-span-4', 'col-span-5', 'col-span-6',

  // Dynamic spacing classes
  'p-1', 'p-2', 'p-3', 'p-4', 'p-5', 'p-6',
  'm-1', 'm-2', 'm-3', 'm-4', 'm-5', 'm-6',
  'px-1', 'px-2', 'px-3', 'px-4', 'px-5', 'px-6',
  'py-1', 'py-2', 'py-3', 'py-4', 'py-5', 'py-6',

  // Dynamic width/height classes
  'w-1', 'w-2', 'w-3', 'w-4', 'w-5', 'w-6', 'w-8', 'w-10', 'w-12', 'w-16', 'w-20', 'w-24',
  'h-1', 'h-2', 'h-3', 'h-4', 'h-5', 'h-6', 'h-8', 'h-10', 'h-12', 'h-16', 'h-20', 'h-24',

  // Dynamic opacity classes
  'opacity-0', 'opacity-25', 'opacity-50', 'opacity-75', 'opacity-100',

  // Custom Venom brand classes
  'bg-brand-primary', 'text-brand-primary', 'border-brand-primary',
  'bg-brand-accent', 'text-brand-accent', 'border-brand-accent',
  'bg-cv-primary', 'text-cv-primary', 'border-cv-primary',
  'bg-cv-accent', 'text-cv-accent', 'border-cv-accent',

  // Dark mode variants for safelist
  'dark:bg-red-500', 'dark:bg-green-500', 'dark:bg-blue-500',
  'dark:text-red-500', 'dark:text-green-500', 'dark:text-blue-500',
  'dark:border-red-500', 'dark:border-green-500', 'dark:border-blue-500',
],
```

## 📁 Complete Content Paths

**Location**: `tailwind.config.js` in the `content` array

```js
content: [
  './app/**/*.{js,ts,jsx,tsx,mdx}',
  './pages/**/*.{js,ts,jsx,tsx,mdx}',
  './components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/**/*.{js,ts,jsx,tsx,mdx}',
  './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  './src/components/**/*.{js,ts,jsx,tsx,mdx}',
  './src/hooks/**/*.{js,ts,jsx,tsx,mdx}',
  './src/lib/**/*.{js,ts,jsx,tsx,mdx}',
  './stories/**/*.{js,ts,jsx,tsx,mdx}',
  './tests/**/*.{js,ts,jsx,tsx,mdx}',
],
```

## 🧪 Quick Validation Snippets

### Basic Test
```tsx
<div className="p-4 rounded bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
  Tailwind OK
</div>
```

### Extended Test
```tsx
<div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tailwind Test</h2>
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-red-100 dark:bg-red-900 p-3 rounded text-center text-sm text-red-800 dark:text-red-200">Red</div>
    <div className="bg-green-100 dark:bg-green-900 p-3 rounded text-center text-sm text-green-800 dark:text-green-200">Green</div>
    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-center text-sm text-blue-800 dark:text-blue-200">Blue</div>
  </div>
  <div className="mt-4 flex gap-2">
    <button className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors">
      Primary
    </button>
    <button className="px-4 py-2 border border-gray-300 text-gray-700 rounded hover:bg-gray-50 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800">
      Secondary
    </button>
  </div>
</div>
```

## 🔧 CI Pipeline Order

**Location**: `package.json` scripts

```json
{
  "scripts": {
    "preflight": "eslint . --max-warnings=0 && npm run type-check && node scripts/tailwind-smoke-test.js"
  }
}
```

## ⚠️ Important Notes

1. **Restart Required**: After changing `tailwind.config.js`, restart the dev server (`npm run dev`)
2. **FOUC Prevention**: The dark-mode script must be in the `<head>` before any CSS loads
3. **Safelist**: Add any dynamically generated classes to prevent purging
4. **Content Paths**: Include all directories where Tailwind classes are used

## 🚀 Preflight Checks

Run `npm run preflight` to verify:
- ✅ ESLint passes
- ✅ TypeScript compiles
- ✅ Tailwind configuration is valid
- ✅ All content paths are included
- ✅ Safelist is configured
- ✅ globals.css imports Tailwind correctly
