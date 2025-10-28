# Tailwind CSS Validation Snippet

Use this snippet to quickly validate Tailwind CSS is working in any component or page:

```tsx
<div className="p-4 rounded bg-gray-100 text-gray-900 dark:bg-zinc-900 dark:text-zinc-100">
  Tailwind OK
</div>
```

## Extended Test Snippet

For more comprehensive testing:

```tsx
<div className="p-6 rounded-lg bg-white dark:bg-gray-800 shadow-lg border border-gray-200 dark:border-gray-700">
  <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-4">Tailwind Test</h2>
  <div className="grid grid-cols-3 gap-4">
    <div className="bg-red-100 dark:bg-red-900 p-3 rounded text-center text-sm text-red-800 dark:text-red-200">
      Red
    </div>
    <div className="bg-green-100 dark:bg-green-900 p-3 rounded text-center text-sm text-green-800 dark:text-green-200">
      Green
    </div>
    <div className="bg-blue-100 dark:bg-blue-900 p-3 rounded text-center text-sm text-blue-800 dark:text-blue-200">
      Blue
    </div>
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

## Dynamic Class Testing

Test dynamic classes that are in the safelist:

```tsx
// These classes are safelisted and should always work
<div className="bg-red-500 text-white p-4">Dynamic Red</div>
<div className="grid-cols-3 col-span-2">Dynamic Grid</div>
<div className="w-12 h-8 opacity-75">Dynamic Sizing</div>
```

## Dark Mode FOUC Test

To test dark mode FOUC prevention:

1. Open browser dev tools
2. Set `localStorage.setItem('theme', 'light')`
3. Refresh page - should not flash white
4. Set `localStorage.setItem('theme', 'dark')`
5. Refresh page - should not flash light
